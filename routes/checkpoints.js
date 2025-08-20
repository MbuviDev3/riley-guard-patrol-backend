import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

// GET all checkpoints
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, location, 
             UPPER(REGEXP_REPLACE(qr_code, '\\s', '', 'g')) AS qr_code
      FROM checkpoints
      ORDER BY id DESC
    `);
    res.json({ checkpoints: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch checkpoints" });
  }
});

// POST add checkpoint
router.post("/", async (req, res) => {
  try {
    const { name, location, qrCode } = req.body;
    if (!name || !qrCode)
      return res.status(400).json({ error: "Missing fields" });

    const result = await pool.query(
      `INSERT INTO checkpoints (name, location, qr_code)
       VALUES ($1, $2, $3)
       RETURNING id, name, location, UPPER(TRIM(qr_code)) AS qr_code`,
      [name, location || null, qrCode.trim().toUpperCase()]
    );

    res.status(201).json({ checkpoint: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add checkpoint" });
  }
});

export default router;
