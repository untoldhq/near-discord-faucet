import pg from 'pg';
import 'dotenv/config';

export default class Database {
  client: pg.Client
  async connect() {
    this.client = new pg.Client()
    await this.client.connect()
    await this.createTableIfNeeded()
  }
  
  async createTableIfNeeded() {
    const result = await this.client.query(`CREATE TABLE IF NOT EXISTS drips (
      user_id varchar(64) NOT NULL,
      near_account_id varchar(64) NOT NULL,
      last_drip timestamp DEFAULT CURRENT_TIMESTAMP
    )`);
    return result;
  }
  
  async insertDrip(userId: string, nearAccountId: string) {
    await this.client.query(`INSERT INTO drips(user_id, near_account_id) VALUES($1, $2)`, [userId, nearAccountId]);
  }
  
  async canDrip(userId: string, nearAccountId: string): Promise<[boolean, string?]> {
    const result = await this.client.query(`SELECT *
      FROM (
         SELECT user_id, near_account_id, last_drip, last_drip + INTERVAL '${process.env.DRIP_INTERVAL}' AS next_drip 
         FROM drips 
      ) AS t 
      WHERE (user_id = $1 OR near_account_id = $2) AND last_drip > NOW() - INTERVAL '${process.env.DRIP_INTERVAL}'`, 
      [userId, nearAccountId]
    );
    if (result.rows.length > 0) {
      return [false, result.rows[0].next_drip]
    }
    return [true, undefined]
  }
}
