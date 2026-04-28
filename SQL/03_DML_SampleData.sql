-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 3: DML — SAMPLE DATA INSERTION
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- RUN AFTER: FILE0_DDL_CreateTables.sql, FILE1_Triggers.sql, FILE2_Views.sql
-- ============================================================
-- NOTE: DDL (FILE0) already inserts:
--   user_id 1 → Sohaib Akhlaq   (Administrator,      role_id=1)
--   user_id 2 → Operator User   (Emergency Operator, role_id=2)
-- This file adds users 3-5 and all remaining data.
-- ============================================================

USE DisasterResponseMIS;
GO

-- ============================================================
-- ADDITIONAL USERS (role_id 3=Field Officer, 4=Warehouse, 5=Finance)
-- ============================================================
INSERT INTO Users (name, email, password_hash, phone, role_id, is_active) VALUES
('Hamza Khan',
 'fieldofficer@mis.pk',
 CONVERT(VARCHAR(256), HASHBYTES('SHA2_256', 'field123'), 2),
 '03211234567', 3, 1),

('Ayesha Siddiqui',
 'warehouse@mis.pk',
 CONVERT(VARCHAR(256), HASHBYTES('SHA2_256', 'wh123'), 2),
 '03321234567', 4, 1),

('Bilal Farooq',
 'finance@mis.pk',
 CONVERT(VARCHAR(256), HASHBYTES('SHA2_256', 'fin123'), 2),
 '03431234567', 5, 1);
GO
-- Expected: 3 rows inserted → total Users = 5

-- ============================================================
-- PERMISSIONS (RBAC matrix — one row per role per module)
-- ============================================================
INSERT INTO Permissions (role_id, module_name, can_read, can_write, can_delete) VALUES
-- Administrator (role_id=1) — full CRUD on all modules
(1, 'EmergencyReports',    1, 1, 1),
(1, 'RescueTeams',         1, 1, 1),
(1, 'TeamAssignments',     1, 1, 1),
(1, 'Warehouses',          1, 1, 1),
(1, 'WarehouseInventory',  1, 1, 1),
(1, 'ResourceAllocations', 1, 1, 1),
(1, 'Hospitals',           1, 1, 1),
(1, 'Patients',            1, 1, 1),
(1, 'Citizens',            1, 1, 1),
(1, 'Donations',           1, 1, 1),
(1, 'Expenses',            1, 1, 1),
(1, 'ApprovalRequests',    1, 1, 1),
(1, 'AuditLogs',           1, 0, 0),  -- read-only for audit logs
(1, 'Users',               1, 1, 1),
-- Emergency Operator (role_id=2)
(2, 'EmergencyReports',    1, 1, 0),
(2, 'RescueTeams',         1, 1, 0),
(2, 'TeamAssignments',     1, 1, 0),
(2, 'Hospitals',           1, 0, 0),
(2, 'Patients',            1, 1, 0),
(2, 'Citizens',            1, 1, 0),
-- Field Officer (role_id=3)
(3, 'EmergencyReports',    1, 0, 0),
(3, 'TeamAssignments',     1, 1, 0),
-- Warehouse Manager (role_id=4)
(4, 'Warehouses',          1, 0, 0),
(4, 'WarehouseInventory',  1, 1, 0),
(4, 'ResourceAllocations', 1, 1, 0),
(4, 'ApprovalRequests',    1, 1, 0),
-- Finance Officer (role_id=5)
(5, 'Donations',           1, 1, 0),
(5, 'Expenses',            1, 1, 0),
(5, 'ApprovalRequests',    1, 0, 0);
GO
-- Expected: 29 rows inserted

