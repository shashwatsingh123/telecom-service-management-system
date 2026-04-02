-- ============================================================
-- Telecommunication Service Management System
-- Database Schema + Sample Data
-- ============================================================

CREATE DATABASE IF NOT EXISTS telecom_db;
USE telecom_db;

-- ============================================================
-- 1. Customer (Strong Entity)
--    Age is a DERIVED attribute — NOT stored as a column.
--    Computed via: TIMESTAMPDIFF(YEAR, Date_of_Birth, CURDATE())
-- ============================================================
CREATE TABLE Customer (
    Customer_ID   INT AUTO_INCREMENT PRIMARY KEY,
    Name          VARCHAR(100)  NOT NULL,
    Aadhaar_Number VARCHAR(12)  NOT NULL UNIQUE,
    Phone         VARCHAR(15)   NOT NULL,
    Date_of_Birth DATE          NOT NULL
);

-- ============================================================
-- 2. Plan (Strong Entity)
-- ============================================================
CREATE TABLE Plan (
    Plan_ID       INT AUTO_INCREMENT PRIMARY KEY,
    Plan_Name     VARCHAR(100)  NOT NULL,
    Plan_Type     ENUM('Prepaid', 'Postpaid') NOT NULL,
    Cost          DECIMAL(10,2) NOT NULL,
    Data_Limit    VARCHAR(50)   NOT NULL,
    Validity_Days INT           NOT NULL
);

-- ============================================================
-- 3. SIM_Card (Strong Entity)
--    FK Customer_ID → ON DELETE CASCADE
--    FK Plan_ID     → ON DELETE RESTRICT
-- ============================================================
CREATE TABLE SIM_Card (
    SIM_ID          INT AUTO_INCREMENT PRIMARY KEY,
    Mobile_Number   VARCHAR(15)  NOT NULL UNIQUE,
    Activation_Date DATE         NOT NULL,
    Status          ENUM('Active', 'Inactive', 'Blocked') NOT NULL DEFAULT 'Active',
    Customer_ID     INT          NOT NULL,
    Plan_ID         INT          NOT NULL,
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID) ON DELETE CASCADE,
    FOREIGN KEY (Plan_ID)     REFERENCES Plan(Plan_ID)         ON DELETE RESTRICT
);

-- ============================================================
-- 4. Bill (Strong Entity)
--    FK SIM_ID → ON DELETE CASCADE
-- ============================================================
CREATE TABLE Bill (
    Bill_ID      INT AUTO_INCREMENT PRIMARY KEY,
    Bill_Date    DATE          NOT NULL,
    Due_Date     DATE          NOT NULL,
    Total_Amount DECIMAL(10,2) NOT NULL,
    SIM_ID       INT           NOT NULL,
    FOREIGN KEY (SIM_ID) REFERENCES SIM_Card(SIM_ID) ON DELETE CASCADE
);

-- ============================================================
-- 5. Payment (Strong Entity)
--    FK Bill_ID → ON DELETE CASCADE
-- ============================================================
CREATE TABLE Payment (
    Payment_ID   INT AUTO_INCREMENT PRIMARY KEY,
    Payment_Date DATE          NOT NULL,
    Amount       DECIMAL(10,2) NOT NULL,
    Payment_Mode ENUM('Cash', 'Card', 'UPI', 'Net Banking') NOT NULL,
    Bill_ID      INT           NOT NULL,
    FOREIGN KEY (Bill_ID) REFERENCES Bill(Bill_ID) ON DELETE CASCADE
);

-- ============================================================
-- 6. Call_Record (Weak Entity)
--    Composite PK: (SIM_ID, Call_ID)
--    FK SIM_ID → ON DELETE CASCADE
-- ============================================================
CREATE TABLE Call_Record (
    SIM_ID        INT  NOT NULL,
    Call_ID       INT  NOT NULL,
    Call_Date     DATE NOT NULL,
    Call_Time     TIME NOT NULL,
    Call_Duration INT  NOT NULL COMMENT 'Duration in seconds',
    Call_Type     ENUM('Incoming', 'Outgoing', 'Missed') NOT NULL,
    PRIMARY KEY (SIM_ID, Call_ID),
    FOREIGN KEY (SIM_ID) REFERENCES SIM_Card(SIM_ID) ON DELETE CASCADE
);

-- ============================================================
-- 7. Complaint (Weak Entity)
--    Composite PK: (Customer_ID, Complaint_No)
--    FK Customer_ID → ON DELETE CASCADE
-- ============================================================
CREATE TABLE Complaint (
    Customer_ID    INT  NOT NULL,
    Complaint_No   INT  NOT NULL,
    Complaint_Date DATE NOT NULL,
    Description    TEXT NOT NULL,
    Status         ENUM('Open', 'In Progress', 'Resolved', 'Closed') NOT NULL DEFAULT 'Open',
    PRIMARY KEY (Customer_ID, Complaint_No),
    FOREIGN KEY (Customer_ID) REFERENCES Customer(Customer_ID) ON DELETE CASCADE
);


-- ============================================================
-- SAMPLE DATA
-- ============================================================

-- Customers
INSERT INTO Customer (Name, Aadhaar_Number, Phone, Date_of_Birth) VALUES
('Aarav Sharma',    '123456789012', '9876543210', '1995-06-15'),
('Priya Patel',     '234567890123', '9876543211', '1998-03-22'),
('Rahul Verma',     '345678901234', '9876543212', '1990-11-08'),
('Sneha Iyer',      '456789012345', '9876543213', '2000-01-30'),
('Vikram Singh',    '567890123456', '9876543214', '1988-07-12'),
('Ananya Gupta',    '678901234567', '9876543215', '1997-09-25'),
('Rohan Deshmukh',  '789012345678', '9876543216', '1993-04-18'),
('Meera Nair',      '890123456789', '9876543217', '2001-12-05');

