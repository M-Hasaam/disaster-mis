-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 8: HOSPITAL & PATIENT BULK DATA
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- RUN AFTER: FILE 0 through FILE 3
-- PURPOSE  : Ensures hospital rows exist, then bulk-inserts
--            patients so vw_HospitalCapacity shows meaningful
--            CRITICAL / LIMITED / AVAILABLE statuses for the demo.
-- ============================================================
-- SAFE TO RE-RUN: Hospital insert is guarded by IF NOT EXISTS.
--                 Patient bulk inserts check current counts first
--                 so duplicate runs only add missing rows.
-- ============================================================

USE DisasterResponseMIS;
GO

-- ============================================================
-- STEP 1 — Ensure all 6 hospitals exist
--          (FILE 3 should have inserted them; this is a safety net)
-- ============================================================
IF NOT EXISTS (SELECT 1 FROM Hospitals WHERE hospital_id = 1)
BEGIN
    SET IDENTITY_INSERT Hospitals ON;

    INSERT INTO Hospitals (hospital_id, name, location, total_beds, specialty) VALUES
    (1, 'Karachi Civil Hospital',   'Karachi, Sindh',      500, 'General, Trauma, Burns'),
    (2, 'Services Hospital Lahore', 'Lahore, Punjab',       400, 'General, Orthopedics, Neurology'),
    (3, 'PIMS Hospital',            'Islamabad, ICT',       350, 'General, Cardiology, Emergency'),
    (4, 'Lady Reading Hospital',    'Peshawar, KPK',        450, 'General, Pediatrics, Surgery'),
    (5, 'Bolan Medical Complex',    'Quetta, Balochistan',  250, 'General, Emergency, Trauma'),
    (6, 'Nishtar Hospital',         'Multan, Punjab',       380, 'General, Nephrology, Cardiology');

    SET IDENTITY_INSERT Hospitals OFF;
    PRINT 'Hospitals inserted.';
END
ELSE
    PRINT 'Hospitals already exist — skipping hospital inserts.';
GO

-- ============================================================
-- STEP 2 — Bulk insert patients using WHILE loops
--
-- vw_HospitalCapacity capacity_status logic:
--   CRITICAL : beds_available  < 5
--   LIMITED  : beds_available  < 20
--   AVAILABLE: beds_available >= 20
--
-- Target distribution (dramatic for demo):
--   Hospital 5 – Bolan   (250 beds) → 246 admitted  → 4 avail  → CRITICAL
--   Hospital 3 – PIMS    (350 beds) → 332 admitted  → 18 avail → LIMITED
--   Hospital 1 – Karachi (500 beds) → ~80 admitted  → AVAILABLE
--   Hospital 2 – Lahore  (400 beds) → ~65 admitted  → AVAILABLE
--   Hospital 4 – Lady R  (450 beds) → ~60 admitted  → AVAILABLE
--   Hospital 6 – Nishtar (380 beds) → ~55 admitted  → AVAILABLE
--
-- IDENTITY on Patients is not set, so rows get natural IDs.
-- ============================================================

-- ── Hospital 5: Bolan Medical Complex → CRITICAL ──────────────────────────
-- Target: 246 total Admitted (deduct already-existing admitted rows)
DECLARE @existingBolan INT = (
    SELECT COUNT(*) FROM Patients WHERE hospital_id = 5 AND status = 'Admitted'
);
DECLARE @needBolan INT = 246 - @existingBolan;
DECLARE @i INT = 0;

WHILE @i < @needBolan
BEGIN
    INSERT INTO Patients (hospital_id, report_id, name, admitted_at, status)
    VALUES (
        5, NULL,
        CONCAT('Bolan Patient ', @i + 1),
        DATEADD(minute, @i * 3, '2024-09-01 00:00:00'),
        'Admitted'
    );
    SET @i = @i + 1;
END;
PRINT CONCAT('Bolan Medical: added ', @needBolan, ' patients → CRITICAL status.');
GO

-- ── Hospital 3: PIMS Hospital → LIMITED ───────────────────────────────────
DECLARE @existingPIMS INT = (
    SELECT COUNT(*) FROM Patients WHERE hospital_id = 3 AND status = 'Admitted'
);
DECLARE @needPIMS INT = 332 - @existingPIMS;
DECLARE @j INT = 0;

WHILE @j < @needPIMS
BEGIN
    INSERT INTO Patients (hospital_id, report_id, name, admitted_at, status)
    VALUES (
        3, NULL,
        CONCAT('PIMS Patient ', @j + 1),
        DATEADD(minute, @j * 2, '2024-09-01 00:00:00'),
        'Admitted'
    );
    SET @j = @j + 1;
