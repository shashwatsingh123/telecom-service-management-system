const express = require('express');
const router = express.Router();
const { get } = require('../sqliteDb');

router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await get(
      'SELECT id, username FROM admin_user WHERE username = ? AND password = ?',
      [username, password]
    );

    if (!admin) return res.status(401).json({ error: 'Invalid admin credentials' });

    res.json({ role: 'admin', username: admin.username });
  } catch (err) {
    console.error('POST /auth/admin-login error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/customer-login', async (req, res) => {
  try {
    const { aadhaarNumber, phone } = req.body;
    if (!aadhaarNumber || !phone) {
      return res.status(400).json({ error: 'Aadhaar number and phone are required' });
    }

    const customer = await get(
      `SELECT Customer_ID, Name, Aadhaar_Number, Phone
       FROM customer_portal
       WHERE Aadhaar_Number = ? AND Phone = ?`,
      [aadhaarNumber, phone]
    );

    if (!customer) return res.status(401).json({ error: 'Invalid customer credentials' });

    res.json({
      role: 'customer',
      customerId: customer.Customer_ID,
      name: customer.Name
    });
  } catch (err) {
    console.error('POST /auth/customer-login error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
