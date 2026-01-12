
import xlsx from 'xlsx';
import path from 'path';

const excelPath = '/Users/akeemojuko/Downloads/VoiceMaps.xlsx';

try {
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(JSON.stringify(data, null, 2));
} catch (e) {
    console.error("Failed to read Excel:", e);
}
