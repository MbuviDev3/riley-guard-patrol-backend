// routes/reports.js
import express from 'express';
import multer from 'multer';
import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Serve the uploads folder statically
router.use('/uploads', express.static(uploadDir));

// POST a new report
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    const { userId, reportType, notes } = req.body;
    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO reports (user_id, report_type, notes, photo_name, photo_url)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [userId, reportType, notes, req.file?.originalname, photoUrl]
    );

    res.json({ report: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET all reports
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    res.json({ reports: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
