import { REST } from '@discordjs/rest'
import { Routes } from 'discord-api-types/v9'
import { Client, Intents } from 'discord.js'
import { SlashCommandBuilder } from '@discordjs/builders'
import 'dotenv/config'

const token = process.env.TOKEN;

const rest = new REST({ version: '9' }).setToken(token);
const clientId: string = '948293756615028747';
const guildId: string = '948288880455602176';

const command = new SlashCommandBuilder().setName('flow').setDescription('Send those tokies');
const commands = [command.toJSON()];

(async () => {
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
})();

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', (thing) => {
  // console.log(client)
  // console.log(thing)
  console.log('Ready!');
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  if (interaction.commandName === 'flow') {
    await interaction.reply('💨!');
  }
});

// Login to Discord with your client's token
client.login(token);
