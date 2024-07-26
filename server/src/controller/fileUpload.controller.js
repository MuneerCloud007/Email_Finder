import xlsx from 'xlsx';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import creditModel from '../model/credit.model.js';
import emailVerificationModel from '../model/emailverfier.model.js';
import companyInfo from '../model/companyInfo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CertainityEnum = {
    VERY_SURE: 'very_sure',
    ULTRA_SURE: 'ultra_sure',
    SURE: 'sure',
    PROBABLE: 'probable',
};

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const extractDomain = (url) => new URL(url).hostname.replace(/^www\./, '');

const processData = (sheet) => {
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const data = [];
    for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const firstName = sheet[xlsx.utils.encode_cell({ r: row, c: 0 })]?.v || '';
        const lastName = sheet[xlsx.utils.encode_cell({ r: row, c: 1 })]?.v || '';
        const websiteOrDomain = sheet[xlsx.utils.encode_cell({ r: row, c: 2 })]?.v || '';
        const domain = websiteOrDomain.includes('http') ? extractDomain(websiteOrDomain) : websiteOrDomain;
        data.push({ firstName, lastName, domain });
    }
    return data;
};

const makeRequestWithRetry = async (url, data, headers, maxRetries = 5, delayMs = 12000) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await axios.post(url, data, { headers });
            console.log(response.data);

            if (!response.data.files[0]['finished']) {
                throw new Error('It is not in progress yet!');
            }
            return response.data;
        } catch (error) {
            console.log("Error during request:", error.message);
            if (retries < maxRetries - 1) {
                await delay(delayMs);
            }
            retries++;
            if (retries === maxRetries) {
                throw new Error(`Max retries reached (${maxRetries}), request failed`);
            }
        }
    }
};

const processVerification = async (subarray) => {
    const EmailVerifierData = {
        task: 'email-search',
        name: 'CloudV',
        data: subarray.map(({ firstName, lastName, domain }) => [firstName, lastName, domain])
    };

    const headers = {
        Authorization: '41b965a9f0a544f1aa43df5bcdaf58168a48bf9dfeb648ac8dc4863d5316498b',
        'Content-Type': 'application/json'
    };

    const url1 = 'https://app.icypeas.com/api/bulk-search';
    const response1 = await axios.post(url1, EmailVerifierData, { headers });
    await delay(3000);
    const file = response1.data.file;

    const url2 = 'https://app.icypeas.com/api/bulk-single-searchs/read';
    const maxRetries = subarray.length > 100 ? 20 : subarray.length > 50 ? 10 : 5;
    const customDelay = subarray.length > 100 ? 12000 : subarray.length > 50 ? 11000 : 10000;

    const resultOption = {
        user: 'LUx6tZABOIKatkTjs8LF',
        mode: 'bulk',
        file,
        type: 'email-search',
        limit: subarray.length
    };
    const checkOption = {
        user: 'LUx6tZABOIKatkTjs8LF',
        file,
        limit: subarray.length
    };

    const response2 = await makeRequestWithRetry('https://app.icypeas.com/api/search-files/read', checkOption, headers, 500, customDelay);
    if (!response2.files[0]['finished']) {
        throw new Error('Error during file processing');
    }

    const response3 = await axios.post(url2, resultOption, { headers });
    return { data: response3.data.items, size: response2.files[0].found };
};

const processSubarrays = async (subarrays) => {
    const verifiedData = [];
    let totalSize = 0;
    const promises = subarrays.map(subarray => processVerification(subarray));
    const results = await Promise.all(promises);

    results.forEach(({ data, size }) => {
        verifiedData.push(...data);
        totalSize += size;
    });

    return { verifiedData, totalSize };
};

const FileUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const { id, folder } = req.params;

    try {
        const fileBuffer = req.file.buffer;
        const credit = await creditModel.findOne({ user: id });

        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        const result = processData(sheet);

        if (result.length > credit.points) {
            return res.status(400).send('Insufficient points');
        }

        const subarraySize = 50;
        const subarrays = [];
        for (let i = 0; i < result.length; i += subarraySize) {
            subarrays.push(result.slice(i, i + subarraySize));
        }

        const { verifiedData, totalSize } = await processSubarrays(subarrays);

        const count = totalSize;
        credit.points = Math.max(0, credit.points - count);
        await credit.save();

        const updatedData = result.map((row, index) => ({
            ...row,
            email: verifiedData[index]?.results.emails?.[0]?.email || 'unknown',
            certainty: verifiedData[index]?.results.emails?.[0]?.certainty || 'unknown',
            mxrecords: verifiedData[index]?.results.emails?.[0]?.mxRecords?.[0] || 'unknown',
            mxProvider: verifiedData[index]?.results.emails?.[0]?.mxProvider || 'unknown'
        }));

      
        for (const vl of updatedData) {
            const { firstName, lastName, domain, email, certainty } = vl;
            const createNewEmailVerifier = new companyInfo({
                firstName,
                lastName,
                company: domain || 'not present',
                email: email || 'not present',
                certainty: certainty || 'not present'
            });
            await createNewEmailVerifier.save();

            const companies = await emailVerificationModel.find({ $and: [{ user: id }, { folder }] });
            if(companies.length==0){
                const newEmailVerifier=new emailVerificationModel({
                    user:id,
                    folder:folder,
                    companyInfo:createNewEmailVerifier._id

                })
                await newEmailVerifier.save();

            }
            else{
            for (const company of companies) {
                company.companyInfo.push(createNewEmailVerifier._id);
                await company.save();
            }
        }
        }

        const newSheet = xlsx.utils.json_to_sheet(updatedData);
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Sheet1');
        const newFileBuffer = xlsx.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

        res.setHeader('Content-Disposition', 'attachment; filename=updatedFile.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.status(200).send(newFileBuffer);
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file.');
    }
};

export { FileUpload };