-- ============================================================
-- CITIZENS (10 citizens across Pakistan)
-- ============================================================
INSERT INTO Citizens (name, phone, address, email) VALUES
('Ali Hassan',      '03001234567', 'Street 5, Lyari, Karachi',        'ali.hassan@gmail.com'),
('Fatima Noor',     '03112345678', 'Block C, Model Town, Lahore',      'fatima.noor@yahoo.com'),
('Usman Tariq',     '03221234567', 'Sector G-9, Islamabad',            'usman.tariq@hotmail.com'),
('Zainab Malik',    '03331234567', 'Peshawar Road, Rawalpindi',        'zainab.malik@gmail.com'),
('Bilal Chaudhry',  '03441234567', 'University Town, Peshawar',        'bilal.ch@gmail.com'),
('Sara Ahmed',      '03551234567', 'Cantt Area, Quetta',               'sara.ahmed@outlook.com'),
('Noman Riaz',      '03001112222', 'Gulgasht Colony, Multan',          'noman.riaz@gmail.com'),
('Iqra Siddiqui',   '03121234567', 'Gulshan-e-Iqbal, Karachi',        'iqra.siddiqui@gmail.com'),
('Asad Raza',       '03231234567', 'DHA Phase 2, Lahore',              'asad.raza@yahoo.com'),
('Nadia Shah',      '03341234567', 'Blue Area, Islamabad',             'nadia.shah@gmail.com');
GO
-- Expected: 10 rows inserted

-- ============================================================
-- RESCUE TEAMS (8 teams — all start 'Available')
-- Triggers will change status automatically on assignments
-- ============================================================
INSERT INTO RescueTeams (team_name, team_type, current_location, status, equipment) VALUES
('Alpha Medical Unit',   'Medical', 'Karachi Central',       'Available', 'Stretchers, Defibrillators, First Aid Kits'),
('Bravo Fire Squad',     'Fire',    'Lahore Cantt',          'Available', 'Fire Hoses, Breathing Apparatus, Ladders'),
('Charlie Rescue Alpha', 'Rescue',  'Islamabad Sector G-9',  'Available', 'Ropes, Harnesses, Cutting Tools'),
('Delta Flood Response', 'Rescue',  'Multan City Center',    'Available', 'Rubber Boats, Life Jackets, Pumps'),
('Echo Medical Team',    'Medical', 'Peshawar Ring Road',    'Available', 'Ambulances, IV Kits, Oxygen Cylinders'),
('Foxtrot Fire Unit',    'Fire',    'Quetta North Zone',     'Available', 'Fire Extinguishers, Thermal Cameras'),
('Golf Search Rescue',   'Rescue',  'Rawalpindi Saddar',     'Available', 'Search Dogs, Thermal Drones, Excavators'),
('Hotel Emergency Med',  'Medical', 'Faisalabad Central',   'Available', 'Mobile ICU, Blood Bank Supplies');
GO
-- Expected: 8 rows inserted

-- ============================================================
-- WAREHOUSES (6 warehouses — one per major city)
-- ============================================================
INSERT INTO Warehouses (name, location, phone) VALUES
('Karachi Central Warehouse', 'Karachi, Sindh',      '02112345678'),
('Lahore Supply Depot',       'Lahore, Punjab',       '04212345678'),
('Islamabad Federal Store',   'Islamabad, ICT',       '05112345678'),
('Peshawar Relief Hub',       'Peshawar, KPK',        '09112345678'),
('Quetta Emergency Depot',    'Quetta, Balochistan',  '08112345678'),
('Multan Regional Warehouse', 'Multan, Punjab',       '06112345678');
GO
-- Expected: 6 rows inserted

-- ============================================================
-- RESOURCES (10 resource types across categories)
-- ============================================================
INSERT INTO Resources (resource_name, category, unit) VALUES
('Water Bottles (1L)',   'Food & Water',    'carton'),   -- resource_id=1
('Rice Bags (10kg)',     'Food & Water',    'bag'),      -- resource_id=2
('Blankets',            'Shelter',         'piece'),     -- resource_id=3
('Tents (4-person)',    'Shelter',         'unit'),      -- resource_id=4
('First Aid Kit',       'Medical',         'kit'),       -- resource_id=5
('Paracetamol Tablets', 'Medical',         'box'),       -- resource_id=6
('ORS Sachets',         'Medical',         'packet'),    -- resource_id=7
('Torch/Flashlight',    'Equipment',       'piece'),     -- resource_id=8
('Generator (5kW)',     'Equipment',       'unit'),      -- resource_id=9
('Chlorine Tablets',    'Water Treatment', 'bottle');    -- resource_id=10
GO
-- Expected: 10 rows inserted

