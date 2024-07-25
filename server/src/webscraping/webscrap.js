import { promises as fs } from 'fs';
import { promisify } from 'util';
import rimrafModule from 'rimraf';
import chromium from "@sparticuz/chromium";
import puppeteer from 'puppeteer';

import { fileURLToPath } from 'url';
import { dirname } from 'path';
// import Chromium from 'chrome-aws-lambda';

const rimraf = promisify(rimrafModule);
chromium.setHeadlessMode = true;
chromium.setGraphicsMode = false;

async function clearCache() {
    await rimraf('./.cache/puppeteer');
}

function delay(milliseconds) {
    return new Promise(resolve => {
        setTimeout(resolve, milliseconds);
    });
}

const userAgentStrings = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.3497.92 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
];

// Utility to get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getRandomUserAgent = () => {
    const randomIndex = Math.floor(Math.random() * userAgentStrings.length);
    return userAgentStrings[randomIndex];
};

let maxRetries = 4;

async function safeGoto(page, url, options, retries = 0) {
    try {
        await page.goto(url, options);
    } catch (error) {
        if (retries < maxRetries) {
            console.log(`Retrying navigation to ${url} (${retries + 1}/${maxRetries})...`);
            await safeGoto(page, url, options, retries + 1);
        } else {
            throw error;
        }
    }
}

const pageDelays = Array.from({ length: 30 }, (_, i) => 1000 + i * 100);
const scrollTimes = Array.from({ length: 40 }, (_, i) => 100 * i);

const navigate_urls = [
    "https://finance.yahoo.com",
    "https://www.espn.com",
    "https://openweathermap.org",
    "https://www.data.gov",
    "https://www.indeed.com",
    "https://www.google.com/finance",
    "https://www.sports-reference.com",
    "https://www.europeandataportal.eu",
    "https://www.wunderground.com",
    "https://www.booking.com"
];

