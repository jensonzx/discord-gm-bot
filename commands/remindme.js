const { SlashCommand, CommandOptionType, ApplicationCommandPermissionType } = require('slash-create');
const ReminderManager = require('../modules/reminder');

const COMMAND_DATE_FORMAT = /^\d{4}-[0-1]\d-\d{2}(\s\d{2}:\d{2})?$/;
const LOCAL_TIME_ZONE = '+0800';

module.exports = class extends SlashCommand {
    constructor(creator) {
        super(creator, {
            name: "remindme",
            description: "Set a reminder (based on UTC+8 time)",
            options: [
                {
                    name: "frequency",
                    type: CommandOptionType.STRING,
                    description: "Interval between each reminder being sent",
                    choices: [
                        {name: "once", value: "once"},
                        {name: "daily", value: "daily"},
                        {name: "weekly", value: "weekly"},
                        {name: "monthly", value: "monthly"}
                    ],
                    required: true
                },
                {
                    name: "datetime",
                    type: CommandOptionType.STRING,
                    description: "Date and/or time of reminder (UTC+8). Format: yyyy-mm-dd hh:mm (e.g. 2012-12-21 15:00)",
                    required: true
                },
                {
                    name: "message",
                    type: CommandOptionType.STRING,
                    description: "Reminder message to be sent",
                    required: true
                }
            ],

            guildIDs: process.env.DISCORD_GUILD_ID ? [ process.env.DISCORD_GUILD_ID ] : undefined
        });
    }

    async run (ctx) {

        await ctx.defer();
        
        if (ctx.user.id !== process.env.DISCORD_BOT_OWNER)
        {
            return void ctx.sendFollowUp({ content: 'Sorry, only owner can execute this command. Just Neko being lazy. :man_shrugging:'})
        }

        
        if (!COMMAND_DATE_FORMAT.test(ctx.options.datetime))
        {
            return void ctx.sendFollowUp({ content: "Invalid date/time provided!" });
        }

        const localDateTime = `${ctx.options.datetime.replace(/\s/, 'T')}${LOCAL_TIME_ZONE}`;
        // TODO: validate date and time depending on the frequency choice
        try {
            ReminderManager.addReminder(new Date(localDateTime), ctx.options.frequency, ctx.options.message);

            // TODO: add embed message to show what reminder u set (include date/time, frequency and msg)
            return void ctx.sendFollowUp({ content: "👌 Reminder successfully set!" })
        }
        catch (err) {
            console.error(err);

            return void ctx.sendFollowUp({ content: err.message });
        }
    }
}