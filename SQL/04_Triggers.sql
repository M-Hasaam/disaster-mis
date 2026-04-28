-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 1: TRIGGERS — EVENT-DRIVEN DATABASE AUTOMATION
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- RUN AFTER: FILE0_DDL_CreateTables.sql
-- ============================================================

USE DisasterResponseMIS;
GO

-- ============================================================
-- T1: trg_ReduceInventoryAfterAllocation
-- Event:   AFTER INSERT on ResourceAllocations
-- Purpose: Automatically subtracts dispatched quantity from
--          WarehouseInventory and updates last_updated timestamp.
--          Rolls back if inventory would go negative.
-- ACID:    Atomicity — allocation + inventory reduction as one unit
-- ============================================================
CREATE OR ALTER TRIGGER trg_ReduceInventoryAfterAllocation
ON ResourceAllocations
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        -- Reduce inventory for every inserted allocation row (handles multi-row inserts)
        UPDATE wi
        SET    wi.quantity     = wi.quantity - i.quantity_dispatched,
               wi.last_updated = SYSDATETIME()
        FROM   WarehouseInventory wi
        INNER JOIN inserted i ON wi.inventory_id = i.inventory_id;

        -- Safety guard: catch negative stock that slipped past the CHECK constraint
        IF EXISTS (
            SELECT 1
            FROM   WarehouseInventory wi
            INNER JOIN inserted i ON wi.inventory_id = i.inventory_id
            WHERE  wi.quantity < 0
        )
        BEGIN
            RAISERROR(
                'TRIGGER T1: Cannot allocate — dispatch quantity exceeds available stock. Transaction rolled back.',
                16, 1
            );
            ROLLBACK TRANSACTION;
            RETURN;
        END
    END TRY
    BEGIN CATCH
        DECLARE @ErrMsg NVARCHAR(4000) = ERROR_MESSAGE();
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        RAISERROR(@ErrMsg, 16, 1);
    END CATCH
END;
GO

-- ============================================================
-- T2: trg_PreventNegativeStock
-- Event:   AFTER UPDATE on WarehouseInventory
-- Purpose: Rolls back any UPDATE that results in quantity < 0.
--          Provides a safety net beyond the DDL CHECK constraint
--          (CHECK constraints can be bypassed in certain bulk operations).
-- Note:    SQL Server has no BEFORE triggers; AFTER + ROLLBACK
--          achieves equivalent behaviour.
-- ============================================================
CREATE OR ALTER TRIGGER trg_PreventNegativeStock
ON WarehouseInventory
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM inserted WHERE quantity < 0)
    BEGIN
        RAISERROR(
            'TRIGGER T2: Inventory update rejected — negative stock values are not permitted.',
            16, 1
        );
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
GO

-- ============================================================
-- T3: trg_MarkTeamBusy
-- Event:   AFTER INSERT on TeamAssignments
-- Purpose: Sets the assigned team's status to 'Busy' so the team
--          cannot be double-assigned to another emergency.
-- Condition: Only changes status if the team is currently 'Available'
--            (prevents overwriting 'Offline' status).
-- ============================================================
CREATE OR ALTER TRIGGER trg_MarkTeamBusy
ON TeamAssignments
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE rt
    SET    rt.status = 'Busy'
    FROM   RescueTeams rt
    INNER JOIN inserted i ON rt.team_id = i.team_id
    WHERE  rt.status = 'Available';
END;
GO

-- ============================================================
-- T4: trg_ResetTeamOnCompletion
-- Event:   AFTER UPDATE on TeamAssignments
-- Purpose: When a mission transitions to 'Completed', resets the
--          team status back to 'Available' for redeployment.
--          Uses the DELETED pseudo-table to detect the status change.
-- ============================================================
CREATE OR ALTER TRIGGER trg_ResetTeamOnCompletion
ON TeamAssignments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF UPDATE(status)
    BEGIN
        UPDATE rt
        SET    rt.status = 'Available'
        FROM   RescueTeams rt
        INNER JOIN inserted i ON rt.team_id = i.team_id
        INNER JOIN deleted  d ON i.assignment_id = d.assignment_id
        WHERE  i.status = 'Completed'
          AND  d.status <> 'Completed';
    END
END;
GO

-- ============================================================
-- T5a: trg_AuditDonationInsert
-- Event:   AFTER INSERT on Donations
-- Purpose: Writes an immutable audit entry for every donation
--          recorded — regardless of which user or application path
--          triggered the insert.
-- ============================================================
CREATE OR ALTER TRIGGER trg_AuditDonationInsert
ON Donations
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @user_id INT;
    SET @user_id = TRY_CAST(SESSION_CONTEXT(N'user_id') AS INT);
    IF @user_id IS NULL
        SET @user_id = 1;   -- Default to Administrator if context not set

    INSERT INTO AuditLogs
        (user_id, action_type, description, table_affected, record_id, ip_address)
    SELECT
        @user_id,
        'INSERT',
        CONCAT('Donation recorded: ', i.donor_name,
               ' — PKR ', CAST(i.amount AS VARCHAR(20)),
               ' for ', i.disaster_event),
        'Donations',
        i.donation_id,
        NULL
    FROM inserted i;
