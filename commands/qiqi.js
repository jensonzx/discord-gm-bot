const { SlashCommand } = require('slash-create');

module.exports = class extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: "qiqi",
            description: "Sends an image of Qiqifallen",

            guildIDs: process.env.DISCORD_GUILD_ID ? [ process.env.DISCORD_GUILD_ID ] : undefined
        });
    }

    async run (ctx) {

        await ctx.defer();

        const qiqiFallenImgUrl = `https://tenor.com/view/qiqi-fallen-gif-23305277`;

        return void ctx.sendFollowUp({ content: qiqiFallenImgUrl });
    }
}