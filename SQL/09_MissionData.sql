-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 9: MISSION / TEAM ASSIGNMENT DATA
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- RUN AFTER: FILE 0 through FILE 5
-- PURPOSE  : Ensures Citizens, RescueTeams, EmergencyReports,
--            and TeamAssignments all have data so that
--            vw_TeamActivityHistory returns meaningful rows for
--            the Field Officer Mission Log page.
-- ============================================================
-- SAFE TO RE-RUN: Every insert block is guarded by IF NOT EXISTS
--                 on the first row of each table, so duplicate
--                 runs skip the inserts cleanly.
-- ============================================================

USE DisasterResponseMIS;
GO

-- ============================================================
-- STEP 1 — Ensure Citizens exist (needed as FK for reports)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Citizens WHERE citizen_id = 1)
BEGIN
    SET IDENTITY_INSERT Citizens ON;

    INSERT INTO Citizens (citizen_id, name, phone, address, email) VALUES
    (1,  'Ali Hassan',       '03001234567', 'Street 5, Lyari, Karachi',        'ali.hassan@gmail.com'),
    (2,  'Fatima Noor',      '03112345678', 'Block C, Model Town, Lahore',     'fatima.noor@yahoo.com'),
    (3,  'Usman Tariq',      '03221234567', 'Sector G-9, Islamabad',           'usman.tariq@hotmail.com'),
    (4,  'Ayesha Malik',     '03331234567', 'Phase 2, Hayatabad, Peshawar',    'ayesha.malik@gmail.com'),
    (5,  'Bilal Chaudhry',   '03441234567', 'Jinnah Town, Quetta',             'bilal.ch@yahoo.com'),
    (6,  'Zainab Ahmed',     '03551234567', 'Hussain Agahi, Multan',           'zainab.ahmed@gmail.com'),
    (7,  'Omar Farooq',      '03661234567', 'Satellite Town, Rawalpindi',      'omar.farooq@hotmail.com'),
    (8,  'Sana Riaz',        '03771234567', 'Garden East, Karachi',            'sana.riaz@gmail.com'),
    (9,  'Kamran Iqbal',     '03881234567', 'Gulberg III, Lahore',             'kamran.iqbal@yahoo.com'),
    (10, 'Nadia Hussain',    '03991234567', 'F-7/2, Islamabad',                'nadia.hussain@gmail.com');

    SET IDENTITY_INSERT Citizens OFF;
    PRINT 'Citizens inserted.';
END
ELSE
    PRINT 'Citizens already exist — skipping.';
GO

-- ============================================================
-- STEP 2 — Ensure RescueTeams exist
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM RescueTeams WHERE team_id = 1)
BEGIN
    SET IDENTITY_INSERT RescueTeams ON;

    INSERT INTO RescueTeams (team_id, team_name, team_type, current_location, status, equipment) VALUES
    (1, 'Alpha Medical Unit',     'Medical', 'Karachi Central',        'Available', 'Stretchers, Defibrillators, First Aid Kits'),
    (2, 'Bravo Fire Squad',       'Fire',    'Lahore Cantt',           'Available', 'Fire Hoses, Breathing Apparatus, Ladders'),
    (3, 'Charlie Rescue Alpha',   'Rescue',  'Islamabad Sector G-9',   'Available', 'Ropes, Harnesses, Cutting Tools'),
    (4, 'Delta Flood Response',   'Flood',   'Peshawar Valley',        'Available', 'Boats, Life Jackets, Water Pumps'),
    (5, 'Echo Medical Reserve',   'Medical', 'Quetta Central',         'Available', 'Mobile ICU, Blood Supply, Oxygen Tanks'),
    (6, 'Foxtrot Fire Control',   'Fire',    'Multan Industrial Zone', 'Available', 'Foam Extinguishers, Thermal Cameras, Drones'),
    (7, 'Golf Search & Rescue',   'Rescue',  'Rawalpindi Hills',       'Available', 'K-9 Units, Thermal Scanners, Excavation Tools'),
    (8, 'Hotel Hazmat Team',      'Hazmat',  'Karachi Port',           'Available', 'Chemical Suits, Gas Detectors, Decontamination Units');

    SET IDENTITY_INSERT RescueTeams OFF;
    PRINT 'RescueTeams inserted.';
