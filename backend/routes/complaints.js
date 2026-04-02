const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all complaints with customer name
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT co.Customer_ID, co.Complaint_No, co.Complaint_Date, co.Description, co.Status,
              c.Name AS Customer_Name
       FROM Complaint co
       JOIN Customer c ON co.Customer_ID = c.Customer_ID
       ORDER BY co.Customer_ID, co.Complaint_No`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /complaints error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single complaint by composite key
router.get('/:customerId/:complaintNo', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT co.Customer_ID, co.Complaint_No, co.Complaint_Date, co.Description, co.Status,
              c.Name AS Customer_Name
       FROM Complaint co
       JOIN Customer c ON co.Customer_ID = c.Customer_ID
       WHERE co.Customer_ID = ? AND co.Complaint_No = ?`,
      [req.params.customerId, req.params.complaintNo]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Complaint not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /complaints/:customerId/:complaintNo error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create complaint (auto-generates Complaint_No per Customer)
router.post('/', async (req, res) => {
  try {
    const { Customer_ID, Complaint_Date, Description, Status } = req.body;
    // Auto-generate Complaint_No: max existing Complaint_No for this Customer + 1
    const [maxRows] = await pool.query(
      'SELECT COALESCE(MAX(Complaint_No), 0) AS maxNo FROM Complaint WHERE Customer_ID = ?',
      [Customer_ID]
    );
    const newComplaintNo = maxRows[0].maxNo + 1;
    await pool.query(
      'INSERT INTO Complaint (Customer_ID, Complaint_No, Complaint_Date, Description, Status) VALUES (?, ?, ?, ?, ?)',
      [Customer_ID, newComplaintNo, Complaint_Date, Description, Status || 'Open']
    );
    res.status(201).json({ Customer_ID, Complaint_No: newComplaintNo, ...req.body });
  } catch (err) {
    console.error('POST /complaints error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update complaint
router.put('/:customerId/:complaintNo', async (req, res) => {
  try {
    const { Complaint_Date, Description, Status } = req.body;
    const [result] = await pool.query(
      'UPDATE Complaint SET Complaint_Date = ?, Description = ?, Status = ? WHERE Customer_ID = ? AND Complaint_No = ?',
      [Complaint_Date, Description, Status, req.params.customerId, req.params.complaintNo]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Complaint not found' });
    res.json({ message: 'Complaint updated successfully' });
  } catch (err) {
    console.error('PUT /complaints/:customerId/:complaintNo error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE complaint
router.delete('/:customerId/:complaintNo', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM Complaint WHERE Customer_ID = ? AND Complaint_No = ?',
      [req.params.customerId, req.params.complaintNo]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Complaint not found' });
    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) {
    console.error('DELETE /complaints/:customerId/:complaintNo error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
