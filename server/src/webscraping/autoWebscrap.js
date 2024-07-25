import puppeteer from 'puppeteer-extra';
import requestPromise from 'request-promise';
import proxyChain from 'proxy-chain';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';
import { promises as fs } from 'fs';
import { promisify } from 'util';
import { readFile } from 'fs/promises';
import rimrafCallback from 'rimraf';
const rimraf = promisify(rimrafCallback);

puppeteer.use(StealthPlugin());
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));

const userAgentStrings = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.2227.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.3497.92 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36',
];

const navigate_url = [
    "https://www.geeksforgeeks.org/array-data-structure/",
    "https://www.hackerrank.com/domains/tutorials/10-days-of-javascript",
    "https://www.w3schools.com/jsref/jsref_obj_array.asp",
    "https://www.interviewbit.com/courses/programming/",
    "https://www.programiz.com/c-programming/examples",
    "https://www.educative.io/courses/grokking-the-coding-interview",
    "https://www.codecademy.com/learn/paths/web-development",
    "https://www.codementor.io/",
    "https://www.topcoder.com/community/competitive-programming/",
    "https://www.codesignal.com/",
];

const pageDelay = Array.from({ length: 30 }, (_, i) => 1000 + i * 100);
const scrollArr = Array.from({ length: 30 }, (_, i) => 100 + i * 100);

const clearCache = async () => {
    await rimraf('./.cache/puppeteer');
};

const getRandomUserAgent = () => {
    const randomIndex = Math.floor(Math.random() * userAgentStrings.length);
    return userAgentStrings[randomIndex];
};

const delay = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
};

const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
};

shuffleArray(pageDelay);
shuffleArray(scrollArr);

const getRandomPageDelay = () => {
    const randomIndex = Math.floor(Math.random() * pageDelay.length);
    return pageDelay[randomIndex];
};

const getRandomScrollTime = () => {
    const randomIndex = Math.floor(Math.random() * scrollArr.length);
    return scrollArr[randomIndex];
};

const addPageBeforeQuery = (url, page) => {
    let queryIndex = url.indexOf('query=');
    if (queryIndex === -1) return url;
    const newUrl = url.slice(0, queryIndex) + ` page=${page}&` + url.slice(queryIndex);
    return newUrl;
};

const removePageParam = (url) => {
    const urlObj = new URL(url);
    urlObj.searchParams.delete('page');
    return urlObj.toString();
};

const getProxy = async () => {
    const anonymizedProxy = await proxyChain.anonymizeProxy({ url: proxyURL });
    return anonymizedProxy;
};

const navigateWithRetry = async (page, url, options, maxRetries = 3, retryDelay = 5000) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await page.goto(url, options);
            return;
        } catch (error) {
            console.error(`Error navigating to ${url}. Retrying...`);
            await delay(retryDelay);
            retries++;
        }
    }
    console.error(`Failed to navigate to ${url} after ${maxRetries} retries.`);
};

