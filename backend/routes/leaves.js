const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all leave types
router.get("/types", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM leave_types");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// APPLY leave
router.post("/apply", async (req, res) => {
  try {
    const { employee_id, leave_type_id, from_date, to_date, reason } = req.body;
    const from = new Date(from_date);
    const to = new Date(to_date);
    const total_days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

    const result = await pool.query(
      "INSERT INTO leave_applications(employee_id, leave_type_id, from_date, to_date, total_days, reason, status) VALUES($1,$2,$3,$4,$5,$6,'pending') RETURNING *",
      [employee_id, leave_type_id, from_date, to_date, total_days, reason]
    );
    res.status(201).json({ message: "Leave applied successfully!", leave: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all leave applications with JOIN
router.get("/all", async (req, res) => {
  try {
    const result = await pool.query(`SELECT la.id, u.name, lt.leave_name, la.from_date, la.to_date, la.total_days, la.reason, la.status, la.created_at FROM leave_applications la INNER JOIN users u ON la.employee_id = u.id INNER JOIN leave_types lt ON la.leave_type_id = lt.id ORDER BY la.created_at DESC`);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET my leave applications
router.get("/my/:employee_id", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT la.id, lt.leave_name, la.from_date, la.to_date, la.total_days, la.reason, la.status, la.created_at FROM leave_applications la INNER JOIN leave_types lt ON la.leave_type_id = lt.id WHERE la.employee_id = $1 ORDER BY la.created_at DESC`,
      [req.params.employee_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// APPROVE or REJECT leave
router.put("/action/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { action, remarks, approved_by } = req.body;
    const leaveId = req.params.id;
    await client.query("BEGIN");
    await client.query("UPDATE leave_applications SET status=$1 WHERE id=$2", [action, leaveId]);
    await client.query("INSERT INTO approval_history(leave_id, approved_by, action, remarks) VALUES($1,$2,$3,$4)", [leaveId, approved_by, action, remarks]);
    await client.query("COMMIT");
    res.json({ message: `Leave ${action} successfully!` });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// DASHBOARD stats
router.get("/stats", async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM leave_applications");
    const pending = await pool.query("SELECT COUNT(*) FROM leave_applications WHERE status='pending'");
    const approved = await pool.query("SELECT COUNT(*) FROM leave_applications WHERE status='approved'");
    const rejected = await pool.query("SELECT COUNT(*) FROM leave_applications WHERE status='rejected'");
    res.json({
      total: total.rows[0].count,
      pending: pending.rows[0].count,
      approved: approved.rows[0].count,
      rejected: rejected.rows[0].count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;