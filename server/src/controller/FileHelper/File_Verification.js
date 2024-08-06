import request from 'request';
import csvParser from 'csv-parser';
import { PassThrough } from 'stream';
import xlsx from "xlsx";
import { promisify } from 'util';
import fs from 'fs';
import axios from "axios"
import FormData from 'form-data';


const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));


// Function to convert CSV to JSON with dynamic header mapping
const convertCsvToJson = (csvUrl) => {
  return new Promise((resolve, reject) => {
    const results = [];
    request(csvUrl)
      .pipe(new PassThrough())
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
};



const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

/**
 * Converts an array of JSON objects to an Excel file and returns its content as a Buffer.
 * @param {Array} jsonArray - The array of JSON objects to convert.
 * @returns {Promise<Buffer>} - The content of the Excel file as a Buffer.
 */
async function jsonToExcel(jsonArray) {
  if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
    throw new Error('Invalid JSON array');
  }

  // Create a new workbook
  const workbook = xlsx.utils.book_new();

  // Convert JSON array to worksheet
  const worksheet = xlsx.utils.json_to_sheet(jsonArray);

  // Append worksheet to workbook
  xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Write workbook to a Buffer
  const buffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  return buffer;
}

/**
 * Uploads an Excel file to the Million Verifier API.
 * @param {Buffer} fileContent - The Excel file content as a Buffer.
 * @param {string} apiKey - The API key for authentication.
 */
async function uploadFile(fileContent, apiKey) {
  try {
    // Create a FormData instance
    const form = new FormData();
    form.append('file_contents', fileContent, {
      filename: 'file.xlsx',
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Correct MIME type for Excel
    });

    // Make the POST request using axios
    const response = await axios.post(
      `https://bulkapi.millionverifier.com/bulkapi/v2/upload?key=${apiKey}`,
      form,
      {
        headers: {
          ...form.getHeaders(),
        },
      }
    );

    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error.message);
  }
}


//Check the status of the file 
/**
 * Checks the status of file verification on Million Verifier API until it is finished.
 * @param {string} fileId - The ID of the file to check.
 * @returns {Promise<Object>} - The status response from the API when the verification is finished.
 * @throws {Error} - Throws an error if something goes wrong during status checking.
 */

async function checkStatusFileVerification(fileId) {
  try {
    let checkStatus;
    while (true) {
      const response = await axios.get(`https://bulkapi.millionverifier.com/bulkapi/v2/fileinfo?key=I1bhNtONTtv9oVPizmDpvoYTe&file_id=${fileId}`);
      //
      checkStatus = response.data;
      console.log("check Status verification is here");
      console.log(checkStatus);
      if (checkStatus.status === 'finished') {
        break;
      }
      await delay(5000);
     
    }
    return checkStatus;
  } catch (err) {
    console.log("chceck status is here error!!!");
    console.log(err);
    throw new Error("Something went wrong in status checking in email verification: " + err.message);
  }
}



// URL of the CSV file
// const csvUrl = 'https://bulkapi.millionverifier.com/bulkapi/v2/download?key=I1bhNtONTtv9oVPizmDpvoYTe&file_id=27000559&filter=all';



  export {convertCsvToJson,jsonToExcel,uploadFile,checkStatusFileVerification}