-- ============================================================
-- HOSPITALS (6 hospitals — one per major city)
-- ============================================================
INSERT INTO Hospitals (name, location, total_beds, specialty) VALUES
('Karachi Civil Hospital',   'Karachi, Sindh',      500, 'General, Trauma, Burns'),
('Services Hospital Lahore', 'Lahore, Punjab',       400, 'General, Orthopedics, Neurology'),
('PIMS Hospital',            'Islamabad, ICT',       350, 'General, Cardiology, Emergency'),
('Lady Reading Hospital',    'Peshawar, KPK',        450, 'General, Pediatrics, Surgery'),
('Bolan Medical Complex',    'Quetta, Balochistan',  250, 'General, Emergency, Trauma'),
('Nishtar Hospital',         'Multan, Punjab',       380, 'General, Nephrology, Cardiology');
GO
-- Expected: 6 rows inserted

-- ============================================================
-- WAREHOUSE INVENTORY (30 rows — resources spread across warehouses)
-- ID mapping (IDENTITY order):
--   Karachi (wh=1):    inv_id  1- 5  → resources 1,2,3,4,5
--   Lahore  (wh=2):    inv_id  6-10  → resources 1,2,3,6,7
--   Islamabad (wh=3):  inv_id 11-15  → resources 1,4,5,8,9
--   Peshawar (wh=4):   inv_id 16-20  → resources 2,3,5,6,10
--   Quetta  (wh=5):    inv_id 21-25  → resources 1,2,3,7,9
--   Multan  (wh=6):    inv_id 26-30  → resources 1,2,4,8,10
-- ============================================================
INSERT INTO WarehouseInventory (warehouse_id, resource_id, quantity, min_threshold) VALUES
-- Karachi Warehouse (warehouse_id=1)
(1, 1,  500, 50),   -- inv_id=1  Water Bottles
(1, 2,  200, 30),   -- inv_id=2  Rice Bags
(1, 3,  300, 40),   -- inv_id=3  Blankets
(1, 4,   50, 10),   -- inv_id=4  Tents
(1, 5,  150, 20),   -- inv_id=5  First Aid Kits
-- Lahore Warehouse (warehouse_id=2)
(2, 1,  400, 50),   -- inv_id=6  Water Bottles
(2, 2,  180, 30),   -- inv_id=7  Rice Bags
(2, 3,  250, 40),   -- inv_id=8  Blankets
(2, 6,  500, 60),   -- inv_id=9  Paracetamol Tablets
(2, 7,  300, 40),   -- inv_id=10 ORS Sachets
-- Islamabad Warehouse (warehouse_id=3)
(3, 1,  350, 50),   -- inv_id=11 Water Bottles
(3, 4,   35, 10),   -- inv_id=12 Tents (35 units — important for Transaction 4)
(3, 5,  100, 20),   -- inv_id=13 First Aid Kits
(3, 8,  200, 25),   -- inv_id=14 Torch/Flashlight
(3, 9,   15,  5),   -- inv_id=15 Generators
-- Peshawar Warehouse (warehouse_id=4)
(4, 2,  120, 30),   -- inv_id=16 Rice Bags
(4, 3,  180, 40),   -- inv_id=17 Blankets
(4, 5,   80, 20),   -- inv_id=18 First Aid Kits (80 units — used in allocation)
(4, 6,  400, 60),   -- inv_id=19 Paracetamol Tablets
(4, 10, 250, 30),   -- inv_id=20 Chlorine Tablets
-- Quetta Warehouse (warehouse_id=5)
(5, 1,  200, 50),   -- inv_id=21 Water Bottles
(5, 2,   90, 30),   -- inv_id=22 Rice Bags
(5, 3,  120, 40),   -- inv_id=23 Blankets
(5, 7,  200, 40),   -- inv_id=24 ORS Sachets (200 units — used in allocation)
(5, 9,    8,  5),   -- inv_id=25 Generators (8 < threshold=5 is OK; threshold is 5)
-- Multan Warehouse (warehouse_id=6)
(6, 1,  300, 50),   -- inv_id=26 Water Bottles
(6, 2,  150, 30),   -- inv_id=27 Rice Bags
(6, 4,   30, 10),   -- inv_id=28 Tents
(6, 8,  150, 25),   -- inv_id=29 Torch/Flashlight
(6, 10, 180, 30);   -- inv_id=30 Chlorine Tablets
GO
-- Expected: 30 rows inserted

