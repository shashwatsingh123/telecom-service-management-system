const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all payments with bill info
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.Payment_ID, p.Payment_Date, p.Amount, p.Payment_Mode,
              p.Bill_ID, b.Total_Amount AS Bill_Amount, b.SIM_ID, s.Mobile_Number
       FROM Payment p
       JOIN Bill b ON p.Bill_ID = b.Bill_ID
       JOIN SIM_Card s ON b.SIM_ID = s.SIM_ID
       ORDER BY p.Payment_ID`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /payments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single payment
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.Payment_ID, p.Payment_Date, p.Amount, p.Payment_Mode,
              p.Bill_ID, b.Total_Amount AS Bill_Amount, b.SIM_ID, s.Mobile_Number
       FROM Payment p
       JOIN Bill b ON p.Bill_ID = b.Bill_ID
       JOIN SIM_Card s ON b.SIM_ID = s.SIM_ID
       WHERE p.Payment_ID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /payments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create payment
router.post('/', async (req, res) => {
  try {
    const { Payment_Date, Amount, Payment_Mode, Bill_ID } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Payment (Payment_Date, Amount, Payment_Mode, Bill_ID) VALUES (?, ?, ?, ?)',
      [Payment_Date, Amount, Payment_Mode, Bill_ID]
    );
    res.status(201).json({ Payment_ID: result.insertId, ...req.body });
  } catch (err) {
    console.error('POST /payments error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update payment
router.put('/:id', async (req, res) => {
  try {
    const { Payment_Date, Amount, Payment_Mode, Bill_ID } = req.body;
    const [result] = await pool.query(
      'UPDATE Payment SET Payment_Date = ?, Amount = ?, Payment_Mode = ?, Bill_ID = ? WHERE Payment_ID = ?',
      [Payment_Date, Amount, Payment_Mode, Bill_ID, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment updated successfully' });
  } catch (err) {
    console.error('PUT /payments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE payment
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Payment WHERE Payment_ID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Payment not found' });
    res.json({ message: 'Payment deleted successfully' });
  } catch (err) {
    console.error('DELETE /payments/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
