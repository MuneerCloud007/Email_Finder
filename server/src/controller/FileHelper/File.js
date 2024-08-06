import XLSX from 'xlsx';

const fileDownload = async (data) => {
    

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const range = XLSX.utils.decode_range(ws['!ref']);
    for (let R = range.s.r; R <= range.e.r; ++R) {
        for (let C = 0; C <= range.e.c; ++C) {
            const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
            if (cell && (
                ws[XLSX.utils.encode_col(C)] === 'Vivalasales Email' ||
                ws[XLSX.utils.encode_col(C)] === 'Vivalasales Certainty' ||
                ws[XLSX.utils.encode_col(C)] === 'Vivalasales MX Records' ||
                ws[XLSX.utils.encode_col(C)] === 'Vivalasales MX Provider'
            )) {
                cell.s = { fill: { fgColor: { rgb: "FFFF00" } } }; // Yellow color
            }
        }
    }

    return {ws,wb};


};

/**
 * Converts an array of JSON objects to an Excel file.
 * @param {Array} jsonArray - The array of JSON objects to convert.
 * @param {string} fileName - The name of the output Excel file.
 */
function jsonToExcel(jsonArray, fileName) {
    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
      throw new Error('Invalid JSON array');
    }
  
    // Extract headers dynamically from the first object in the array
    const headers = Object.keys(jsonArray[0]);
  
    // Convert JSON array to worksheet with dynamic headers
    const worksheet = xlsx.utils.json_to_sheet(jsonArray, { header: headers });
  
    // Create a new workbook and append the worksheet
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
  
    // Write the workbook to a file
    xlsx.writeFile(workbook, fileName);
  }
  
  

export {fileDownload,jsonToExcel};