END;
PRINT CONCAT('PIMS Hospital: added ', @needPIMS, ' patients → LIMITED status.');
GO

-- ── Hospital 1: Karachi Civil Hospital → AVAILABLE (80 admitted) ──────────
DECLARE @existingKarachi INT = (
    SELECT COUNT(*) FROM Patients WHERE hospital_id = 1 AND status = 'Admitted'
);
DECLARE @needKarachi INT = 80 - @existingKarachi;
DECLARE @k INT = 0;

WHILE @k < @needKarachi
BEGIN
    INSERT INTO Patients (hospital_id, report_id, name, admitted_at, status)
    VALUES (
        1, NULL,
        CONCAT('KCH Patient ', @k + 1),
        DATEADD(minute, @k * 4, '2024-09-02 06:00:00'),
        'Admitted'
    );
    SET @k = @k + 1;
END;
PRINT CONCAT('Karachi Civil: added ', @needKarachi, ' patients → AVAILABLE status.');
GO

-- ── Hospital 2: Services Hospital Lahore → AVAILABLE (65 admitted) ────────
DECLARE @existingLahore INT = (
    SELECT COUNT(*) FROM Patients WHERE hospital_id = 2 AND status = 'Admitted'
);
DECLARE @needLahore INT = 65 - @existingLahore;
DECLARE @l INT = 0;

WHILE @l < @needLahore
BEGIN
    INSERT INTO Patients (hospital_id, report_id, name, admitted_at, status)
    VALUES (
        2, NULL,
        CONCAT('SHL Patient ', @l + 1),
        DATEADD(minute, @l * 5, '2024-09-02 08:00:00'),
        'Admitted'
    );
    SET @l = @l + 1;
END;
PRINT CONCAT('Services Lahore: added ', @needLahore, ' patients → AVAILABLE status.');
GO

-- ── Hospital 4: Lady Reading Hospital → AVAILABLE (60 admitted) ───────────
DECLARE @existingLRH INT = (
    SELECT COUNT(*) FROM Patients WHERE hospital_id = 4 AND status = 'Admitted'
);
DECLARE @needLRH INT = 60 - @existingLRH;
DECLARE @m INT = 0;

WHILE @m < @needLRH
BEGIN
    INSERT INTO Patients (hospital_id, report_id, name, admitted_at, status)
    VALUES (
        4, NULL,
        CONCAT('LRH Patient ', @m + 1),
        DATEADD(minute, @m * 4, '2024-09-03 07:00:00'),
        'Admitted'
    );
    SET @m = @m + 1;
END;
PRINT CONCAT('Lady Reading: added ', @needLRH, ' patients → AVAILABLE status.');
GO

-- ── Hospital 6: Nishtar Hospital → AVAILABLE (55 admitted) ───────────────
DECLARE @existingNishtar INT = (
    SELECT COUNT(*) FROM Patients WHERE hospital_id = 6 AND status = 'Admitted'
);
DECLARE @needNishtar INT = 55 - @existingNishtar;
DECLARE @n INT = 0;

WHILE @n < @needNishtar
BEGIN
    INSERT INTO Patients (hospital_id, report_id, name, admitted_at, status)
    VALUES (
        6, NULL,
        CONCAT('Nishtar Patient ', @n + 1),
        DATEADD(minute, @n * 5, '2024-09-03 09:00:00'),
        'Admitted'
    );
    SET @n = @n + 1;
END;
PRINT CONCAT('Nishtar Hospital: added ', @needNishtar, ' patients → AVAILABLE status.');
GO

-- ============================================================
-- STEP 3 — Verify vw_HospitalCapacity output
-- ============================================================
SELECT
    hospital_name,
    total_beds,
    current_patients,
    beds_available,
    capacity_status
FROM vw_HospitalCapacity
ORDER BY
    CASE capacity_status
        WHEN 'CRITICAL'  THEN 1
        WHEN 'LIMITED'   THEN 2
        ELSE 3
    END,
    hospital_name;
GO

-- ============================================================
-- EXPECTED OUTPUT:
-- hospital_name              | total_beds | current_patients | beds_available | capacity_status
-- Bolan Medical Complex      |        250 |              246 |              4 | CRITICAL
-- PIMS Hospital              |        350 |              332 |             18 | LIMITED
-- Karachi Civil Hospital     |        500 |               80 |            420 | AVAILABLE
-- Lady Reading Hospital      |        450 |               60 |            390 | AVAILABLE
-- Nishtar Hospital           |        380 |               55 |            325 | AVAILABLE
-- Services Hospital Lahore   |        400 |               65 |            335 | AVAILABLE
-- ============================================================

PRINT '=== FILE 8: Hospital & Patient Data — complete. ===';
GO
