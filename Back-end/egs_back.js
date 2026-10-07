/* ==========================================================================
   EGS_BACK - MICRO BACKEND SERVER (CSV, EXCEL, SQL - FULL CRUD API)
   Định dạng: Development Server Chuẩn (Modularized & Secured)
   ================================------------------------------------------ */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const db = require('./db');
const { readCSV, writeCSV, readExcel, writeExcel } = require('./fileHandler');

const app = express();
const PORT = process.env.PORT || 3000;

/* ==========================================
   A. BẢO MẬT & MIDDLEWARES CHUẨN PRODUCTION
   ================================---------- */
// 1. Bảo mật HTTP headers cơ bản
app.use(helmet());

// 2. Cấu hình CORS (Cho phép các client app kết nối)
app.use(cors({
    origin: '*', // Thay đổi thành domain cụ thể khi lên production thực tế
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 3. Giới hạn số lượng request tránh tấn công DoS/Brute-force (Rate Limiting)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 phút
    max: 100, // Tối đa 100 request mỗi 15 phút từ 1 IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.' }
});
app.use('/api/', limiter);

// 4. Middleware đọc JSON body
app.use(express.json());


/* ==========================================================================
   B. NHÓM API CHO CSV DATABASE (CRUD + ASYNC/AWAIT)
   ================================------------------------------------------ */

app.get('/api/csv', async(req, res) => {
    try {
        const data = await readCSV();
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/csv', async(req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Thiếu thông tin name hoặc email!' });

        const results = await readCSV();
        const newId = results.length > 0 ? parseInt(results[results.length - 1].id) + 1 : 1;
        const newData = { id: newId, name, email };

        results.push(newData);
        await writeCSV(results);

        res.json({ success: true, message: 'Đã thêm vào CSV thành công!', data: newData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/csv/:id', async(req, res) => {
    try {
        const targetId = req.params.id;
        const { name, email } = req.body;
        const results = await readCSV();

        let found = false;
        const updatedResults = results.map(row => {
            if (row.id.toString() === targetId.toString()) {
                found = true;
                return { id: row.id, name: name || row.name, email: email || row.email };
            }
            return row;
        });

        if (!found) return res.status(404).json({ error: 'Không tìm thấy ID trong CSV!' });

        await writeCSV(updatedResults);
        res.json({ success: true, message: `Đã cập nhật ID ${targetId} trong CSV!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/csv/:id', async(req, res) => {
    try {
        const targetId = req.params.id;
        const results = await readCSV();
        const filteredResults = results.filter(row => row.id.toString() !== targetId.toString());

        if (filteredResults.length === results.length) {
            return res.status(404).json({ error: 'Không tìm thấy ID trong CSV!' });
        }

        await writeCSV(filteredResults);
        res.json({ success: true, message: `Đã xóa ID ${targetId} khỏi CSV!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* ==========================================================================
   C. NHÓM API CHO EXCEL (.xlsx) DATABASE (CRUD + ASYNC/AWAIT)
   ================================------------------------------------------ */

app.get('/api/excel', async(req, res) => {
    try {
        const sheetData = await readExcel();
        res.json({ success: true, data: sheetData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/excel', async(req, res) => {
    try {
        const { name, email } = req.body;
        if (!name || !email) return res.status(400).json({ error: 'Thiếu thông tin name hoặc email!' });

        const sheetData = await readExcel();
        const newId = sheetData.length > 0 ? sheetData[sheetData.length - 1].id + 1 : 1;
        const newItem = { id: newId, name, email };

        sheetData.push(newItem);
        await writeExcel(sheetData);

        res.json({ success: true, message: 'Đã thêm vào Excel thành công!', data: newItem });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/excel/:id', async(req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        const { name, email } = req.body;
        const sheetData = await readExcel();

        let found = false;
        const updatedData = sheetData.map(row => {
            if (row.id === targetId) {
                found = true;
                return { id: row.id, name: name || row.name, email: email || row.email };
            }
            return row;
        });

        if (!found) return res.status(404).json({ error: 'Không tìm thấy ID trong Excel!' });

        await writeExcel(updatedData);
        res.json({ success: true, message: `Đã cập nhật ID ${targetId} trong Excel!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/excel/:id', async(req, res) => {
    try {
        const targetId = parseInt(req.params.id);
        const sheetData = await readExcel();
        const filteredData = sheetData.filter(row => row.id !== targetId);

        if (filteredData.length === sheetData.length) {
            return res.status(404).json({ error: 'Không tìm thấy ID trong Excel!' });
        }

        await writeExcel(filteredData);
        res.json({ success: true, message: `Đã xóa ID ${targetId} khỏi Excel!` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


/* ==========================================================================
   D. NHÓM API CHO SQL (SQLite) DATABASE (CRUD)
   ================================------------------------------------------ */

app.get('/api/sql', (req, res) => {
    db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, data: rows });
    });
});

app.post('/api/sql', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Thiếu thông tin name hoặc email!' });

    const query = `INSERT INTO users (name, email) VALUES (?, ?)`;
    db.run(query, [name, email], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
            success: true,
            message: 'Đã thêm vào SQL Database thành công!',
            data: { id: this.lastID, name, email }
        });
    });
});

app.put('/api/sql/:id', (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    const query = `UPDATE users SET name = ?, email = ? WHERE id = ?`;

    db.run(query, [name, email, id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Không tìm thấy ID người dùng!' });
        res.json({ success: true, message: `Đã cập nhật ID ${id} thành công!` });
    });
});

app.delete('/api/sql/:id', (req, res) => {
    const { id } = req.params;
    const query = `DELETE FROM users WHERE id = ?`;

    db.run(query, [id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        if (this.changes === 0) return res.status(404).json({ error: 'Không tìm thấy ID người dùng!' });
        res.json({ success: true, message: `Đã xóa ID ${id} thành công!` });
    });
});


/* ==========================================================================
   E. KHỞI CHẠY SERVER
   ================================------------------------------------------ */
app.listen(PORT, () => {
    console.log(`[egs_back] Server đang chạy an toàn tại: http://localhost:${PORT}`);
});