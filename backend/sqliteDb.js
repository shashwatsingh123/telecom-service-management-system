const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'telecom_portal.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

async function ensureColumn(tableName, columnName, columnDef) {
  const allowedTables = ['customer_portal'];
  if (!allowedTables.includes(tableName)) {
    throw new Error('Invalid table name for schema update');
  }

  const columns = await all(`PRAGMA table_info(${tableName})`);
  const exists = columns.some((c) => c.name === columnName);
  if (!exists) {
    await run(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${columnDef}`);
  }
}

async function initSqlite() {
  await run(`CREATE TABLE IF NOT EXISTS admin_user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS customer_portal (
    Customer_ID INTEGER PRIMARY KEY,
    Name TEXT NOT NULL,
    Aadhaar_Number TEXT NOT NULL UNIQUE,
    Phone TEXT NOT NULL,
    Password TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS plan_portal (
    Plan_ID INTEGER PRIMARY KEY,
    Plan_Name TEXT NOT NULL,
    Plan_Type TEXT NOT NULL,
    Cost REAL NOT NULL,
    Data_Limit TEXT NOT NULL,
    Validity_Days INTEGER NOT NULL
  )`);

  await run(`CREATE TABLE IF NOT EXISTS sim_card_portal (
    SIM_ID INTEGER PRIMARY KEY,
    Mobile_Number TEXT NOT NULL UNIQUE,
    Status TEXT NOT NULL,
    Customer_ID INTEGER NOT NULL,
    Plan_ID INTEGER NOT NULL,
    FOREIGN KEY (Customer_ID) REFERENCES customer_portal(Customer_ID),
    FOREIGN KEY (Plan_ID) REFERENCES plan_portal(Plan_ID)
  )`);

  await run(`CREATE TABLE IF NOT EXISTS recharge_portal (
    Recharge_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    SIM_ID INTEGER NOT NULL,
    Customer_ID INTEGER NOT NULL,
    Recharge_Date TEXT NOT NULL,
    Amount REAL NOT NULL,
    Payment_Mode TEXT NOT NULL,
    FOREIGN KEY (SIM_ID) REFERENCES sim_card_portal(SIM_ID),
    FOREIGN KEY (Customer_ID) REFERENCES customer_portal(Customer_ID)
  )`);

  await ensureColumn('customer_portal', 'Password', 'TEXT');

  const adminCount = await get('SELECT COUNT(*) AS count FROM admin_user');
  if (!adminCount || adminCount.count === 0) {
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new Error('ADMIN_PASSWORD is required to initialize admin login securely');
    }

    const adminPasswordHash = await bcrypt.hash(adminPassword, 10);
    await run('INSERT INTO admin_user (username, password) VALUES (?, ?)', [adminUsername, adminPasswordHash]);
  }

  const customerCount = await get('SELECT COUNT(*) AS count FROM customer_portal');
  if (!customerCount || customerCount.count === 0) {
    const customerSeed = [
      { id: 1, name: 'Aarav Sharma', aadhaar: '123456789012', phone: '9876543210', password: 'cust@123' },
      { id: 2, name: 'Priya Patel', aadhaar: '234567890123', phone: '9876543211', password: 'cust@234' },
      { id: 3, name: 'Rahul Verma', aadhaar: '345678901234', phone: '9876543212', password: 'cust@345' }
    ];

    for (const c of customerSeed) {
      const hash = await bcrypt.hash(c.password, 10);
      await run(
        'INSERT INTO customer_portal (Customer_ID, Name, Aadhaar_Number, Phone, Password) VALUES (?, ?, ?, ?, ?)',
        [c.id, c.name, c.aadhaar, c.phone, hash]
      );
    }

    await run(`INSERT INTO plan_portal (Plan_ID, Plan_Name, Plan_Type, Cost, Data_Limit, Validity_Days) VALUES
      (1, 'Basic Prepaid', 'Prepaid', 199.00, '1.5 GB/day', 28),
      (2, 'Super Saver', 'Prepaid', 399.00, '2 GB/day', 56),
      (4, 'Postpaid Starter', 'Postpaid', 499.00, '40 GB', 30)`);

    await run(`INSERT INTO sim_card_portal (SIM_ID, Mobile_Number, Status, Customer_ID, Plan_ID) VALUES
      (1, '9001000001', 'Active', 1, 1),
      (2, '9001000002', 'Active', 1, 4),
      (3, '9001000003', 'Active', 2, 2),
      (10, '9001000010', 'Active', 3, 4)`);
  }

  const rowsNeedingPassword = await all(
    'SELECT Customer_ID, Aadhaar_Number FROM customer_portal WHERE Password IS NULL OR Password = ""'
  );

  for (const row of rowsNeedingPassword) {
    const fallbackPassword = `cust@${String(row.Aadhaar_Number).slice(-4)}`;
    const hash = await bcrypt.hash(fallbackPassword, 10);
    await run('UPDATE customer_portal SET Password = ? WHERE Customer_ID = ?', [hash, row.Customer_ID]);
  }
}

module.exports = {
  db,
  run,
  get,
  all,
  initSqlite
};
