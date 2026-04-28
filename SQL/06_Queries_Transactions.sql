-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 4: CORE QUERIES + TRANSACTIONS + APPROVAL WORKFLOW
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- RUN AFTER: FILE0-FILE3 in order.
-- ============================================================

USE DisasterResponseMIS;
GO

-- ============================================================
-- ============================================================
-- PART A: CORE SELECT QUERIES (A through G)
-- ============================================================
-- ============================================================

-- ============================================================
-- Query A: High-severity emergency reports in a specific city
-- Use case: Emergency Operator dashboard — active High alerts in Karachi
-- Expected: Reports from Karachi with severity='High' ordered newest first
-- ============================================================
PRINT '=== Query A: High-Severity Reports in Karachi ===';
SELECT
    er.report_id,
    c.name           AS citizen_name,
    c.phone          AS citizen_phone,
    er.location,
    er.disaster_type,
    er.severity,
    er.report_time,
    er.status
FROM EmergencyReports er
INNER JOIN Citizens c ON er.citizen_id = c.citizen_id
WHERE er.location LIKE '%Karachi%'
  AND er.severity  = 'High'
ORDER BY er.report_time DESC;
GO
-- EXPECTED OUTPUT (4 rows):
-- report_id | citizen_name  | location              | disaster_type | severity | status
-- 21        | Ali Hassan    | Karachi, Malir        | Flood         | High     | Pending
-- 11        | Ali Hassan    | Karachi, Orangi Town  | Flood         | High     | Dispatched
-- 8         | Iqra Siddiqui | Karachi, SITE Area    | Urban Fire    | High     | Pending
-- 1         | Ali Hassan    | Karachi, Lyari        | Flood         | High     | Dispatched

-- ============================================================
-- Query B: Resources below minimum stock threshold
-- Use case: Warehouse Manager — what needs restocking urgently
-- Expected: Items where current quantity < min_threshold, worst shortage first
-- ============================================================
PRINT '=== Query B: Resources Below Stock Threshold ===';
SELECT
    r.resource_name,
    r.category,
    r.unit,
    w.name                             AS warehouse_name,
    w.location                         AS warehouse_location,
    wi.quantity                        AS current_stock,
    wi.min_threshold,
    (wi.min_threshold - wi.quantity)   AS shortage_amount
FROM WarehouseInventory wi
INNER JOIN Resources  r ON wi.resource_id  = r.resource_id
INNER JOIN Warehouses w ON wi.warehouse_id = w.warehouse_id
WHERE wi.quantity < wi.min_threshold
ORDER BY shortage_amount DESC;
GO
-- EXPECTED OUTPUT (after DML inserts, before transactions):
-- After trigger T1 reduced inventory, check which items fell below threshold.
-- e.g. Lahore WH Rice Bags: 180-50 = 130 (still above threshold 30) → no row
-- Quetta WH ORS Sachets: 200-50 = 150 (above threshold 40) → no row
-- Lahore WH Paracetamol: 500 quantity vs 60 threshold → no row
-- NOTE: After Transaction 4 dispatches 30 Tents from Islamabad (qty=35-30=5 vs threshold=10)
--       that row WILL appear here. Run Query B again after transactions to see it.

-- ============================================================
-- Query C: Full mission history of a specific rescue team
-- Use case: Field Officer / Admin — track team performance over time
-- Change team_id value to inspect a different team
-- ============================================================
PRINT '=== Query C: Mission History for Team 3 (Charlie Rescue Alpha) ===';
SELECT
    rt.team_name,
    rt.team_type,
    rt.status                          AS current_team_status,
    er.report_id,
    er.location                        AS emergency_location,
    er.disaster_type,
    er.severity,
    ta.assigned_at,
    ta.completed_at,
    ta.status                          AS mission_status,
    DATEDIFF(MINUTE, ta.assigned_at,
        CASE
            WHEN ta.completed_at IS NOT NULL THEN ta.completed_at
            ELSE SYSDATETIME()
        END)                           AS duration_minutes
FROM RescueTeams    rt
INNER JOIN TeamAssignments  ta ON rt.team_id   = ta.team_id
INNER JOIN EmergencyReports er ON ta.report_id = er.report_id
WHERE rt.team_id = 3
ORDER BY ta.assigned_at DESC;
GO
-- EXPECTED OUTPUT (2 rows for Charlie Rescue Alpha):
-- team_name            | emergency_location    | mission_status | duration_minutes
-- Charlie Rescue Alpha | Lahore, Shahdara      | Completed      | 450
-- Charlie Rescue Alpha | Islamabad, Margalla   | Completed      | 570
-- current_team_status = Available (both missions completed)

