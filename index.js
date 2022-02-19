const dotenv = require('dotenv');
const path = require('path');
const { SlashCreator, GatewayServer } = require('slash-create');
const { Client } = require('discord.js');
const { generateDocs } = require('./docs');

dotenv.config();

const client = new Client({
    intents: [
        'GUILDS',
        'GUILD_VOICE_STATES'
    ]
});

const creator = new SlashCreator({
  applicationID: process.env.DISCORD_CLIENT_ID,
  token: process.env.DISCORD_CLIENT_TOKEN,
});

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    console.log('Generating docs...');
    generateDocs(creator.commands);

    client.user.setActivity(`Type /help for list of commands`, { type: 'LISTENING' });
});

creator
    .withServer(
        new GatewayServer(
            (handler) => client.ws.on('INTERACTION_CREATE', handler)
        )
    )
    .registerCommandsIn(path.join(__dirname, 'commands'));

if (process.env.DISCORD_GUILD_ID) creator.syncCommandsIn(process.env.DISCORD_GUILD_ID);
else creator.syncCommands();

client.login(process.env.DISCORD_CLIENT_TOKEN);

module.exports.client = client;
module.exports.creator = creator;