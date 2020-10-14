const puppeteer = require("puppeteer");
const { CronJob } = require("cron");
require("dotenv").config();

const url = "https://se.fitness24seven.com/mina-sidor/oversikt/";
const headless = true;

/** @param {number} ms */
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

/**
 * Books a session on fitness24seven
 * @param {string} gym
 */
async function bookSession(gym) {
    let browser, page;
    try {
        console.log(`Booking ${gym}...`);
        browser = await puppeteer.launch({
            defaultViewport: { width: 1200, height: 800 },
            headless,
            executablePath: "chromium-browser",
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        page = await browser.newPage();

        page.on("console", (msg) => console.log("\x1b[33mCONSOLE\x1b[0m", msg.text()));

        // Homepage
        await page.goto(url);
        console.log(' --Homepage');

        // Go to login
        await page.waitForSelector(".c-login .c-btn");
        await page.evaluate(() => { document.querySelector(".c-login .c-btn").click() });
        console.log(' --Login');

        // Login
        await page.waitForSelector("#logonIdentifier");
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
        await page.waitForSelector(".c-info-box--cta, .c-arrow-cta__link[href='/mina-sidor/boka-grupptraning/']");
        await page.evaluate(() => document.querySelector(".c-info-box--cta, .c-arrow-cta__link[href='/mina-sidor/boka-grupptraning/']").click());
        console.log(' --Booking');

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

        switch (gym) {
            case Gym.Lilla_Torg:
                // Gym Malmo Lilla Torg
                await page.waitForSelector("[id='checkbox-Malmö Lilla Torg-input']");
                await page.evaluate(() => document.getElementById("checkbox-Malmö Lilla Torg-input").click());
                break;
            case Gym.Katrinelund:
                // Gym Malmö Katrinelund
                await page.waitForSelector("[id='checkbox-Malmö Katrinelund-input']");
                await page.evaluate(() => document.getElementById("checkbox-Malmö Katrinelund-input").click());
                break;
            case Gym.Dalaplan:
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

        console.log(' --Looking for available session');

        // Book
        await page.waitForSelector(".c-class-card__button:not(.c-btn--cancel)");
        await page.evaluate(() => document.querySelector(".c-class-card__button:not(.c-btn--cancel)").click());

        console.log("Booking completed " + new Date().toLocaleString());

        await sleep(10000);

        await browser.close();

        console.log('Browser closed');

    } catch (error) {
        console.error(error);
        const html = await page.evaluate(() => document.body.innerHTML)
        console.log(html.replace(/\n/g, ""));
        await browser.close();
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
 * @param {string} gym
 */
function schedule(weekday, hours, minutes, gym) {
    const day = (weekday + 7 - 2) % 7;
    new CronJob(
        `0 ${minutes} ${hours} * * ${day}`,
        function () {
            console.log(`Performing booking ${hours}:${minutes} for ${Object.keys(Day)[weekday]} at ${gym}`, new Date().toLocaleString());
            bookSession(gym)
        },
        null,
        true,
        "Europe/Stockholm"
    ).start();

    console.log(`Scheduling booking ${hours}:${minutes} for ${Object.keys(Day)[weekday]} at ${gym}`);
}

const Day = {
    "Sunday": 0,
    "Monday": 1,
    "Tuesday": 2,
    "Wednesday": 3,
    "Thursday": 4,
    "Friday": 5,
    "Saturday": 6,
}

const Gym = {
    "Lilla_Torg": "Lilla Torg",
    "Dalaplan": "Dalaplan",
    "Katrinelund": "Katrinelund"
}

schedule(Day.Wednesday, "06", "30", Gym.Lilla_Torg);
schedule(Day.Wednesday, "18", "15", Gym.Dalaplan);
schedule(Day.Thursday, "18", "00", Gym.Katrinelund);
schedule(Day.Thursday, "19", "00", Gym.Lilla_Torg);
