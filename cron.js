const puppeteer = require("puppeteer");
const { CronJob } = require("cron");
const dayjs = require("dayjs");
const fetch = require("node-fetch");
const atob = require("atob");
require("dotenv").config();

const { Day, User } = require("./constants.js");

let jobs = {};

module.exports = ({
  homeUrl = "https://se.fitness24seven.com/mina-sidor/oversikt/",
  apiUrl = "https://platform.fitness24seven.com/api/v2",
  notifyEnabled = true,
  notifyUrl = "https://home.codies.se/api/services/notify/",
  puppeteerOptions = {
    defaultViewport: { width: 1200, height: 800 },
    headless: true,
    executablePath: "chromium-browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  testBook = null,
  offsetMinutes = 5,
}) => {
  let bookingIds = [];

  /** @param {number} ms */
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Notifies a user
   * @param {string} user
   * @param {string} message
   */
  function notify(user, message) {
    if (!notifyEnabled) {
      console.log("Notification:", message);
      return;
    }
    fetch(notifyUrl + process.env[user + "_HA"], {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.BEARER_TOKEN,
      },
      body: JSON.stringify({
        title: "Fitness24Seven",
        message,
      }),
    });
  }

  /**
   * Books a timeslot with fitness24seven API
   * @param {{id: string}} timeslot
   * @param {string} token
   * @param {dayjs.Dayjs} date
   * @param {string} usr
   * @param {{name: string}} gym
   * @param {string} day
   * @param {any} callback
   */
  async function bookTimeslotAPI(timeslot, token, date, usr, gym, day, callback) {
    if (bookingIds.includes(usr + timeslot.id)) return;
    bookingIds.push(usr + timeslot.id);

    const api = require("./api.js")({ apiUrl, token });
    const delay = date.diff(dayjs());
    console.log(` --API Sleep ${delay}ms ` + new Date().toLocaleString());
    await sleep(delay + 500);
    const now = `${new Date().toLocaleString()} ${new Date().getMilliseconds()}ms`;
    console.log(" --API Awake " + now);

    console.log(" --API Booking");
    try {
      const booking = await api.createNewBooking(timeslot.id);

      if (booking.isSuccessful) {
        console.log("API Booking successful " + now);
        // notify(usr, `Booking successful: ${day} at ${gym.name} - ${now}`);
      } else {
        console.log("API Booking failed " + booking.errorCode + " " + now);
        notify(usr, `Booking failed ${booking.errorCode}: ${day} at ${gym.name} - ${now}`);
      }

      bookingIds.pop(usr + timeslot.id);

      callback(booking.isSuccessful);
      return booking.isSuccessful;
    } catch (err) {
      console.error("API Booking error", now);
      console.error(err);
      bookingIds.pop(usr + timeslot.id);

      notify(usr, `Booking error: ${day} at ${gym.name} - ${now}`);
      callback(false);
      return false;
    }
  }

  /**
   * Books a session on fitness24seven
   * @param {dayjs.Dayjs} date
   * @param {string} usr
   * @param {{name: string}} workout
   * @param {{id: string, name: string}} gym
   * @param {any} callback
   */
  async function bookSession(date, usr, workout, gym, callback) {
    let browser, page, token;
    const day = Object.keys(Day)[date.add(4, "day").day()];
    try {
      console.log(`Booking ${day} at ${gym.name} for ${usr} - ${new Date().toLocaleString()}...`);
      browser = await puppeteer.launch(puppeteerOptions);
      page = await browser.newPage();

      page.on("console", (msg) => console.log("\x1b[33mCONSOLE\x1b[0m", msg.text()));

      // Homepage
      await page.goto(homeUrl);
      console.log(" --Homepage");

      // Go to login
      await page.waitForSelector(".c-login .c-btn");
      await page.evaluate(() => {
        document.querySelector(".c-login .c-btn").click();
      });
      console.log(" --Login");

      // Login
      await page.waitForSelector("#email");
      await page.evaluate(
        (email, pass) => {
          document.getElementById("email").value = email;
          document.getElementById("password").value = pass;
          document.getElementById("next").click();
        },
        process.env[usr + "_EMAIL"],
        atob(process.env[usr + "_PASSWORD"] || "")
      );

      await page.waitForFunction('window.localStorage.isLoggedin === "true"');
      console.log(" --Logged in");

      const storage = await page.evaluate(() => JSON.stringify(window.localStorage));
      token = Object.keys(JSON.parse(storage))
        .filter((key) => key.includes("accesstoken"))
        .map((key) => JSON.parse(JSON.parse(storage)[key]).secret)
        .pop();

      // e.g. info.idTokenClaims.extension_PersonId
      info = Object.values(JSON.parse(storage))
        .filter((value) => value.includes("idTokenClaims"))
        .map(JSON.parse)
        .pop();

      if (!token) {
        console.error(" --No token found");
        await sleep(10000);
        await browser.close();
        return;
      }

      const api = require("./api.js")({ apiUrl, token });

      const timeslots = await api.getTimeSlotsNew(gym.id);
      const timeslot = timeslots
        .filter(({ activity }) => activity.name === workout.name)
        .filter(({ duration }) => dayjs(date.add(4, "day")).isSame(duration.start))
        .pop();

      if (!timeslot) {
        console.error(" --No timeslot found");
        await sleep(10000);
        await browser.close();
        return;
      }

      console.log(" --API found session");
      await bookTimeslotAPI(timeslot, token, date, usr, gym, day, callback);

      await sleep(10000);
      await browser.close();
    } catch (error) {
      console.log(error);
      if (browser) await browser.close();

      const delay = date.diff(dayjs());
      if (delay > 0) {
        console.log(" --Retry " + new Date().toLocaleString());
        bookSession(date, usr, workout, gym, callback);
        return;
      }

      notify(usr, `Booking failed: ${day} at ${gym.name} - ${new Date().toLocaleString()}`);
      callback(false);

      // const html = await page.evaluate(() => document.body.innerHTML)
      // console.error(html.replace(/\n/g, ""));
      console.log(error);
      console.log("Booking failed " + new Date().toLocaleString());
    }
  }

  // *    *    *    *    *    *
  // ┬    ┬    ┬    ┬    ┬    ┬
  // │    │    │    │    │    │
  // │    │    │    │    │    └ day of week (0 - 6) (Sun - Sat)
  // │    │    │    │    └───── month (0 - 11) (Jan - Dec)
  // │    │    │    └────────── day of month (1 - 31)
  // │    │    └─────────────── hours (0 - 23)
  // │    └──────────────────── minutes (0 - 59)
  // └───────────────────────── seconds (0 - 59)

  /**
   * Schedules a cron job that books on fitness24seven
   * @param {dayjs.Dayjs} date
   * @param {string} usr
   * @param {{name: string}} workout
   * @param {{name: string}} gym
   * @param {any} callback
   */
  function schedule(date, usr, workout, gym, callback) {
    const offset = date.subtract(offsetMinutes, "minute");
    const datestring = date.format("ddd DD MMM YYYY HH:mm");
    const unique = `${datestring} - ${gym.name} - ${usr}`;
    const job = new CronJob(
      `0 ${offset.format("m H")} ${date.date()} ${date.month()} *`,
      function () {
        console.log(`Performing booking: ${unique}`, new Date().toLocaleString());
        bookSession(date, usr, workout, gym, callback);
      },
      null,
      true,
      "Europe/Stockholm"
    );

    jobs[unique] = job;

    job.start();

    console.log(`Scheduling booking: ${unique}`);
  }

  require("./calendar.js")({ schedule, notify });

  // Daily check
  new CronJob(
    "0 3 * * *",
    function () {
      Object.values(jobs).forEach((job) => job.stop());
      jobs = {};

      require("./calendar.js")({ schedule, notify });
    },
    null,
    true,
    "Europe/Stockholm"
  ).start();

  notify(User.VW, "Booking Service is up and running!");

  console.log(`Booking Service is up and running! - ${dayjs().format("ddd DD MMM HH:mm")}`);

  if (testBook) {
    const { date, user, workout, gym } = testBook;
    bookSession(dayjs(date).subtract(4, "day"), user, workout, gym, () => {});
  }
};
