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
    date: "2023-03-13 06:30",
    user: User.VW,
    workout: Workout["cycling"],
    gym: Gym["värnhem"],
  },
});
