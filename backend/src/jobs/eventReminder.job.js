// Sends "event is coming up" reminders (Notification type event_reminder)
// to everyone registered for an event, once at ~2 days out and once at ~1
// day out. Guarded by Event.remindersSent so each window fires at most once
// per event - rescheduling (Event.js's pre-validate hook) clears that list
// so a moved event reminds again for its new date.
const Event = require("../models/Event");
const { notifyEventReminder } = require("../services/notification.service");

const DAY_MS = 24 * 60 * 60 * 1000;

// Each window is a band of "time until eventDate" - an event is due for a
// given reminder while it's inside that band and hasn't been sent that key
// yet. Ordered furthest-out first so an event that skips straight into a
// closer band (e.g. created with only 20h notice) never gets an earlier
// reminder it's already too late for.
const REMINDER_WINDOWS = [
    { key: "2d", from: 1 * DAY_MS, to: 2 * DAY_MS }, // 24h-48h before
    { key: "1d", from: 0, to: 1 * DAY_MS }, // 0h-24h before
];

const SWEEP_INTERVAL_MS = 15 * 60 * 1000; // finer-grained than the hourly content sweep, so a narrow window isn't missed

const sweepUpcomingEvents = async () => {
    const now = new Date();

    for (const { key, from, to } of REMINDER_WINDOWS) {
        const events = await Event.find({
            isActive: true,
            status: "published",
            eventDate: { $gte: new Date(now.getTime() + from), $lte: new Date(now.getTime() + to) },
            remindersSent: { $ne: key },
        });

        for (const event of events) {
            try {
                await notifyEventReminder({ event: event._id });
                event.remindersSent.push(key);
                await event.save();
            } catch (err) {
                console.error(`Event reminder (${key}) failed for event ${event._id}:`, err);
            }
        }
    }
};

const startEventReminderJob = () => {
    sweepUpcomingEvents();
    setInterval(sweepUpcomingEvents, SWEEP_INTERVAL_MS);
};

module.exports = { startEventReminderJob, sweepUpcomingEvents };
