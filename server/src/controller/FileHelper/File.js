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

export {fileDownload};
