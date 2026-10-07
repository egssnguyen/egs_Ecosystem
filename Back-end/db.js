// db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const SQL_FILE = path.join(__dirname, 'database.sqlite');

const db = new sqlite3.Database(SQL_FILE, (err) => {
    if (err) {
        console.error('Lỗi kết nối SQLite:', err.message);
    } else {
        console.log('Đã kết nối thành công với SQLite Database.');
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT
        )`);
    }
});

module.exports = db;