END
ELSE
    PRINT 'RescueTeams already exist — skipping.';
GO

-- ============================================================
-- STEP 3 — Ensure EmergencyReports exist (FK target for assignments)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM EmergencyReports WHERE report_id = 1)
BEGIN
    SET IDENTITY_INSERT EmergencyReports ON;

    INSERT INTO EmergencyReports (report_id, citizen_id, location, disaster_type, severity, report_time, status) VALUES
    (1,  1,  'Karachi, Lyari',              'Flood',          'High',   '2024-07-15 06:30:00', 'Dispatched'),
    (2,  2,  'Lahore, Gulberg',             'Fire',           'Medium', '2024-07-15 09:15:00', 'Pending'),
    (3,  3,  'Islamabad, F-7',             'Earthquake',     'High',   '2024-07-16 03:00:00', 'Dispatched'),
    (4,  4,  'Peshawar, Hayatabad',         'Fire',           'High',   '2024-07-16 14:00:00', 'Dispatched'),
    (5,  5,  'Quetta, Satellite Town',      'Earthquake',     'Medium', '2024-07-17 11:30:00', 'Pending'),
    (6,  6,  'Multan, Hussain Agahi',       'Flood',          'High',   '2024-07-17 21:00:00', 'Dispatched'),
    (7,  7,  'Rawalpindi, Saddar',          'Fire',           'Low',    '2024-07-18 10:00:00', 'Resolved'),
    (8,  8,  'Karachi, Korangi',            'Industrial Leak','High',   '2024-07-19 08:45:00', 'Pending'),
    (9,  9,  'Lahore, Shalimar',            'Flood',          'Medium', '2024-07-20 16:00:00', 'Resolved'),
    (10, 10, 'Islamabad, G-10',             'Fire',           'Low',    '2024-07-21 13:20:00', 'Resolved'),
    (11, 1,  'Peshawar, Old City',          'Flood',          'High',   '2024-08-01 05:00:00', 'Dispatched'),
    (12, 2,  'Karachi, SITE Area',          'Fire',           'High',   '2024-08-01 07:30:00', 'Resolved'),
    (13, 3,  'Lahore, Township',            'Earthquake',     'Medium', '2024-08-02 10:00:00', 'Pending'),
    (14, 4,  'Quetta, Brewery Road',        'Flood',          'High',   '2024-08-02 18:00:00', 'Dispatched'),
    (15, 5,  'Multan, New Multan',          'Fire',           'Medium', '2024-08-03 10:00:00', 'Dispatched'),
    (16, 6,  'Karachi, Malir',              'Flood',          'High',   '2024-08-05 04:00:00', 'Pending'),
    (17, 7,  'Islamabad, E-7',             'Fire',           'Low',    '2024-08-06 15:30:00', 'Resolved'),
    (18, 8,  'Lahore, DHA Phase 6',         'Fire',           'Medium', '2024-08-04 15:00:00', 'Dispatched'),
    (19, 9,  'Rawalpindi, Chaklala',        'Earthquake',     'High',   '2024-08-07 02:15:00', 'Pending'),
    (20, 10, 'Karachi, Orangi Town',        'Flood',          'High',   '2024-08-08 07:00:00', 'Pending');

    SET IDENTITY_INSERT EmergencyReports OFF;
    PRINT 'EmergencyReports inserted.';
END
ELSE
    PRINT 'EmergencyReports already exist — skipping.';
GO

