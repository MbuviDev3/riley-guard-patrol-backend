import express from 'express'
import bcrypt from 'bcrypt'
import pool from '../config/db.js';
const router = express.Router();

router.post('/signup', async (req, res) => {
  const { firstName, secondName, userId, phone, email, role, branch, gender, password } = req.body;

  try {
    // ✅ Check if email exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // ✅ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ Insert user
const newUser = await pool.query(
  `INSERT INTO users
    (first_name, second_name, user_id, phone, email, role, branch, gender, password_hash)
   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
   RETURNING *`,
  [firstName, secondName, userId, phone, email, role, branch, gender, hashedPassword]
);


    res.json({ message: 'User created successfully', user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET ALL USERS
// =======================
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name, second_name, user_id, phone, email, role, branch, gender, created_at 
       FROM users 
       ORDER BY created_at DESC`
    );
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/users/guards
router.get("/guards", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, first_name, second_name FROM users WHERE role = 'guard'"
    );
    res.json({ guards: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch guards" });
  }
});


export default router;
