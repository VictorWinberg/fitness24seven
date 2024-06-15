const { User, Gyms, Workouts } = require("./constants.js");

require("./cron.js")({
  puppeteerOptions: {
    defaultViewport: { width: 1200, height: 800 },
    headless: true,
    executablePath: "",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  notifyEnabled: false,
  testBook: {
    date: "2024-01-01 00:00",
    user: User.VW,
    workout: Workouts.find((workout) => workout.key === "bodypump"),
    gym: Gyms.find((gym) => gym.key === "värnhem"),
  },
});

// require("./calendar.js")({
//   notify: console.log,
// });
