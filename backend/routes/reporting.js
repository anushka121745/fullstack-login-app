const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CITY WISE REPORT
router.get("/citywise", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ep.city, COUNT(ep.id) as total_employees,
      COALESCE(SUM(ep.salary), 0) as total_salary,
      COALESCE(AVG(ep.salary), 0) as avg_salary
      FROM employee_profiles ep
      WHERE ep.city IS NOT NULL
      GROUP BY ep.city
      ORDER BY total_employees DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DOMAIN WISE REPORT
router.get("/domainwise", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ep.domain, COUNT(ep.id) as total_employees,
      COALESCE(SUM(ep.salary), 0) as total_salary,
      COALESCE(AVG(ep.salary), 0) as avg_salary
      FROM employee_profiles ep
      WHERE ep.domain IS NOT NULL
      GROUP BY ep.domain
      ORDER BY total_employees DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MEETING MODE REPORT
router.get("/meetingmode", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ep.meeting_mode, COUNT(ep.id) as total_employees
      FROM employee_profiles ep
      WHERE ep.meeting_mode IS NOT NULL
      GROUP BY ep.meeting_mode
      ORDER BY total_employees DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MARK ATTENDANCE
router.post("/attendance", async (req, res) => {
  try {
    const { employee_id, check_in, check_out, attendance_date } = req.body;
    const lateTime = "09:30";
    const is_late = check_in > lateTime;

    const existing = await pool.query(
      "SELECT * FROM attendance WHERE employee_id=$1 AND attendance_date=$2",
      [employee_id, attendance_date]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Attendance already marked!" });
    }

    await pool.query(
      "INSERT INTO attendance(employee_id, check_in, check_out, attendance_date, is_late, status) VALUES($1,$2,$3,$4,$5,'present')",
      [employee_id, check_in, check_out, attendance_date, is_late]
    );

    res.json({ message: "Attendance marked!", is_late });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET ATTENDANCE with 3 late = 1 absent rule
router.get("/attendance/:employee_id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM attendance WHERE employee_id=$1 ORDER BY attendance_date DESC",
      [req.params.employee_id]
    );

    const lateCount = result.rows.filter(a => a.is_late).length;
    const absentFromLate = Math.floor(lateCount / 3);

    res.json({
      attendance: result.rows,
      late_count: lateCount,
      absent_from_late: absentFromLate,
      total_days: result.rows.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// SALARY REPORT with TDS & ESI
router.get("/salary/:employee_id", async (req, res) => {
  try {
    const emp = await pool.query(
      "SELECT ep.salary, u.name FROM employee_profiles ep JOIN users u ON ep.user_id = u.id WHERE ep.user_id=$1",
      [req.params.employee_id]
    );

    if (emp.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const basic = parseFloat(emp.rows[0].salary);
    const tds = basic > 50000 ? basic * 0.10 : basic * 0.05;
    const esi = basic <= 21000 ? basic * 0.0075 : 0;
    const pf = basic * 0.12;
    const total_deduction = tds + esi + pf;
    const net_salary = basic - total_deduction;

    res.json({
      name: emp.rows[0].name,
      basic_salary: basic,
      tds_deduction: tds.toFixed(2),
      esi_deduction: esi.toFixed(2),
      pf_deduction: pf.toFixed(2),
      total_deduction: total_deduction.toFixed(2),
      net_salary: net_salary.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ALL EMPLOYEES SALARY REPORT
router.get("/salary-all", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.name, ep.designation, ep.salary as basic_salary,
      CASE WHEN ep.salary > 50000 THEN ep.salary * 0.10 ELSE ep.salary * 0.05 END as tds,
      CASE WHEN ep.salary <= 21000 THEN ep.salary * 0.0075 ELSE 0 END as esi,
      ep.salary * 0.12 as pf,
      ep.salary - (CASE WHEN ep.salary > 50000 THEN ep.salary * 0.10 ELSE ep.salary * 0.05 END) - 
      (CASE WHEN ep.salary <= 21000 THEN ep.salary * 0.0075 ELSE 0 END) - 
      (ep.salary * 0.12) as net_salary
      FROM employee_profiles ep
      JOIN users u ON ep.user_id = u.id
      ORDER BY ep.salary DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;