import pool from './config/db.js' ;// PostgreSQL pool

// Add new checkpoint
const addCheckpoint = async (req, res) => {
  try {
    const { name, location, qrCode } = req.body;
    const result = await pool.query(
      'INSERT INTO checkpoints (name, location, qr_code) VALUES ($1, $2, $3) RETURNING *',
      [name, location, qrCode]
    );
    res.status(201).json({ success: true, checkpoint: result.rows[0] });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


// Get all checkpoints
async function getCheckpoints() {
  const result = await pool.query(`SELECT * FROM checkpoints ORDER BY id DESC`);
  return result.rows;
}

// Update checkpoint
async function updateCheckpoint(id, name, location) {
  const result = await pool.query(
    `UPDATE checkpoints SET name=$1, location=$2 WHERE id=$3 RETURNING *`,
    [name, location, id]
  );
  return result.rows[0];
}

// Delete checkpoint
async function deleteCheckpoint(id) {
  await pool.query(`DELETE FROM checkpoints WHERE id=$1`, [id]);
}

module.exports = { addCheckpoint, getCheckpoints, updateCheckpoint, deleteCheckpoint };
