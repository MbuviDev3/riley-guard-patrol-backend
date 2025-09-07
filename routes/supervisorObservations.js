import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// GET all supervisor observations
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM supervisor_observations ORDER BY created_at DESC`
    );
    res.json({ observations: result.rows });
  } catch (err) {
    console.error("❌ Fetch supervisor observations error:", err);
    res.status(500).json({ error: "Failed to fetch observations" });
  }
});

// POST new supervisor observation
router.post("/", async (req, res) => {
  const { checkpointData, guardData, guardId, observation } = req.body;

  if (!checkpointData || !guardData || !guardId || !observation) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO supervisor_observations (checkpoint_data, guard_data, guard_id, observation)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [checkpointData, guardData, guardId, observation]
    );

    res.json({ observation: result.rows[0] });
  } catch (err) {
    console.error("❌ Save supervisor observation error:", err);
    res.status(500).json({ error: "Failed to save observation" });
  }
});

export default router;
