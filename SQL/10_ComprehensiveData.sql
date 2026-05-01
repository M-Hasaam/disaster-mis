-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 10: COMPREHENSIVE DEMO DATA
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- RUN AFTER: FILE 0 through FILE 9
-- PURPOSE  : Populates all remaining tables so every dashboard
--            page shows meaningful, non-zero KPIs:
--            • 15 more Citizens
--            • 50 more EmergencyReports (mix of Pending/Dispatched/Resolved)
--            • 12 Pending ApprovalRequests
--            • 25 Donations (varied disaster events)
--            • 20 Expenses (varied categories)
--            • 6 WarehouseInventory rows updated below threshold
--              → triggers trg_LowStockAlert → auto-fills StockAlerts
-- ============================================================
-- SAFE TO RE-RUN: Every block is guarded by row-count checks.
-- ============================================================

USE DisasterResponseMIS;
GO

-- ============================================================
-- STEP 1 — More Citizens (IDs auto-assigned via IDENTITY)
--          Guard: skip if ≥ 20 citizens already exist
-- ============================================================
IF (SELECT COUNT(*) FROM Citizens) < 20
BEGIN
    INSERT INTO Citizens (name, phone, address, email) VALUES
    ('Asad Raza',          '03231234567', 'Johar Town, Lahore',               'asad.raza@gmail.com'),
    ('Iqra Siddiqui',      '03121234567', 'Gulshan-e-Iqbal, Karachi',         'iqra.sid@hotmail.com'),
    ('Tariq Mehmood',      '03451234567', 'Model Colony, Karachi',             'tariq.m@yahoo.com'),
    ('Sara Ahmed',         '03551234567', 'Cantt Area, Peshawar',              'sara.ahmed@gmail.com'),
    ('Hamid Khan',         '03671234567', 'Blue Area, Islamabad',              'hamid.khan@live.com'),
    ('Nadia Shah',         '03341234567', 'Satellite Town, Rawalpindi',        'nadia.shah@gmail.com'),
    ('Zubair Hussain',     '03781234567', 'Gulberg II, Lahore',               'zubair.h@gmail.com'),
    ('Maira Qureshi',      '03891234567', 'Defense Housing, Karachi',          'maira.q@yahoo.com'),
    ('Faisal Mirza',       '03921234567', 'F-10, Islamabad',                   'faisal.mirza@gmail.com'),
    ('Rabia Naz',          '03031234567', 'Hayatabad Phase 4, Peshawar',       'rabia.naz@hotmail.com'),
    ('Salman Sheikh',      '03141234567', 'Liaquatabad, Karachi',              'salman.s@gmail.com'),
    ('Hina Butt',          '03251234567', 'Johar Town Phase 2, Lahore',        'hina.butt@yahoo.com'),
    ('Noman Riaz',         '03001112222', 'Kasi Road, Quetta',                 'noman.r@gmail.com'),
    ('Zainab Malik',       '03331234567', 'Rawalpindi Saddar',                 'zainab.malik@gmail.com'),
    ('Bilal Nawaz',        '03561234567', 'Hussain Agahi, Multan',             'bilal.n@yahoo.com');

    PRINT CONCAT('Citizens: added ', @@ROWCOUNT, ' new records.');
END
ELSE
    PRINT 'Citizens ≥ 20 — skipping.';
GO

