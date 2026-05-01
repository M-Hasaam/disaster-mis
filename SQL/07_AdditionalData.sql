-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 7: ADDITIONAL SAMPLE DATA
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- RUN AFTER: FILE 0 through FILE 3 (all base data must exist first)
-- PURPOSE  : Adds more rows to make performance benchmark queries
--            produce measurably different timings for the
--            Indexed vs Non-Indexed and View vs Table comparisons.
-- ============================================================
-- NOTE: Does NOT change any existing schema, triggers, or views.
--       Only inserts new rows into existing tables.
--       Safe to run multiple times only if the DB was re-seeded
--       from scratch (IDENTITY columns will produce new IDs).
-- ============================================================

USE DisasterResponseMIS;
GO

-- ============================================================
-- ADDITIONAL EMERGENCY REPORTS (50 rows)
-- citizen_id must be 1-10  (from FILE 3)
-- severity   must be 'Low' | 'Medium' | 'High'
-- status     must be 'Pending' | 'Dispatched' | 'Resolved' | 'Cancelled'
-- ============================================================
INSERT INTO EmergencyReports (citizen_id, location, disaster_type, severity, report_time, status)
VALUES
(1,  'Karachi, Baldia Town',         'Flood',         'High',   '2024-09-01 05:00:00', 'Pending'),
(2,  'Lahore, Ferozepur Road',       'Urban Fire',    'Medium', '2024-09-01 07:30:00', 'Dispatched'),
(3,  'Islamabad, H-8',               'Earthquake',    'High',   '2024-09-02 02:15:00', 'Pending'),
(4,  'Rawalpindi, Westridge',        'Urban Fire',    'Low',    '2024-09-02 11:45:00', 'Resolved'),
(5,  'Peshawar, Dalazak Road',       'Flood',         'High',   '2024-09-03 06:00:00', 'Dispatched'),
(6,  'Quetta, Pashtunabad',          'Earthquake',    'Medium', '2024-09-03 03:20:00', 'Pending'),
(7,  'Multan, Mumtazabad',           'Flood',         'High',   '2024-09-04 08:10:00', 'Dispatched'),
(8,  'Karachi, North Nazimabad',     'Gas Explosion', 'High',   '2024-09-04 14:30:00', 'Pending'),
(9,  'Lahore, Johar Town',           'Flood',         'Medium', '2024-09-05 07:00:00', 'Resolved'),
(10, 'Islamabad, G-6',               'Urban Fire',    'Low',    '2024-09-05 12:45:00', 'Cancelled'),
(1,  'Karachi, Surjani Town',        'Flood',         'High',   '2024-09-06 04:30:00', 'Pending'),
(2,  'Lahore, Iqbal Town',           'Urban Fire',    'High',   '2024-09-06 16:00:00', 'Dispatched'),
(3,  'Islamabad, F-10',              'Gas Explosion', 'Medium', '2024-09-07 09:15:00', 'Pending'),
(4,  'Rawalpindi, Dhoke Syedan',     'Flood',         'Low',    '2024-09-07 19:00:00', 'Resolved'),
(5,  'Peshawar, Phandu',             'Earthquake',    'High',   '2024-09-08 01:45:00', 'Dispatched'),
(6,  'Quetta, Brewary Road',         'Urban Fire',    'Medium', '2024-09-08 13:30:00', 'Pending'),
(7,  'Multan, Bosan Road',           'Flood',         'High',   '2024-09-09 05:50:00', 'Dispatched'),
(8,  'Karachi, Liaquatabad',         'Urban Fire',    'Low',    '2024-09-09 17:20:00', 'Resolved'),
(9,  'Lahore, Township',             'Flood',         'High',   '2024-09-10 03:40:00', 'Pending'),
(10, 'Islamabad, I-9',               'Earthquake',    'Medium', '2024-09-10 22:15:00', 'Cancelled'),
(1,  'Karachi, New Karachi',         'Flood',         'High',   '2024-09-11 06:10:00', 'Pending'),
(2,  'Lahore, Sabzazar',             'Urban Fire',    'Medium', '2024-09-11 10:45:00', 'Dispatched'),
(3,  'Islamabad, G-13',              'Flood',         'High',   '2024-09-12 04:00:00', 'Pending'),
(4,  'Rawalpindi, Asghar Mall',      'Gas Explosion', 'High',   '2024-09-12 15:30:00', 'Dispatched'),
(5,  'Peshawar, Charsadda Road',     'Flood',         'Medium', '2024-09-13 08:20:00', 'Resolved'),
(6,  'Quetta, Kuchlak Road',         'Earthquake',    'High',   '2024-09-13 00:45:00', 'Pending'),
(7,  'Multan, Vehari Road',          'Flood',         'Low',    '2024-09-14 11:00:00', 'Resolved'),
(8,  'Karachi, Gulshan-e-Hadeed',    'Urban Fire',    'High',   '2024-09-14 18:15:00', 'Pending'),
(9,  'Lahore, Chungi Amar Sidhu',    'Flood',         'Medium', '2024-09-15 05:30:00', 'Dispatched'),
(10, 'Islamabad, D-12',              'Earthquake',    'Low',    '2024-09-15 20:00:00', 'Resolved'),
(1,  'Karachi, Korangi Industrial',  'Gas Explosion', 'High',   '2024-09-16 07:45:00', 'Pending'),
(2,  'Lahore, Raiwind Road',         'Flood',         'High',   '2024-09-16 09:30:00', 'Dispatched'),
(3,  'Islamabad, H-11',              'Urban Fire',    'Medium', '2024-09-17 14:10:00', 'Pending'),
(4,  'Rawalpindi, Morgah',           'Flood',         'High',   '2024-09-17 04:20:00', 'Cancelled'),
(5,  'Peshawar, Mattani',            'Earthquake',    'High',   '2024-09-18 02:00:00', 'Dispatched'),
(6,  'Quetta, Sariab Road',          'Flood',         'Medium', '2024-09-18 08:40:00', 'Pending'),
(7,  'Multan, Shujabad Road',        'Urban Fire',    'Low',    '2024-09-19 12:30:00', 'Resolved'),
(8,  'Karachi, Keamari',             'Flood',         'High',   '2024-09-19 03:50:00', 'Pending'),
(9,  'Lahore, Barki Road',           'Urban Fire',    'Medium', '2024-09-20 16:45:00', 'Dispatched'),
(10, 'Islamabad, E-7',               'Gas Explosion', 'High',   '2024-09-20 11:00:00', 'Pending'),
(1,  'Karachi, Shah Faisal Colony',  'Flood',         'High',   '2024-09-21 05:15:00', 'Dispatched'),
(2,  'Lahore, Manga Mandi',          'Flood',         'Medium', '2024-09-21 07:00:00', 'Resolved'),
(3,  'Islamabad, F-6',               'Earthquake',    'Low',    '2024-09-22 22:30:00', 'Pending'),
(4,  'Rawalpindi, Taxila',           'Urban Fire',    'High',   '2024-09-22 13:20:00', 'Dispatched'),
(5,  'Peshawar, Kohat Road',         'Flood',         'High',   '2024-09-23 06:45:00', 'Pending'),
(6,  'Quetta, Western Bypass',       'Earthquake',    'High',   '2024-09-23 01:10:00', 'Pending'),
(7,  'Multan, Qasim Pur Colony',     'Flood',         'Medium', '2024-09-24 09:00:00', 'Dispatched'),
(8,  'Karachi, Landhi',              'Urban Fire',    'High',   '2024-09-24 14:50:00', 'Pending'),
(9,  'Lahore, Nishtar Colony',       'Flood',         'Low',    '2024-09-25 04:20:00', 'Resolved'),
(10, 'Islamabad, G-7',               'Urban Fire',    'Medium', '2024-09-25 19:40:00', 'Pending');
GO
-- Expected: 50 rows inserted → total EmergencyReports = 80

