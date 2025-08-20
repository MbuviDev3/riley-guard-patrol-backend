import express from 'express';
import pool from '../config/db.js';

const router = express.Router();

// GET all observations
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.id, o.observation, o.created_at, o.qr_data, c.name AS checkpoint_name
      FROM observations o
      LEFT JOIN checkpoints c ON o.checkpoint_id = c.id
      ORDER BY o.id DESC
    `);
    res.json({ observations: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch observations' });
  }
});

// POST new observation
router.post("/", async (req, res) => {
  const { qrData, guardId, observation } = req.body;

  if (!guardId || !observation) {
    return res.status(400).json({ error: "Guard ID and observation are required" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO observations (qr_data, guard_id, observation)
       VALUES ($1, $2, $3)
       RETURNING id, qr_data, guard_id, observation, created_at`,
      [qrData, guardId, observation]
    );

    res.json({ observation: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save observation" });
  }
});

export default router;
