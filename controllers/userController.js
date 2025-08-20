import pool from "../config/db.js";

// Add user
const addUser = async (req, res) => {
  try {
    const {
      firstName,
      secondName,
      userId,
      phone,
      email,
      role,
      branch,
      gender
    } = req.body;

    if (!firstName || !secondName || !userId || !phone || !role || !gender) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    const result = await pool.query(
      `INSERT INTO users (
        first_name, second_name, user_id, phone, email, role, branch, gender
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) 
       RETURNING id, first_name AS "firstName", second_name AS "secondName",
                 user_id AS "userId", phone, email, role, branch, gender`,
      [firstName, secondName, userId, phone, email, role, branch, gender]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding user:", error);
    res.status(500).json({ message: "Error adding user" });
  }
};

// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, first_name AS "firstName", second_name AS "secondName",
              user_id AS "userId", phone, email, role, branch, gender
       FROM users ORDER BY id DESC`
    );
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Error fetching users" });
  }
};

// Update user
const updateUser = async (req, res) => {
  const { id } = req.params;
  const { firstName, secondName, phone, email, role, branch, gender } = req.body;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET first_name=$1, second_name=$2, phone=$3, email=$4, role=$5, branch=$6, gender=$7
       WHERE id=$8 
       RETURNING id, first_name AS "firstName", second_name AS "secondName",
                 user_id AS "userId", phone, email, role, branch, gender`,
      [firstName, secondName, phone, email, role, branch, gender, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: error.message });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`DELETE FROM users WHERE id=$1 RETURNING *`, [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: error.message });
  }
};

export { addUser, getUsers, updateUser, deleteUser };
