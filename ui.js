const { User, Gyms, Workouts } = require("./constants.js");

require("./cron")({
  puppeteerOptions: {
    defaultViewport: { width: 1200, height: 800 },
    headless: false,
    executablePath: "",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  notifyEnabled: false,
  testBook: {
    date: "2024-03-19 18:00",
    user: User.VW,
    workout: Workouts.find((workout) => workout.key === "hiit the cage"),
    gym: Gyms.find((gym) => gym.key === "värnhem"),
  },
});
