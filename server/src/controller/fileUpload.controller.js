import xlsx from 'xlsx';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import creditModel from '../model/credit.model.js';

import fileModel from '../model/file.model.js';
import ApiError from '../utils/ApiError.js';
import fileTableModal from '../model/fileTable.modal.js';
import { fileDownload } from "./FileHelper/File.js";
import fileOperationModel from '../model/fileOperation.model.js';
import mongoose from "mongoose";
import { create, mailHelper } from "../helper/account.js";
import UserModal from "../model/user.model.js"



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
            if (response.data.files[0]["total"] == response.data.files[0]["done"]) {
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







const FileTesting = async (req, res, next) => {
    const { data, socket, mappingData, id, fileName } = req.body


    console.log("MAPPING DATA IS HERE PLS CHECK!!!");
    console.log(mappingData);



    const credit = await creditModel.findOne({ user: id });




    const result = processDataFromJson(data, mappingData);


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
        operational: "EmailFinder",
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
            data: []
        },
        success: true

    })

    //Result is checked now operation is started 
    const subarraySize = 5000;
    const subarrays = [];
    for (let i = 0; i < result.length; i += subarraySize) {
        subarrays.push(result.slice(i, i + subarraySize));
    }

    const { verifiedData, totalSize, foundSize } = await processSubarrays(subarrays, { req, socket });

    const count = foundSize;
    credit.points = Math.max(0, credit.points - count);
    await credit.save();





    //result data is email certainint mxRecord and mxProvider is added...

    const updatedData = result.map((row, index) => {
        result[index]["email"] = verifiedData[index]?.results.emails?.[0]?.email || 'Not Found';
        result[index]["certainty"] = isCertaintyValid(verifiedData[index]?.results.emails?.[0]?.certainty) || 'invalid'
        result[index]["mxrecords"] = verifiedData[index]?.results.emails?.[0]?.mxRecords?.[0] || 'Not Found',
            result[index]["mxProvider"] = verifiedData[index]?.results.emails?.[0]?.mxProvider || 'Not Found'

    });


    const promises = result.map(async (vl) => {
        const { firstName, lastName, domain, email, certainty, mxrecords, mxProvider } = vl;
        console.log("Line no 333 in file upload");
        console.log(vl);

        let newFileTable = new fileTableModal({ firstName, lastName, domain, email, certainty, mxRecord: mxrecords, mxProvider, userId: id, fileId: newFileData["_id"] });
        newFileTable = await newFileTable.save();
        newFileData["fileData"].push(newFileTable["_id"]);
    });

    await Promise.all(promises);

    newFileData.totalValid = foundSize;
    newFileData.status = "completed"

    newFileData["EmailFind"]["totalValid"] = foundSize;
    newFileData["EmailFind"]["totalInvalid"] = totalSize - foundSize;

    newFileData['EmailVerify']["totalValid"] = "N/A"
    newFileData['EmailVerify']['valid_catchAll'] = "N/A"
    newFileData["EmailVerify"]["totalInvalid"] = "N/A"
    newFileData["EmailVerify"]["catch_all"] = "N/A"
    newFileData["EmailVerify"]["disposable"] = "N/A"







    newFileData = await newFileData.save();

    //User Email integration process started....
    const user = await UserModal.findById(id);


    console.log("Email integration is done in email finder pls check in controller");

    await mailHelper({
        current_user: user,
        template: 'email_finder',
        req: req,
        fileId: newFileData["_id"],
        externalInfo: {
            Operational: "EmailFinder",
            name: `${user["firstName"]} ${user["lastName"]}`,
            data: {
                catchall: "N/A",
                invalid: "N/A",
                valid: "N/A"
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

    })

    res.status(200).json({
        success: true,
        data: newFileData
    });
}

const getAllFileData = async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
        throw ApiError.badRequest("user id is missing");
    }
    const fileData = await fileModel.find({ user: id });
    res.status(200).json({
        success: true,
        data: fileData
    })

}

const getFileById = async (req, res, next) => {
    const { fileId } = req.body;
    try {
        console.log("FILE ID IS HERE = " + fileId);
        console.log("I am in localserver !!!!!");
        if (!fileId) {
            throw ApiError.badRequest("FILE ID IS NOT PRESENT !!!!");

        }

        const fileByIdData = await fileModel.findById(new mongoose.Types.ObjectId(fileId)).populate("fileData");
        if (!fileByIdData) {
            throw ApiError.badRequest("FILE BY ID DATA IS NOT PRESENT !!!!");
        }


        res.status(200).json({
            success: true,
            data: fileByIdData
        })
    }
    catch (err) {
        next(err);
    }

}


