import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from "axios";
import creditModel from '../model/credit.model.js';
import ApiError from "../utils/ApiError.js";
// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CertainityEnum = {
    VERY_SURE: 'very_sure',
    ULTRA_SURE: 'ultra_sure',
    SURE: 'sure',
    PROBABLE: 'probable',
    NOT_FOUND:'not_found'
};

// Utility function to introduce delay
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Function to extract the domain from a URL
const extractDomain = (url) => {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./, '');
};

// Function to process data from the uploaded Excel file
const processData = (data) => {
    return data.map(({ firstName, lastName, website }) => ({
        firstName,
        lastName,
        domain: extractDomain(website),
    }));
};
async function makeRequestWithRetry(url, data, headers, maxRetries = 4, delay = 2000) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            const response = await axios.post(url, data, { ...headers });
            return response.data; // Assuming you want to return data upon success
        } catch (error) {
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

// Function to verify email addresses and process the results
const processVerification = async (result) => {
    const verifiedData = [];
    

    for (const vl of result) {
        
        const { firstName, lastName, domain } = vl;

        const url1 = 'https://app.icypeas.com/api/email-search';
        const EmailVerifierData = {
            firstname: firstName.toLowerCase(),
            lastname: lastName.toLowerCase(),
            domainOrCompany: domain
        };
        const headers = {
            'Authorization': '41b965a9f0a544f1aa43df5bcdaf58168a48bf9dfeb648ac8dc4863d5316498b',
            'Content-Type': 'application/json'
        };

        try {
            const response1 = await axios.post(url1, EmailVerifierData, { headers });
            await delay(1000);
            const url2 = "https://app.icypeas.com/api/bulk-single-searchs/read";
            const EmailVerifierData2 = {
                "user": "LUx6tZABOIKatkTjs8LF",
                "mode": "single",
                "id": response1.data["item"]["_id"]
            };
            const response2 = await makeRequestWithRetry(url2, EmailVerifierData2, { headers });
            console.log(response2["items"][0]["results"]["emails"]);

            verifiedData.push({
                ...vl,
                "EmailVerifier": response2["items"][0]["results"]["emails"]?.[0]?.["email"] || "NOT FOUND",
                "Status": response2["items"][0]["results"]["emails"]?.[0]?.["certainty"] || "NOT FOUND",
                "MxRecord": response2["items"][0]["results"]["emails"]?.[0]?.["mxRecords"]?.[0] || "NOT FOUND"
            });
            console.log("I am below pls check here!!!!!");
        } catch (error) {
            console.error('Error during email verification:', error);
        }
    }

  

    return verifiedData;
};

// Main handler for file upload
const FileUpload = async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }
    const {id,socket}=req.params;
    console.log("Socket !!!!");
    console.log(socket);
    const ip = req.ip || req.connection.remoteAddress; // Get the IP address from the req object
    const userAgent = req.headers['user-agent']; // Get the User Agent from the req object
    const uniqueRoom = `${ip}`; // Create the same unique room identifier
    


    try {
        const fileBuffer = req.file.buffer;

        const credit=await creditModel.findOne({user:id});

        // Parse the Excel file
        const workbook = xlsx.read(fileBuffer, { type: 'buffer' });


        // Convert the first sheet to JSON
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);
        console.log("JSON DATA____________________________________________");

        const result = processData(jsonData); // Convert data to firstName, lastName, domain
        console.log("RESULT____________________________________________");
        console.log(result);

        if(result>credit.points){
            next(ApiError.badRequest("In sufficent points !!!"));
        }

        const verifiedData = await processVerification(result);
        console.log("VERIFEID DATA____________________________________________________")
        console.log(verifiedData);

        const count = verifiedData.filter((vl) => Object.values(CertainityEnum).includes(vl["Status"])).length;

        console.log(count);

        

        if(credit.points>count){
            credit.points=credit.points-count;
        }
        else{
            credit.points=0;
        }
        const newCredit=await credit.save();
        console.log("I am credit executed pls check !!!!");
        console.log(newCredit);




        // Add "Email Verified", "Certainity", and "MX Records" columns
        const updatedData = jsonData.map((row, index) => ({
            ...row,
            'Email Verified': `${verifiedData[index]["EmailVerifier"]}`, 
            'Certainity': `${verifiedData[index]["Status"]}`, 
            'MX Records': verifiedData[index]["MxRecord"]
        }));

        // Convert JSON back to sheet
        const newSheet = xlsx.utils.json_to_sheet(updatedData);

        // Create a new workbook and append the new sheet
        const newWorkbook = xlsx.utils.book_new();
        xlsx.utils.book_append_sheet(newWorkbook, newSheet, 'Sheet1');

        // Write workbook to a buffer
        const newFileBuffer = xlsx.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });

        // Send the buffer back to the frontend
        res.setHeader('Content-Disposition', 'attachment; filename=updatedFile.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');


       
        
        if (socket) {

            // Check if the room exists
            const roomExists = req.io.sockets.adapter.rooms.has(uniqueRoom);

            if (roomExists) {
                console.log(`Room ${uniqueRoom} exists. Adding socket ${socket} to the room.`);
            } else {
                console.log(`Room ${uniqueRoom} does not exist. Creating and adding socket ${socket} to the room.`);
            }

            req.io.to(uniqueRoom).emit('updateCredit', {
                success: true,
                data: newCredit
            });


        }


        res.status(200).send(newFileBuffer);
    } catch (error) {
        console.error('Error processing file:', error);
        res.status(500).send('Error processing file.');
    }
};

export { FileUpload };

