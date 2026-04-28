-- ============================================================
-- SMART DISASTER RESPONSE MIS
-- FILE 0: DDL — DATABASE & TABLE CREATION
-- Authors: Sohaib Akhlaq (24i-3108) | Shaiman Qasir (24i-3074) | M. Hasaam (24i-3107)
-- Database: Microsoft SQL Server (T-SQL)
-- Instructor: Ms. Zoya Sumbul
-- ============================================================
-- RUN ORDER: This file first, then triggers, then DML, then queries, then indexes.
-- ============================================================

-- ============================================================
-- CREATE DATABASE
-- ============================================================
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'DisasterResponseMIS')
BEGIN
    CREATE DATABASE DisasterResponseMIS;
END
GO

USE DisasterResponseMIS;
GO

-- ============================================================
-- DROP TABLES (clean slate — drop in reverse FK order)
-- ============================================================
IF OBJECT_ID('dbo.StockAlerts',         'U') IS NOT NULL DROP TABLE StockAlerts;
IF OBJECT_ID('dbo.AuditLogs',           'U') IS NOT NULL DROP TABLE AuditLogs;
IF OBJECT_ID('dbo.Permissions',         'U') IS NOT NULL DROP TABLE Permissions;
IF OBJECT_ID('dbo.Patients',            'U') IS NOT NULL DROP TABLE Patients;
IF OBJECT_ID('dbo.ResourceAllocations', 'U') IS NOT NULL DROP TABLE ResourceAllocations;
IF OBJECT_ID('dbo.ApprovalRequests',    'U') IS NOT NULL DROP TABLE ApprovalRequests;
IF OBJECT_ID('dbo.Donations',           'U') IS NOT NULL DROP TABLE Donations;
IF OBJECT_ID('dbo.Expenses',            'U') IS NOT NULL DROP TABLE Expenses;
IF OBJECT_ID('dbo.TeamAssignments',     'U') IS NOT NULL DROP TABLE TeamAssignments;
IF OBJECT_ID('dbo.WarehouseInventory',  'U') IS NOT NULL DROP TABLE WarehouseInventory;
IF OBJECT_ID('dbo.EmergencyReports',    'U') IS NOT NULL DROP TABLE EmergencyReports;
IF OBJECT_ID('dbo.Citizens',            'U') IS NOT NULL DROP TABLE Citizens;
IF OBJECT_ID('dbo.RescueTeams',         'U') IS NOT NULL DROP TABLE RescueTeams;
IF OBJECT_ID('dbo.Hospitals',           'U') IS NOT NULL DROP TABLE Hospitals;
IF OBJECT_ID('dbo.Resources',           'U') IS NOT NULL DROP TABLE Resources;
IF OBJECT_ID('dbo.Warehouses',          'U') IS NOT NULL DROP TABLE Warehouses;
IF OBJECT_ID('dbo.Users',               'U') IS NOT NULL DROP TABLE Users;
IF OBJECT_ID('dbo.Roles',               'U') IS NOT NULL DROP TABLE Roles;
GO

-- ============================================================
-- TABLE 1: Roles
-- ============================================================
CREATE TABLE Roles (
    role_id     INT          IDENTITY(1,1) PRIMARY KEY,
    role_name   VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255) NOT NULL
);
GO