-- ============================================================
-- Query D: Financial summary per disaster event
-- Use case: Finance Officer / Admin — surplus or deficit per event
-- ============================================================
PRINT '=== Query D: Financial Summary by Disaster Event ===';
SELECT
    COALESCE(d.disaster_event, e.disaster_event)         AS disaster_event,
    ISNULL(SUM(d.amount), 0)                             AS total_donations,
    ISNULL(SUM(e.amount), 0)                             AS total_expenses,
    ISNULL(SUM(d.amount), 0) - ISNULL(SUM(e.amount), 0) AS net_balance,
    CASE
        WHEN ISNULL(SUM(d.amount), 0) - ISNULL(SUM(e.amount), 0) >= 0
        THEN 'SURPLUS'
        ELSE 'DEFICIT'
    END                                                  AS financial_status
FROM Donations d
FULL OUTER JOIN Expenses e ON d.disaster_event = e.disaster_event
GROUP BY COALESCE(d.disaster_event, e.disaster_event)
ORDER BY net_balance DESC;
GO
-- EXPECTED OUTPUT (4 events):
-- disaster_event          | total_donations | total_expenses | net_balance  | financial_status
-- Lahore Floods 2024      | 1700000.00      | 350000.00      | 1350000.00   | SURPLUS
-- Quetta Earthquake 2024  | 1030000.00      | 530000.00      | 500000.00    | SURPLUS
-- Karachi Floods 2024     | 950000.00       | 470000.00      | 480000.00    | SURPLUS
-- Peshawar Floods 2024    | 420000.00       | 270000.00      | 150000.00    | SURPLUS

-- ============================================================
-- Query E: All pending approval requests with requester details
-- Use case: Admin / approver — see what needs a decision
-- ============================================================
PRINT '=== Query E: Pending Approval Requests ===';
SELECT
    ar.request_id,
    u.name                             AS requested_by_name,
    u.email                            AS requester_email,
    r.role_name                        AS requester_role,
    ar.request_type,
    ar.details,
    ar.status,
    ar.created_at,
    DATEDIFF(HOUR, ar.created_at, SYSDATETIME()) AS pending_since_hours
FROM ApprovalRequests ar
INNER JOIN Users u ON ar.requested_by = u.user_id
INNER JOIN Roles r ON u.role_id       = r.role_id
WHERE ar.status = 'Pending'
ORDER BY ar.created_at ASC;
GO
-- EXPECTED OUTPUT (3 rows initially — request_ids 3, 6, 8):
-- request_id | requested_by_name | requester_role    | request_type      | status
-- 3          | Ayesha Siddiqui   | Warehouse Manager | ResourceDispatch  | Pending
-- 6          | Operator User     | Emergency Operator| TeamDeployment    | Pending
-- 8          | Bilal Farooq      | Finance Officer   | FinancialApproval | Pending

-- ============================================================
-- Query F: Hospitals sorted by available beds (most available first)
-- Use case: Emergency Operator — where to send patients
-- ============================================================
PRINT '=== Query F: Hospital Capacity Report ===';
SELECT
    h.hospital_id,
    h.name                             AS hospital_name,
    h.location,
    h.specialty,
    h.total_beds,
    COUNT(p.patient_id)                AS current_patients,
    h.total_beds - COUNT(p.patient_id) AS beds_available,
    CASE
        WHEN h.total_beds - COUNT(p.patient_id) <  5 THEN 'CRITICAL'
        WHEN h.total_beds - COUNT(p.patient_id) < 20 THEN 'LIMITED'
        ELSE 'AVAILABLE'
    END                                AS capacity_status
FROM Hospitals h
LEFT JOIN Patients p ON h.hospital_id = p.hospital_id
                     AND p.status = 'Admitted'
GROUP BY
    h.hospital_id, h.name, h.location,
    h.specialty,   h.total_beds
ORDER BY beds_available DESC;
GO
-- EXPECTED OUTPUT (6 rows):
-- hospital_name            | total_beds | current_patients | beds_available | capacity_status
-- Nishtar Hospital         | 380        | 1                | 379            | AVAILABLE
-- Lady Reading Hospital    | 450        | 2                | 448            | AVAILABLE
-- Services Hospital Lahore | 400        | 0                | 400            | AVAILABLE  (discharged only)
-- Bolan Medical Complex    | 250        | 2                | 248            | AVAILABLE
-- PIMS Hospital            | 350        | 2                | 348            | AVAILABLE
-- Karachi Civil Hospital   | 500        | 3                | 497            | AVAILABLE

