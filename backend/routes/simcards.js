const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all SIM cards with joined Customer name and Plan name
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.SIM_ID, s.Mobile_Number, s.Activation_Date, s.Status,
              s.Customer_ID, c.Name AS Customer_Name,
              s.Plan_ID, p.Plan_Name, p.Cost AS Plan_Cost
       FROM SIM_Card s
       JOIN Customer c ON s.Customer_ID = c.Customer_ID
       JOIN Plan p ON s.Plan_ID = p.Plan_ID
       ORDER BY s.SIM_ID`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /simcards error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single SIM card
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.SIM_ID, s.Mobile_Number, s.Activation_Date, s.Status,
              s.Customer_ID, c.Name AS Customer_Name,
              s.Plan_ID, p.Plan_Name, p.Cost AS Plan_Cost
       FROM SIM_Card s
       JOIN Customer c ON s.Customer_ID = c.Customer_ID
       JOIN Plan p ON s.Plan_ID = p.Plan_ID
       WHERE s.SIM_ID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'SIM Card not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /simcards/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create SIM card
router.post('/', async (req, res) => {
  try {
    const { Mobile_Number, Activation_Date, Status, Customer_ID, Plan_ID } = req.body;
    const [result] = await pool.query(
      'INSERT INTO SIM_Card (Mobile_Number, Activation_Date, Status, Customer_ID, Plan_ID) VALUES (?, ?, ?, ?, ?)',
      [Mobile_Number, Activation_Date, Status || 'Active', Customer_ID, Plan_ID]
    );
    res.status(201).json({ SIM_ID: result.insertId, ...req.body });
  } catch (err) {
    console.error('POST /simcards error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update SIM card
router.put('/:id', async (req, res) => {
  try {
    const { Mobile_Number, Activation_Date, Status, Customer_ID, Plan_ID } = req.body;
    const [result] = await pool.query(
      'UPDATE SIM_Card SET Mobile_Number = ?, Activation_Date = ?, Status = ?, Customer_ID = ?, Plan_ID = ? WHERE SIM_ID = ?',
      [Mobile_Number, Activation_Date, Status, Customer_ID, Plan_ID, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'SIM Card not found' });
    res.json({ message: 'SIM Card updated successfully' });
  } catch (err) {
    console.error('PUT /simcards/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE SIM card
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM SIM_Card WHERE SIM_ID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'SIM Card not found' });
    res.json({ message: 'SIM Card deleted successfully' });
  } catch (err) {
    console.error('DELETE /simcards/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
