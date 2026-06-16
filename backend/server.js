const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes
const customerRoutes  = require('./routes/customers');
const planRoutes      = require('./routes/plans');
const simcardRoutes   = require('./routes/simcards');
const billRoutes      = require('./routes/bills');
const paymentRoutes   = require('./routes/payments');
const callRecordRoutes = require('./routes/callrecords');
const complaintRoutes = require('./routes/complaints');
const authSqliteRoutes = require('./routes/authSqlite');
const customerPortalRoutes = require('./routes/customerPortal');
const { initSqlite } = require('./sqliteDb');

// Use Routes
app.use('/api/customers',   customerRoutes);
app.use('/api/plans',       planRoutes);
app.use('/api/simcards',    simcardRoutes);
app.use('/api/bills',       billRoutes);
app.use('/api/payments',    paymentRoutes);
app.use('/api/callrecords', callRecordRoutes);
app.use('/api/complaints',  complaintRoutes);
app.use('/api/auth', authSqliteRoutes);
app.use('/api/customer-portal', customerPortalRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Telecom API is running' });
});

// Dashboard stats endpoint
app.get('/api/dashboard', async (req, res) => {
  const pool = require('./db');
  try {
    const [customers]  = await pool.query('SELECT COUNT(*) AS count FROM Customer');
    const [activeSims] = await pool.query("SELECT COUNT(*) AS count FROM SIM_Card WHERE Status = 'Active'");
    const [totalBills] = await pool.query('SELECT COUNT(*) AS count FROM Bill');
    const [paidBills]  = await pool.query('SELECT COUNT(DISTINCT b.Bill_ID) AS count FROM Bill b INNER JOIN Payment p ON b.Bill_ID = p.Bill_ID');
    const [openComplaints] = await pool.query("SELECT COUNT(*) AS count FROM Complaint WHERE Status IN ('Open', 'In Progress')");
    const [totalRevenue]   = await pool.query('SELECT COALESCE(SUM(Amount), 0) AS total FROM Payment');

    res.json({
      totalCustomers: customers[0].count,
      activeSims: activeSims[0].count,
      totalBills: totalBills[0].count,
      paidBills: paidBills[0].count,
      pendingBills: totalBills[0].count - paidBills[0].count,
      openComplaints: openComplaints[0].count,
      totalRevenue: totalRevenue[0].total
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;

initSqlite()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize SQLite database:', err);
    process.exit(1);
  });
