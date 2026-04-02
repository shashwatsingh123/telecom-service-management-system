const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all customers (Age computed dynamically)
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT Customer_ID, Name, Aadhaar_Number, Phone, Date_of_Birth,
              TIMESTAMPDIFF(YEAR, Date_of_Birth, CURDATE()) AS Age
       FROM Customer
       ORDER BY Customer_ID`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /customers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single customer by ID
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT Customer_ID, Name, Aadhaar_Number, Phone, Date_of_Birth,
              TIMESTAMPDIFF(YEAR, Date_of_Birth, CURDATE()) AS Age
       FROM Customer WHERE Customer_ID = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /customers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create customer
router.post('/', async (req, res) => {
  try {
    const { Name, Aadhaar_Number, Phone, Date_of_Birth } = req.body;
    const [result] = await pool.query(
      'INSERT INTO Customer (Name, Aadhaar_Number, Phone, Date_of_Birth) VALUES (?, ?, ?, ?)',
      [Name, Aadhaar_Number, Phone, Date_of_Birth]
    );
    res.status(201).json({ Customer_ID: result.insertId, ...req.body });
  } catch (err) {
    console.error('POST /customers error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update customer
router.put('/:id', async (req, res) => {
  try {
    const { Name, Aadhaar_Number, Phone, Date_of_Birth } = req.body;
    const [result] = await pool.query(
      'UPDATE Customer SET Name = ?, Aadhaar_Number = ?, Phone = ?, Date_of_Birth = ? WHERE Customer_ID = ?',
      [Name, Aadhaar_Number, Phone, Date_of_Birth, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer updated successfully' });
  } catch (err) {
    console.error('PUT /customers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE customer
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM Customer WHERE Customer_ID = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    console.error('DELETE /customers/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
