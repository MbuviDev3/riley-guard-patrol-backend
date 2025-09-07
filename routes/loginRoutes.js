import express from "express";
import pool from "../config/db.js";
import bcrypt from "bcryptjs";

const router = express.Router();

router.post("/", async (req, res) => {
  const { user_id, password } = req.body;

  if (!user_id || !password) {
    return res.status(400).json({ status: "error", message: "User ID and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [user_id.trim()]);

    if (result.rows.length === 0) {
      return res.status(400).json({ status: "error", message: "User not found" });
    }

    const user = result.rows[0];
    console.log("User found:", user.user_id);

    const isMatch = await bcrypt.compare(password, user.password_hash);
    console.log("Password match:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ status: "error", message: "Invalid credentials" });
    }

    res.json({
      status: "success",
      message: "Login successful",
      user: {
        id: user.id,
        first_name: user.first_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ status: "error", message: "Server error" });
  }
});

export default router;
