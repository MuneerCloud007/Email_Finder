import xlsx from 'xlsx';
import axios from 'axios';
import path from 'path';
import { fileURLToPath } from 'url';
import creditModel from '../model/credit.model.js';

import fileModel from '../model/file.model.js';
import ApiError from '../utils/ApiError.js';
import fileTableModal from '../model/fileTable.modal.js';
import { fileDownload } from "./FileHelper/File.js";
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

const processData = (sheet, columnMapping) => {
    const range = xlsx.utils.decode_range(sheet['!ref']);
    const data = [];
    const columnHeaders = {
        firstName: columnMapping.firstNameColumn,
        lastName: columnMapping.lastNameColumn,
        domain: columnMapping.companyNameColumn
    };

    // Find column indices based on provided column names
    const colIndices = {};
    for (let col = range.s.c; col <= range.e.c; col++) {
        const cell = sheet[xlsx.utils.encode_cell({ r: 0, c: col })];
        if (cell) {
            const colHeader = cell.v.trim();
            if (Object.values(columnHeaders).includes(colHeader)) {
                colIndices[colHeader] = col;
            }
        }
    }

    for (let row = range.s.r + 1; row <= range.e.r; row++) {
        const firstName = sheet[xlsx.utils.encode_cell({ r: row, c: colIndices[columnHeaders.firstName] })]?.v || '';
        const lastName = sheet[xlsx.utils.encode_cell({ r: row, c: colIndices[columnHeaders.lastName] })]?.v || '';
        const websiteOrDomain = sheet[xlsx.utils.encode_cell({ r: row, c: colIndices[columnHeaders.domain] })]?.v || '';
        const domain = websiteOrDomain.includes('http') ? extractDomain(websiteOrDomain) : websiteOrDomain;
        data.push({ firstName, lastName, domain });
    }
    return data;
};
const isCertaintyValid = (certainty) => {
    if(Object.values(CertainityEnum).includes(certainty)){
        return "valid"
    }
    else{
        return certainty || "invalid"

    }};


const processDataFromJson = (data, columnMapping) => {
    return data.map(item => {
        const firstName = item[columnMapping.firstNameColumn] || '';
        const lastName = item[columnMapping.lastNameColumn] || '';
        const websiteOrDomain = item[columnMapping.companyNameColumn] || '';
        const domain = websiteOrDomain.includes('http') ? extractDomain(websiteOrDomain) : websiteOrDomain;
        return { firstName, lastName, domain };
    });
};



const makeRequestWithRetry = async (url, data, headers, maxRetries = 5, delayMs = 14000, { req, socket }) => {
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

const processVerification = async (subarray, { req, socket }) => {
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
    const customDelay = subarray.length > 200 ? 15000 : subarray.length > 50 ? 11000 : 10000;

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

    const response2 = await makeRequestWithRetry('https://app.icypeas.com/api/search-files/read', checkOption, headers, 1000, customDelay, { req, socket });
    if (!response2.files[0]['finished']) {
        throw new Error('Error during file processing');
    }

    const response3 = await axios.post(url2, resultOption, { headers });
    return { data: response3.data.items, found: response2.files[0].found, size: subarray.length };
};

const processSubarrays = async (subarrays, { req, socket }) => {
    const verifiedData = [];
    let totalSize = 0;
    let foundSize = 0
    const promises = subarrays.map(subarray => processVerification(subarray, { req, socket }));
    const results = await Promise.all(promises);

    results.forEach(({ data, size, found }) => {
        verifiedData.push(...data);
        totalSize += size;
        foundSize += found;
    });



    return { verifiedData, totalSize, foundSize };
};



const FileTesting = async (req, res, next) => {
    const { data, socket, mappingData, id, fileName } = req.body

    console.log(req.body);


    
    const credit = await creditModel.findOne({ user: id });

    console.log(credit);

    console.log("SOCKET DATA IS HERE = "+socket);


    const result = processDataFromJson(data, mappingData);
    if (result.length > credit.points) {
        return res.status(400).send('Insufficient points');
    }

    if (result.length > credit.points) {
        return res.status(400).send('Insufficient points');
    }





    let newFileData = new fileModel({
        user: id,
        file_name: fileName,
        totalValid: 0,
        totalData: data.length,
        status: "pending",
        data: []


    });


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








    newFileData = await newFileData.save();






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

    console.log("RESULTED PROJECT BEFORE OPERATION");
    console.log(result);

    const updatedData = result.map((row, index) => {
        result[index]["email"] = verifiedData[index]?.results.emails?.[0]?.email || 'unknown';
        result[index]["certainty"] = isCertaintyValid(verifiedData[index]?.results.emails?.[0]?.certainty) || 'invalid'
        result[index]["mxrecords"] = verifiedData[index]?.results.emails?.[0]?.mxRecords?.[0] || 'unknown',
        result[index]["mxProvider"] =verifiedData[index]?.results.emails?.[0]?.mxProvider || 'unknown'
       


        const Newdata = {
            ...data[index],
            email: verifiedData[index]?.results.emails?.[0]?.email || 'unknown',
            certainty: isCertaintyValid(verifiedData[index]?.results.emails?.[0]?.certainty) || 'invalid',
            mxrecords: verifiedData[index]?.results.emails?.[0]?.mxRecords?.[0] || 'unknown',
            mxProvider: verifiedData[index]?.results.emails?.[0]?.mxProvider || 'unknown'
        }
        return Newdata;


    });

    console.log("Result !!!!!!");
    console.log(result);

    const promises = result.map(async (vl) => {
        const { firstName, lastName, domain, email, certainty, mxrecords, mxProvider } = vl;
        console.log("Line no 333 in file upload");
        console.log(vl);

        let newFileTable = new fileTableModal({ firstName, lastName, domain, email, certainty, mxRecord: mxrecords, mxProvider, userId: id, fileId: newFileData["_id"] });
        newFileTable = await newFileTable.save();
        newFileData["fileData"].push(newFileTable["_id"]);
    });

    await Promise.all(promises);

    newFileData.data = updatedData;
    newFileData.totalValid = foundSize;
    newFileData.status = "completed"
    newFileData = await newFileData.save();

    console.log("NEW FIle DATA IS HERE PLS CHECK !!");
    console.log(newFileData);



    req.io.emit("File_success", {
        message: {
            user: id,
            file_name: fileName,
            totalValid: foundSize,
            totalData: totalSize,
            data: updatedData,
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
        const { userId, fileId } = req.body;
        const file = await fileModel.findById(fileId);
        if (!file) throw ApiError.badRequest("file not found");

        console.log("FIle download controller");
        console.log(file.data);
        const data = file.data.map(item => {
            const { mxProvider, certainty, mxrecords, email, _id,...rest } = item;

            const data = {
                
                'Vivalasales Email': email,
                'Vivalasales Email Status': certainty,
             

            }
            
            return {...rest,...data};

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
        res.status({
            success: true,
            data: newFile
        })


    }
    catch (err) {
        next(err);

    }
}





export { FileTesting, getAllFileData, fileDownloadController, getFileById, addRowFile, deleteRowFile, updateByIdCell, fileById };
