import express from 'express';
import pool from '../config/db.js';
const router = express.Router();

// Instead of saving qrCode base64, save only qr_value
// routes/checkpoints.js
router.post("/", async (req, res) => {
  try {
    const { name, location, qrCode, qrValue } = req.body;

    const result = await pool.query(
      "INSERT INTO checkpoints (name, location, qr_code, qr_value) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, location, qrCode, qrValue]  // ✅ pass qrCode into qr_code
    );

    res.json({ checkpoint: result.rows[0] });
  } catch (err) {
    console.error("Error adding checkpoint:", err);
    res.status(500).json({ error: "Failed to add checkpoint" });
  }
});


// Fetch checkpoints
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM checkpoints ORDER BY id DESC");
    res.json({ checkpoints: result.rows });
  } catch (err) {
    console.error("Error fetching checkpoints:", err);
    res.status(500).json({ error: "Failed to fetch checkpoints" });
  }
});


export default router;
