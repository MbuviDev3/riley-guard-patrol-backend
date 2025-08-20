import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

// GET all scans
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.id, s.guard_id, s.checkpoint_id, s.qr_data, s.observation, s.scanned_at
      FROM scans s
      ORDER BY s.created_at DESC
    `);
    res.json({ scans: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch scans" });
  }
});

// POST new scan
router.post("/", async (req, res) => {
  try {
    const { guardId, qrData, observation } = req.body;

    if (!guardId || !qrData)
      return res.status(400).json({ error: "guardId and qrData are required" });

    const cleanQr = qrData.trim().replace(/\s+/g, '').toUpperCase();

    // match checkpoint
    const cpRes = await pool.query(
      `SELECT id FROM checkpoints WHERE UPPER(REGEXP_REPLACE(qr_code, '\\s', '', 'g')) = $1`,
      [cleanQr]
    );

    if (cpRes.rowCount === 0) {
      return res.status(404).json({ error: "QR code does not match any checkpoint" });
    }

    const checkpointId = cpRes.rows[0].id;

    const scanRes = await pool.query(
      `INSERT INTO scans (guard_id, checkpoint_id, qr_data, observation)
       VALUES ($1, $2, $3, $4)
       RETURNING id, guard_id, checkpoint_id, qr_data, observation, scanned_at`,
      [guardId, checkpointId, cleanQr, observation || null]
    );

    res.json({ scan: scanRes.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save scan" });
  }
});

export default router;