const fileDownloadController = async (req, res, next) => {
    try {
        const { userId, fileId, operational } = req.body;
        console.log(req.body);
        const file = await fileModel.findById(fileId).populate("fileData");
        if (!file) throw ApiError.badRequest("file not found");

        console.log("FIle download controller");
        console.log(file);
        let data = file["fileData"].map(item => {
            const { mxProvider, certainty, mxRecord, status, quality, email, _id, firstName, lastName, domain } = item;
            let dummyData;
            if (file['operational'] == "EmailVerification") {
                dummyData = {
                    "First Name": firstName,
                    "Last Name": lastName,
                    "Domain or CompanyName": domain,
                    'Vivalasales Email': email || "Not Found",
                    'Vivasales Quality': quality || "Not Found",
                    'Vivalasales Email Status': status || "Not Found",
                    "MxProvider": mxProvider,
                    "MxRecord": mxRecord
                }
            }
            else {

                dummyData = {
                    "First Name": firstName,
                    "Last Name": lastName,
                    "Domain or CompanyName": domain,
                    'Vivalasales Email': email || "Not Found",
                    'Vivasales Quality': "Not Found",
                    'Vivalasales Email Status': "Not Found",
                    "MxProvider": mxProvider || "Not Found",
                    "MxRecord": mxRecord || "Not Found"



                }

            }

            return { ...dummyData };

        });

        const { ws, wb } = await fileDownload(data);

        const buf = xlsx.write(wb, { bookType: 'xlsx', type: 'buffer' });
        res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.attachment('vivaLaSales_NewFile.xlsx');
        res.send(buf);
    }
    catch (err) {
        next(err);
    }

}


const addRowFile = async (req, res, next) => {
    try {
        const { userId, fileId } = req.body;
        console.log(userId);
        console.log(fileId);
        let fileData = await fileModel.find({ $and: [{ user: new mongoose.Types.ObjectId(userId) }, { _id: new mongoose.Types.ObjectId(fileId) }] });
        if ((!fileData || !fileData[0]?.fileData.length > 0)) {
            throw ApiError.badRequest("The the file does't requested is not present to add !!!!");

        }

        let fileTableData = await fileTableModal({
            firstName: "",
            lastName: "",
            domain: "",
            email: "",
            certainty: "",
            mxrecords: "",
            mxProvider: "",
            fileId: fileId,
            userId: userId



        })
        fileTableData = await fileTableData.save();

        console.log("FILE DATS");
        console.log(fileData);
        fileData[0]["fileData"].push(fileTableData["_id"])
        await fileData[0].save();

        let data = {
            firstName: fileTableData.firstName,
            lastName: fileTableData.lastName,
            domain: fileTableData.company,
            email: fileTableData.email,
            certainty: fileTableData["certainty"],
            mxrecords: fileTableData.mxRecord,
            mxProvider: fileTableData.mxProvider
        };

        return res.status(200).json({
            success: true,
            data: { ...data }


        })




    }
    catch (err) {
        next(err);

    }
}

const deleteRowFile = async (req, res, next) => {
    try {
        const { fileId, userId, data, fileTableId } = req.body;
        if (!data) {
            next(ApiError.badRequest("Please provide a please deletion array"))
        }



        const deletionPromises = data.map(id => fileTableModal.findByIdAndDelete(id));
        const CatcheDataPromises = data.map(id => fileModel.updateOne(
            { $and: [{ _id: fileId }, { userId: userId }] },
            { $pull: { fileData: id } }
        ))

        // Wait for all deletions to complete
        const results = await Promise.all(deletionPromises);
        const catcheResult = await Promise.all(CatcheDataPromises);
        // console.log(catcheResult);
        res.status(200).json({
            success: true,
            data: results
        })

    }
    catch (err) {
        next(err);
    }
}




const updateByIdCell = async (req, res, next) => {
    const userId = req.params.id;
    const { colName, colValue, colId } = req.body;
    let updateData = []
    console.log("Update BY ID Cell---------------------")
    console.log(userId);
    console.log(colName);
    console.log(colValue);
    console.log(colId);


    try {
        if (!userId) {
            next(ApiError.badRequest("Please provide a objectId"))
        }
        let updateData;

        const update = {
            $set: {
                [colName]: colValue
            }
        };

        // Perform the update
        updateData = await fileTableModal.updateOne(
            { _id: colId },
            update
        );








        res.header("Content-Type", "application/json");


        res.status(200).json({
            sucess: "true",
            data: updateData
        })
    }
    catch (err) {
        next(err);
    }

}


const fileById = async (req, res, next) => {
    try {
        const { id } = req.params;
        if (!id) {
            throw new ApiError.badRequest("Id is not present");
        }
        const file = await fileData.findById(id);
        if (!file) {
            throw new ApiError.badRequest("File is not present");

        }
        const newFile = await file.populate("fileData");

        let data = newFile["fileData"].map(item => {
            const { mxProvider, certainty, mxrecords, status, quality, email, _id, firstName, lastName, domain } = item;
            let dummyData;
            if (newFile['operational'] == "EmailVerification") {

                dummyData = {
                    "First Name": firstName,
                    "Last Name": lastName,
                    "Domain or CompanyName": domain,
                    'Vivalasales Email': email || "Not Found",
                    'Vivasales Quality': quality || "Not Found",
                    'Vivalasales Email Status': status || "Not Found",
                    "MxProvider": mxProvider,
                    "MxRecord": mxrecords
                }
            }
            else {

                dummyData = {
                    "First Name": firstName,
                    "Last Name": lastName,
                    "Domain or CompanyName": domain,
                    'Vivalasales Email': email || "Not Found",
                    'Vivasales Quality': "Not Found",
                    'Vivalasales Email Status': "Not Found",
                    "MxProvider": mxProvider || "Not Found",
                    "MxRecord": mxrecords || "Not Found"



                }

            }

            return { ...dummyData };

        });











        res.status({
            success: true,
            data: data
        })


    }
    catch (err) {
        next(err);

    }
}





export { FileTesting, getAllFileData, fileDownloadController, getFileById, addRowFile, deleteRowFile, updateByIdCell, fileById };
