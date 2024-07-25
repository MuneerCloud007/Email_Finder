import axios from "axios";
const CertainityEnum = {
    VERY_SURE: 'very_sure',
    ULTRA_SURE: 'ultra_sure',
    SURE: 'sure',
    PROBABLE: 'probable',
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function extractDomain(url) {
    // Remove protocol (http, https) and www from URL
    let domain = url.replace(/(^\w+:|^)\/\//, '').replace('www.', '');

    // Remove path and query string
    domain = domain.split('/')[0];

    return domain;
}


async function makeRequestWithRetry(url, data, headers, maxRetries = 4, delay = 2000) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await axios.post(url, data, { ...headers });
            console.log("MAKE REQUEST WITH RETRY");
            console.log(response);
            return response.data; // Assuming you want to return data upon success
        } catch (error) {
            console.log("REASON FOR THE ERROR !!!");
            console.log(error)
            console.error(`Request failed, retrying attempt ${retries + 1}/${maxRetries}`);
            if (retries < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay));
            }
            retries++;
            if (retries === maxRetries) {
                throw new Error(`Max retries reached (${maxRetries}), request failed`);
            }
        }
    }
}

export {makeRequestWithRetry,extractDomain,delay,CertainityEnum}