-- ============================================================
-- Query G: Full audit trail for a specific user
-- Use case: Admin compliance review — complete action log
-- Change user_id value to inspect a different user
-- ============================================================
PRINT '=== Query G: Audit Trail for User #1 (Administrator) ===';
SELECT
    al.log_id,
    al.action_type,
    al.description,
    al.table_affected,
    al.record_id,
    al.timestamp,
    al.ip_address
FROM AuditLogs al
WHERE al.user_id = 1
ORDER BY al.timestamp DESC;
GO
-- EXPECTED OUTPUT (4 rows from manual inserts — trigger rows have user_id=1 as default):
-- log_id | action_type | description                              | table_affected
-- 8      | LOGOUT      | Administrator session ended              | Users
-- 5      | UPDATE      | Team Alpha Medical assigned...           | TeamAssignments
-- 4      | UPDATE      | Approval request #1 approved...          | ApprovalRequests
-- 1      | LOGIN       | Administrator logged in to system        | Users
-- (Plus trigger-generated rows from donations/expenses using default user_id=1)

-- ============================================================
-- BONUS Query H: MIS Disaster Incident Report by Type
-- Use case: MIS reporting — incidents grouped by disaster type
-- ============================================================
PRINT '=== Query H: MIS Incident Report by Disaster Type ===';
SELECT
    er.disaster_type,
    COUNT(*)                                                AS total_incidents,
    SUM(CASE WHEN er.severity = 'High'   THEN 1 ELSE 0 END) AS high_severity,
    SUM(CASE WHEN er.severity = 'Medium' THEN 1 ELSE 0 END) AS medium_severity,
    SUM(CASE WHEN er.severity = 'Low'    THEN 1 ELSE 0 END) AS low_severity,
    SUM(CASE WHEN er.status = 'Resolved' THEN 1 ELSE 0 END) AS resolved,
    SUM(CASE WHEN er.status IN ('Pending','Dispatched') THEN 1 ELSE 0 END) AS active
FROM EmergencyReports er
GROUP BY er.disaster_type
ORDER BY total_incidents DESC;
GO
-- EXPECTED OUTPUT (4 disaster types):
-- disaster_type | total | high | medium | low | resolved | active
-- Flood         | 15    | 9    | 4      | 2   | 3        | 12
-- Urban Fire    | 9     | 3    | 4      | 2   | 4        | 5
-- Earthquake    | 4     | 2    | 1      | 1   | 1        | 3
-- Gas Explosion | 3     | 1    | 0      | 2   | 0        | 3
-- (approximately — check your own data)

-- ============================================================
-- BONUS Query I: Resource Allocation History with Stock Impact
-- Use case: Administrator — full dispatch history and inventory impact
-- ============================================================
PRINT '=== Query I: Resource Allocation History ===';
SELECT
    ra.allocation_id,
    ar.request_type,
    r.resource_name,
    w.name                   AS warehouse_name,
    ra.quantity_dispatched,
    ra.destination,
    ra.allocated_at,
    wi.quantity              AS stock_remaining,
    ar.status                AS approval_status
FROM ResourceAllocations ra
INNER JOIN WarehouseInventory wi ON ra.inventory_id  = wi.inventory_id
INNER JOIN Resources          r  ON wi.resource_id   = r.resource_id
INNER JOIN Warehouses         w  ON wi.warehouse_id  = w.warehouse_id
LEFT  JOIN ApprovalRequests   ar ON ra.request_id    = ar.request_id
ORDER BY ra.allocated_at;
GO
-- EXPECTED OUTPUT (4 rows + additional after transactions run):
-- allocation_id | resource_name       | warehouse     | qty_dispatched | stock_remaining
-- 1             | Water Bottles (1L)  | Karachi WH    | 100            | 400
-- 3             | First Aid Kit       | Peshawar Hub  | 30             | 50
-- 4             | ORS Sachets         | Quetta Depot  | 50             | 150
-- 2             | Rice Bags (10kg)    | Lahore Depot  | 50             | 130

-- ============================================================
-- ============================================================
-- PART B: TRANSACTION HANDLING (4 Transactions + Rollback Tests)
-- Pattern: BEGIN TRANSACTION → steps → COMMIT (success path)
--          BEGIN TRANSACTION → step fails → ROLLBACK (failure test)
-- ACID:
--   Atomicity   — T1: allocation + inventory as single unit
--   Consistency — T2: team must be Available before assignment
--   Durability  — T3: committed financial record persists
--   Isolation   — T4: UPDLOCK prevents concurrent double-approval
-- ============================================================
-- ============================================================

-- ============================================================
-- TRANSACTION 1: Resource Allocation with Inventory Update (ATOMICITY)
-- Allocates Rice Bags from Karachi Warehouse to a relief point.
-- Trigger T1 fires automatically to reduce inventory.
-- ============================================================
PRINT '=== TRANSACTION 1: Resource Allocation — Success Test ===';
GO

