const express = require('express');
const router = express.Router();
const { get } = require('../sqliteDb');
const bcrypt = require('bcryptjs');

router.post('/admin-login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const admin = await get('SELECT id, username, password FROM admin_user WHERE username = ?', [username]);

    if (!admin) return res.status(401).json({ error: 'Invalid admin credentials' });

    const passwordValid = await bcrypt.compare(password, admin.password);
    if (!passwordValid) return res.status(401).json({ error: 'Invalid admin credentials' });

    res.json({ role: 'admin', username: admin.username });
  } catch (err) {
    console.error('POST /auth/admin-login error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/customer-login', async (req, res) => {
  try {
    const { aadhaarNumber, password } = req.body;
    if (!aadhaarNumber || !password) {
      return res.status(400).json({ error: 'Aadhaar number and password are required' });
    }

    const customer = await get(
      `SELECT Customer_ID, Name, Aadhaar_Number, Phone, Password
       FROM customer_portal
       WHERE Aadhaar_Number = ?`,
      [aadhaarNumber]
    );

    if (!customer || !customer.Password) {
      return res.status(401).json({ error: 'Invalid customer credentials' });
    }

    const passwordValid = await bcrypt.compare(password, customer.Password);
    if (!passwordValid) return res.status(401).json({ error: 'Invalid customer credentials' });

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
