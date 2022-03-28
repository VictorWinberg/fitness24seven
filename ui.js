const { User, Gym, Workout } = require("./constants.js");

require("./cron")({
  puppeteerOptions: {
    defaultViewport: { width: 1200, height: 800 },
    headless: false,
    executablePath: "",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  notify: false,
  testBook: {
    date: "2022-01-11 20:15",
    user: User.VW,
    workout: Workout["box"],
    gym: Gym["dalaplan"],
  },
});
