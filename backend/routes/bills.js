const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all bills with SIM info
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.Bill_ID, b.Bill_Date, b.Due_Date, b.Total_Amount,
              b.SIM_ID, s.Mobile_Number
       FROM Bill b
       JOIN SIM_Card s ON b.SIM_ID = s.SIM_ID
       ORDER BY b.Bill_ID`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /bills error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single bill
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.Bill_ID, b.Bill_Date, b.Due_Date, b.Total_Amount,
              b.SIM_ID, s.Mobile_Number
       FROM Bill b
       JOIN SIM_Card s ON b.SIM_ID = s.SIM_ID
       WHERE b.Bill_ID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Bill not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /bills/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create bill
router.post('/', async (req, res) => {
  try {
    const { Bill_Date, Due_Date, Total_Amount, SIM_ID } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Bill (Bill_Date, Due_Date, Total_Amount, SIM_ID) VALUES (?, ?, ?, ?)',
      [Bill_Date, Due_Date, Total_Amount, SIM_ID]
    );
    res.status(201).json({ Bill_ID: result.insertId, ...req.body });
  } catch (err) {
    console.error('POST /bills error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update bill
router.put('/:id', async (req, res) => {
  try {
    const { Bill_Date, Due_Date, Total_Amount, SIM_ID } = req.body;
    const [result] = await pool.query(
      'UPDATE Bill SET Bill_Date = ?, Due_Date = ?, Total_Amount = ?, SIM_ID = ? WHERE Bill_ID = ?',
      [Bill_Date, Due_Date, Total_Amount, SIM_ID, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Bill not found' });
    res.json({ message: 'Bill updated successfully' });
  } catch (err) {
    console.error('PUT /bills/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE bill
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Bill WHERE Bill_ID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Bill not found' });
    res.json({ message: 'Bill deleted successfully' });
  } catch (err) {
    console.error('DELETE /bills/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