const WebscrapingData = (url1, cookieData) => {
    return new Promise(async (resolve, reject) => {
        const maxRetries = 5;
        let attempt = 0;
        let success = false;

        while (attempt < maxRetries && !success) {
            try {
                await clearCache();
                console.log("I am inside Puppeteer");

                let options = {
                    args: [
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        "--hide-scrollbars",
                        "--disable-web-security",
                        "--single-process",
                        "--no-zygote",
                    ],
                    headless: false,

                    ignoreHTTPSErrors: true,
                };

                console.log(await chromium.executablePath);
                console.log(options);

                const browser = await puppeteer.launch(options);
                console.log("Puppeteer is launched");
                const page = await browser.newPage();
                await page.setViewport({ width: 800, height: 600 });
                setTimeout(async () => {
                    console.log('Closing browser due to timeout...');
                    if (browser) {
                        await browser.close();
                    }
                }, 180000);

                const cookie = {
                    name: 'li_at',
                    value: cookieData,
                    domain: '.www.linkedin.com',
                    path: '/',
                    httpOnly: false,
                    secure: true
                };
                await page.setCookie(cookie);
                await page.setExtraHTTPHeaders({
                    'Accept-Language': 'en-US,en;q=0.9',
                    'Referer': 'https://www.linkedin.com/',
                });

                try {
                    await safeGoto(page, navigate_urls[Math.floor(Math.random() * navigate_urls.length)], { waitUntil: 'load', timeout: 20000 });
                    await new Promise(r => setTimeout(r, pageDelays[Math.floor(Math.random() * pageDelays.length)]));

                    await safeGoto(page, url1, { waitUntil: 'networkidle2', timeout: 20000000 });

                    // This is the first layer
                    await page.waitForSelector('.account-top-card', { timeout: 18000000 });
                    await new Promise(r => setTimeout(r, 2000));

                    const dataFirstLayer = await page.evaluate(() => {
                        const accountCard = document.querySelector(".account-top-card.entity-card");
                        if (!accountCard) return null;
                        
                        const arr2 = Array.from(accountCard.children[0]?.children[0]?.children || []);

                        const result = arr2.reduce((current, vl, index) => {
                            if (index === 0) {
                                current = {
                                    img: vl.children[0]?.children[0]?.children[0]?.src || '',
                                    company: vl.children[0]?.children[1]?.children[0]?.innerText || '',
                                    industry: vl.children[0]?.children[1]?.children[1]?.children[0]?.children[0]?.innerText || '',
                                    employees: vl.children[0]?.children[1]?.children[1]?.children[0]?.children[2]?.innerText || '',
                                    revenue: vl.children[0]?.children[1]?.children[1]?.children[0]?.children[3]?.innerText || '',
                                    country: vl.children[0]?.children[1]?.children[2]?.innerText || ''
                                };
                            }
                            return current;
                        }, {});

                        return { data: result };
                    });

                    // Check if first layer data is null
                    if (!dataFirstLayer) {
                        resolve([]);
                        success = true;
                        return;
                    }

                    // This is the button for modal data activation
                    await page.waitForSelector('.account-top-card__account-descriptions');
                    await new Promise(r => setTimeout(r, 2000));
                    await page.evaluate(() => {
                        const button = document.querySelector(".account-top-card__account-descriptions")
                            ?.children[0]?.children[0]?.children[1]?.children[0];
                        if (button) button.click();
                    });

                    // This is modal data for fetching info
                    await page.waitForSelector('#ember-panel-outlet', { timeout: 18000000 });
                    await new Promise(r => setTimeout(r, 2000));

                    const dataSecondLayer = await page.evaluate(() => {
                        const modalId = document.getElementById("ember-panel-outlet");
                        if (!modalId) return null;

                        const arr = Array.from(modalId.children[0]?.children[0]?.children[3]?.children || []);

                        const data = arr.reduce((current, value, index) => {
                            if (index === 1) {
                                current.description = value?.innerText || '';
                            }

                            if (index === 3) {
                                current.header_quater = value.children[1]?.children[1]?.innerText || '';
                                current.website = value.children[0]?.children[1]?.innerText || '';
                                current.type = value.children[2]?.children[1]?.innerText || '';
                            }

                            return current;
                        }, {});

                        return { data };
                    });

                    // Check if second layer data is null
                    if (!dataSecondLayer) {
                        resolve([]);
                        success = true;
                        return;
                    }

                    console.log(dataSecondLayer);
                    console.log(dataFirstLayer);

                    resolve({ ...dataFirstLayer.data, ...dataSecondLayer.data });
                    success = true;
                } catch (error) {
                    console.log(error);
                    attempt++;
                    if (attempt === maxRetries) {
                        reject({ error: error });
                    }
                } finally {
                    console.log("I am in finally");
                    await browser.close();
                }
            } catch (err) {
                console.log("I am error Puppeteer");
                console.log(err);
                attempt++;
                if (attempt === maxRetries) {
                    reject(err);
                }
            }
        }

        console.log(`All done, check the screenshots. ✨`);
    });
};
// const ur1="https://www.linkedin.com/sales/company/81577225?_ntb=sVXClZ16QIi2pIN2R7%2Fgzw%3D%3D";
// const cookieData="AQEFARABAAAAABCnwTkAAAGQ3ccEMAAAAZEB049eVgAAs3VybjpsaTplbnRlcnByaXNlQXV0aFRva2VuOmVKeGpaQUFDN3NtekpVRTB2NXp0QnhETngySThoUkhFaUtyYzZnWm1SQjcwMG1aZ0JBQ05JUWJuXnVybjpsaTplbnRlcnByaXNlUHJvZmlsZToodXJuOmxpOmVudGVycHJpc2VBY2NvdW50OjE5NDIyMjg3MywyNTM2NDAxNzYpXnVybjpsaTptZW1iZXI6NDA1MjQ0NDM5FYrMHcz9bF7iCGNv2sgsnKmLUgslrB_lVY494Kl7IH7_glc-BTjYd39XVQHs6906ajhDnSnJ_i56o_lrn2U64UuhFqp1u9bPiw4bDlvyeVI7gPktBGoYJkgBaNVsHBirkJ4E-NxHefkplf9EsfSTKHACVvvA9IuHexR5RSZGvmlf-EylPRCJ8kNTFxg0EJnzgdlKlw";
// WebscrapingData(ur1,cookieData).then((data)=>console.log(data)).catch((err)=>console.log())



 export default WebscrapingData;






















