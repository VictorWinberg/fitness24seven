const { google } = require("googleapis");
const dayjs = require("dayjs");

const { User, Gym, Workout } = require("./constants.js");

const calendarId = process.env.CALENDAR_ID;

module.exports = async ({ schedule, notify }) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: "./credentials.json",
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });
  const calendar = google.calendar({ version: "v3", auth });

  const { data } = await calendar.events.list({
    calendarId,
    timeMin: dayjs().toISOString(),
  });
  const { items = [] } = data;

  async function updateEvent(event, summary) {
    try {
      await calendar.events.update({
        calendarId,
        eventId: event.id.toString(),
        requestBody: {
          ...event,
          start: event.start,
          end: event.end,
          summary: summary,
        },
      });
    } catch (error) {
      const { message } = error;
      notify(User.VW, message);
    }
  }

  const events = items
    .filter((evt) => evt.summary && evt.start && evt.start.dateTime)
    .filter((evt) => Object.keys(Workout).some((key) => evt.summary.toLowerCase().includes(key)))
    .filter((evt) => dayjs().add(2, "day").isBefore(evt.start.dateTime));

  if (events.length === 0) return console.log("No events found");

  events.forEach(async (event) => {
    const { summary, location } = event;

    const workout = Workout[Object.keys(Workout).find((key) => summary.toLowerCase().includes(key))];
    const gym = Gym[Object.keys(Gym).find((key) => location.toLowerCase().includes(key))];

    if (!workout || !gym) {
      await updateEvent(event, summary.replace(/❌|🤖/g, "") + "❌");
      return;
    }

    schedule(dayjs(event.start.dateTime.toString()).subtract(2, "day"), User.VW, workout, gym, async (success) => {
      await updateEvent(event, summary.replace(/❌|🤖/g, "") + (success ? "💪" : "❌"));
    });

    await updateEvent(event, summary.replace(/❌|🤖/g, "") + "🤖");
  });
};