-- ============================================================
-- EMERGENCY REPORTS (30 reports across cities and disaster types)
-- Allowed severity: 'Low' | 'Medium' | 'High'
-- Allowed status:   'Pending' | 'Dispatched' | 'Resolved' | 'Cancelled'
-- ============================================================
INSERT INTO EmergencyReports
    (citizen_id, location, disaster_type, severity, report_time, status)
VALUES
(1,  'Karachi, Lyari',            'Flood',         'High',   '2024-07-15 06:30:00', 'Dispatched'),  -- report_id=1
(2,  'Lahore, Ravi River',        'Flood',         'High',   '2024-07-15 08:15:00', 'Pending'),     -- report_id=2
(3,  'Islamabad, Margalla',       'Earthquake',    'Medium', '2024-07-16 03:45:00', 'Resolved'),    -- report_id=3
(4,  'Rawalpindi, Raja Bazar',    'Urban Fire',    'High',   '2024-07-16 14:20:00', 'Dispatched'),  -- report_id=4
(5,  'Peshawar, Hayatabad',       'Flood',         'Medium', '2024-07-17 09:00:00', 'Pending'),     -- report_id=5
(6,  'Quetta, Hazara Town',       'Earthquake',    'High',   '2024-07-17 21:10:00', 'Dispatched'),  -- report_id=6
(7,  'Multan, Gulgasht Colony',   'Urban Fire',    'Low',    '2024-07-18 11:30:00', 'Resolved'),    -- report_id=7
(8,  'Karachi, SITE Area',        'Urban Fire',    'High',   '2024-07-18 16:45:00', 'Pending'),     -- report_id=8
(9,  'Lahore, DHA Phase 5',       'Urban Fire',    'Medium', '2024-07-19 10:00:00', 'Dispatched'),  -- report_id=9
(10, 'Islamabad, G-11',           'Flood',         'High',   '2024-07-19 22:30:00', 'Pending'),     -- report_id=10
(1,  'Karachi, Orangi Town',      'Flood',         'High',   '2024-08-01 05:20:00', 'Dispatched'),  -- report_id=11
(2,  'Lahore, Shahdara',          'Flood',         'Medium', '2024-08-01 07:45:00', 'Resolved'),    -- report_id=12
(3,  'Islamabad, I-8',            'Gas Explosion', 'High',   '2024-08-02 13:15:00', 'Pending'),     -- report_id=13
(4,  'Rawalpindi, Saddar',        'Flood',         'Low',    '2024-08-02 18:30:00', 'Resolved'),    -- report_id=14
(5,  'Peshawar, Old City',        'Urban Fire',    'Medium', '2024-08-03 11:00:00', 'Dispatched'),  -- report_id=15
(6,  'Quetta, Satellite Town',    'Earthquake',    'Medium', '2024-08-03 04:55:00', 'Pending'),     -- report_id=16
(7,  'Multan, Shah Rukn-e-Alam',  'Flood',         'High',   '2024-08-04 08:20:00', 'Dispatched'),  -- report_id=17
(8,  'Karachi, Korangi',          'Urban Fire',    'Medium', '2024-08-04 15:10:00', 'Resolved'),    -- report_id=18
(9,  'Lahore, Gulberg',           'Gas Explosion', 'Low',    '2024-08-05 09:30:00', 'Pending'),     -- report_id=19
(10, 'Islamabad, F-7',            'Urban Fire',    'Medium', '2024-08-05 14:50:00', 'Dispatched'),  -- report_id=20
(1,  'Karachi, Malir',            'Flood',         'High',   '2024-08-10 03:00:00', 'Pending'),     -- report_id=21
(2,  'Lahore, Wapda Town',        'Earthquake',    'Low',    '2024-08-10 06:40:00', 'Resolved'),    -- report_id=22
(3,  'Islamabad, E-11',           'Flood',         'Medium', '2024-08-11 10:25:00', 'Dispatched'),  -- report_id=23
(4,  'Rawalpindi, Chaklala',      'Urban Fire',    'High',   '2024-08-11 17:45:00', 'Pending'),     -- report_id=24
(5,  'Peshawar, University Road', 'Flood',         'High',   '2024-08-12 07:10:00', 'Dispatched'),  -- report_id=25
(6,  'Quetta, Chiltan Town',      'Earthquake',    'High',   '2024-08-12 02:30:00', 'Pending'),     -- report_id=26
(7,  'Multan, Cantt',             'Urban Fire',    'Medium', '2024-08-13 12:00:00', 'Resolved'),    -- report_id=27
(8,  'Karachi, Defence',          'Gas Explosion', 'Low',    '2024-08-13 19:20:00', 'Pending'),     -- report_id=28
(9,  'Lahore, Model Town',        'Flood',         'High',   '2024-08-14 04:55:00', 'Dispatched'),  -- report_id=29
(10, 'Islamabad, G-9',            'Urban Fire',    'Low',    '2024-08-14 13:30:00', 'Resolved');    -- report_id=30
GO
-- Expected: 30 rows inserted

