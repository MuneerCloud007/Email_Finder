import request from 'request';
import csvParser from 'csv-parser';
import { PassThrough } from 'stream';

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

// URL of the CSV file
const csvUrl = 'https://bulkapi.millionverifier.com/bulkapi/v2/download?key=I1bhNtONTtv9oVPizmDpvoYTe&file_id=27008124&filter=all';
const data=convertCsvToJson(csvUrl).then((data)=>console.log(data)).catch((err)=>console.log(err));

  export {convertCsvToJson}