DECLARE @t1_inv_id   INT          = 2;    -- Karachi WH, Rice Bags (qty=200 originally)
DECLARE @t1_qty      INT          = 50;
DECLARE @t1_dest     VARCHAR(255) = 'Lyari Secondary Relief Point, Karachi';
DECLARE @t1_req_id   INT          = 1;
DECLARE @t1_avail    INT;
DECLARE @t1_alloc_id INT;

BEGIN TRY
    BEGIN TRANSACTION T1_ResourceDispatch;

    -- Step 1: Verify sufficient stock
    SELECT @t1_avail = quantity
    FROM   WarehouseInventory
    WHERE  inventory_id = @t1_inv_id;

    IF @t1_avail IS NULL
    BEGIN
        RAISERROR('T1 STEP 1 FAILED: Inventory record %d not found.', 16, 1, @t1_inv_id);
        ROLLBACK TRANSACTION T1_ResourceDispatch;
        RETURN;
    END

    IF @t1_avail < @t1_qty
    BEGIN
        RAISERROR('T1 STEP 1 FAILED: Insufficient stock. Available: %d, Requested: %d.',
                  16, 1, @t1_avail, @t1_qty);
        ROLLBACK TRANSACTION T1_ResourceDispatch;
        RETURN;
    END
    PRINT 'T1 Step 1 PASSED: Stock check OK. Available = ' + CAST(@t1_avail AS VARCHAR(10));

    -- Step 2: Insert allocation — trigger T1 fires here and reduces inventory
    INSERT INTO ResourceAllocations
        (request_id, inventory_id, quantity_dispatched, destination, allocated_at)
    VALUES
        (@t1_req_id, @t1_inv_id, @t1_qty, @t1_dest, SYSDATETIME());

    SET @t1_alloc_id = CAST(SCOPE_IDENTITY() AS INT);
    PRINT 'T1 Step 2 PASSED: Allocation record #' + CAST(@t1_alloc_id AS VARCHAR(10)) + ' created.';

    -- Step 3: Confirm inventory is still positive after trigger
    DECLARE @t1_new_qty INT;
    SELECT @t1_new_qty = quantity FROM WarehouseInventory WHERE inventory_id = @t1_inv_id;

    IF @t1_new_qty < 0
    BEGIN
        RAISERROR('T1 STEP 3 FAILED: Inventory went negative after trigger.', 16, 1);
        ROLLBACK TRANSACTION T1_ResourceDispatch;
        RETURN;
    END
    PRINT 'T1 Step 3 PASSED: Inventory still positive = ' + CAST(@t1_new_qty AS VARCHAR(10));

    COMMIT TRANSACTION T1_ResourceDispatch;
    PRINT '>>> TRANSACTION 1 COMMITTED SUCCESSFULLY.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION T1_ResourceDispatch;
    PRINT 'TRANSACTION 1 ROLLED BACK. Error: ' + ERROR_MESSAGE();
END CATCH;
GO
-- EXPECTED: T1 Step 1 PASSED, T1 Step 2 PASSED, T1 Step 3 PASSED, COMMITTED
-- Rice Bags in Karachi WH: 200 → 200-50(from alloc in DML)=150... -50(T1)=100

PRINT '=== TRANSACTION 1: Rollback Test — Excess Quantity ===';
GO

DECLARE @t1r_inv_id INT = 2;
DECLARE @t1r_qty    INT = 99999;
DECLARE @t1r_avail  INT;

BEGIN TRY
    BEGIN TRANSACTION T1_RollbackTest;

    SELECT @t1r_avail = quantity FROM WarehouseInventory WHERE inventory_id = @t1r_inv_id;

    IF @t1r_avail < @t1r_qty
    BEGIN
        RAISERROR('T1 ROLLBACK: Insufficient stock (%d available, %d requested).',
                  16, 1, @t1r_avail, @t1r_qty);
        ROLLBACK TRANSACTION T1_RollbackTest;
        RETURN;
    END

    INSERT INTO ResourceAllocations
        (request_id, inventory_id, quantity_dispatched, destination)
    VALUES (1, @t1r_inv_id, @t1r_qty, 'Test Destination');

    COMMIT TRANSACTION T1_RollbackTest;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION T1_RollbackTest;
    PRINT '>>> T1 ROLLBACK CONFIRMED — No allocation created. Error: ' + ERROR_MESSAGE();
END CATCH;
GO
-- EXPECTED: T1 ROLLBACK CONFIRMED — Insufficient stock (100 available, 99999 requested)

