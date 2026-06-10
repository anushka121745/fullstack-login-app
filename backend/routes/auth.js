const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExist = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const newUser = await pool.query(
      `INSERT INTO users(name, email, password) VALUES($1, $2, $3) RETURNING *`,
      [name, email, hashedPassword]
    );
    res.status(201).json({ message: "User Registered Successfully!", user: newUser.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(400).json({ message: "Wrong Password" });
    }
    const token = jwt.sign({ id: user.rows[0].id, role: user.rows[0].role }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ message: "Login Success", token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PROFILE
router.get("/profile", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query("SELECT id, name, email, role FROM users WHERE id=$1", [decoded.id]);
    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (user.rows.length === 0) {
      return res.status(400).json({ message: "Email not found" });
    }
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 15 * 60 * 1000);
    await pool.query(
      `INSERT INTO password_reset (user_id, token, expires_at) VALUES ($1, $2, $3)`,
      [user.rows[0].id, token, expires]
    );
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset Request",
      html: `
        <h2>Password Reset</h2>
        <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
        <a href="http://localhost:3000/reset-password/${token}">Reset Password</a>
      `,
    });
    res.json({ message: "Password reset email sent!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    const resetRecord = await pool.query("SELECT * FROM password_reset WHERE token=$1", [token]);
    if (resetRecord.rows.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }
    const expired = new Date(resetRecord.rows[0].expires_at) < new Date();
    if (expired) {
      return res.status(400).json({ message: "Token expired" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [hashedPassword, resetRecord.rows[0].user_id]);
    await pool.query("DELETE FROM password_reset WHERE token=$1", [token]);
    res.json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADMIN ONLY ROUTE
router.get("/admin", async (req, res) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "admin") {
      return res.status(403).json({ message: "Forbidden - Admins only" });
    }
    const users = await pool.query("SELECT id, name, email, role FROM users");
    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;