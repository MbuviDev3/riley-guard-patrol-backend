import pool from '../config/db.js';

export const addCheckpoint = async (req, res) => {
  try {
    const { name, location, qrCode } = req.body;

    if (!name || !location || !qrCode) {
      return res.status(400).json({ success: false, message: 'Missing fields' });
    }

    const result = await pool.query(
      'INSERT INTO checkpoints (name, location, qr_code) VALUES ($1, $2, $3) RETURNING *',
      [name, location, qrCode]
    );

    res.status(201).json({ success: true, checkpoint: result.rows[0] });
  } catch (err) {
    console.error('Error adding checkpoint:', err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