-- ============================================================
-- STEP 2 — 50 more EmergencyReports
--          30 Pending (drives the "Pending Queue" KPI),
--          15 Dispatched (drives "Dispatched Units"),
--          5  Resolved (historical data for charts)
--          Guard: only insert if < 25 Pending reports exist
-- ============================================================
IF (SELECT COUNT(*) FROM EmergencyReports WHERE status = 'Pending') < 25
BEGIN
    -- ── 30 Pending Reports ──────────────────────────────────────
    INSERT INTO EmergencyReports (citizen_id, location, disaster_type, severity, report_time, status) VALUES
    (1,  'Karachi, Orangi Town',            'Flood',            'High',   '2024-09-01 02:15:00', 'Pending'),
    (2,  'Lahore, Samanabad',               'Urban Fire',        'Medium', '2024-09-01 05:30:00', 'Pending'),
    (3,  'Islamabad, G-7',                  'Urban Fire',        'High',   '2024-09-01 12:40:00', 'Pending'),
    (4,  'Peshawar, Kohat Road',            'Flood',            'High',   '2024-09-01 11:45:00', 'Pending'),
    (5,  'Quetta, Western Bypass',          'Earthquake',        'High',   '2024-09-01 06:10:00', 'Pending'),
    (6,  'Multan, Gulgasht Colony',         'Urban Fire',        'Medium', '2024-09-01 08:00:00', 'Pending'),
    (7,  'Rawalpindi, Taxila',              'Urban Fire',        'Medium', '2024-09-01 18:20:00', 'Pending'),
    (8,  'Karachi, Shah Faisal Colony',     'Flood',            'High',   '2024-09-02 10:15:00', 'Pending'),
    (9,  'Lahore, Barki Road',              'Urban Fire',        'High',   '2024-09-02 21:45:00', 'Pending'),
    (10, 'Islamabad, E-7',                  'Gas Explosion',     'High',   '2024-09-02 16:00:00', 'Pending'),
    (1,  'Karachi, Landhi',                 'Urban Fire',        'Medium', '2024-09-03 19:50:00', 'Pending'),
    (2,  'Lahore, Ravi Road',               'Flood',            'High',   '2024-09-03 03:00:00', 'Pending'),
    (3,  'Islamabad, F-6',                  'Earthquake',        'Medium', '2024-09-03 03:30:00', 'Pending'),
    (4,  'Peshawar, Charsadda Road',        'Flood',            'High',   '2024-09-03 07:10:00', 'Pending'),
    (5,  'Quetta, Sariab Road',             'Chemical Leak',     'High',   '2024-09-04 09:00:00', 'Pending'),
    (6,  'Multan, Qasim Pur Colony',        'Flood',            'Medium', '2024-09-04 14:00:00', 'Pending'),
    (7,  'Rawalpindi, Westridge',           'Urban Fire',        'Low',    '2024-09-04 17:30:00', 'Pending'),
    (8,  'Karachi, Malir Halt',             'Landslide',         'Medium', '2024-09-05 04:20:00', 'Pending'),
    (9,  'Lahore, Shalamar',               'Flood',            'High',   '2024-09-05 06:15:00', 'Pending'),
    (10, 'Islamabad, I-9',                  'Structural Collapse','High',  '2024-09-05 11:00:00', 'Pending'),
    (1,  'Karachi, Ittehad Town',           'Urban Fire',        'Medium', '2024-09-06 08:30:00', 'Pending'),
    (2,  'Lahore, Data Darbar',             'Stampede',          'High',   '2024-09-06 14:00:00', 'Pending'),
    (3,  'Islamabad, G-10',                 'Urban Fire',        'Low',    '2024-09-06 20:10:00', 'Pending'),
    (4,  'Peshawar, University Road',       'Earthquake',        'High',   '2024-09-07 01:30:00', 'Pending'),
    (5,  'Quetta, Airport Road',            'Flood',            'Medium', '2024-09-07 07:45:00', 'Pending'),
    (6,  'Multan, Boson Road',              'Gas Explosion',     'High',   '2024-09-07 13:00:00', 'Pending'),
    (7,  'Rawalpindi, Adiala Road',         'Urban Fire',        'Medium', '2024-09-08 09:20:00', 'Pending'),
    (8,  'Karachi, SITE Industrial Area',   'Chemical Leak',     'High',   '2024-09-08 15:00:00', 'Pending'),
    (9,  'Lahore, Township',                'Flood',            'High',   '2024-09-09 02:00:00', 'Pending'),
    (10, 'Islamabad, H-8',                  'Urban Fire',        'Medium', '2024-09-09 11:45:00', 'Pending');

    -- ── 15 Dispatched Reports ───────────────────────────────────
    INSERT INTO EmergencyReports (citizen_id, location, disaster_type, severity, report_time, status) VALUES
    (1,  'Karachi, Korangi',                'Flood',            'High',   '2024-08-15 06:00:00', 'Dispatched'),
    (2,  'Lahore, Gulberg III',             'Urban Fire',        'High',   '2024-08-15 10:30:00', 'Dispatched'),
    (3,  'Islamabad, F-8',                  'Earthquake',        'Medium', '2024-08-16 04:00:00', 'Dispatched'),
    (4,  'Peshawar, Ring Road',             'Flood',            'High',   '2024-08-16 09:00:00', 'Dispatched'),
    (5,  'Quetta, Brewery Road',            'Chemical Leak',     'High',   '2024-08-17 14:00:00', 'Dispatched'),
    (6,  'Multan, Nishtar Road',            'Urban Fire',        'Medium', '2024-08-17 20:00:00', 'Dispatched'),
    (7,  'Rawalpindi, Murree Road',         'Landslide',         'High',   '2024-08-18 07:00:00', 'Dispatched'),
    (8,  'Karachi, Defence Phase 6',        'Urban Fire',        'Low',    '2024-08-19 16:00:00', 'Dispatched'),
    (9,  'Lahore, Allama Iqbal Town',       'Flood',            'High',   '2024-08-20 03:00:00', 'Dispatched'),
    (10, 'Islamabad, G-9',                  'Gas Explosion',     'High',   '2024-08-20 11:00:00', 'Dispatched'),
    (1,  'Karachi, North Karachi',          'Flood',            'Medium', '2024-08-21 05:30:00', 'Dispatched'),
    (2,  'Lahore, Ferozepur Road',          'Urban Fire',        'High',   '2024-08-22 18:00:00', 'Dispatched'),
    (3,  'Islamabad, E-11',                 'Structural Collapse','High',  '2024-08-23 09:00:00', 'Dispatched'),
    (4,  'Peshawar, Warsak Road',           'Flood',            'High',   '2024-08-24 12:00:00', 'Dispatched'),
    (5,  'Quetta, Zarghoon Road',           'Earthquake',        'Medium', '2024-08-25 07:00:00', 'Dispatched');

    -- ── 5 Resolved Reports (historical / charts) ─────────────────
    INSERT INTO EmergencyReports (citizen_id, location, disaster_type, severity, report_time, status) VALUES
    (6,  'Multan, Shah Rukn-e-Alam',        'Urban Fire',        'Low',    '2024-07-10 10:00:00', 'Resolved'),
    (7,  'Rawalpindi, Saddar',              'Urban Fire',        'Low',    '2024-07-12 14:00:00', 'Resolved'),
    (8,  'Karachi, Clifton',                'Urban Fire',        'Medium', '2024-07-14 08:00:00', 'Resolved'),
    (9,  'Lahore, Gulberg',                 'Flood',            'Medium', '2024-07-20 16:30:00', 'Resolved'),
    (10, 'Islamabad, F-7',                  'Urban Fire',        'Low',    '2024-07-22 11:00:00', 'Resolved');

    PRINT 'EmergencyReports: 50 new records added (30 Pending, 15 Dispatched, 5 Resolved).';
