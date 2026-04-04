const express = require('express');
const router = express.Router();
const { get, all, run } = require('../sqliteDb');

router.get('/profile/:customerId', async (req, res) => {
  try {
    const customerId = Number(req.params.customerId);

    const customer = await get(
      'SELECT Customer_ID, Name, Aadhaar_Number, Phone FROM customer_portal WHERE Customer_ID = ?',
      [customerId]
    );

    if (!customer) return res.status(404).json({ error: 'Customer not found' });

    const sims = await all(
      `SELECT s.SIM_ID, s.Mobile_Number, s.Status,
              p.Plan_Name, p.Plan_Type, p.Cost, p.Data_Limit, p.Validity_Days
       FROM sim_card_portal s
       JOIN plan_portal p ON s.Plan_ID = p.Plan_ID
       WHERE s.Customer_ID = ?
       ORDER BY s.SIM_ID`,
      [customerId]
    );

    const recentRecharges = await all(
      `SELECT Recharge_ID, SIM_ID, Recharge_Date, Amount, Payment_Mode
       FROM recharge_portal
       WHERE Customer_ID = ?
       ORDER BY Recharge_ID DESC
       LIMIT 10`,
      [customerId]
    );

    res.json({ customer, sims, recentRecharges });
  } catch (err) {
    console.error('GET /customer-portal/profile/:customerId error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/recharge', async (req, res) => {
  try {
    const { customerId, simId, amount, paymentMode } = req.body;

    if (!customerId || !simId || !amount || !paymentMode) {
      return res.status(400).json({ error: 'customerId, simId, amount and paymentMode are required' });
    }

    const normalizedAmount = Number(amount);
    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const allowedModes = ['Cash', 'Card', 'UPI', 'Net Banking'];
    if (!allowedModes.includes(paymentMode)) {
      return res.status(400).json({ error: 'Invalid payment mode' });
    }

    const sim = await get(
      'SELECT SIM_ID FROM sim_card_portal WHERE SIM_ID = ? AND Customer_ID = ?',
      [simId, customerId]
    );

    if (!sim) {
      return res.status(404).json({ error: 'SIM not found for this customer' });
    }

    await run('BEGIN');
    let committed = false;

    try {
      const result = await run(
        'INSERT INTO recharge_portal (SIM_ID, Customer_ID, Recharge_Date, Amount, Payment_Mode) VALUES (?, ?, datetime("now"), ?, ?)',
        [simId, customerId, normalizedAmount, paymentMode]
      );
      await run('COMMIT');
      committed = true;

      res.status(201).json({
        message: 'Recharge successful',
        rechargeId: result.lastID
      });
    } finally {
      if (!committed) {
        try {
          await run('ROLLBACK');
        } catch (rollbackErr) {
          console.error('ROLLBACK failed:', rollbackErr);
        }
      }
    }
  } catch (err) {
    console.error('POST /customer-portal/recharge error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
