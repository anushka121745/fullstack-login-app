const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { files: 5 } });

router.get("/departments", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM departments");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/skills", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM skills");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { user_id, department_id, phone, address, designation, salary, skills } = req.body;
    const emp = await pool.query(
      "INSERT INTO employee_profiles(user_id, department_id, phone, address, designation, salary) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [user_id, department_id, phone, address, designation, salary]
    );
    const empId = emp.rows[0].id;
    if (skills && skills.length > 0) {
      for (let skillId of skills) {
        await pool.query("INSERT INTO employee_skills(employee_id, skill_id) VALUES($1,$2)", [empId, skillId]);
      }
    }
    res.status(201).json({ message: "Employee created!", employee: emp.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT ep.id, u.name, u.email, d.department_name, ep.phone, ep.designation, ep.salary FROM employee_profiles ep INNER JOIN users u ON ep.user_id = u.id INNER JOIN departments d ON ep.department_id = d.id");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM employee_skills WHERE employee_id=$1", [req.params.id]);
    await pool.query("DELETE FROM employee_images WHERE employee_id=$1", [req.params.id]);
    await pool.query("DELETE FROM employee_profiles WHERE id=$1", [req.params.id]);
    res.json({ message: "Employee deleted!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/upload/:id", upload.array("images", 5), async (req, res) => {
  try {
    const empId = req.params.id;
    for (let file of req.files) {
      await pool.query("INSERT INTO employee_images(employee_id, image_url) VALUES($1,$2)", [empId, file.filename]);
    }
    res.json({ message: "Images uploaded!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/stats/dashboard", async (req, res) => {
  try {
    const employees = await pool.query("SELECT COUNT(*) FROM employee_profiles");
    const departments = await pool.query("SELECT COUNT(*) FROM departments");
    const skills = await pool.query("SELECT COUNT(*) FROM skills");
    const images = await pool.query("SELECT COUNT(*) FROM employee_images");
    res.json({
      employees: employees.rows[0].count,
      departments: departments.rows[0].count,
      skills: skills.rows[0].count,
      images: images.rows[0].count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
// DEPARTMENT STATS
router.get("/department-stats", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.department_name,
        COUNT(ep.id) as employee_count,
        COALESCE(AVG(ep.salary), 0) as avg_salary,
        COALESCE(SUM(ep.salary), 0) as total_salary
      FROM departments d
      LEFT JOIN employee_profiles ep ON d.id = ep.department_id
      GROUP BY d.department_name
      ORDER BY employee_count DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TOTAL SALARY
router.get("/total-salary", async (req, res) => {
  try {
    const result = await pool.query("SELECT COALESCE(SUM(salary), 0) as total FROM employee_profiles");
    res.json({ total: result.rows[0].total });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});