END;
GO

-- ============================================================
-- T5b: trg_AuditExpenseInsert
-- Event:   AFTER INSERT on Expenses
-- Purpose: Writes an immutable audit entry for every expense
--          recorded — ensures full financial traceability.
-- ============================================================
CREATE OR ALTER TRIGGER trg_AuditExpenseInsert
ON Expenses
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @user_id INT;
    SET @user_id = TRY_CAST(SESSION_CONTEXT(N'user_id') AS INT);
    IF @user_id IS NULL
        SET @user_id = 1;

    INSERT INTO AuditLogs
        (user_id, action_type, description, table_affected, record_id, ip_address)
    SELECT
        @user_id,
        'INSERT',
        CONCAT('Expense recorded: ', i.category,
               ' — PKR ', CAST(i.amount AS VARCHAR(20)),
               ' for ', i.disaster_event),
        'Expenses',
        i.expense_id,
        NULL
    FROM inserted i;
END;
GO

-- ============================================================
-- T6: trg_LowStockAlert
-- Event:   AFTER UPDATE on WarehouseInventory
-- Purpose: Inserts a StockAlerts record when inventory quantity
--          crosses BELOW the min_threshold for the first time.
-- Duplicate prevention: only fires when crossing from above to
--          below threshold — not for subsequent low-stock updates.
-- ============================================================
CREATE OR ALTER TRIGGER trg_LowStockAlert
ON WarehouseInventory
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    INSERT INTO StockAlerts (inventory_id, alert_time)
    SELECT
        i.inventory_id,
        SYSDATETIME()
    FROM   inserted i
    INNER JOIN deleted  d ON i.inventory_id = d.inventory_id
    WHERE  i.quantity   <  i.min_threshold   -- now below threshold
      AND  d.quantity   >= d.min_threshold;  -- was at or above threshold (crossing event only)
END;
GO

-- ============================================================
-- T7: trg_AuditDeleteEmergencyReports
-- Event:   AFTER DELETE on EmergencyReports
-- Purpose: Logs every hard-delete of an emergency report.
--          Critical for compliance — deletions must be fully
--          traceable even after the source record is gone.
-- ============================================================
CREATE OR ALTER TRIGGER trg_AuditDeleteEmergencyReports
ON EmergencyReports
AFTER DELETE
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @user_id INT;
    SET @user_id = TRY_CAST(SESSION_CONTEXT(N'user_id') AS INT);
    IF @user_id IS NULL
        SET @user_id = 1;

    INSERT INTO AuditLogs
        (user_id, action_type, description, table_affected, record_id, ip_address)
    SELECT
        @user_id,
        'DELETE',
        CONCAT('Emergency report deleted: ID=', CAST(d.report_id AS VARCHAR(10)),
               ', Type=', d.disaster_type,
               ', Location=', d.location),
        'EmergencyReports',
        d.report_id,
        NULL
    FROM deleted d;
END;
GO

-- ============================================================
-- VERIFY ALL TRIGGERS CREATED SUCCESSFULLY
-- ============================================================
SELECT
    t.name                   AS TriggerName,
    OBJECT_NAME(t.parent_id) AS TableName,
    t.type_desc              AS TriggerType,
    t.is_disabled            AS IsDisabled
FROM sys.triggers t
WHERE t.name LIKE 'trg_%'
ORDER BY OBJECT_NAME(t.parent_id), t.name;
GO

-- ============================================================
-- EXPECTED OUTPUT (8 triggers across 5 tables):
-- TriggerName                           | TableName           | TriggerType     | IsDisabled
-- trg_AuditDeleteEmergencyReports       | EmergencyReports    | SQL_TRIGGER     | 0
-- trg_AuditDonationInsert               | Donations           | SQL_TRIGGER     | 0
-- trg_AuditExpenseInsert                | Expenses            | SQL_TRIGGER     | 0
-- trg_ReduceInventoryAfterAllocation    | ResourceAllocations | SQL_TRIGGER     | 0
-- trg_LowStockAlert                     | WarehouseInventory  | SQL_TRIGGER     | 0
-- trg_PreventNegativeStock              | WarehouseInventory  | SQL_TRIGGER     | 0
-- trg_MarkTeamBusy                      | TeamAssignments     | SQL_TRIGGER     | 0
-- trg_ResetTeamOnCompletion             | TeamAssignments     | SQL_TRIGGER     | 0
-- ============================================================

PRINT '=== FILE 1: Triggers — 8 triggers created successfully. ===';
GO