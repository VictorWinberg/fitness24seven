const puppeteer = require("puppeteer");
const { CronJob } = require("cron");
require("dotenv").config();

const url = "https://se.fitness24seven.com/mina-sidor/oversikt/";
const headless = true;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Books a bodypump session in 2 days on fitness24seven
 * @param {string} gym
 */
async function bookSession(gym) {
    const browser = await puppeteer.launch({ defaultViewport: null, headless });
    const page = await browser.newPage();

    await page.setViewport({ width: 1200, height: 2000 });

    page.on("console", (msg) => console.log("\x1b[33mCONSOLE\x1b[0m", msg.text()));

    // Homepage
    await page.goto(url);

    // Go to login
    await page.waitForSelector(".c-login .c-btn");
    await page.evaluate(() => document.querySelector(".c-login .c-btn").click());
    await page.waitForSelector("#logonIdentifier");

    // Login
    await page.evaluate(
        (email, pass) => {
            document.getElementById("logonIdentifier").value = email;
            document.getElementById("password").value = pass;
            document.getElementById("next").click();
        },
        process.env.USER_1_EMAIL,
        process.env.USER_1_PASSWORD
    );

    // Go to booking
    // await page.waitForSelector(".c-info-box--cta");
    // await page.evaluate(() => document.querySelector(".c-info-box--cta").click());
    await page.waitForSelector(".c-arrow-cta__link[href='/mina-sidor/boka-grupptraning/']");
    await page.evaluate(() => document.querySelector(".c-arrow-cta__link[href='/mina-sidor/boka-grupptraning/']").click());

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
    await page.waitForSelector(".c-filter-toggle__toggle-input");
    await page.evaluate(() => document.querySelector(".c-filter-toggle__toggle-input").click());

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

    // Gym
    await page.waitForSelector(filterSelector(1, 4));
    await page.evaluate(() => document.querySelector(window.filterSelector(1, 4)).click());

    switch (gym.toLowerCase()) {
        case "lilla torg":
            // Gym Malmo Lilla Torg
            await page.waitForSelector("[id='checkbox-Malmö Lilla Torg-input']");
            await page.evaluate(() => document.getElementById("checkbox-Malmö Lilla Torg-input").click());
            break;
        case "katrinelund":
            // Gym Malmö Katrinelund
            await page.waitForSelector("[id='checkbox-Malmö Katrinelund-input']");
            await page.evaluate(() => document.getElementById("checkbox-Malmö Katrinelund-input").click());
            break;
        case "dalaplan":
            // Gym Malmö Dalaplan
            await page.waitForSelector("[id='checkbox-Malmö Dalaplan-input']");
            await page.evaluate(() => document.getElementById("checkbox-Malmö Dalaplan-input").click());
            break;
    }

    // Session
    await page.waitForSelector(filterSelector(2, 2));
    await page.evaluate(() => document.querySelector(window.filterSelector(2, 2)).click());

    // Session Bodypump
    await page.waitForSelector("#checkbox-BODYPUMP®-input");
    await page.evaluate(() => document.getElementById("checkbox-BODYPUMP®-input").click());

    // Book Bodypump
    await page.waitForSelector(".c-class-card__button:not(.c-btn--cancel)");
    await page.evaluate(() => document.querySelector(".c-class-card__button:not(.c-btn--cancel)").click());

    await sleep(10000);

    await browser.close();
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
 * @param {string} weekday
 * @param {number} hours
 * @param {number} minutes
 * @param {string} gym
 */
function schedule(weekday, hours, minutes, gym) {
    const _weekday = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"].indexOf((weekday + 7 - 2) % 7);
    new CronJob(
        `0 ${minutes} ${hours} * * ${_weekday}`,
        function () {
            bookSession(gym)
        },
        null,
        true,
        "Europe/Berlin"
    ).start();
}

schedule("wednesday", 06, 30, "Lilla Torg")
schedule("wednesday", 18, 15, "Dalaplan")