-- ============================================================
-- TABLE 2: Users
-- ============================================================
CREATE TABLE Users (
    user_id       INT           IDENTITY(1,1) PRIMARY KEY,
    name          VARCHAR(100)  NOT NULL,
    email         VARCHAR(150)  NOT NULL UNIQUE,
    password_hash VARCHAR(256)  NOT NULL,
    phone         VARCHAR(20)   NULL,
    role_id       INT           NOT NULL,
    is_active     BIT           NOT NULL DEFAULT 1,
    created_at    DATETIME2     DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Users_Roles FOREIGN KEY (role_id)
        REFERENCES Roles(role_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);
GO

-- ============================================================
-- TABLE 3: Citizens
-- ============================================================
CREATE TABLE Citizens (
    citizen_id INT          IDENTITY(1,1) PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    phone      VARCHAR(20)  NOT NULL,
    address    VARCHAR(255) NULL,
    email      VARCHAR(150) NULL
);
GO

-- ============================================================
-- TABLE 4: EmergencyReports
-- ============================================================
CREATE TABLE EmergencyReports (
    report_id    INT          IDENTITY(1,1) PRIMARY KEY,
    citizen_id   INT          NOT NULL,
    location     VARCHAR(255) NOT NULL,
    disaster_type VARCHAR(100) NOT NULL,
    severity     VARCHAR(20)  NOT NULL,
    report_time  DATETIME2    NOT NULL DEFAULT SYSDATETIME(),
    status       VARCHAR(30)  NOT NULL DEFAULT 'Pending',
    CONSTRAINT FK_EmergencyReports_Citizens FOREIGN KEY (citizen_id)
        REFERENCES Citizens(citizen_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT CHK_EmergencyReports_Severity
        CHECK (severity IN ('Low', 'Medium', 'High')),
    CONSTRAINT CHK_EmergencyReports_Status
        CHECK (status IN ('Pending', 'Dispatched', 'Resolved', 'Cancelled'))
);
GO

-- ============================================================
-- TABLE 5: RescueTeams
-- ============================================================
CREATE TABLE RescueTeams (
    team_id          INT          IDENTITY(1,1) PRIMARY KEY,
    team_name        VARCHAR(100) NOT NULL,
    team_type        VARCHAR(50)  NOT NULL,
    current_location VARCHAR(255) NOT NULL,
    status           VARCHAR(30)  NOT NULL DEFAULT 'Available',
    equipment        VARCHAR(500) NULL,
    CONSTRAINT CHK_RescueTeams_Status
        CHECK (status IN ('Available', 'Busy', 'Offline'))
);
GO

-- ============================================================
-- TABLE 6: TeamAssignments
-- ============================================================
CREATE TABLE TeamAssignments (
    assignment_id INT       IDENTITY(1,1) PRIMARY KEY,
    report_id     INT       NOT NULL,
    team_id       INT       NOT NULL,
    assigned_at   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    completed_at  DATETIME2 NULL,
    status        VARCHAR(30) NOT NULL DEFAULT 'Assigned',
    CONSTRAINT FK_TeamAssignments_Reports FOREIGN KEY (report_id)
        REFERENCES EmergencyReports(report_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT FK_TeamAssignments_Teams FOREIGN KEY (team_id)
        REFERENCES RescueTeams(team_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT CHK_TeamAssignments_Status
        CHECK (status IN ('Assigned', 'EnRoute', 'OnSite', 'Completed', 'Cancelled'))
);
GO

-- ============================================================
-- TABLE 7: Warehouses
-- ============================================================
CREATE TABLE Warehouses (
    warehouse_id INT          IDENTITY(1,1) PRIMARY KEY,
    name         VARCHAR(100) NOT NULL,
    location     VARCHAR(255) NOT NULL,
    phone        VARCHAR(20)  NULL
);
GO

-- ============================================================
-- TABLE 8: Resources
-- ============================================================
CREATE TABLE Resources (
    resource_id   INT         IDENTITY(1,1) PRIMARY KEY,
    resource_name VARCHAR(100) NOT NULL,
    category      VARCHAR(50)  NOT NULL,
    unit          VARCHAR(20)  NOT NULL
);
GO

-- ============================================================
-- TABLE 9: WarehouseInventory
-- ============================================================
CREATE TABLE WarehouseInventory (
    inventory_id  INT       IDENTITY(1,1) PRIMARY KEY,
    warehouse_id  INT       NOT NULL,
    resource_id   INT       NOT NULL,
    quantity      INT       NOT NULL DEFAULT 0,
    min_threshold INT       NOT NULL DEFAULT 10,
    last_updated  DATETIME2 DEFAULT SYSDATETIME(),
    CONSTRAINT FK_WI_Warehouses FOREIGN KEY (warehouse_id)
        REFERENCES Warehouses(warehouse_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT FK_WI_Resources FOREIGN KEY (resource_id)
        REFERENCES Resources(resource_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT UQ_WarehouseInventory_Unique
        UNIQUE (warehouse_id, resource_id),
    CONSTRAINT CHK_WarehouseInventory_Quantity
        CHECK (quantity >= 0),
    CONSTRAINT CHK_WarehouseInventory_Threshold
        CHECK (min_threshold >= 0)
);
GO

-- ============================================================
-- TABLE 10: ApprovalRequests
-- ============================================================
CREATE TABLE ApprovalRequests (
    request_id   INT          IDENTITY(1,1) PRIMARY KEY,
    requested_by INT          NOT NULL,
    request_type VARCHAR(50)  NOT NULL,
    details      TEXT         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'Pending',
    decided_by   INT          NULL,
    decision_note TEXT        NULL,
    created_at   DATETIME2    NOT NULL DEFAULT SYSDATETIME(),
    decided_at   DATETIME2    NULL,
    CONSTRAINT FK_ApprovalRequests_RequestedBy FOREIGN KEY (requested_by)
        REFERENCES Users(user_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT FK_ApprovalRequests_DecidedBy FOREIGN KEY (decided_by)
        REFERENCES Users(user_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT CHK_ApprovalRequests_Status
        CHECK (status IN ('Pending', 'Approved', 'Rejected'))
);
GO

-- ============================================================
-- TABLE 11: ResourceAllocations
-- ============================================================
CREATE TABLE ResourceAllocations (
    allocation_id       INT           IDENTITY(1,1) PRIMARY KEY,
    request_id          INT           NULL,
    inventory_id        INT           NOT NULL,
    quantity_dispatched INT           NOT NULL,
    destination         VARCHAR(255)  NOT NULL,
    allocated_at        DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_RA_ApprovalRequests FOREIGN KEY (request_id)
        REFERENCES ApprovalRequests(request_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT FK_RA_Inventory FOREIGN KEY (inventory_id)
        REFERENCES WarehouseInventory(inventory_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT CHK_ResourceAllocations_Quantity
        CHECK (quantity_dispatched > 0)
);
GO

-- ============================================================
-- TABLE 12: Hospitals
-- ============================================================
CREATE TABLE Hospitals (
    hospital_id INT          IDENTITY(1,1) PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    location    VARCHAR(255) NOT NULL,
    total_beds  INT          NOT NULL DEFAULT 0,
    specialty   VARCHAR(200) NULL,
    CONSTRAINT CHK_Hospitals_Beds CHECK (total_beds >= 0)
);
GO

-- ============================================================
-- TABLE 13: Patients
-- ============================================================
CREATE TABLE Patients (
    patient_id  INT          IDENTITY(1,1) PRIMARY KEY,
    hospital_id INT          NOT NULL,
    report_id   INT          NULL,
    name        VARCHAR(100) NOT NULL,
    admitted_at DATETIME2    NOT NULL DEFAULT SYSDATETIME(),
    status      VARCHAR(30)  NOT NULL DEFAULT 'Admitted',
    CONSTRAINT FK_Patients_Hospitals FOREIGN KEY (hospital_id)
        REFERENCES Hospitals(hospital_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT FK_Patients_Reports FOREIGN KEY (report_id)
        REFERENCES EmergencyReports(report_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT CHK_Patients_Status
        CHECK (status IN ('Admitted', 'Discharged', 'Transferred', 'Deceased'))
);
GO

-- ============================================================
-- TABLE 14: Donations
-- ============================================================
CREATE TABLE Donations (
    donation_id   INT            IDENTITY(1,1) PRIMARY KEY,
    donor_name    VARCHAR(100)   NOT NULL,
    amount        DECIMAL(10,2)  NOT NULL,
    type          VARCHAR(30)    NOT NULL,
    disaster_event VARCHAR(100)  NOT NULL,
    donated_at    DATETIME2      NOT NULL DEFAULT SYSDATETIME(),
    approved_by   INT            NULL,
    CONSTRAINT FK_Donations_Users FOREIGN KEY (approved_by)
        REFERENCES Users(user_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT CHK_Donations_Amount CHECK (amount > 0),
    CONSTRAINT CHK_Donations_Type   CHECK (type IN ('Cash', 'Kind', 'Pledge'))
);
GO

-- ============================================================
-- TABLE 15: Expenses
-- ============================================================
CREATE TABLE Expenses (
    expense_id     INT           IDENTITY(1,1) PRIMARY KEY,
    category       VARCHAR(50)   NOT NULL,
    amount         DECIMAL(10,2) NOT NULL,
    disaster_event VARCHAR(100)  NOT NULL,
    incurred_at    DATETIME2     NOT NULL DEFAULT SYSDATETIME(),
    approved_by    INT           NULL,
    CONSTRAINT FK_Expenses_Users FOREIGN KEY (approved_by)
        REFERENCES Users(user_id)
        ON UPDATE NO ACTION
        ON DELETE NO ACTION,
    CONSTRAINT CHK_Expenses_Amount CHECK (amount > 0)
);
GO

-- ============================================================
-- TABLE 16: AuditLogs
-- ============================================================
CREATE TABLE AuditLogs (
    log_id        INT          IDENTITY(1,1) PRIMARY KEY,
    user_id       INT          NOT NULL,
    action_type   VARCHAR(50)  NOT NULL,
    description   VARCHAR(500) NOT NULL,
    table_affected VARCHAR(100) NOT NULL,
    record_id     INT          NULL,
    timestamp     DATETIME2    NOT NULL DEFAULT SYSDATETIME(),
    ip_address    VARCHAR(45)  NULL,
    CONSTRAINT FK_AuditLogs_Users FOREIGN KEY (user_id)
        REFERENCES Users(user_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT CHK_AuditLogs_ActionType
        CHECK (action_type IN ('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT'))
);
GO

-- ============================================================
-- TABLE 17: Permissions
-- ============================================================
CREATE TABLE Permissions (
    permission_id INT          IDENTITY(1,1) PRIMARY KEY,
    role_id       INT          NOT NULL,
    module_name   VARCHAR(100) NOT NULL,
    can_read      BIT          NOT NULL DEFAULT 0,
    can_write     BIT          NOT NULL DEFAULT 0,
    can_delete    BIT          NOT NULL DEFAULT 0,
    CONSTRAINT FK_Permissions_Roles FOREIGN KEY (role_id)
        REFERENCES Roles(role_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION,
    CONSTRAINT UQ_Permissions_RoleModule UNIQUE (role_id, module_name)
);
GO

-- ============================================================
-- TABLE 18: StockAlerts
-- Corrected to 3NF: only stores alert_id, inventory_id, alert_time.
-- Resource/warehouse details fetched via JOIN at query time.
-- ============================================================
CREATE TABLE StockAlerts (
    alert_id     INT       IDENTITY(1,1) PRIMARY KEY,
    inventory_id INT       NOT NULL,
    alert_time   DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_StockAlerts_Inventory FOREIGN KEY (inventory_id)
        REFERENCES WarehouseInventory(inventory_id)
        ON UPDATE CASCADE
        ON DELETE NO ACTION
);
GO

-- ============================================================
-- SEED ROLES (required before Users, triggers, DML)
-- ============================================================
INSERT INTO Roles (role_name, description) VALUES
('Administrator',    'Full system access — manages users, roles, and permissions'),
('Emergency Operator','Creates and tracks emergency reports, assigns rescue teams'),
('Field Officer',    'Responds to assigned missions, updates mission status'),
('Warehouse Manager','Manages inventory and submits dispatch requests'),
('Finance Officer',  'Manages donations and expenses');
GO

-- ============================================================
-- SEED USERS (2 base users required by DDL; rest inserted in DML)
-- ============================================================
INSERT INTO Users (name, email, password_hash, phone, role_id, is_active) VALUES
('Sohaib Akhlaq',
 'admin@mis.pk',
 CONVERT(VARCHAR(256), HASHBYTES('SHA2_256', 'admin123'), 2),
 '03001234567', 1, 1),

('Operator User',
 'operator@mis.pk',
 CONVERT(VARCHAR(256), HASHBYTES('SHA2_256', 'op123'), 2),
 '03001112222', 2, 1);
GO

-- ============================================================
-- VERIFY TABLE CREATION
-- ============================================================
SELECT
    t.name        AS table_name,
    p.rows        AS row_count
FROM sys.tables  t
JOIN sys.partitions p ON t.object_id = p.object_id
                      AND p.index_id IN (0, 1)
ORDER BY t.name;
GO

PRINT '=== FILE 0: DDL Complete — All 18 tables created successfully. ===';
GO