END
ELSE
    PRINT 'EmergencyReports: sufficient Pending records exist — skipping.';
GO

-- ============================================================
-- STEP 3 — 12 Pending ApprovalRequests
--          Guard: skip if ≥ 8 Pending approvals already exist
-- ============================================================
IF (SELECT COUNT(*) FROM ApprovalRequests WHERE status = 'Pending') < 8
BEGIN
    INSERT INTO ApprovalRequests
        (requested_by, request_type, details, status, decided_by, decision_note, created_at)
    VALUES
    (4, 'ResourceDispatch', 'Request 500 Water Bottles to Karachi Flood Relief camps, Orangi Town',            'Pending', NULL, NULL, '2024-09-01 07:00:00'),
    (4, 'ResourceDispatch', 'Urgent: 200 Tents required for displaced families, Peshawar Kohat Road',         'Pending', NULL, NULL, '2024-09-01 09:30:00'),
    (4, 'ResourceDispatch', 'Deploy 50 Emergency Medical Kits to Quetta Earthquake victims',                  'Pending', NULL, NULL, '2024-09-01 11:00:00'),
    (4, 'ResourceDispatch', 'Request 300 Blankets for Lahore flood-displaced persons',                        'Pending', NULL, NULL, '2024-09-02 08:00:00'),
    (4, 'ResourceDispatch', 'Fuel Supply needed for 3 rescue vehicles in Islamabad operations',               'Pending', NULL, NULL, '2024-09-02 13:00:00'),
    (2, 'TeamDeployment',   'Additional medical team required at Karachi Civil Hospital overflow zone',        'Pending', NULL, NULL, '2024-09-03 06:00:00'),
    (2, 'TeamDeployment',   'Request backup Fire Squad for Multan Gas Explosion site',                        'Pending', NULL, NULL, '2024-09-03 15:00:00'),
    (4, 'ResourceDispatch', 'Drinking water supply (1000 litres) needed for Rawalpindi relief camp',          'Pending', NULL, NULL, '2024-09-04 09:00:00'),
    (4, 'ResourceDispatch', 'Medical equipment: 10 Oxygen Cylinders for PIMS Hospital overflow ward',         'Pending', NULL, NULL, '2024-09-04 14:30:00'),
    (2, 'TeamDeployment',   'Hazmat team deployment required at Karachi SITE Industrial Area chemical spill', 'Pending', NULL, NULL, '2024-09-05 08:00:00'),
    (4, 'ResourceDispatch', 'Generator fuel for Quetta Bolan Medical Complex backup power',                   'Pending', NULL, NULL, '2024-09-06 10:00:00'),
    (3, 'FieldRequest',     'Field officer requests satellite communication equipment for Peshawar sector',   'Pending', NULL, NULL, '2024-09-07 07:00:00');

    PRINT CONCAT('ApprovalRequests: added ', @@ROWCOUNT, ' Pending records.');
