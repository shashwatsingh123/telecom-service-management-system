const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all call records with SIM mobile number
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cr.SIM_ID, cr.Call_ID, cr.Call_Date, cr.Call_Time, cr.Call_Duration, cr.Call_Type,
              s.Mobile_Number
       FROM Call_Record cr
       JOIN SIM_Card s ON cr.SIM_ID = s.SIM_ID
       ORDER BY cr.SIM_ID, cr.Call_ID`
    );
    res.json(rows);
  } catch (err) {
    console.error('GET /callrecords error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET single call record by composite key
router.get('/:simId/:callId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT cr.SIM_ID, cr.Call_ID, cr.Call_Date, cr.Call_Time, cr.Call_Duration, cr.Call_Type,
              s.Mobile_Number
       FROM Call_Record cr
       JOIN SIM_Card s ON cr.SIM_ID = s.SIM_ID
       WHERE cr.SIM_ID = ? AND cr.Call_ID = ?`,
      [req.params.simId, req.params.callId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Call record not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('GET /callrecords/:simId/:callId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST create call record (auto-generates Call_ID per SIM)
router.post('/', async (req, res) => {
  try {
    const { SIM_ID, Call_Date, Call_Time, Call_Duration, Call_Type } = req.body;
    // Auto-generate Call_ID: max existing Call_ID for this SIM + 1
    const [maxRows] = await pool.query(
      'SELECT COALESCE(MAX(Call_ID), 0) AS maxId FROM Call_Record WHERE SIM_ID = ?',
      [SIM_ID]
    );
    const newCallId = maxRows[0].maxId + 1;
    await pool.query(
      'INSERT INTO Call_Record (SIM_ID, Call_ID, Call_Date, Call_Time, Call_Duration, Call_Type) VALUES (?, ?, ?, ?, ?, ?)',
      [SIM_ID, newCallId, Call_Date, Call_Time, Call_Duration, Call_Type]
    );
    res.status(201).json({ SIM_ID, Call_ID: newCallId, ...req.body });
  } catch (err) {
    console.error('POST /callrecords error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT update call record
router.put('/:simId/:callId', async (req, res) => {
  try {
    const { Call_Date, Call_Time, Call_Duration, Call_Type } = req.body;
    const [result] = await pool.query(
      'UPDATE Call_Record SET Call_Date = ?, Call_Time = ?, Call_Duration = ?, Call_Type = ? WHERE SIM_ID = ? AND Call_ID = ?',
      [Call_Date, Call_Time, Call_Duration, Call_Type, req.params.simId, req.params.callId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Call record not found' });
    res.json({ message: 'Call record updated successfully' });
  } catch (err) {
    console.error('PUT /callrecords/:simId/:callId error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE call record
router.delete('/:simId/:callId', async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM Call_Record WHERE SIM_ID = ? AND Call_ID = ?',
      [req.params.simId, req.params.callId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Call record not found' });
    res.json({ message: 'Call record deleted successfully' });
  } catch (err) {
    console.error('DELETE /callrecords/:simId/:callId error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