-- ============================================================
-- TRANSACTION 2: Rescue Team Assignment (CONSISTENCY)
-- Team must be Available before assignment; trigger sets to Busy.
-- ============================================================
PRINT '=== TRANSACTION 2: Team Assignment — Success Test ===';
GO

DECLARE @t2_team_id   INT = 7;    -- Golf Search Rescue — Available
DECLARE @t2_report_id INT = 2;    -- Lahore Ravi River Flood — Pending
DECLARE @t2_status    VARCHAR(30);
DECLARE @t2_assign_id INT;

BEGIN TRY
    BEGIN TRANSACTION T2_TeamAssignment;

    -- Step 1: Confirm team is Available
    SELECT @t2_status = status FROM RescueTeams WHERE team_id = @t2_team_id;

    IF @t2_status IS NULL
    BEGIN
        RAISERROR('T2 STEP 1 FAILED: Team %d not found.', 16, 1, @t2_team_id);
        ROLLBACK TRANSACTION T2_TeamAssignment;
        RETURN;
    END

    IF @t2_status <> 'Available'
    BEGIN
        RAISERROR('T2 STEP 1 FAILED: Team is %s, not Available.', 16, 1, @t2_status);
        ROLLBACK TRANSACTION T2_TeamAssignment;
        RETURN;
    END
    PRINT 'T2 Step 1 PASSED: Team is Available.';

    -- Step 2: Insert assignment — trigger T3 (trg_MarkTeamBusy) fires → team = 'Busy'
    INSERT INTO TeamAssignments (report_id, team_id, assigned_at, status)
    VALUES (@t2_report_id, @t2_team_id, SYSDATETIME(), 'Assigned');

    SET @t2_assign_id = CAST(SCOPE_IDENTITY() AS INT);
    PRINT 'T2 Step 2 PASSED: Assignment #' + CAST(@t2_assign_id AS VARCHAR(10)) + ' created. Team set Busy by trigger.';

    -- Step 3: Update report status to Dispatched
    UPDATE EmergencyReports
    SET    status = 'Dispatched'
    WHERE  report_id = @t2_report_id;

    PRINT 'T2 Step 3 PASSED: Report #' + CAST(@t2_report_id AS VARCHAR(10)) + ' marked Dispatched.';

    COMMIT TRANSACTION T2_TeamAssignment;
    PRINT '>>> TRANSACTION 2 COMMITTED SUCCESSFULLY.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION T2_TeamAssignment;
    PRINT 'TRANSACTION 2 ROLLED BACK. Error: ' + ERROR_MESSAGE();
END CATCH;
GO
-- EXPECTED: Steps 1-3 PASSED, COMMITTED. Team 7 (Golf) now = Busy; Report 2 = Dispatched

PRINT '=== TRANSACTION 2: Rollback Test — Team Already Busy ===';
GO

DECLARE @t2r_team_id INT = 1;   -- Alpha Medical — currently Busy
DECLARE @t2r_status  VARCHAR(30);

BEGIN TRY
    BEGIN TRANSACTION T2_RollbackTest;

    SELECT @t2r_status = status FROM RescueTeams WHERE team_id = @t2r_team_id;

    IF @t2r_status <> 'Available'
    BEGIN
        RAISERROR('T2 ROLLBACK: Team status is %s. Only Available teams can be assigned.',
                  16, 1, @t2r_status);
        ROLLBACK TRANSACTION T2_RollbackTest;
        RETURN;
    END

    INSERT INTO TeamAssignments (report_id, team_id, assigned_at, status)
    VALUES (5, @t2r_team_id, SYSDATETIME(), 'Assigned');

    COMMIT TRANSACTION T2_RollbackTest;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION T2_RollbackTest;
    PRINT '>>> T2 ROLLBACK CONFIRMED — No assignment created. Error: ' + ERROR_MESSAGE();
END CATCH;
GO
-- EXPECTED: T2 ROLLBACK CONFIRMED — Team status is Busy. Only Available teams can be assigned.
-- ============================================================
-- TRANSACTION 3: Financial Entry with Dual Audit Trail (DURABILITY)
-- Trigger T5a writes audit log automatically; we also write an
-- explicit transaction-level audit entry to demonstrate full control.
-- ============================================================
PRINT '=== TRANSACTION 3: Financial Entry — Success Test ===';
GO

DECLARE @t3_donor    VARCHAR(100)  = 'Sindh Relief Fund';
DECLARE @t3_amount   DECIMAL(10,2) = 650000.00;
DECLARE @t3_type     VARCHAR(30)   = 'Cash';
DECLARE @t3_event    VARCHAR(100)  = 'Karachi Floods 2024';
DECLARE @t3_approver INT           = 1;
DECLARE @t3_user     INT           = 5;
DECLARE @t3_don_id   INT;