-- ============================================================
-- STEP 4 — Ensure TeamAssignments exist
--          Includes completed missions (with duration) and
--          active missions (EnRoute / OnSite / Assigned)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM TeamAssignments WHERE assignment_id = 1)
BEGIN
    SET IDENTITY_INSERT TeamAssignments ON;

    -- Completed missions (historical, with resolved timestamps)
    INSERT INTO TeamAssignments (assignment_id, report_id, team_id, assigned_at, completed_at, status) VALUES
    (1,  3,  3, '2024-07-16 04:30:00', '2024-07-16 14:00:00', 'Completed'),   -- Charlie: Islamabad Earthquake ✓
    (2,  7,  2, '2024-07-18 12:00:00', '2024-07-18 18:00:00', 'Completed'),   -- Bravo:   Rawalpindi Fire ✓
    (3,  12, 3, '2024-08-01 08:30:00', '2024-08-01 16:00:00', 'Completed'),   -- Charlie: Karachi SITE Fire ✓
    (4,  14, 5, '2024-08-02 19:00:00', '2024-08-03 08:00:00', 'Completed'),   -- Echo:    Quetta Flood ✓
    (5,  18, 6, '2024-08-04 16:00:00', '2024-08-04 22:00:00', 'Completed'),   -- Foxtrot: Lahore DHA Fire ✓
    (6,  9,  2, '2024-07-20 16:30:00', '2024-07-21 02:00:00', 'Completed'),   -- Bravo:   Lahore Shalimar Flood ✓
    (7,  10, 1, '2024-07-21 14:00:00', '2024-07-21 19:30:00', 'Completed'),   -- Alpha:   Islamabad G-10 Fire ✓
    (8,  17, 2, '2024-08-06 16:00:00', '2024-08-06 20:45:00', 'Completed'),   -- Bravo:   Islamabad E-7 Fire ✓

    -- Active missions (no completed_at → duration calculated from GETDATE())
    (9,  1,  1, '2024-07-15 07:00:00', NULL, 'OnSite'),    -- Alpha:   Karachi Lyari Flood — on site
    (10, 4,  2, '2024-07-16 15:00:00', NULL, 'OnSite'),    -- Bravo:   Peshawar Hayatabad Fire — on site
    (11, 6,  5, '2024-07-17 22:00:00', NULL, 'OnSite'),    -- Echo:    Multan Flood — on site
    (12, 11, 4, '2024-08-01 06:00:00', NULL, 'OnSite'),    -- Delta:   Peshawar Old City Flood — on site
    (13, 15, 6, '2024-08-03 11:30:00', NULL, 'EnRoute'),   -- Foxtrot: Multan New Multan Fire — en route
    (14, 16, 4, '2024-08-05 05:00:00', NULL, 'Assigned'),  -- Delta:   Karachi Malir Flood — assigned
    (15, 19, 7, '2024-08-07 03:00:00', NULL, 'EnRoute'),   -- Golf:    Rawalpindi Earthquake — en route
    (16, 20, 1, '2024-08-08 08:00:00', NULL, 'OnSite'),    -- Alpha:   Karachi Orangi Flood — on site
    (17, 8,  8, '2024-07-19 09:30:00', NULL, 'OnSite');    -- Hotel:   Karachi Korangi Leak — on site

    SET IDENTITY_INSERT TeamAssignments OFF;
    PRINT 'TeamAssignments inserted (8 completed + 9 active).';
END
ELSE
    PRINT 'TeamAssignments already exist — skipping.';
GO

-- ============================================================
-- STEP 5 — Verify vw_TeamActivityHistory
-- ============================================================
SELECT
    team_name,
    disaster_type,
    emergency_location,
    severity,
    mission_status,
    assigned_at,
    completed_at,
    mission_duration_minutes
FROM vw_TeamActivityHistory
ORDER BY
    CASE mission_status
        WHEN 'OnSite'    THEN 1
        WHEN 'EnRoute'   THEN 2
        WHEN 'Assigned'  THEN 3
        WHEN 'Completed' THEN 4
        ELSE 5
    END,
    assigned_at DESC;
GO

PRINT '=== FILE 9: Mission Data — complete. ===';
GO