-- ============================================================
-- TEAM ASSIGNMENTS
-- Strategy: Insert COMPLETED assignments first so that trigger
-- trg_ResetTeamOnCompletion fires and restores teams to 'Available'.
-- Then insert ACTIVE assignments (trigger sets those teams to 'Busy').
-- Allowed status: 'Assigned' | 'EnRoute' | 'OnSite' | 'Completed' | 'Cancelled'
-- ============================================================

-- Step A: Insert completed historical assignments
-- (trg_MarkTeamBusy fires → teams Busy, then trg_ResetTeamOnCompletion fires → teams back to Available)
INSERT INTO TeamAssignments (report_id, team_id, assigned_at, completed_at, status) VALUES
(3,  3, '2024-07-16 04:30:00', '2024-07-16 14:00:00', 'Completed'),  -- assignment_id=1 Charlie ✓
(7,  2, '2024-07-18 12:00:00', '2024-07-18 18:00:00', 'Completed'),  -- assignment_id=2 Bravo ✓
(12, 3, '2024-08-01 08:30:00', '2024-08-01 16:00:00', 'Completed'),  -- assignment_id=3 Charlie ✓
(14, 5, '2024-08-02 19:00:00', '2024-08-03 08:00:00', 'Completed'),  -- assignment_id=4 Echo ✓
(18, 6, '2024-08-04 16:00:00', '2024-08-04 22:00:00', 'Completed');  -- assignment_id=5 Foxtrot ✓
GO

-- Step B: Insert active assignments
-- (trg_MarkTeamBusy fires → teams set to 'Busy' automatically)
INSERT INTO TeamAssignments (report_id, team_id, assigned_at, completed_at, status) VALUES
(1,  1, '2024-07-15 07:00:00', NULL, 'OnSite'),   -- assignment_id=6  Alpha Medical (Busy)
(4,  2, '2024-07-16 15:00:00', NULL, 'OnSite'),   -- assignment_id=7  Bravo Fire (Busy)
(6,  5, '2024-07-17 22:00:00', NULL, 'OnSite'),   -- assignment_id=8  Echo Medical (Busy)
(11, 4, '2024-08-01 06:00:00', NULL, 'OnSite'),   -- assignment_id=9  Delta Flood (Busy)
(15, 6, '2024-08-03 11:30:00', NULL, 'EnRoute');  -- assignment_id=10 Foxtrot Fire (Busy)
GO
-- Expected: Teams 1,2,4,5,6 = Busy; Teams 3,7,8 = Available

-- ============================================================
-- APPROVAL REQUESTS (8 requests across types)
-- Allowed status: 'Pending' | 'Approved' | 'Rejected'
-- requested_by: 4=Warehouse Manager, 2=Operator, 5=Finance Officer
-- decided_by:   1=Administrator
-- ============================================================
INSERT INTO ApprovalRequests
    (requested_by, request_type, details, status,
     decided_by, decision_note, created_at, decided_at)