-- ============================================================
-- ADDITIONAL AUDIT LOGS (40 rows)
-- user_id must be 1-5  (from FILE 0 + FILE 3)
-- action_type must be 'INSERT' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT'
-- table_affected: any meaningful table name string
-- ============================================================
INSERT INTO AuditLogs (user_id, action_type, description, table_affected, record_id, ip_address)
VALUES
(2, 'INSERT', 'Emergency report submitted: Karachi Baldia Flood',          'EmergencyReports', 31, '192.168.1.21'),
(2, 'INSERT', 'Emergency report submitted: Lahore Ferozepur Fire',         'EmergencyReports', 32, '192.168.1.21'),
(1, 'UPDATE', 'Report status updated to Dispatched: ID=32',                'EmergencyReports', 32, '192.168.1.1'),
(1, 'LOGIN',  'Administrator logged in to review approvals',               'Users',             1, '192.168.1.1'),
(4, 'INSERT', 'Dispatch request submitted for Blankets — Peshawar',        'ApprovalRequests',  9, '192.168.1.31'),
(1, 'UPDATE', 'Approval request #9 approved by Administrator',             'ApprovalRequests',  9, '192.168.1.1'),
(2, 'INSERT', 'Emergency report submitted: Islamabad H-8 Earthquake',      'EmergencyReports', 33, '192.168.1.22'),
(3, 'UPDATE', 'Mission status updated to Completed — assignment #7',       'TeamAssignments',   7, '192.168.1.51'),
(1, 'UPDATE', 'Team Bravo Fire Squad status reset to Available',           'RescueTeams',       2, '192.168.1.1'),
(2, 'UPDATE', 'Team assigned to Rawalpindi Urban Fire report #34',         'TeamAssignments',  11, '192.168.1.22'),
(4, 'INSERT', 'Inventory dispatch request for Tents — Islamabad Store',    'ApprovalRequests', 10, '192.168.1.31'),
(5, 'INSERT', 'Donation recorded: Sindh Government — PKR 800000 Cash',     'Donations',         9, '192.168.1.41'),
(5, 'INSERT', 'Expense recorded: Procurement — PKR 250000 Peshawar',       'Expenses',          9, '192.168.1.41'),
(1, 'UPDATE', 'Approval #10 approved — Tent dispatch to G-11 flood zone',  'ApprovalRequests', 10, '192.168.1.1'),
(2, 'INSERT', 'Emergency report submitted: Peshawar Dalazak Flood',        'EmergencyReports', 35, '192.168.1.22'),
(3, 'UPDATE', 'Mission status updated to OnSite — Peshawar deployment',    'TeamAssignments',  12, '192.168.1.52'),
(4, 'UPDATE', 'Inventory adjusted after Tent allocation — Islamabad store', 'WarehouseInventory',12,'192.168.1.31'),
(1, 'LOGOUT', 'Administrator session ended',                               'Users',             1, '192.168.1.1'),
(2, 'INSERT', 'Emergency report submitted: Quetta Pashtunabad Earthquake', 'EmergencyReports', 36, '192.168.1.23'),
(5, 'INSERT', 'Donation recorded: KPK Government — PKR 600000 Pledge',     'Donations',        10, '192.168.1.42'),
(1, 'LOGIN',  'Administrator logged in for daily review',                  'Users',             1, '192.168.1.1'),
(4, 'INSERT', 'Dispatch request submitted for ORS Sachets — Quetta',       'ApprovalRequests', 11, '192.168.1.32'),
(1, 'UPDATE', 'Approval #11 approved — ORS dispatch to Quetta camp',       'ApprovalRequests', 11, '192.168.1.1'),
(5, 'INSERT', 'Expense recorded: Distribution — PKR 75000 Quetta',         'Expenses',         10, '192.168.1.42'),
(2, 'INSERT', 'Emergency report submitted: Multan Mumtazabad Flood',       'EmergencyReports', 37, '192.168.1.24'),
(3, 'UPDATE', 'Field report submitted — mission completion noted',          'TeamAssignments',  13, '192.168.1.53'),
(1, 'UPDATE', 'Emergency report #35 status updated to Resolved',           'EmergencyReports', 35, '192.168.1.1'),
(4, 'INSERT', 'Stock replenishment request submitted for Water Bottles',    'ApprovalRequests', 12, '192.168.1.33'),
(2, 'INSERT', 'Emergency report submitted: Karachi North Nazimabad Gas',   'EmergencyReports', 38, '192.168.1.25'),
(1, 'UPDATE', 'User role verified for Field Officer access',                'Users',             3, '192.168.1.1'),
(5, 'INSERT', 'Donation recorded: Welfare Trust — PKR 150000 Kind',        'Donations',        11, '192.168.1.43'),
(1, 'LOGOUT', 'Administrator session ended — daily review complete',       'Users',             1, '192.168.1.1'),
(2, 'INSERT', 'Emergency report submitted: Lahore Johar Town Flood',       'EmergencyReports', 39, '192.168.1.26'),
(4, 'INSERT', 'Dispatch request submitted for First Aid Kits — Lahore',    'ApprovalRequests', 13, '192.168.1.34'),
(1, 'LOGIN',  'Administrator logged in to process pending approvals',      'Users',             1, '192.168.1.1'),
(1, 'UPDATE', 'Batch approval: Requests #12 and #13 approved',             'ApprovalRequests', 13, '192.168.1.1'),
(5, 'INSERT', 'Expense recorded: Operations — PKR 95000 Lahore relief',    'Expenses',         11, '192.168.1.44'),
(3, 'UPDATE', 'Mission status updated: Multan team OnSite',                'TeamAssignments',  14, '192.168.1.54'),
(2, 'INSERT', 'Emergency report submitted: Islamabad G-6 Fire',            'EmergencyReports', 40, '192.168.1.27'),
(1, 'LOGOUT', 'Administrator session ended',                               'Users',             1, '192.168.1.1');
GO
-- Expected: 40 rows inserted → total AuditLogs ≈ 64 (24 existing + 40 new)

