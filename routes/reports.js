// routes/reports.js
import express from "express";
import multer from "multer";
import pool from "../config/db.js";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads folder exists
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

// Serve uploads folder statically
router.use("/uploads", express.static(uploadDir));

/**
 * POST /api/reports
 * Create a new report
 */
router.post("/", upload.single("photo"), async (req, res) => {
  try {
    const { userId, reportType, notes } = req.body;

    if (!userId || !reportType || !notes) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const result = await pool.query(
      `INSERT INTO reports (user_id, report_type, notes, photo_name, photo_url)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, reportType, notes, req.file?.originalname, photoUrl]
    );

    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    console.error("Error adding report:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/reports
 * Fetch all reports with user info
 */
// routes/reports.js
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, report_type, notes, photo_name, photo_url, created_at
       FROM reports
       ORDER BY created_at DESC`
    );

    res.json({ success: true, reports: result.rows });
  } catch (err) {
    console.error("Error fetching reports:", err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});

/**
 * GET /api/reports/:id
 * Fetch a single report by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT r.id, r.user_id, r.report_type, r.notes, r.photo_name, r.photo_url, r.created_at,
              u.first_name, u.second_name, u.role
       FROM reports r
       LEFT JOIN users u ON r.user_id = u.user_id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Report not found" });
    }

    res.json({ success: true, report: result.rows[0] });
  } catch (err) {
    console.error("Error fetching report:", err);
    res.status(500).json({ error: "Failed to fetch report" });
  }
});

export default router;