VALUES
(4, 'ResourceDispatch',
 'Dispatch 100 cartons Water Bottles from Karachi Warehouse to Lyari Flood Zone',
 'Approved', 1, 'Approved — critical flood zone priority',
 '2024-07-15 06:45:00', '2024-07-15 07:00:00'),   -- request_id=1

(4, 'ResourceDispatch',
 'Dispatch 50 bags Rice from Lahore Depot to Shahdara Flood Victims',
 'Approved', 1, 'Approved — food emergency confirmed',
 '2024-08-01 06:30:00', '2024-08-01 07:00:00'),   -- request_id=2

(4, 'ResourceDispatch',
 'Dispatch 30 Tents from Islamabad Store to G-11 Flash Flood Affected',
 'Pending', NULL, NULL,
 '2024-07-19 23:00:00', NULL),                     -- request_id=3 (used in Transaction 4)

(4, 'ResourceDispatch',
 'Dispatch 200 First Aid Kits from Peshawar Hub to Hayatabad Flood Area',
 'Rejected', 1, 'Rejected — use Islamabad store instead; stock is sufficient there',
 '2024-07-17 09:30:00', '2024-07-17 10:00:00'),   -- request_id=4

(2, 'TeamDeployment',
 'Deploy additional medical team to Quetta Earthquake Zone',
 'Approved', 1, 'Approved — High severity event confirmed',
 '2024-07-17 22:30:00', '2024-07-17 23:00:00'),   -- request_id=5

(2, 'TeamDeployment',
 'Deploy fire unit to Karachi SITE Urban Fire Zone',
 'Pending', NULL, NULL,
 '2024-07-18 17:00:00', NULL),                     -- request_id=6

(5, 'FinancialApproval',
 'Procurement of 500 ORS Sachets for Quetta Earthquake survivors',
 'Approved', 1, 'Approved — within budget allocation',
 '2024-07-18 09:00:00', '2024-07-18 09:30:00'),   -- request_id=7

(5, 'FinancialApproval',
 'Emergency generator procurement for Peshawar Relief Hub',
 'Pending', NULL, NULL,
 '2024-08-12 08:00:00', NULL);                     -- request_id=8
GO
-- Expected: 8 rows inserted

-- ============================================================
-- RESOURCE ALLOCATIONS
-- Only for Approved requests (request_id 1, 2, 5, 7).
-- IMPORTANT: Inserting here fires trigger T1 (trg_ReduceInventoryAfterAllocation)
-- which AUTOMATICALLY reduces WarehouseInventory.quantity.
-- Quantities chosen to keep inventory positive:
--   inv_id=1  (Karachi, Water Bottles, qty=500) dispatch 100 → leaves 400
--   inv_id=7  (Lahore, Rice Bags, qty=180)      dispatch 50  → leaves 130
--   inv_id=18 (Peshawar, First Aid Kits, qty=80) dispatch 30 → leaves 50
--   inv_id=24 (Quetta, ORS Sachets, qty=200)    dispatch 50  → leaves 150
-- ============================================================
INSERT INTO ResourceAllocations
    (request_id, inventory_id, quantity_dispatched, destination, allocated_at)
VALUES
(1,  1,  100, 'Lyari Flood Relief Camp, Karachi',           '2024-07-15 07:30:00'),
(2,  7,   50, 'Shahdara Flood Distribution Point, Lahore',  '2024-08-01 07:30:00'),
(5,  18,  30, 'Hayatabad Flood Zone, Peshawar',             '2024-07-17 23:30:00'),
(7,  24,  50, 'Quetta Earthquake Relief Camp',              '2024-07-18 10:00:00');
GO
-- Expected: 4 rows inserted; trigger fires 4 times reducing inventory

