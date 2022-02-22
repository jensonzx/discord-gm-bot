const schedule = require('node-schedule');
const path = require('path');
const { readFileSync, writeFileSync } = require('fs');

const REMINDERS_FILE_LOCATION = path.join(_ROOTDIR, 'data', 'reminders.json');
const REMINDER_CHANNEL_ID = process.env.REMINDER_CHANNEL_ID;

/**
 * Get a list of reminders from the stored JSON reminder file
 * @returns {Array<Reminder>} List of reminders
 */
const getCachedReminders = function() {
    let remindersFile = undefined;
    try {
        remindersFile = readFileSync(REMINDERS_FILE_LOCATION);
    }
    catch (err)
    {
        console.error(err);
        return;
    }

    const reminders = JSON.parse(remindersFile);
    
    if (!reminders instanceof Array)
        throw new TypeError("JSON parsed from reminders.json must be an Array object");

    return reminders;
};

module.exports = class ReminderManager {
    constructor() {
        if (this instanceof ReminderManager) {
            throw Error('A static class cannot be instantiated.');
        }
    }

    /**
     * @type {Array<Reminder>}
     */
    static #runningReminders = [];

    static async initialize() {
        try {
            const cachedReminder = getCachedReminders();

            if (cachedReminder) {
                for (let reminder of cachedReminder) {
                    ReminderManager.runReminder(reminder.frequency, new Date(reminder.dateTime), reminder.message);
                }
            }
            else {
                console.log('Cached reminders file does not exist');
            }
        }
        catch (err) {
            console.error({message: 'An error occured while retrieving the JSON file', error: err});
        }
    }

    /**
     * 
     * @param {Date} dateTime 
     * @param {string} frequency 
     * @param {string} message 
     */
    static async addReminder(dateTime, frequency, message) {
        
        ReminderManager.runReminder(frequency, dateTime, message);

        try {
            const reminder = new Reminder(dateTime, frequency, message);
            const cachedReminders = getCachedReminders() || [];

            cachedReminders.push(reminder);
            
            writeFileSync(REMINDERS_FILE_LOCATION, JSON.stringify(cachedReminders));
        }
        catch (err) {
            console.error({message: 'Error saving reminder to file', error: err});
        }
    }

    static async removeReminder() {
        // TODO: unschedule reminder and update json file
    }

    static async listReminders() {
        // TODO
    }

    /**
     * 
     * @param {Date} dateTime 
     * @param {string} frequency 
     * @param {string} message 
     */
    static runReminder(frequency, dateTime, message) {
        const { client } = require('..');
        let job = undefined;
    
        switch (frequency) {
            case Reminder.FREQUENCY_ONCE:
                // TODO
                break;
            case Reminder.FREQUENCY_DAILY:
                job = schedule.scheduleJob({
                    hour: dateTime.getHours() || 0,
                    minute: dateTime.getMinutes() || 0
                }, () => {
                    client.channels.cache.get(REMINDER_CHANNEL_ID).send(message);
                });
                break;
            case Reminder.FREQUENCY_WEEKLY:
                // TODO
                break;
            case Reminder.FREQUENCY_MONTHLY:
                // TODO
                break;
            default:
                throw new Error('Invalid frequency!');
        }
    
        ReminderManager.#runningReminders.push(job);
    }
}

class Reminder {
    constructor(dateTime, frequency, message)
    {
        this.dateTime = dateTime;
        this.frequency = frequency;
        this.message = message;
    }

    static FREQUENCY_ONCE = 'once';
    static FREQUENCY_DAILY = 'daily';
    static FREQUENCY_WEEKLY = 'weekly';
    static FREQUENCY_MONTHLY = 'monthly';
}