BEGIN TRY
    BEGIN TRANSACTION T3_FinancialEntry;

    -- Step 1: Validate amount
    IF @t3_amount <= 0
    BEGIN
        RAISERROR('T3 STEP 1 FAILED: Donation amount must be positive.', 16, 1);
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION T3_FinancialEntry;
        RETURN;
    END
    PRINT 'T3 Step 1 PASSED: Amount PKR ' + CAST(@t3_amount AS VARCHAR(20)) + ' is valid.';

    -- Step 2: Insert donation — trigger T5a fires automatically
    INSERT INTO Donations
        (donor_name, amount, type, disaster_event, donated_at, approved_by)
    VALUES
        (@t3_donor, @t3_amount, @t3_type, @t3_event, SYSDATETIME(), @t3_approver);

    SET @t3_don_id = CAST(SCOPE_IDENTITY() AS INT);
    PRINT 'T3 Step 2 PASSED: Donation #' + CAST(@t3_don_id AS VARCHAR(10)) + ' inserted. Trigger wrote audit row.';

    -- Step 3: Write explicit transaction-level audit entry
    INSERT INTO AuditLogs
        (user_id, action_type, description, table_affected, record_id, ip_address)
    VALUES
        (@t3_user, 'INSERT',
         'Donation recorded: ' + @t3_donor + ' — PKR ' +
             CAST(@t3_amount AS VARCHAR(20)) + ' for ' + @t3_event,
         'Donations', @t3_don_id, '192.168.1.40');

    PRINT 'T3 Step 3 PASSED: Explicit audit log entry written.';

    COMMIT TRANSACTION T3_FinancialEntry;
    PRINT '>>> TRANSACTION 3 COMMITTED SUCCESSFULLY.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION T3_FinancialEntry;
    PRINT 'TRANSACTION 3 ROLLED BACK. Error: ' + ERROR_MESSAGE();
END CATCH;
GO

-- EXPECTED: All steps PASSED, COMMITTED. AuditLogs gains 2 new rows (1 trigger + 1 explicit).

PRINT '=== TRANSACTION 3: Rollback Test — Negative Amount ===';
GO

DECLARE @t3r_amount DECIMAL(10,2) = -5000.00;

BEGIN TRY
    BEGIN TRANSACTION T3_RollbackTest;

    IF @t3r_amount <= 0
    BEGIN
        -- Fixed: Use %f format specifier for decimal instead of %s with CAST
        DECLARE @errMsg NVARCHAR(4000) = 'T3 ROLLBACK: Amount PKR ' + 
                                         CAST(@t3r_amount AS VARCHAR(20)) + 
                                         ' is not positive. Cannot record donation.';
        RAISERROR(@errMsg, 16, 1);
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION T3_RollbackTest;
        RETURN;
    END

    INSERT INTO Donations (donor_name, amount, type, disaster_event, donated_at, approved_by)
    VALUES ('Bad Donor', @t3r_amount, 'Cash', 'Test Event', SYSDATETIME(), 1);

    COMMIT TRANSACTION T3_RollbackTest;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION T3_RollbackTest;
    PRINT '>>> T3 ROLLBACK CONFIRMED — No donation record created. Error: ' + ERROR_MESSAGE();
END CATCH;
GO
-- EXPECTED: T3 ROLLBACK CONFIRMED — Amount -5000.00 is not positive.

-- ============================================================
-- TRANSACTION 4: Approval Execution (ISOLATION)
-- Approves request #3 (30 Tents from Islamabad) and executes
-- the allocation inside a single atomic transaction.
-- UPDLOCK + ROWLOCK prevents two administrators from approving
-- the same request simultaneously.
-- ============================================================
PRINT '=== TRANSACTION 4: Approval Execution — Success Test ===';
GO

DECLARE @t4_req_id     INT          = 3;    -- Pending: 30 Tents from Islamabad Store
DECLARE @t4_decider    INT          = 1;
DECLARE @t4_note       VARCHAR(500) = 'Approved — tents urgently needed for G-11 flood victims';
DECLARE @t4_inv_id     INT          = 12;   -- Islamabad WH, Tents (qty=35, threshold=10)
DECLARE @t4_qty        INT          = 30;
DECLARE @t4_dest       VARCHAR(255) = 'G-11 Flood Relief Camp, Islamabad';
DECLARE @t4_req_status VARCHAR(20);
DECLARE @t4_avail      INT;