END
ELSE
    PRINT 'ApprovalRequests: sufficient Pending records exist — skipping.';
GO

-- ============================================================
-- STEP 4 — 25 more Donations (varied events and amounts)
--          Guard: skip if ≥ 20 donations already exist
-- ============================================================
IF (SELECT COUNT(*) FROM Donations) < 20
BEGIN
    INSERT INTO Donations (donor_name, amount, type, disaster_event, donated_at, approved_by) VALUES
    ('Pakistan Red Crescent',          850000.00, 'Cash',  'Karachi Floods 2024',           '2024-09-01 09:00:00', 5),
    ('Edhi Foundation',                620000.00, 'Cash',  'Peshawar Earthquake 2024',       '2024-09-01 11:00:00', 5),
    ('Saylani Welfare Trust',          480000.00, 'Cash',  'Quetta Earthquake 2024',         '2024-09-02 10:00:00', 5),
    ('Punjab Disaster Fund',           950000.00, 'Cash',  'Lahore Floods 2024',             '2024-09-02 14:00:00', 5),
    ('Chhipa Welfare Association',     320000.00, 'Cash',  'Karachi Floods 2024',            '2024-09-03 09:30:00', 5),
    ('Al-Khidmat Foundation',          730000.00, 'Cash',  'Multan Emergency Relief 2024',   '2024-09-03 13:00:00', 5),
    ('JDC Foundation',                 280000.00, 'Cash',  'Islamabad Gas Explosion 2024',   '2024-09-04 08:00:00', 5),
    ('Ansar Burney Welfare Trust',     410000.00, 'Cash',  'Peshawar Earthquake 2024',       '2024-09-04 15:00:00', 5),
    ('Rizq Trust Pakistan',            560000.00, 'Cash',  'Karachi Floods 2024',            '2024-09-05 10:00:00', 5),
    ('Sharif Medical Trust',           890000.00, 'Cash',  'Lahore Floods 2024',             '2024-09-05 16:00:00', 5),
    ('Shaukat Khanum Memorial',        445000.00, 'Cash',  'National Disaster Relief Fund',  '2024-09-06 09:00:00', 5),
    ('Habib Bank Foundation',         1200000.00, 'Cash',  'National Disaster Relief Fund',  '2024-09-06 12:00:00', 5),
    ('MCB Arif Habib Foundation',      670000.00, 'Cash',  'Quetta Earthquake 2024',         '2024-09-07 10:00:00', 5),
    ('Fauji Foundation',               785000.00, 'Cash',  'Rawalpindi Relief Operations',   '2024-09-07 14:00:00', 5),
    ('Engro Foundation',               530000.00, 'Cash',  'Karachi Industrial Incident',    '2024-09-08 09:00:00', 5),
    ('PTCL Charitable Foundation',     345000.00, 'Cash',  'National Disaster Relief Fund',  '2024-09-08 13:00:00', 5),
    ('Sindh Relief Trust',             920000.00, 'Cash',  'Karachi Floods 2024',            '2024-09-09 08:00:00', 5),
    ('KPK Emergency Fund',             610000.00, 'Cash',  'Peshawar Earthquake 2024',       '2024-09-09 11:00:00', 5),
    ('Balochistan Welfare Society',    430000.00, 'Kind',  'Quetta Earthquake 2024',         '2024-09-10 09:00:00', 5),
    ('Lahore Chamber of Commerce',     750000.00, 'Cash',  'Lahore Floods 2024',             '2024-09-10 14:00:00', 5),
    ('Citizens Foundation',            380000.00, 'Kind',  'National Disaster Relief Fund',  '2024-09-11 10:00:00', 5),
    ('Memon Welfare Society',          290000.00, 'Cash',  'Karachi Floods 2024',            '2024-09-11 15:00:00', 5),
    ('Dawood Foundation',              840000.00, 'Cash',  'Multan Emergency Relief 2024',   '2024-09-12 09:00:00', 5),
    ('Gul Ahmed Textile Foundation',   460000.00, 'Cash',  'National Disaster Relief Fund',  '2024-09-12 13:00:00', 5),
    ('OGDCL Community Fund',           680000.00, 'Pledge','Islamabad Gas Explosion 2024',   '2024-09-13 10:00:00', 5);

    PRINT CONCAT('Donations: added ', @@ROWCOUNT, ' records.');
