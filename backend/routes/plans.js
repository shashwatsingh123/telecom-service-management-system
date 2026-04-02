const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all plans
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Plan ORDER BY Plan_ID');
    res.json(rows);
  } catch (err) {
    console.error('GET /plans error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single plan
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Plan WHERE Plan_ID = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /plans/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create plan
router.post('/', async (req, res) => {
  try {
    const { Plan_Name, Plan_Type, Cost, Data_Limit, Validity_Days } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Plan (Plan_Name, Plan_Type, Cost, Data_Limit, Validity_Days) VALUES (?, ?, ?, ?, ?)',
      [Plan_Name, Plan_Type, Cost, Data_Limit, Validity_Days]
    );
    res.status(201).json({ Plan_ID: result.insertId, ...req.body });
  } catch (err) {
    console.error('POST /plans error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update plan
router.put('/:id', async (req, res) => {
  try {
    const { Plan_Name, Plan_Type, Cost, Data_Limit, Validity_Days } = req.body;
    const [result] = await pool.query(
      'UPDATE Plan SET Plan_Name = ?, Plan_Type = ?, Cost = ?, Data_Limit = ?, Validity_Days = ? WHERE Plan_ID = ?',
      [Plan_Name, Plan_Type, Cost, Data_Limit, Validity_Days, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan updated successfully' });
  } catch (err) {
    console.error('PUT /plans/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE plan
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Plan WHERE Plan_ID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Plan not found' });
    res.json({ message: 'Plan deleted successfully' });
  } catch (err) {
    console.error('DELETE /plans/:id error:', err);
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ error: 'Cannot delete plan: it is assigned to one or more SIM cards' });
    }
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
