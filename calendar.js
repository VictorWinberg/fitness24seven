const { google } = require("googleapis");
const dayjs = require("dayjs");
require("dotenv").config();

const { User, Gyms, Workouts } = require("./constants.js");

const { CALENDAR_ID, MR_CALENDAR_ID, MS_CALENDAR_ID } = process.env;

module.exports = async ({ schedule, notify }) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  const calendar = google.calendar({ version: "v3", auth });

  async function findEvents(calendarId) {
    const { data } = await calendar.events.list({
      calendarId,
      singleEvents: true,
      timeMin: dayjs().toISOString(),
      timeMax: dayjs().add(1, "week").toISOString(),
    });
    const { items = [] } = data;

    const events = items
      .filter((evt) => evt.summary && evt.start && evt.start.dateTime)
      .filter((evt) => Workouts.some((workout) => evt.summary.toLowerCase().includes(workout.key)))
      .filter((evt) => dayjs().add(4, "day").isBefore(evt.start.dateTime));

    if (events.length === 0) {
      console.log("No events found", calendarId, dayjs().format("YYYY-MM-DD"));
    }

    return events;
  }

  async function updateEvent(calendarId, event, summary, user) {
    try {
      if (event.recurringEventId) {
        await calendar.events.insert({
          calendarId,
          requestBody: { ...event, summary },
        });
        return;
      }
      await calendar.events.update({
        calendarId,
        eventId: event.id.toString(),
        requestBody: { ...event, summary },
      });
    } catch (error) {
      // Forbidden fallback - notify user
      if (error.code === 403) {
        if (!user) return;

        notify(user, `${summary} (${event.location})`);
        return;
      }

      notify(user || User.VW, error.message);
    }
  }

  async function scheduleEvent(calendarId, event, users) {
    const { summary, location } = event;

    const workout = Workouts.find((workout) => summary.toLowerCase().includes(workout.key));
    const gym = Gyms.find((gym) => location.toLowerCase().includes(gym.key));

    if (!workout || !gym) {
      await updateEvent(calendarId, event, summary.replace(/💀|❌|🤖/g, "") + "💀");
      return;
    }

    users.forEach((user) => {
      schedule(dayjs(event.start.dateTime.toString()).subtract(4, "day"), user, workout, gym, async (success) => {
        await updateEvent(calendarId, event, summary.replace(/💀|❌|🤖/g, "") + (success ? "💪" : "❌"), user);
      });
    });

    console.log("Event found", summary, location, dayjs().format("YYYY-MM-DD"));
    await updateEvent(calendarId, event, summary.replace(/💀|❌|🤖/g, "") + "🤖");
  }

  const calendarMap = {
    [CALENDAR_ID]: [User.VW, User.AO],
    [MR_CALENDAR_ID]: [User.VW],
    [MS_CALENDAR_ID]: [User.AO],
  };

  for (const calendarId in calendarMap) {
    const events = await findEvents(calendarId);

    events.forEach(async (event) => {
      scheduleEvent(calendarId, event, calendarMap[calendarId]);
    });
  }
};