-- Plans
INSERT INTO Plan (Plan_Name, Plan_Type, Cost, Data_Limit, Validity_Days) VALUES
('Basic Prepaid',       'Prepaid',   199.00,  '1.5 GB/day',  28),
('Super Saver',         'Prepaid',   399.00,  '2 GB/day',    56),
('Unlimited Prepaid',   'Prepaid',   599.00,  '3 GB/day',    84),
('Postpaid Starter',    'Postpaid',  499.00,  '40 GB',       30),
('Postpaid Premium',    'Postpaid',  799.00,  '75 GB',       30),
('Postpaid Ultra',      'Postpaid', 1199.00,  'Unlimited',   30),
('Data Booster',        'Prepaid',    98.00,  '6 GB',        28),
('International Pack',  'Postpaid', 1999.00,  '10 GB',       30);

-- SIM Cards
INSERT INTO SIM_Card (Mobile_Number, Activation_Date, Status, Customer_ID, Plan_ID) VALUES
('9001000001', '2024-01-10', 'Active',   1, 1),
('9001000002', '2024-02-15', 'Active',   1, 4),
('9001000003', '2024-03-20', 'Active',   2, 2),
('9001000004', '2024-04-05', 'Inactive', 3, 3),
('9001000005', '2024-05-12', 'Active',   4, 5),
('9001000006', '2024-06-01', 'Blocked',  5, 6),
('9001000007', '2024-07-18', 'Active',   6, 1),
('9001000008', '2024-08-25', 'Active',   7, 4),
('9001000009', '2024-09-30', 'Active',   8, 2),
('9001000010', '2024-10-15', 'Active',   3, 5);

-- Bills
INSERT INTO Bill (Bill_Date, Due_Date, Total_Amount, SIM_ID) VALUES
('2025-01-01', '2025-01-15', 199.00,  1),
('2025-01-01', '2025-01-15', 499.00,  2),
('2025-01-01', '2025-01-15', 399.00,  3),
('2025-02-01', '2025-02-15', 599.00,  4),
('2025-02-01', '2025-02-15', 799.00,  5),
('2025-02-01', '2025-02-15', 1199.00, 6),
('2025-03-01', '2025-03-15', 199.00,  7),
('2025-03-01', '2025-03-15', 499.00,  8),
('2025-03-01', '2025-03-15', 399.00,  9),
('2025-04-01', '2025-04-15', 799.00, 10);

-- Payments
INSERT INTO Payment (Payment_Date, Amount, Payment_Mode, Bill_ID) VALUES
('2025-01-10', 199.00,  'UPI',         1),
('2025-01-12', 499.00,  'Card',        2),
('2025-01-14', 399.00,  'Net Banking', 3),
('2025-02-10', 599.00,  'UPI',         4),
('2025-02-12', 799.00,  'Cash',        5),
('2025-02-14', 1199.00, 'Card',        6),
('2025-03-10', 199.00,  'UPI',         7),
('2025-03-12', 499.00,  'Net Banking', 8);

-- Call Records (Weak entity — composite PK: SIM_ID, Call_ID)
INSERT INTO Call_Record (SIM_ID, Call_ID, Call_Date, Call_Time, Call_Duration, Call_Type) VALUES
(1, 1, '2025-03-01', '09:15:00', 120, 'Outgoing'),
(1, 2, '2025-03-01', '11:30:00',  45, 'Incoming'),
(1, 3, '2025-03-02', '14:00:00',   0, 'Missed'),
(2, 1, '2025-03-01', '10:00:00', 300, 'Outgoing'),
(2, 2, '2025-03-03', '16:45:00',  90, 'Incoming'),
(3, 1, '2025-03-02', '08:20:00', 180, 'Outgoing'),
(3, 2, '2025-03-02', '12:10:00',  60, 'Incoming'),
(5, 1, '2025-03-03', '09:00:00', 240, 'Outgoing'),
(5, 2, '2025-03-04', '15:30:00',   0, 'Missed'),
(7, 1, '2025-03-05', '10:45:00', 150, 'Incoming'),
(8, 1, '2025-03-05', '11:00:00', 200, 'Outgoing'),
(9, 1, '2025-03-06', '13:30:00',  75, 'Incoming');

-- Complaints (Weak entity — composite PK: Customer_ID, Complaint_No)
INSERT INTO Complaint (Customer_ID, Complaint_No, Complaint_Date, Description, Status) VALUES
(1, 1, '2025-02-10', 'Network connectivity issues in Sector 15',          'Resolved'),
(1, 2, '2025-03-05', 'Incorrect billing amount for February',             'Open'),
(2, 1, '2025-02-20', 'SIM card not activating after port-in',             'In Progress'),
(3, 1, '2025-01-15', 'Call drops during peak hours',                       'Closed'),
(4, 1, '2025-03-01', 'Data speed throttling below plan limits',           'Open'),
(5, 1, '2025-02-28', 'Unable to make international calls',                'In Progress'),
(6, 1, '2025-03-10', 'Spam calls from unknown numbers',                   'Open'),
(7, 1, '2025-03-12', 'Plan auto-renewal without consent',                 'Open'),
(8, 1, '2025-03-15', 'Poor signal strength in basement area',             'In Progress');
