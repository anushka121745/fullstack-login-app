const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// GET all assets
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM assets ORDER BY id DESC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ADD asset
router.post("/", async (req, res) => {
  try {
    const { asset_code, asset_name, asset_type, purchase_date, purchase_cost } = req.body;
    const result = await pool.query(
      "INSERT INTO assets(asset_code, asset_name, asset_type, purchase_date, purchase_cost) VALUES($1,$2,$3,$4,$5) RETURNING *",
      [asset_code, asset_name, asset_type, purchase_date, purchase_cost]
    );
    res.status(201).json({ message: "Asset added!", asset: result.rows[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ALLOCATE asset to employee
router.post("/allocate", async (req, res) => {
  const client = await pool.connect();
  try {
    const { asset_id, employee_id, allocated_by } = req.body;

    await client.query("BEGIN");

    const allocation = await client.query(
      "INSERT INTO asset_allocations(asset_id, employee_id, allocated_by) VALUES($1,$2,$3) RETURNING *",
      [asset_id, employee_id, allocated_by]
    );

    await client.query(
      "UPDATE assets SET status='allocated' WHERE id=$1",
      [asset_id]
    );

    await client.query(
      "INSERT INTO asset_history(asset_id, action, remarks, created_by) VALUES($1,'allocated','Asset allocated to employee',$2)",
      [asset_id, allocated_by]
    );

    await client.query(
      "INSERT INTO notifications(user_id, title, message) VALUES($1,'Asset Assigned','A new asset has been assigned to you')",
      [employee_id]
    );

    await client.query(
      "INSERT INTO audit_logs(table_name, action_type, record_id, new_data, performed_by) VALUES('asset_allocations','INSERT',$1,$2::jsonb,$3)",
      [allocation.rows[0].id, JSON.stringify(allocation.rows[0]), allocated_by]
    );

    await client.query("COMMIT");
    res.status(201).json({ message: "Asset allocated successfully!" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// GET all allocations with JOIN
router.get("/allocations", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT aa.id, a.asset_name, a.asset_type, u.name as employee_name,
      aa.allocated_date, aa.status
      FROM asset_allocations aa
      INNER JOIN assets a ON aa.asset_id = a.id
      INNER JOIN users u ON aa.employee_id = u.id
      ORDER BY aa.id DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// RETURN asset
router.put("/return/:id", async (req, res) => {
  const client = await pool.connect();
  try {
    const { asset_id, returned_by } = req.body;

    await client.query("BEGIN");

    await client.query(
      "UPDATE asset_allocations SET status='returned', return_date=CURRENT_DATE WHERE id=$1",
      [req.params.id]
    );

    await client.query(
      "UPDATE assets SET status='available' WHERE id=$1",
      [asset_id]
    );

    await client.query(
      "INSERT INTO asset_history(asset_id, action, remarks, created_by) VALUES($1,'returned','Asset returned by employee',$2)",
      [asset_id, returned_by]
    );

    await client.query("COMMIT");
    res.json({ message: "Asset returned successfully!" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500).json({ message: error.message });
  } finally {
    client.release();
  }
});

// GET notifications
router.get("/notifications/:user_id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM notifications WHERE user_id=$1 ORDER BY created_at DESC",
      [req.params.user_id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const total = await pool.query("SELECT COUNT(*) FROM assets");
    const allocated = await pool.query("SELECT COUNT(*) FROM assets WHERE status='allocated'");
    const available = await pool.query("SELECT COUNT(*) FROM assets WHERE status='available'");
    const byType = await pool.query("SELECT asset_type, COUNT(*) as count FROM assets GROUP BY asset_type");
    res.json({
      total: total.rows[0].count,
      allocated: allocated.rows[0].count,
      available: available.rows[0].count,
      byType: byType.rows
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;