END
ELSE
    PRINT 'Donations: sufficient records exist — skipping.';
GO

-- ============================================================
-- STEP 5 — 20 more Expenses
--          Guard: skip if ≥ 16 expenses already exist
-- ============================================================
IF (SELECT COUNT(*) FROM Expenses) < 16
BEGIN
    INSERT INTO Expenses (category, amount, disaster_event, incurred_at, approved_by) VALUES
    ('Procurement',    430000.00, 'Karachi Floods 2024',           '2024-09-01 08:00:00', 5),
    ('Logistics',      180000.00, 'Karachi Floods 2024',           '2024-09-01 12:00:00', 5),
    ('Medical',        560000.00, 'Peshawar Earthquake 2024',       '2024-09-02 09:00:00', 5),
    ('Procurement',    320000.00, 'Quetta Earthquake 2024',         '2024-09-02 14:00:00', 5),
    ('Search & Rescue',210000.00, 'Quetta Earthquake 2024',         '2024-09-03 07:00:00', 5),
    ('Logistics',      140000.00, 'Lahore Floods 2024',             '2024-09-03 11:00:00', 5),
    ('Medical',        470000.00, 'Lahore Floods 2024',             '2024-09-04 08:00:00', 5),
    ('Procurement',    280000.00, 'Multan Emergency Relief 2024',   '2024-09-04 15:00:00', 5),
    ('Infrastructure', 390000.00, 'Karachi Floods 2024',            '2024-09-05 09:00:00', 5),
    ('Communications', 95000.00,  'National Disaster Relief Fund',  '2024-09-05 14:00:00', 5),
    ('Fuel & Transport',165000.00,'Rawalpindi Relief Operations',   '2024-09-06 08:00:00', 5),
    ('Medical',        620000.00, 'Islamabad Gas Explosion 2024',   '2024-09-06 13:00:00', 5),
    ('Procurement',    410000.00, 'Peshawar Earthquake 2024',       '2024-09-07 09:00:00', 5),
    ('Search & Rescue',245000.00, 'Peshawar Earthquake 2024',       '2024-09-07 16:00:00', 5),
    ('Logistics',      175000.00, 'Quetta Earthquake 2024',         '2024-09-08 08:00:00', 5),
    ('Infrastructure', 530000.00, 'Karachi Industrial Incident',    '2024-09-08 14:00:00', 5),
    ('Medical',        380000.00, 'Multan Emergency Relief 2024',   '2024-09-09 09:00:00', 5),
    ('Communications', 72000.00,  'Rawalpindi Relief Operations',   '2024-09-09 13:00:00', 5),
    ('Procurement',    490000.00, 'Lahore Floods 2024',             '2024-09-10 08:00:00', 5),
    ('Fuel & Transport',195000.00,'National Disaster Relief Fund',  '2024-09-10 15:00:00', 5);

    PRINT CONCAT('Expenses: added ', @@ROWCOUNT, ' records.');
