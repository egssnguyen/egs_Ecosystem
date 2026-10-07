// fileHandler.js
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { Parser } = require('json2csv');
const XLSX = require('xlsx');

const CSV_FILE = path.join(__dirname, 'database.csv');
const EXCEL_FILE = path.join(__dirname, 'database.xlsx');

// Khởi tạo file mẫu nếu chưa tồn tại
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, 'id,name,email\n1,Nguyen Van A,a@gmail.com\n2,Tran Thi B,b@gmail.com');
}

if (!fs.existsSync(EXCEL_FILE)) {
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet([
        { id: 1, name: 'Nguyen Van A', email: 'a@gmail.com' },
        { id: 2, name: 'Tran Thi B', email: 'b@gmail.com' }
    ]);
    XLSX.utils.book_append_sheet(wb, ws, 'Users');
    XLSX.writeFile(wb, EXCEL_FILE);
}

// --- CSV Helpers (Promise based) ---
const readCSV = () => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => resolve(results))
            .on('error', (err) => reject(err));
    });
};

const writeCSV = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const json2csvParser = new Parser({ fields: ['id', 'name', 'email'] });
            const csvData = json2csvParser.parse(data);
            fs.writeFileSync(CSV_FILE, csvData, 'utf8');
            resolve(true);
        } catch (err) {
            reject(err);
        }
    });
};

// --- Excel Helpers (Promise based) ---
const readExcel = () => {
    return new Promise((resolve, reject) => {
        try {
            const workbook = XLSX.readFile(EXCEL_FILE);
            const sheetName = workbook.SheetNames[0];
            const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
            resolve(sheetData);
        } catch (err) {
            reject(err);
        }
    });
};

const writeExcel = (data) => {
    return new Promise((resolve, reject) => {
        try {
            const workbook = XLSX.readFile(EXCEL_FILE);
            const sheetName = workbook.SheetNames[0];
            workbook.Sheets[sheetName] = XLSX.utils.json_to_sheet(data);
            XLSX.writeFile(workbook, EXCEL_FILE);
            resolve(true);
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { readCSV, writeCSV, readExcel, writeExcel };