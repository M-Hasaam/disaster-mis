-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 2: VIEWS — LOGICAL ABSTRACTION & ROLE-BASED SECURITY
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- RUN AFTER: FILE0_DDL_CreateTables.sql, FILE1_Triggers.sql
-- ============================================================

USE DisasterResponseMIS;
GO

-- ============================================================
-- VIEW 1: vw_ActiveEmergencies
-- Purpose : Real-time feed of active (Pending / Dispatched) emergency
--           reports, enriched with citizen contact info and the
--           currently assigned rescue team.
-- Used by : Emergency Operator, Administrator
-- Security: Exposes citizen name + phone ONLY — address & email hidden.
--           Resolved / Cancelled reports excluded.
-- ============================================================
CREATE OR ALTER VIEW vw_ActiveEmergencies
AS
SELECT
    er.report_id,
    c.name          AS citizen_name,
    c.phone         AS citizen_phone,     -- address & email intentionally omitted
    er.location,
    er.disaster_type,
    er.severity,
    er.report_time,
    er.status       AS report_status,
    rt.team_name    AS assigned_team,
    rt.team_type,
    ta.status       AS mission_status,
    ta.assigned_at
FROM EmergencyReports er
INNER JOIN Citizens       c  ON er.citizen_id  = c.citizen_id
LEFT  JOIN TeamAssignments ta ON er.report_id   = ta.report_id
                              AND ta.status NOT IN ('Completed', 'Cancelled')
LEFT  JOIN RescueTeams    rt ON ta.team_id      = rt.team_id
WHERE er.status IN ('Pending', 'Dispatched');
GO

-- ============================================================
-- VIEW 2: vw_WarehouseStockSummary
-- Purpose : Full inventory snapshot with automatic stock-level
--           classification (OK / MEDIUM / LOW).
-- Used by : Warehouse Manager, Administrator
-- Security: No financial or user data exposed.
-- ============================================================
CREATE OR ALTER VIEW vw_WarehouseStockSummary
AS
SELECT
    wi.inventory_id,
    r.resource_name,
    r.category,
    r.unit,
    w.name          AS warehouse_name,
    w.location      AS warehouse_location,
    wi.quantity,
    wi.min_threshold,
    wi.last_updated,
    CASE
        WHEN wi.quantity < wi.min_threshold         THEN 'LOW'
        WHEN wi.quantity < wi.min_threshold * 2     THEN 'MEDIUM'
        ELSE                                             'OK'
    END             AS stock_status
FROM WarehouseInventory wi
INNER JOIN Resources  r ON wi.resource_id  = r.resource_id
INNER JOIN Warehouses w ON wi.warehouse_id = w.warehouse_id;
GO

-- ============================================================
-- VIEW 3: vw_FinancialSummaryByDisaster
-- Purpose : Aggregated donations vs expenses per disaster event,
--           with net balance calculated.
-- Used by : Finance Officer, Administrator
-- Security: Shows ONLY aggregated totals. Individual donor names,
--           amounts, and transaction IDs are completely hidden —
--           principle of least privilege applied.
-- ============================================================
CREATE OR ALTER VIEW vw_FinancialSummaryByDisaster
AS
SELECT
    COALESCE(d.disaster_event, e.disaster_event)                    AS disaster_event,
    ISNULL(SUM(d.amount), 0)                                        AS total_donations,
    ISNULL(SUM(e.amount), 0)                                        AS total_expenses,
    ISNULL(SUM(d.amount), 0) - ISNULL(SUM(e.amount), 0)            AS net_balance
FROM Donations d
FULL OUTER JOIN Expenses e ON d.disaster_event = e.disaster_event
GROUP BY COALESCE(d.disaster_event, e.disaster_event);
GO

-- ============================================================
-- VIEW 4: vw_HospitalCapacity
-- Purpose : Real-time hospital bed availability to support patient
--           routing decisions during emergencies.
-- Used by : Emergency Operator, Administrator
-- Security: Shows aggregated patient COUNT only — individual patient
--           identity is not exposed (medical privacy compliance).
-- ============================================================
CREATE OR ALTER VIEW vw_HospitalCapacity
AS
SELECT
    h.hospital_id,
    h.name          AS hospital_name,
    h.location,
    h.total_beds,
    h.specialty,
    COUNT(p.patient_id)                         AS current_patients,
    h.total_beds - COUNT(p.patient_id)          AS beds_available,
    CASE
        WHEN h.total_beds - COUNT(p.patient_id) <  5  THEN 'CRITICAL'
        WHEN h.total_beds - COUNT(p.patient_id) < 20  THEN 'LIMITED'
        ELSE                                               'AVAILABLE'
    END                                         AS capacity_status
FROM Hospitals h
LEFT JOIN Patients p ON h.hospital_id = p.hospital_id
                     AND p.status = 'Admitted'
GROUP BY h.hospital_id, h.name, h.location, h.total_beds, h.specialty;
GO

-- ============================================================
-- VIEW 5: vw_TeamActivityHistory
-- Purpose : Complete mission history per rescue team, including
--           calculated duration in minutes.
-- Used by : Field Officer (filtered to own team at app layer),
--           Administrator
-- Security: No citizen PII (name, phone, address) exposed.
-- ============================================================
CREATE OR ALTER VIEW vw_TeamActivityHistory
AS
SELECT
    rt.team_id,
    rt.team_name,
    rt.team_type,
    er.report_id,
    er.location         AS emergency_location,
    er.disaster_type,
    er.severity,
    ta.assigned_at,
    ta.completed_at,
    ta.status           AS mission_status,
    DATEDIFF(MINUTE,
        ta.assigned_at,
        CASE WHEN ta.completed_at IS NOT NULL
             THEN ta.completed_at
             ELSE GETDATE()
        END)            AS mission_duration_minutes
FROM RescueTeams    rt
INNER JOIN TeamAssignments  ta ON rt.team_id   = ta.team_id
INNER JOIN EmergencyReports er ON ta.report_id = er.report_id;
GO

-- ============================================================
-- VERIFY ALL VIEWS
-- ============================================================
SELECT
    TABLE_NAME   AS ViewName,
    TABLE_SCHEMA AS SchemaName
FROM INFORMATION_SCHEMA.VIEWS
WHERE TABLE_NAME LIKE 'vw_%'
ORDER BY TABLE_NAME;
GO

-- ============================================================
-- ROLE-TO-VIEW MAPPING (reference)
-- Role                | Views Accessible
-- Administrator       | All 5 views
-- Emergency Operator  | vw_ActiveEmergencies, vw_HospitalCapacity
-- Field Officer       | vw_TeamActivityHistory (own team only at app layer)
-- Warehouse Manager   | vw_WarehouseStockSummary
-- Finance Officer     | vw_FinancialSummaryByDisaster
-- ============================================================

PRINT '=== FILE 2: Views — 5 views created successfully. ===';
GO