-- ============================================================
-- PATIENTS (10 patients across hospitals)
-- Allowed status: 'Admitted' | 'Discharged' | 'Transferred' | 'Deceased'
-- ============================================================
INSERT INTO Patients (hospital_id, report_id, name, admitted_at, status) VALUES
(1, 1,  'Mohammad Saleem', '2024-07-15 09:00:00', 'Admitted'),
(1, 1,  'Rukhsana Bibi',   '2024-07-15 09:30:00', 'Admitted'),
(2, 3,  'Tariq Mahmood',   '2024-07-16 07:00:00', 'Discharged'),
(3, 4,  'Amina Khalid',    '2024-07-16 16:00:00', 'Admitted'),
(4, 6,  'Ghulam Rasool',   '2024-07-18 00:30:00', 'Admitted'),
(5, 6,  'Shahida Parveen', '2024-07-18 01:00:00', 'Admitted'),
(1, 11, 'Hassan Raza',     '2024-08-01 07:00:00', 'Admitted'),
(2, 9,  'Sana Mirza',      '2024-07-19 12:00:00', 'Discharged'),
(3, 13, 'Farhan Akhtar',   '2024-08-02 14:00:00', 'Admitted'),
(6, 17, 'Kiran Shahzad',   '2024-08-04 10:30:00', 'Admitted');
GO
-- Expected: 10 rows inserted

-- ============================================================
-- DONATIONS (8 donations)
-- Allowed type: 'Cash' | 'Kind' | 'Pledge'
-- approved_by = 5 (Finance Officer, Bilal Farooq)
-- NOTE: Trigger T5a (trg_AuditDonationInsert) fires for EACH row
--       and automatically writes to AuditLogs.
-- ============================================================
INSERT INTO Donations
    (donor_name, amount, type, disaster_event, donated_at, approved_by)
VALUES
('Imran Welfare Trust',        500000.00, 'Cash',   'Karachi Floods 2024',    '2024-07-16 10:00:00', 5),
('Aga Khan Foundation',        750000.00, 'Cash',   'Quetta Earthquake 2024', '2024-07-18 11:00:00', 5),
('Citizens Relief Fund',       200000.00, 'Cash',   'Lahore Floods 2024',     '2024-08-02 09:00:00', 5),
('Punjab Government',         1500000.00, 'Pledge', 'Lahore Floods 2024',     '2024-08-03 12:00:00', 5),
('Red Crescent Pakistan',      350000.00, 'Kind',   'Karachi Floods 2024',    '2024-07-20 15:00:00', 5),
('Edhi Foundation',            420000.00, 'Cash',   'Peshawar Floods 2024',   '2024-08-12 10:00:00', 5),
('Al-Khidmat Foundation',      280000.00, 'Kind',   'Quetta Earthquake 2024', '2024-07-19 14:00:00', 5),
('Anonymous Corporate Donor',  100000.00, 'Cash',   'Karachi Floods 2024',    '2024-07-17 16:30:00', 5);
GO
-- Expected: 8 rows inserted; trigger T5a fires 8 times → 8 AuditLog rows auto-created

-- ============================================================
-- EXPENSES (8 expenses)
-- approved_by = 5 (Finance Officer)
-- NOTE: Trigger T5b (trg_AuditExpenseInsert) fires for EACH row.
-- ============================================================
INSERT INTO Expenses
    (category, amount, disaster_event, incurred_at, approved_by)
VALUES
('Procurement',  350000.00, 'Karachi Floods 2024',    '2024-07-16 12:00:00', 5),
('Distribution', 120000.00, 'Karachi Floods 2024',    '2024-07-17 09:00:00', 5),
('Operations',    80000.00, 'Quetta Earthquake 2024', '2024-07-18 14:00:00', 5),
('Procurement',  450000.00, 'Quetta Earthquake 2024', '2024-07-19 11:00:00', 5),
('Procurement',  200000.00, 'Lahore Floods 2024',     '2024-08-03 10:00:00', 5),
('Operations',   150000.00, 'Lahore Floods 2024',     '2024-08-04 09:00:00', 5),
('Distribution',  90000.00, 'Peshawar Floods 2024',   '2024-08-12 13:00:00', 5),
('Procurement',  180000.00, 'Peshawar Floods 2024',   '2024-08-13 10:00:00', 5);
GO
-- Expected: 8 rows inserted; trigger T5b fires 8 times → 8 AuditLog rows auto-created

