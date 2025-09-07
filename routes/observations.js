import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET all observations
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.id,
        o.qr_data,
        o.observation,
        o.created_at,
        c.name AS checkpoint_name,
        u.first_name || ' ' || u.second_name AS guard_name
      FROM observations o
      LEFT JOIN checkpoints c ON o.checkpoint_id = c.id
      LEFT JOIN users u ON o.guard_id = u.id
      ORDER BY o.id DESC
    `);

    res.json({ observations: result.rows });
  } catch (err) {
    console.error("❌ Fetch observations error:", err);
    res.status(500).json({ error: "Failed to fetch observations" });
  }
});

// POST new observation
router.post("/", async (req, res) => {
  const { guardId, qrData, observation } = req.body;

  if (!guardId || !observation || !qrData) {
    return res
      .status(400)
      .json({ error: "guardId, qrData and observation are required" });
  }

  try {
    // Try to match checkpoint by QR code
    const cpRes = await pool.query(
      `SELECT id FROM checkpoints WHERE qr_code = $1`,
      [qrData]
    );

    let checkpointId = null;
    if (cpRes.rowCount > 0) {
      checkpointId = cpRes.rows[0].id;
    }

    // Insert observation with qr_data stored as text
    const result = await pool.query(
      `INSERT INTO observations (guard_id, checkpoint_id, qr_data, observation)
       VALUES ($1, $2, $3, $4)
       RETURNING id, guard_id, checkpoint_id, qr_data, observation, created_at`,
      [guardId, checkpointId, qrData, observation]
    );

    res.json({ observation: result.rows[0] });
  } catch (err) {
    console.error("❌ Save observation error:", err);
    res.status(500).json({ error: "Failed to save observation" });
  }
});

export default router;