BEGIN TRY
    BEGIN TRANSACTION T4_ApprovalExecution;

    -- Step 1: Lock and read request row — prevents concurrent double-approval
    SELECT @t4_req_status = status
    FROM   ApprovalRequests WITH (UPDLOCK, ROWLOCK)
    WHERE  request_id = @t4_req_id;

    IF @t4_req_status IS NULL
    BEGIN
        RAISERROR('T4 STEP 1 FAILED: Request #%d not found.', 16, 1, @t4_req_id);
        ROLLBACK TRANSACTION T4_ApprovalExecution;
        RETURN;
    END

    IF @t4_req_status <> 'Pending'
    BEGIN
        RAISERROR('T4 STEP 1 FAILED: Request is %s, not Pending. Cannot re-process.',
                  16, 1, @t4_req_status);
        ROLLBACK TRANSACTION T4_ApprovalExecution;
        RETURN;
    END
    PRINT 'T4 Step 1 PASSED: Request #' + CAST(@t4_req_id AS VARCHAR(5)) + ' is Pending and row-locked.';

    -- Step 2: Approve the request
    UPDATE ApprovalRequests
    SET    status        = 'Approved',
           decided_by    = @t4_decider,
           decision_note = @t4_note,
           decided_at    = SYSDATETIME()
    WHERE  request_id    = @t4_req_id;

    PRINT 'T4 Step 2 PASSED: Request marked Approved.';

    -- Step 3: Verify stock then insert allocation
    SELECT @t4_avail = quantity FROM WarehouseInventory WHERE inventory_id = @t4_inv_id;

    IF @t4_avail < @t4_qty
    BEGIN
        RAISERROR('T4 STEP 3 FAILED: Insufficient Tents (%d available, %d needed).',
                  16, 1, @t4_avail, @t4_qty);
        ROLLBACK TRANSACTION T4_ApprovalExecution;
        RETURN;
    END

    -- Allocation INSERT fires trigger T1 → inventory auto-reduces (35 - 30 = 5)
    -- Trigger T6 fires too: 5 < threshold 10 → StockAlerts row inserted
    INSERT INTO ResourceAllocations
        (request_id, inventory_id, quantity_dispatched, destination, allocated_at)
    VALUES
        (@t4_req_id, @t4_inv_id, @t4_qty, @t4_dest, SYSDATETIME());

    PRINT 'T4 Step 3 PASSED: 30 Tents dispatched. Inventory auto-reduced by trigger T1.';
    PRINT '                  New Tent qty = 5 (below threshold 10) → StockAlert auto-created by trigger T6.';

    -- Step 4: Write audit log
    INSERT INTO AuditLogs
        (user_id, action_type, description, table_affected, record_id, ip_address)
    VALUES
        (@t4_decider, 'UPDATE',
         'Request #' + CAST(@t4_req_id AS VARCHAR(10)) +
             ' approved and executed — ' + CAST(@t4_qty AS VARCHAR(10)) +
             ' Tents dispatched to ' + @t4_dest,
         'ApprovalRequests', @t4_req_id, '192.168.1.1');

    PRINT 'T4 Step 4 PASSED: Audit log written.';

    COMMIT TRANSACTION T4_ApprovalExecution;
    PRINT '>>> TRANSACTION 4 COMMITTED SUCCESSFULLY.';
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION T4_ApprovalExecution;
    PRINT 'TRANSACTION 4 ROLLED BACK. Error: ' + ERROR_MESSAGE();
END CATCH;
GO
-- EXPECTED: All steps PASSED, COMMITTED.
--   ApprovalRequests.request_id=3 → status='Approved'
--   WarehouseInventory.inventory_id=12 → quantity=5 (was 35)
--   StockAlerts → 1 new row (Islamabad Tents crossed below threshold)

PRINT '=== TRANSACTION 4: Rollback Test — Already Approved Request ===';
GO

DECLARE @t4r_req_id INT = 1;   -- Already Approved
DECLARE @t4r_status VARCHAR(20);

BEGIN TRY
    BEGIN TRANSACTION T4_RollbackTest;

    SELECT @t4r_status = status
    FROM   ApprovalRequests WITH (UPDLOCK, ROWLOCK)
    WHERE  request_id = @t4r_req_id;

    IF @t4r_status <> 'Pending'
    BEGIN
        RAISERROR('T4 ROLLBACK: Request is %s, not Pending. Cannot re-process.',
                  16, 1, @t4r_status);
        ROLLBACK TRANSACTION T4_RollbackTest;
        RETURN;
    END

    UPDATE ApprovalRequests
    SET status = 'Approved', decided_by = 1, decided_at = SYSDATETIME()
    WHERE request_id = @t4r_req_id;

    COMMIT TRANSACTION T4_RollbackTest;
