import express from "express";
import pool from "../config/db.js";

const router = express.Router();

// ---------------------------
// POST: assign checkpoint to guard
// ---------------------------
router.post("/", async (req, res) => {
  const { guardId, checkpointId } = req.body;

  if (!guardId || !checkpointId) {
    return res.status(400).json({ error: "Guard and checkpoint are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO assignments (guard_id, checkpoint_id) VALUES ($1, $2) RETURNING *",
      [guardId, checkpointId]
    );
    res.json({ assignment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign checkpoint" });
  }
});

// ---------------------------
// GET: assignments for a specific guard
// ---------------------------
router.get("/guard/:guardId", async (req, res) => {
  const { guardId } = req.params;
  try {
    const result = await pool.query(
      `SELECT a.id as assignment_id, c.name as checkpoint_name, c.location, a.assigned_at
       FROM assignments a
       JOIN checkpoints c ON a.checkpoint_id = c.id
       WHERE a.guard_id = $1
       ORDER BY a.assigned_at DESC`,
      [guardId]
    );

    res.json({ assignments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch assignments" });
  }
});

// ---------------------------
// GET: all assignments (supervisor view)
// ---------------------------
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.id as assignment_id,
              u.id as guard_id, u.first_name, u.second_name,
              c.id as checkpoint_id, c.name as checkpoint_name, c.location,
              a.assigned_at
       FROM assignments a
       JOIN users u ON a.guard_id = u.id
       JOIN checkpoints c ON a.checkpoint_id = c.id
       ORDER BY a.assigned_at DESC`
    );
    res.json({ assignments: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all assignments" });
  }
});

// ---------------------------
// GET: guards with their assigned checkpoints (optional)
// ---------------------------
router.get("/guards-with-checkpoints", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.id, u.first_name, u.second_name,
        json_agg(json_build_object(
          'id', c.id,
          'name', c.name,
          'assigned_at', a.assigned_at
        )) FILTER (WHERE c.id IS NOT NULL) AS assigned_checkpoints
      FROM users u
      LEFT JOIN assignments a ON u.id = a.guard_id
      LEFT JOIN checkpoints c ON a.checkpoint_id = c.id
      WHERE u.role = 'Guard'
      GROUP BY u.id
    `);
    res.json({ guards: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch guards with checkpoints" });
  }
});

export default router;
