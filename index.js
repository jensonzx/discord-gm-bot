const dotenv = require('dotenv');
const path = require('path');
const { SlashCreator, GatewayServer } = require('slash-create');
const { Client } = require('discord.js');
const { generateDocs } = require('./docs');
const { readdirSync } = require('fs');

dotenv.config();
global._ROOTDIR = __dirname;

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

const initModules = function() {
    const files = readdirSync(path.join(__dirname, 'modules'));

    try {
        for (let file of files) {
            if (file.endsWith('.js')) {
                // Call initialize function for each module
                require(path.join(__dirname, 'modules', file)).initialize();
            }
        }
    }
    catch (err) {
        console.error(err);
        
        throw new Error('Each module must have an initialize() function!');
    }
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);

    console.log('Generating docs...');
    generateDocs(creator.commands);

    console.log('Starting modules...');
    initModules();

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