END TRY
BEGIN CATCH
    IF @@TRANCOUNT > 0
        ROLLBACK TRANSACTION T4_RollbackTest;
    PRINT '>>> T4 ROLLBACK CONFIRMED — Request not re-processed. Error: ' + ERROR_MESSAGE();
END CATCH;
GO
-- EXPECTED: T4 ROLLBACK CONFIRMED — Request is Approved, not Pending.

-- ============================================================
-- ============================================================
-- PART C: APPROVAL WORKFLOW OPERATIONS
-- ============================================================
-- ============================================================

-- Submit a new approval request (status defaults to 'Pending')
PRINT '=== Approval Workflow: Submit New Request ===';
INSERT INTO ApprovalRequests
    (requested_by, request_type, details, created_at)
VALUES
    (4, 'ResourceDispatch',
     'Dispatch 80 Blankets from Multan Warehouse to Multan Cantt Fire Victims',
     SYSDATETIME());
GO
-- EXPECTED: 1 row inserted; request_id=9, status='Pending'

-- Reject a pending request with a reason
PRINT '=== Approval Workflow: Reject Request #6 ===';
UPDATE ApprovalRequests
SET    status        = 'Rejected',
       decided_by    = 1,
       decision_note = 'Rejected — situation contained; resources not needed at this time.',
       decided_at    = SYSDATETIME()
WHERE  request_id    = 6
  AND  status        = 'Pending';
GO
-- EXPECTED: 1 row updated (only if request_id=6 was still Pending)

-- View full decision history for all requests
PRINT '=== Approval Workflow: Full Decision History ===';
SELECT
    ar.request_id,
    ar.request_type,
    CAST(ar.details AS VARCHAR(80))     AS details_preview,
    ar.status,
    req_u.name                          AS submitted_by,
    req_r.role_name                     AS submitter_role,
    dec_u.name                          AS decided_by_name,
    dec_r.role_name                     AS decider_role,
    ar.decision_note,
    ar.created_at,
    ar.decided_at,
    DATEDIFF(MINUTE, ar.created_at, ar.decided_at) AS decision_time_minutes
FROM ApprovalRequests ar
INNER JOIN Users req_u ON ar.requested_by = req_u.user_id
INNER JOIN Roles req_r ON req_u.role_id   = req_r.role_id
LEFT  JOIN Users dec_u ON ar.decided_by   = dec_u.user_id
LEFT  JOIN Roles dec_r ON dec_u.role_id   = dec_r.role_id
ORDER BY ar.created_at ASC;
GO

-- SLA report: average decision time per request type
PRINT '=== Approval Workflow: SLA Report by Request Type ===';
SELECT
    request_type,
    COUNT(*)                                                AS total_requests,
    SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END)  AS total_approved,
    SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END)  AS total_rejected,
    SUM(CASE WHEN status = 'Pending'  THEN 1 ELSE 0 END)  AS total_pending,
    AVG(DATEDIFF(MINUTE, created_at, decided_at))         AS avg_decision_minutes
FROM ApprovalRequests
GROUP BY request_type
ORDER BY total_requests DESC;
GO

-- ============================================================
-- POST-TRANSACTION VERIFICATION
-- ============================================================
PRINT '=== Post-Transaction State Verification ===';

-- Check team statuses
SELECT team_id, team_name, status AS current_status FROM RescueTeams ORDER BY team_id;
GO
-- EXPECTED: Teams 1,2,4,5,6,7 = Busy; Teams 3,8 = Available

-- Check stock alerts generated
SELECT
    sa.alert_id,
    sa.alert_time,
    r.resource_name,
    w.name          AS warehouse_name,
    wi.quantity     AS qty_at_alert_time,
    wi.min_threshold
FROM StockAlerts sa
INNER JOIN WarehouseInventory wi ON sa.inventory_id = wi.inventory_id
INNER JOIN Resources          r  ON wi.resource_id  = r.resource_id
INNER JOIN Warehouses         w  ON wi.warehouse_id = w.warehouse_id
ORDER BY sa.alert_time;
GO
-- EXPECTED (1 row after Transaction 4):
-- resource_name      | warehouse_name        | qty | min_threshold
-- Tents (4-person)   | Islamabad Federal Store | 5   | 10

-- Check pending requests remaining
SELECT request_id, request_type, status FROM ApprovalRequests
WHERE status = 'Pending'
ORDER BY request_id;
GO
-- EXPECTED: request_id=8 (FinancialApproval) and request_id=9 (new Blankets request)

PRINT '=== FILE 4: Queries, Transactions & Approval Workflow Complete. ===';
GO