-- ============================================================
-- MANUAL AUDIT LOG ENTRIES (operational events)
-- These supplement the trigger-generated audit rows.
-- Allowed action_type: 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
-- ============================================================
INSERT INTO AuditLogs
    (user_id, action_type, description, table_affected, record_id, ip_address)
VALUES
(1, 'LOGIN',  'Administrator logged in to system',                          'Users',            1, '192.168.1.1'),
(2, 'INSERT', 'Emergency report submitted: Karachi Lyari Flood',            'EmergencyReports', 1, '192.168.1.20'),
(4, 'INSERT', 'Resource dispatch request submitted for Water Bottles',      'ApprovalRequests', 1, '192.168.1.30'),
(1, 'UPDATE', 'Approval request #1 approved by Administrator',              'ApprovalRequests', 1, '192.168.1.1'),
(1, 'UPDATE', 'Team Alpha Medical assigned to Emergency Report #1',         'TeamAssignments',  6, '192.168.1.1'),
(3, 'UPDATE', 'Mission status updated to OnSite for assignment #6',         'TeamAssignments',  6, '192.168.1.50'),
(4, 'UPDATE', 'Inventory updated after dispatch — Karachi Warehouse',       'WarehouseInventory',1,'192.168.1.30'),
(1, 'LOGOUT', 'Administrator session ended',                                'Users',            1, '192.168.1.1');
GO
-- Expected: 8 manual rows + 16 trigger-generated rows = 24 total AuditLogs rows

-- ============================================================
-- VERIFICATION — Table row counts after all inserts
-- ============================================================
SELECT 'Roles'               AS TableName, COUNT(*) AS CountRows FROM Roles
UNION ALL SELECT 'Users',               COUNT(*) FROM Users
UNION ALL SELECT 'Citizens',            COUNT(*) FROM Citizens
UNION ALL SELECT 'RescueTeams',         COUNT(*) FROM RescueTeams
UNION ALL SELECT 'Warehouses',          COUNT(*) FROM Warehouses
UNION ALL SELECT 'Resources',           COUNT(*) FROM Resources
UNION ALL SELECT 'Hospitals',           COUNT(*) FROM Hospitals
UNION ALL SELECT 'WarehouseInventory',  COUNT(*) FROM WarehouseInventory
UNION ALL SELECT 'EmergencyReports',    COUNT(*) FROM EmergencyReports
UNION ALL SELECT 'TeamAssignments',     COUNT(*) FROM TeamAssignments
UNION ALL SELECT 'ApprovalRequests',    COUNT(*) FROM ApprovalRequests
UNION ALL SELECT 'ResourceAllocations', COUNT(*) FROM ResourceAllocations
UNION ALL SELECT 'Patients',            COUNT(*) FROM Patients
UNION ALL SELECT 'Donations',           COUNT(*) FROM Donations
UNION ALL SELECT 'Expenses',            COUNT(*) FROM Expenses
UNION ALL SELECT 'AuditLogs',           COUNT(*) FROM AuditLogs
UNION ALL SELECT 'Permissions',         COUNT(*) FROM Permissions
UNION ALL SELECT 'StockAlerts',         COUNT(*) FROM StockAlerts;
GO

-- ============================================================
-- EXPECTED VERIFICATION OUTPUT:
-- TableName             | RowCount
-- Roles                 | 5
-- Users                 | 5
-- Citizens              | 10
-- RescueTeams           | 8
-- Warehouses            | 6
-- Resources             | 10
-- Hospitals             | 6
-- WarehouseInventory    | 30
-- EmergencyReports      | 30
-- TeamAssignments       | 10
-- ApprovalRequests      | 8
-- ResourceAllocations   | 4
-- Patients              | 10
-- Donations             | 8
-- Expenses              | 8
-- AuditLogs             | 24   (8 manual + 8 donation triggers + 8 expense triggers)
-- Permissions           | 29
-- StockAlerts           | 0    (none crossed threshold during seeding)
-- ============================================================

PRINT '=== FILE 3: DML Complete — All sample data inserted successfully. ===';
GO