import pool from '../config/db.js';

// Get all guards with their assigned checkpoints
export const getGuards = async (req, res) => {
  try {
    const guardsRes = await pool.query(
      `SELECT u.id, u.first_name, u.second_name, 
        json_agg(json_build_object('id', c.id, 'name', c.name)) FILTER (WHERE c.id IS NOT NULL) AS assigned_checkpoints
      FROM users u
      LEFT JOIN assignments a ON u.id = a.guard_id
      LEFT JOIN checkpoints c ON a.checkpoint_id = c.id
      WHERE u.role = 'guard'
      GROUP BY u.id`
    );
    res.status(200).json({ success: true, guards: guardsRes.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Assign checkpoint to guard
export const assignCheckpoint = async (req, res) => {
  const { guardId, checkpointId } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO assignments (guard_id, checkpoint_id) VALUES ($1, $2) RETURNING *`,
      [guardId, checkpointId]
    );
    res.status(201).json({ success: true, assignment: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to assign checkpoint' });
  }
};

// Record a scan
export const recordScan = async (req, res) => {
  const { guardId, checkpointId, qrData } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO scans (guard_id, checkpoint_id, qr_data) VALUES ($1, $2, $3) RETURNING *`,
      [guardId, checkpointId, qrData]
    );
    res.status(201).json({ success: true, scan: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to record scan' });
  }
};

// Get all reports (scans)
export const getReports = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.id, s.scanned_at, u.first_name || ' ' || u.second_name AS guard_name,
        c.name AS checkpoint_name
       FROM scans s
       LEFT JOIN users u ON s.guard_id = u.id
       LEFT JOIN checkpoints c ON s.checkpoint_id = c.id
       ORDER BY s.scanned_at DESC`
    );
    res.status(200).json({ success: true, reports: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
};
