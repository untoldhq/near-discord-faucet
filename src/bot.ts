import * as nearAPI from 'near-api-js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { Client, Intents } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import 'dotenv/config';

const token = process.env.TOKEN;
export default class Bot {
  account: nearAPI.Account
  near: nearAPI.Near
  constructor() {
    this.start()
  }
  
  async start() {
    await this.setupNear()
    await this.setupDiscord()
  }
  
  async setupNear() {
    const { connect, keyStores, KeyPair } = nearAPI;
    const keyStore = new keyStores.InMemoryKeyStore();
    const accountId = process.env.FAUCET_ACCOUNT_ID;
    const keyPair = KeyPair.fromString(process.env.FAUCET_PK);
    await keyStore.setKey("testnet", accountId, keyPair);
    const config = {
      networkId: "testnet",
      keyStore, // optional if not signing transactions
      nodeUrl: "https://rpc.testnet.near.org",
      walletUrl: "https://wallet.testnet.near.org",
      helperUrl: "https://helper.testnet.near.org",
      explorerUrl: "https://explorer.testnet.near.org",
      headers: {},
    };
    this.near = await connect(config);
    this.account = await this.near.account(accountId)
    console.log(await this.account.getAccountBalance())
  }
  
  async setupDiscord() {
    const rest = new REST({ version: '9' }).setToken(token);
    const clientId: string = '948293756615028747';
    const guildId: string = '948288880455602176';
    const command = new SlashCommandBuilder()
      .setName('flow')
      .setDescription('Send those tokies')
      .addStringOption(option =>
        option.setName('near_account_id')
          .setDescription('The NEAR account to send tokens to')
          .setRequired(true)
        );
    const commands = [command.toJSON()];
    try {
      console.log('Started refreshing application (/) commands.');
    
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
    
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
    
    
    // Create a new client instance
    const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
    
    // When the client is ready, run this code (only once)
    client.once('ready', async () => {
    
      console.log('Ready!');
      
    });
    
    client.on('interactionCreate', async interaction => {
      if (!interaction.isCommand()) return;
    
      if (interaction.commandName === 'flow') {
        try {
          const receiverId = interaction.options.getString('near_account_id');
          const receiver = await this.near.account(receiverId);
          await receiver.state(); // throw an error if we can't check state on this receiver account
          this.account.sendMoney(receiverId, "5000000000000000000000000");
          await interaction.reply('🚰 sent 5 NEAR to ' + interaction.options.getString('near_account_id'));
        } catch {
          await interaction.reply('🥶 cannot find a NEAR account named ' + interaction.options.getString('near_account_id'));
        }
      }
    });
    
    // Login to Discord with your client's token
    client.login(token);
    
  }
}
