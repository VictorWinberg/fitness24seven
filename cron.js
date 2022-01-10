const puppeteer = require("puppeteer");
const { CronJob } = require("cron");
const dayjs = require("dayjs");
const fetch = require("node-fetch");
const atob = require("atob");
require("dotenv").config();

const { Day, User, Gym, Workout } = require("./constants.js");

module.exports = ({
  homeUrl = "https://se.fitness24seven.com/mina-sidor/oversikt/",
  classesUrl = "https://digitalplatform-prod-svc.azurewebsites.net/v2/Booking/sv-SE/Classes",
  bookUrl = "https://digitalplatform-prod-svc.azurewebsites.net/v2/Booking/BookClass",
  notify = true,
  notifyUrl = "https://home.zolly.ml/api/services/notify/",
  notifyUrlAdmin = "https://home.zolly.ml/api/services/notify/mobile_app_mr",
  puppeteerOptions = {
    defaultViewport: { width: 1200, height: 800 },
    headless: true,
    executablePath: "chromium-browser",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  },
  testBook = null,
  offsetMinutes = 5,
}) => {
  let sessionIds = [];

  /** @param {number} ms */
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  /**
   * Books a session with fitness24seven API
   * @param {any} session
   * @param {any} auths
   * @param {any} date
   * @param {any} usr
   * @param {any} gym
   * @param {any} day
   */
  async function bookSessionAPI(session, auths, date, usr, gym, day) {
    if (sessionIds.includes(usr + session.id)) return;
    sessionIds.push(usr + session.id);

    const delay = date.diff(dayjs());
    console.log(` --API Sleep ${delay}ms ` + new Date().toLocaleString());
    await sleep(delay + 500);
    const now = new Date().toLocaleString() + " " + new Date().getMilliseconds() + "ms";
    console.log(" --API Awake " + now);

    auths
      .filter((auth) => auth.scopes)
      .forEach(async (auth) => {
        console.log(" --API booking");
        fetch(`${bookUrl}?classId=${session.id}`, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + auth.accessToken,
          },
        })
          .then(async (res) => {
            console.log("API Booking completed " + res.status + " " + now);
            console.log(await res.json());
            sessionIds.pop(usr + session.id);

            if (notify) {
              fetch(notifyUrl + process.env[usr + "_HA"], {
                method: "POST",
                headers: {
                  Authorization: "Bearer " + process.env.BEARER_TOKEN,
                },
                body: JSON.stringify({
                  title: "Fitness24Seven",
                  message: `API Booking completed ${res.status}: ${day} at ${gym.name} - ${now}`,
                }),
              });
            }
          })
          .catch((err) => {
            console.error("API Booking failed", now);
            console.error(err);
            sessionIds.pop(usr + session.id);
          });
      });
  }

  /**
   * Books a session on fitness24seven
   * @param {dayjs.Dayjs} date
   * @param {any} usr
   * @param {{name: string, var: string}} workout
   * @param {{name: string, var: string}} gym
   */
  async function bookSession(date, usr, workout, gym) {
    let browser, page, session, auths;
    const day = Object.keys(Day)[date.add(2, "day").day()];
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

      // Go to booking
      await page.waitForSelector(".c-info-box--cta, .c-arrow-cta__link[href='/mina-sidor/boka-grupptraning/']");
      await page.evaluate(() => document.querySelector(".c-info-box--cta, .c-arrow-cta__link[href='/mina-sidor/boka-grupptraning/']").click());
      console.log(" --Booking");

      const storage = await page.evaluate(() => JSON.stringify(window.localStorage));
      auths = Object.keys(JSON.parse(storage))
        .filter((key) => key.includes("authority"))
        .reduce((acc, curr) => acc.concat({ ...JSON.parse(curr), ...JSON.parse(JSON.parse(storage)[curr]) }), []);

      const res = await fetch(`${classesUrl}?gymIds=${gym.var}`);
      const { classes } = await res.json();
      session = classes.filter(({ typeId, starts }) => typeId === workout.var && dayjs(date.add(2, "day")).isSame(starts)).pop();

      if (session) {
        console.log(" --API found session");
        bookSessionAPI(session, auths, date, usr, gym, day);
      }

      // Helper methods for filter selecting
      const filterSelector = (id, dd) => `.u-display-none--sm .c-class-filter:nth-child(${id}) .c-filter-dropdown:nth-child(${dd}) .c-filter-dropdown__button--clickable`;
      await page.evaluate(() => {
        window.filterSelector = function (id, dd) {
          return `.u-display-none--sm .c-class-filter:nth-child(${id}) .c-filter-dropdown:nth-child(${dd}) .c-filter-dropdown__button--clickable`;
        };
      });

      // Set Weekday
      await page.waitForSelector(`.c-weekday-switcher__weekday-container:nth-child(${3})`);
      await page.evaluate(() => document.querySelector(`.c-weekday-switcher__weekday-container:nth-child(${3})`).click());

      // Free spots
      // await page.waitForSelector(".c-filter-toggle__toggle-input");
      // await page.evaluate(() => document.querySelector(".c-filter-toggle__toggle-input").click());

      // Country
      await page.waitForSelector(filterSelector(1, 2));
      await page.evaluate(() => document.querySelector(window.filterSelector(1, 2)).click());

      // Country Sweden
      await page.waitForSelector("#checkbox-Sverige-input");
      await page.evaluate(() => document.getElementById("checkbox-Sverige-input").click());

      // City
      await page.waitForSelector(filterSelector(1, 3));
      await page.evaluate(() => document.querySelector(window.filterSelector(1, 3)).click());

      // City Malmo
      await page.waitForSelector("#checkbox-Malmö-input");
      await page.evaluate(() => document.getElementById("checkbox-Malmö-input").click());

      const delay = date.diff(dayjs());
      console.log(` --Sleep ${delay}ms ` + new Date().toLocaleString());
      await sleep(delay);
      console.log(" --Awake " + new Date().toLocaleString());

      // Gym
      await page.waitForSelector(filterSelector(1, 4));
      await page.evaluate(() => document.querySelector(window.filterSelector(1, 4)).click());

      await page.waitForSelector(`[id='checkbox-${gym.name}-input']`);
      await page.evaluate((gym) => document.getElementById(`checkbox-${gym.name}-input`).click(), gym);

      // Workout
      await page.waitForSelector(filterSelector(2, 2));
      await page.evaluate(() => document.querySelector(window.filterSelector(2, 2)).click());

      // Workout Selection
      const checkboxInput = `checkbox-${workout.name}-input`;
      await page.waitForSelector("#" + checkboxInput);
      await page.evaluate((input) => document.getElementById(input).click(), checkboxInput);

      console.log(" --Looking for available session " + new Date().toLocaleString());

      // Book
      await page.waitForSelector(".c-class-card__button:not(.c-btn--cancel)");
      const now = new Date().toLocaleString();
      await page.evaluate(() => [...document.querySelectorAll(".c-class-card__button:not(.c-btn--cancel)")].pop().click());

      console.log("Booking completed " + now);

      if (notify) {
        fetch(notifyUrl + process.env[usr + "_HA"], {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.BEARER_TOKEN,
          },
          body: JSON.stringify({
            title: "Fitness24Seven",
            message: `Booking complete: ${day} at ${gym.name} - ${now}`,
          }),
        });
      }

      await sleep(10000);
      await browser.close();
    } catch (error) {
      if (notify) {
        fetch(notifyUrl + process.env[usr + "_HA"], {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.BEARER_TOKEN,
          },
          body: JSON.stringify({
            title: "Fitness24Seven",
            message: `Booking failed: ${day} at ${gym.name} - ${new Date().toLocaleString()}`,
          }),
        });

        fetch(notifyUrlAdmin, {
          method: "POST",
          headers: {
            Authorization: "Bearer " + process.env.BEARER_TOKEN,
          },
          body: JSON.stringify({
            title: "Fitness24Seven",
            message: `[${usr}] Booking failed: ${day} at ${gym.name} - ${new Date().toLocaleString()}`,
          }),
        });
      }

      // const html = await page.evaluate(() => document.body.innerHTML)
      // console.error(html.replace(/\n/g, ""));
      console.log(error);
      console.log("Booking failed " + new Date().toLocaleString());

      await browser.close();

      const delay = date.diff(dayjs());
      if (delay > 0) {
        console.log(" --Retry " + new Date().toLocaleString());
        bookSession(date, usr, workout, gym);
      }
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
   * @param {number} weekday
   * @param {string} hours
   * @param {string} minutes
   * @param {string} usr
   * @param {{name: string, var: string}} workout
   * @param {{name: string, var: string}} gym
   */
  function schedule(weekday, hours, minutes, usr, workout, gym) {
    const day = (weekday + 7 - 2) % 7;
    let date = dayjs(`${dayjs().format("YYYY-MM-DD")} ${hours}:${minutes}`);
    const offset = date.subtract(offsetMinutes, "minute");
    new CronJob(
      `0 ${offset.format("mm HH")} * * ${day}`,
      function () {
        date = dayjs(`${dayjs().format("YYYY-MM-DD")} ${hours}:${minutes}`);
        console.log(`Performing booking ${hours}:${minutes} on ${Object.keys(Day)[weekday]} at ${gym.name} for ${usr}`, new Date().toLocaleString());
        bookSession(date, usr, workout, gym);
      },
      null,
      true,
      "Europe/Stockholm"
    ).start();

    console.log(`Scheduling booking ${hours}:${minutes} on ${Object.keys(Day)[weekday]} at ${gym.name} for ${usr}`);
  }

  // Keep alive
  new CronJob(
    "0 0 1 0 *",
    function () {
      console.log("Happy New Year!");
    },
    null,
    true,
    "Europe/Stockholm"
  ).start();

  if (notify) {
    fetch(notifyUrlAdmin, {
      method: "POST",
      headers: {
        Authorization: "Bearer " + process.env.BEARER_TOKEN,
      },
      body: JSON.stringify({
        title: "Fitness24Seven",
        message: "Booking Service is up and running!",
      }),
    });
  }

  console.log(`Booking Service is up and running! - ${new Date().toLocaleString()}`);

  require("./schedule.js")({ schedule, Day, User, Workout, Gym });

  if (testBook) {
    const { date, user, workout, gym } = testBook;
    bookSession(dayjs(date).subtract(2, "day"), user, workout, gym);
  }
};
