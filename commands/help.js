const { SlashCommand } = require('slash-create');
const { MessageEmbed } = require("discord.js");

module.exports = class extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: "help",
            description: "Display list of available commands to user privately",

            guildIDs: process.env.DISCORD_GUILD_ID ? [ process.env.DISCORD_GUILD_ID ] : undefined
        });
    }

    async run (ctx) {

        const { client, creator } = require('..');

        await ctx.defer();

        let commands = creator.commands;

        let helpEmbed = new MessageEmbed()
        .setTitle(client.user.username)
        .setDescription("List of all commands")
        .setColor("#F8AA2A");

        commands.forEach((slashCmd) => {
        helpEmbed.addField(
            `**/${slashCmd.commandName}**`,
            `${slashCmd.description}`,
            true
            );
        });

        helpEmbed.setTimestamp();

        const user = client.users.cache.get(ctx.user.id) ?? await client.users.fetch(ctx.user.id);
        user.send({ embeds: [helpEmbed] }).catch(console.error);

        return void ctx.sendFollowUp({ content: '✅ | Sent you the commands list!' });
    }
}