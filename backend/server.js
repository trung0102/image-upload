const express = require('express');
const multer = require('multer');
const {Pool} = require('pg');
const path = require('path');
const cors = require('cors');
const { copyFileSync } = require('fs');
require('dotenv').config();

const app = express();
const port = 5000;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

const storage = multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}_${file.originalname}`)
    },
});

const uploads = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
          }
          cb(new Error('Chỉ chấp nhận file ảnh JPG, PNG, GIF!'));
    },
    limits: { fileSize: 5 * 1024 * 1024 },
});

app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(cors());

app.post('/upload', uploads.single('image'), async (req, res) => {
    try {
        const {originalname} = req.file;
        const imagePath = `/uploads/${req.file.filename}`;

        const query = 'INSERT INTO images (img_name, path) VALUES ($1, $2) RETURNING *';
        const values = [originalname, imagePath];
        const result = await pool.query(query, values);

        res.json({ message: 'Upload thanh cong!', image: result.rows[0]});
    } catch (error) {
        res.status(500).json({error: error.message}); 
    }
});

app.get('/images', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM images');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({error: error.message}); 
    }
});

app.listen(port, () => {
    console.log(`Server chạy tại http://localhost:${port}`);
});