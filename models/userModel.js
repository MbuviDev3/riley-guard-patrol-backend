const pool = require('../config/db');

const createUser = async (userData) => {
  const {
    firstName, secondName, userId,
    phone, email, role, branch, gender
  } = userData;

  const result = await pool.query(
    `INSERT INTO users 
    (first_name, second_name, user_id, phone, email, role, branch, gender)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [firstName, secondName, userId, phone, email, role, branch, gender]
  );

  return result.rows[0];
};

const getAllUsers = async () => {
  const result = await pool.query('SELECT * FROM users ORDER BY id DESC');
  return result.rows;
};

module.exports = { createUser, getAllUsers };