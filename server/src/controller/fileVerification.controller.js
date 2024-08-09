
import fileModel from "../model/file.model.js";
import fileVerificationModal from "../model/fileVerification.modal.js";
import fileTableModal from "../model/fileTable.modal.js";
import ApiError from "../utils/ApiError.js";
import fileOperationModel from "../model/fileOperation.model.js";
import axios from "axios";
import FormData from 'form-data';
import { convertCsvToJson, jsonToExcel, uploadFile, checkStatusFileVerification } from "./FileHelper/File_Verification.js"
import { fileURLToPath } from 'url';
import path from 'path';
import creditModel from "../model/credit.model.js";
import UserModal from "../model/user.model.js"
import { create, mailHelper } from "../helper/account.js";
import mongoose from "mongoose";







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


const isCertaintyValid = (certainty) => {
    if (Object.values(CertainityEnum).includes(certainty)) {
        return "valid"
    }
    else {
        return certainty || "invalid"

    }
};


const processDataFromJson = (data, columnMapping) => {
    console.log("COLUMN MAPPING IS HERE");
    console.log(columnMapping);
    return data.map(item => {
        // Extract values from the item based on column mapping
        const fullName = item[columnMapping.fullNameColumn] || '';
        const firstName = item[columnMapping.firstNameColumn] || '';
        const lastName = item[columnMapping.lastNameColumn] || '';
        const companyName = item[columnMapping.companyNameColumn] || '';
        const website = item[columnMapping.WebsiteColumn] || '';

        // Determine firstName and lastName based on available data
        let processedFirstName = '';
        let processedLastName = '';

        if (firstName && lastName) {
            processedFirstName = firstName;
            processedLastName = lastName;
        } else if (fullName) {
            const nameParts = fullName.split(' ');
            processedFirstName = nameParts[0] || '';
            processedLastName = nameParts.slice(1).join(' ') || '';
        }

        // Determine the domain, prioritizing companyName over website
        const domain = companyName || (website.includes('http') ? extractDomain(website) : website);

        return {
            firstName: processedFirstName,
            lastName: processedLastName,
            domain: domain
        };
    });
};



