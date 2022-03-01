const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { Client, Intents } = require('discord.js');
const { SlashCommandBuilder } = require('@discordjs/builders');

require('dotenv').config();
const token = process.env.TOKEN;

const rest = new REST({ version: '9' }).setToken(token);
const clientId = '948293756615028747';
const guildId = '948288880455602176';

const command = new SlashCommandBuilder().setName('flow').setDescription('Send those tokies');
console.log(command);
const commands = [command.toJSON()];

console.log(commands);
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
  console.log(client)
  console.log(thing)
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