-- ============================================================
-- ADDITIONAL DONATIONS (4 rows — extends financial summary)
-- type must be 'Cash' | 'Kind' | 'Pledge'
-- approved_by = 5 (Finance Officer — Bilal Farooq)
-- ============================================================
INSERT INTO Donations (donor_name, amount, type, disaster_event, donated_at, approved_by)
VALUES
('Sindh Provincial Government', 800000.00, 'Pledge', 'Karachi Floods 2024',    '2024-09-05 10:00:00', 5),
('KPK Disaster Management',     600000.00, 'Cash',   'Peshawar Floods 2024',   '2024-09-08 11:30:00', 5),
('UNHCR Pakistan',              950000.00, 'Kind',   'Quetta Earthquake 2024', '2024-09-10 14:00:00', 5),
('Islamabad Chamber Commerce',  175000.00, 'Cash',   'Islamabad Relief 2024',  '2024-09-12 09:15:00', 5);
GO
-- Expected: 4 rows inserted → total Donations = 12
-- Trigger trg_AuditDonationInsert fires 4 times → 4 more AuditLog rows

-- ============================================================
-- ADDITIONAL EXPENSES (4 rows)
-- approved_by = 5 (Finance Officer)
-- ============================================================
INSERT INTO Expenses (category, amount, disaster_event, incurred_at, approved_by)
VALUES
('Procurement',  275000.00, 'Peshawar Floods 2024',   '2024-09-09 10:00:00', 5),
('Distribution',  95000.00, 'Quetta Earthquake 2024', '2024-09-11 13:00:00', 5),
('Operations',   115000.00, 'Karachi Floods 2024',    '2024-09-14 09:30:00', 5),
('Procurement',  320000.00, 'Islamabad Relief 2024',  '2024-09-13 11:00:00', 5);
GO
-- Expected: 4 rows inserted → total Expenses = 12
-- Trigger trg_AuditExpenseInsert fires 4 times → 4 more AuditLog rows

-- ============================================================
-- VERIFICATION — Row counts after additional inserts
-- ============================================================
SELECT 'EmergencyReports' AS TableName, COUNT(*) AS TotalRows FROM EmergencyReports
UNION ALL SELECT 'AuditLogs',   COUNT(*) FROM AuditLogs
UNION ALL SELECT 'Donations',   COUNT(*) FROM Donations
UNION ALL SELECT 'Expenses',    COUNT(*) FROM Expenses
UNION ALL SELECT 'StockAlerts', COUNT(*) FROM StockAlerts;
GO

-- ============================================================
-- EXPECTED OUTPUT (approximate — triggers add rows):
-- TableName        | RowCount
-- EmergencyReports |  80  (30 base + 50 new)
-- AuditLogs        |  72  (24 base + 40 manual + 4 donation + 4 expense triggers)
-- Donations        |  12  (8 base + 4 new)
-- Expenses         |  12  (8 base + 4 new)
-- StockAlerts      |   0  (no threshold crossed during seeding)
-- ============================================================

PRINT '=== FILE 7: Additional Data — inserted successfully. ===';
GO