const WebscrapingData = (url1, cookieData) => {
    return (new Promise(async (resolve, reject) => {
        await clearCache();

        puppeteer.launch({
            headless: false,

            args: [
               
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                    "--hide-scrollbars",
                    "--disable-web-security",
                    "--single-process",
                    "--no-zygote",
                
            ],
            timeout: 600000,
            ignoreHTTPSErrors: true
        }).then(async browser => {
            const page = await browser.newPage();
            await page.setViewport({ width: 800, height: 600 });

            const cookie = {
                name: 'li_at',
                value: cookieData, // Replace with your actual cookie value
                domain: '.www.linkedin.com',
                path: '/',
                httpOnly: true,
                secure: true
            };

            await page.setCookie(cookie);
            await page.setExtraHTTPHeaders({
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.linkedin.com/',
            });

            try {
                async function safeGoto(url, options) {
                    try {
                        await navigateWithRetry(page, url, options);
                    } catch (error) {
                        console.error('Navigation error:', error);
                    }
                }
                // Close the browser after 5 minutes
                setTimeout(async () => {
                    console.log('Closing browser due to timeout...');
                    if (browser) {
                        await browser.close();
                    }
                }, 180000);

                await safeGoto(url1, { waitUntil: 'load', timeout: 20000 });
                await page.waitForSelector('a', { timeout: 1800000 });

                const title = await page.evaluate(() => document.title);
                console.log(title);

                const links = await page.evaluate(() => {
                    const links = Array.from(document.querySelectorAll('a')).map(a => a.href);
                    return links;
                });
                console.log(links);


                await page.waitForSelector('.artdeco-list__item div .flex .flex .flex .artdeco-entity-lockup__title', { timeout: 18000000 });

                const infiniteScroll = async (page, arr) => {
                    let data = arr || [];

                    const scrollToBottomOfDiv = async () => {
                        const divElement = await page.$("#search-results-container");
                        if (divElement) {
                            await page.evaluate(() => {
                                const element = document.getElementById("search-results-container")
                                element.scrollTop += 100;
                            });
                        }
                    };

                    const extractData = async () => {
                        const newItems = await page.evaluate(() => {
                            return Array.from(document.querySelectorAll(".artdeco-list__item div .flex .flex .flex .artdeco-entity-lockup__title"))
                                .map(element => {
                                    return {
                                        name: element.children[0].innerText.trim(),
                                        link: element.parentElement.parentElement.children[1].children[2].href,
                                        company: element.parentElement.parentElement.children[1].children[2].innerText,
                                        position: element.parentElement.parentElement.children[1].children[0].innerHTML,
                                        profile: element.children[0].href

                                    };
                                });
                        });

                        return newItems;
                    };

                    while (data.length < 25) {
                        await scrollToBottomOfDiv();
                        const newData = await extractData();
                        console.log(newData.length)
                        if (newData.length == 25) {
                            data = newData;
                            console.log("LENGTH = " + data.length);
                        }
                        await delay(100);
                    }

                    return data;
                };

                const secondPage = async (exec, value, chances = 1) => {
                    let i = value;
                    const positions = [];
                    let userAgent;
                    let navigate_url_arr;

                    while (positions.length < 4) {
                        const position = Math.floor(Math.random() * (exec.length - i + 1)) + i;
                        if (!positions.includes(position)) {
                            positions.push(position);
                        }
                    }

                    try {
                        while (i < exec.length) {
                            const shouldSetUserAgent = positions.includes(i);

                            if (shouldSetUserAgent) {
                                userAgent = getRandomUserAgent();
                                await page.setUserAgent(userAgent);
                                navigate_url_arr = navigate_url[Math.floor(Math.random() * navigate_url.length)];
                                await safeGoto(navigate_url_arr, { timeout: 20000 });
                                await page.setExtraHTTPHeaders({
                                    'Accept-Language': 'en-US,en;q=0.9',
                                    'Referer': `${navigate_url_arr}`,
                                });
                            }

                            console.log("SECOND PAGE NO = " + (i + 1));
                            let second_Link = exec[i].link;
                            await safeGoto(second_Link, { waitUntil: 'load', timeout: 20000 });

                            await delay(6000);
                            await delay(getRandomPageDelay());
                            ++i;
                        }
                    } catch (err) {
                        if (chances < 5) {
                            console.log(chances);
                            await delay(4000);
                            return await secondPage(exec, i, chances + 1);
                        }
                        throw new Error(err);
                    }
                };

                const FirstPageIterative = async (count, pageCount, chances = 1, arr) => {
                    console.log("I COunt is = " + count);
                    let i = count;
                    let array = arr || [];
                    if (array.length == 0) {
                        array.push("PAGE 0");
                        array.push("Page 1");
                    }
                    console.log(pageCount);
                    console.log(array);
                    const positions = [];
                    let userAgent;
                    let navigate_url_arr;

                    while (positions.length < 4) {
                        const position = Math.floor(Math.random() * (pageCount - count + 1)) + count;
                        if (!positions.includes(position)) {
                            positions.push(position);
                        }
                    }

                    try {
                        while (i <= pageCount) {
                            const shouldSetUserAgent = positions.includes(i);

                            if (shouldSetUserAgent) {
                                userAgent = getRandomUserAgent();
                                await page.setUserAgent(userAgent);
                                navigate_url_arr = navigate_url[Math.floor(Math.random() * navigate_url.length)];
                                await safeGoto(navigate_url_arr, { waitUntil: 'load', timeout: 20000 });
                                await page.setExtraHTTPHeaders({
                                    'Accept-Language': 'en-US,en;q=0.9',
                                    'Referer': `${navigate_url_arr}`,
                                    'Cache-Control': 'no-cache',
                                    'Accept-Language': 'en-US,en;q=0.9',
                                });
                            }

                            console.log("Page no = " + i);

                            let page_url = addPageBeforeQuery(url1, i);
                            await clearCache();

                            await safeGoto(page_url, { waitUntil: 'load', timeout: 20000 });
                            await page.waitForSelector('.full-width', { timeout: 20000 });

                            await delay(3000);
                            exec = await infiniteScroll(page);
                            await page.setExtraHTTPHeaders({
                                'Accept-Language': 'en-US,en;q=0.9',
                                'Referer': `${page_url}`,
                                'Accept-Language': 'en-US,en;q=0.9',
                            });
                            await delay(2000);
                            array = [...array, ...exec];
                            ++i;
                        }

                        return { count: i, array: array };
                    } catch (err) {
                        if (chances < 5) {
                            await delay(4000);
                            console.log("chances = " + chances);
                            return await FirstPageIterative(i, pageCount, chances + 1, array);
                        }
                        throw new Error(err);
                    } finally {
                        await browser.close();
                    }
                };

                let exec;
                await page.waitForSelector('.artdeco-pagination__pages', { timeout: 18000000 });

                try {
                    exec = await infiniteScroll(page);
                    browser.close();
                    await delay(4000);
                    resolve({ success: true, data: exec });
                    console.log("Loop is executed");
                } catch (err) {
                    console.log(err);
                    reject({ error: err?.message });
                }
            } catch (error) {
                console.log(error);
                reject({ error: error });
                console.error('Error scraping LinkedIn profile:', error);
            } finally {
                await delay(1000);
                browser.close();
            }

            console.log("All done, check the screenshots. ✨");
        });
    }));
};

const urlTemplate = "https://www.linkedin.com/sales/search/people?page={page}&query=...";
function getQueryString(url) {
    const pageIndex = url.indexOf("query");
    if (pageIndex === -1) return ""; // Return an empty string if 'page' is not found
    return url.substring(pageIndex);
}
async function main(url, start, end, cookieData) {
    let data = [];
    const getQueryUrl = getQueryString(url);
    for (let i = start; i <= end; i++) {
        const url = urlTemplate.replace('page={page}&query=...', `page=${i}&${getQueryUrl}`);
        try {
            const result = await WebscrapingData(url, cookieData);
            console.log("Webscraping data.....");
            if (result.success) {
                data = [...data, ...result.data];
            }

        } catch (err) {
            console.error("Error scraping data:", err);
        }
    }
    return data;
}


export default main;