const makeRequestWithRetry = async (url, data, headers, maxRetries = 5, delayMs = 14000, { req, socket }) => {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await axios.post(url, data, { headers });
            console.log(response.data);
            if(response.data.files[0]["total"] == response.data.files[0]["done"]){
                return response.data;

            }

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

const processVerification = async (subarray, { req, socket }) => {
    try {
        const EmailVerifierData = {
            task: 'email-search',
            name: 'CloudV',
            data: subarray.map(({ firstName, lastName, domain }) => [firstName, lastName, domain])
        };

        const headers = {
            Authorization: process.env["Icypeas_API_KEY"],
            'Content-Type': 'application/json'
        };

        const url1 = 'https://app.icypeas.com/api/bulk-search';
        const response1 = await axios.post(url1, EmailVerifierData, { headers });
        await delay(3000);
        const file = response1.data.file;

        const url2 = 'https://app.icypeas.com/api/bulk-single-searchs/read';
        const maxRetries = subarray.length > 100 ? 20 : subarray.length > 50 ? 10 : 5;
        const customDelay = subarray.length > 200 ? 15000 : subarray.length > 50 ? 11000 : 10000;

        const resultOption = {
            user: process.env["Icypeas_User_Id"],
            mode: 'bulk',
            file,
            type: 'email-search',
            limit: subarray.length
        };
        const checkOption = {
            user: process.env["Icypeas_User_Id"],
            file,
            limit: subarray.length
        };

        const response2 = await makeRequestWithRetry('https://app.icypeas.com/api/search-files/read', checkOption, headers, 1000, customDelay, { req, socket });
      
        const response3 = await axios.post(url2, resultOption, { headers });
        return { data: response3.data.items, found: response2.files[0].found, size: subarray.length };
    }
    catch (err) {
        console.log(err);

    }
};

const processSubarrays = async (subarrays, { req, socket }) => {
    const verifiedData = [];
    let totalSize = 0;
    let foundSize = 0
    const promises = subarrays.map(subarray => processVerification(subarray, { req, socket }));
    const results = await Promise.all(promises);
    console.log("Process subarrays is here pls check");
    console.log(results);

    results.forEach(({ data, size, found }) => {
        verifiedData.push(...data);
        totalSize += size;
        foundSize += found;
    });



    return { verifiedData, totalSize, foundSize };
};
















const fileVerification = async (req, res, next) => {
    try {
        const { data, socket, mappingData, id, fileName } = req.body;


        const credit = await creditModel.findOne({ user: id });

        let result = processDataFromJson(data, mappingData);
        if (result.length > credit.points) {
            return res.status(400).send('Insufficient points');
        }

        let fileOperationId = new fileOperationModel({
            fullName: mappingData["fullNameColumn"],
            firstName: mappingData["firstNameColumn"],
            lastName: mappingData["lastNameColumn"],
            companyName: mappingData["companyNameColumn"],
            website: mappingData["WebsiteColumn"],
            country: mappingData["country"]
        });

        fileOperationId = await fileOperationId.save();

        let newFileData = new fileModel({
            user: id,
            file_name: fileName,
            totalValid: 0,
            totalData: data.length,
            status: "pending",
            data: [],
            operational: "EmailVerification",
            fileOperational: fileOperationId["_id"]
        });

        newFileData = await newFileData.save();

        req.io.to(socket).emit("File_Pending", {
            message: {
                user: id,
                file_name: fileName,
                totalValid: 0,
                totalData: data.length,
                status: "pending",
                data: [],
                operational: "EmailVerification",
            },
            success: true
        });

        const subarraySize = 5000;
        const subarrays = [];
        for (let i = 0; i < result.length; i += subarraySize) {
            subarrays.push(result.slice(i, i + subarraySize));
        }

        const { verifiedData, totalSize, foundSize } = await processSubarrays(subarrays, { req, socket });

        credit.points = Math.max(0, credit.points - foundSize);
        await credit.save();

        const dummyVerifiedData = result.map((row, index) => ({
            ...row,
            email: verifiedData[index]?.results.emails?.[0]?.email || 'Not Found',
            certainty: isCertaintyValid(verifiedData[index]?.results.emails?.[0]?.certainty) || 'invalid',
            mxrecords: verifiedData[index]?.results.emails?.[0]?.mxRecords?.[0] || 'Not Found',
            mxProvider: verifiedData[index]?.results.emails?.[0]?.mxProvider || 'Not Found'
        }));

        const filterOutDummyData = dummyVerifiedData.filter(row => row.email !== 'Not Found');
        const filterOutIndex = filterOutDummyData.map(row => dummyVerifiedData.indexOf(row));

        console.log("filterOutIndex is here is pls check");
        console.log(filterOutIndex);

        const excelSheet = await jsonToExcel(filterOutDummyData);
        const apiKey = process.env["Million_verifier_API_KEY"];
        const fileId = await uploadFile(excelSheet, apiKey);

        const fileTotalStatus = await checkStatusFileVerification(fileId["file_id"]);
        await delay(3000);
        console.log("File total Status is here....");
        console.log(fileTotalStatus);

        const fileGetUrl = `https://bulkapi.millionverifier.com/bulkapi/v2/download?key=${apiKey}&file_id=${fileId["file_id"]}&filter=all`;
        const verifiedResult = await convertCsvToJson(fileGetUrl);

        console.log("verifiedResult is here pls check !!!");

        filterOutIndex.forEach((vl, index) => {
            dummyVerifiedData[vl] = verifiedResult[index];
        });

        const emailVerifyCount = {
            valid: 0,
            valid_catchAll: 0,
            invalid: 0,
            catch_all: 0,
            disposable: 0
        };

        const updatedData = dummyVerifiedData.map((row, index) => {
            switch (row["result"]) {
                case "catch_all":
                    emailVerifyCount.catch_all++;
                    break;
                case "invalid":
                    emailVerifyCount.invalid++;
                    break;
                case "ok":
                    emailVerifyCount.valid++;
                    break;
                case "disposable":
                    emailVerifyCount.disposable++;
                    break;
                default:
                    emailVerifyCount.invalid++;
                    break;


            }

          
        });
        for (const vl of dummyVerifiedData) {
            const { firstName, lastName, domain, email, certainty, mxrecords, mxProvider, quality, result } = vl;
        
            try {
                let newFileTable = new fileTableModal({ 
                    firstName, 
                    lastName, 
                    domain, 
                    email, 
                    certainty, 
                    mxRecord: mxrecords, 
                    mxProvider, 
                    userId: id, 
                    fileId: newFileData["_id"], 
                    quality, 
                    status: result 
                });
                newFileTable = await newFileTable.save();
                newFileData["fileData"].push(newFileTable["_id"]);
            } catch (error) {
                console.error('Error saving file table:', error);
                // Handle the error as needed
            }
        }
        
        credit.points = Math.max(0, credit.points - foundSize);
        await credit.save();

        newFileData.totalValid = foundSize;
        newFileData["EmailFind"]["totalValid"] = foundSize;
        newFileData["EmailFind"]["totalInvalid"] = totalSize - foundSize;

        newFileData['EmailVerify']["totalValid"] = emailVerifyCount["valid"];
        newFileData['EmailVerify']['valid_catchAll'] = emailVerifyCount["valid_catchAll"];
        newFileData["EmailVerify"]["totalInvalid"] = emailVerifyCount["invalid"];
        newFileData["EmailVerify"]["catch_all"] = emailVerifyCount["catch_all"];
        newFileData["EmailVerify"]["disposable"] = emailVerifyCount["disposable"];

        newFileData.status = "completed";
        newFileData = await newFileData.save();

        const user=await UserModal.findById(id);


        await mailHelper({
            current_user: user,
            template: 'email_finder_and_verification',
            req: req,
            fileId:newFileData["_id"],
            externalInfo:{
                Operational:"Email Verification",
                name:`${user["firstName"]} ${user["lastName"]}`,
                data:{
                    catchall:emailVerifyCount["catch_all"] +  emailVerifyCount["valid_catchAll"],
                    valid:emailVerifyCount["valid"],
                    invalid:emailVerifyCount["invalid"] + emailVerifyCount["disposable"]
                }
                
            }
        });
    








        req.io.emit("File_success", {
            message: {
                user: id,
                file_name: fileName,
                totalValid: foundSize,
                totalData: totalSize,
                status: "completed"
            },
            success: true
        });

        res.status(200).json({
            success: true,
            data: newFileData
        });

    } catch (err) {
        next(err);
    }
};





export { fileVerification };
