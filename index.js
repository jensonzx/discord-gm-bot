const dotenv = require('dotenv');
const path = require('path');
const { SlashCreator, GatewayServer } = require('slash-create');
const { Client } = require('discord.js');
const { generateDocs } = require('./docs');
const { readdirSync } = require('fs');

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

function initModules() {
    try {
        const fileNames = readdirSync(path.join(__dirname, 'modules'));
        const modules = fileNames.filter(fileName => fileName.endsWith('.js'))
                            .map(fileName => new (require(path.join(__dirname, 'modules', fileName)))());

        for (let module of modules) {
            client.modules.push(module)
        }
    }
    catch (err) {
        console.error(err);
        
        throw new Error('Each module must have an initialize() function!');
    }
}

client.modules = [];
client._ROOTDIR = __dirname;

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