END
ELSE
    PRINT 'Expenses: sufficient records exist — skipping.';
GO

-- ============================================================
-- STEP 6 — Create LOW stock conditions in WarehouseInventory
--          This triggers trg_LowStockAlert → fills StockAlerts
--          Guard: only update if StockAlerts table has < 3 rows
-- ============================================================
IF (SELECT COUNT(*) FROM StockAlerts) < 3
BEGIN
    -- Set 6 inventory items below their own min_threshold
    -- (inventory_ids 2, 6, 13, 17, 22, 28 from FILE 3 layout)
    UPDATE WarehouseInventory SET quantity =
        CASE inventory_id
            WHEN 2  THEN 8    -- Rice Bags, Karachi (threshold=30  → below)
            WHEN 6  THEN 5    -- item in Lahore    (threshold=20+ → below)
            WHEN 13 THEN 3    -- item in Islamabad (threshold=10+ → below)
            WHEN 17 THEN 7    -- item in Peshawar  (threshold=15+ → below)
            WHEN 22 THEN 4    -- item in Quetta    (threshold=10+ → below)
            WHEN 28 THEN 6    -- item in Multan    (threshold=15+ → below)
        END
    WHERE inventory_id IN (2, 6, 13, 17, 22, 28)
      AND quantity >= min_threshold;  -- only if they were above threshold (prevents duplicate alert)

    PRINT CONCAT('WarehouseInventory: updated ', @@ROWCOUNT, ' rows below threshold. trg_LowStockAlert auto-inserted StockAlerts rows.');
END
ELSE
    PRINT 'StockAlerts: ≥ 3 rows already exist — skipping inventory update.';
GO

-- ============================================================
-- STEP 7 — Verify all impacted tables
-- ============================================================
SELECT 'EmergencyReports' AS TableName, status, COUNT(*) AS TotalRows
FROM EmergencyReports GROUP BY status
UNION ALL
SELECT 'ApprovalRequests', status, COUNT(*) FROM ApprovalRequests GROUP BY status
ORDER BY TableName, status;
GO

SELECT
    'Donations'   AS TableName, COUNT(*) AS TotalRows, SUM(amount) AS TotalAmount FROM Donations
UNION ALL
SELECT 'Expenses', COUNT(*), SUM(amount) FROM Expenses;
GO

SELECT
    'StockAlerts' AS TableName, COUNT(*) AS TotalRows FROM StockAlerts
UNION ALL SELECT 'Citizens',    COUNT(*) FROM Citizens;
GO

-- Quick operator KPI preview
SELECT
    (SELECT COUNT(*) FROM EmergencyReports WHERE status = 'Pending')    AS pending_queue,
    (SELECT COUNT(*) FROM EmergencyReports WHERE status = 'Dispatched') AS dispatched_units,
    (SELECT COUNT(*) FROM ApprovalRequests WHERE status = 'Pending')    AS pending_approvals,
    (SELECT COUNT(*) FROM StockAlerts)                                  AS stock_alerts,
    (SELECT SUM(amount) FROM Donations)                                 AS total_donations_pkr;
GO

PRINT '=== FILE 10: Comprehensive Demo Data — complete. ===';
GO
