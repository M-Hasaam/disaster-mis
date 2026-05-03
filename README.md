# Disaster Response MIS

A full-stack **Management Information System** for coordinating disaster relief operations — from citizen emergency reports through rescue dispatch, hospital management, warehouse logistics, and financial tracking, with a complete audit trail.

Built as a university database project demonstrating ACID transactions, triggers, stored procedures, views, indexing, and role-based access control on a modern Next.js stack.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| UI | React 19, Tailwind CSS v4, Framer Motion v12 |
| Charts | Recharts v2 |
| Auth | NextAuth v4 (JWT, credentials) |
| Database | Microsoft SQL Server (`mssql` v12) |
| Forms | React Hook Form + Zod v4 |
| Language | TypeScript 5 |

---

## Features

**Five role-based dashboards**, each scoped to a distinct operational domain:

| Role | Route | Key Capabilities |
|---|---|---|
| Administrator | `/admin` | System KPIs, user management, approval workflows, audit trail |
| Emergency Operator | `/operator` | Incident queue, rescue team dispatch, hospital bed availability |
| Field Officer | `/field-officer` | Active missions, team status tracking |
| Warehouse Manager | `/warehouse` | Inventory levels, stock alerts, resource allocation |
| Finance Officer | `/finance` | Donations, expenses, financial summaries |

**Cross-cutting features:**
- Reports hub (`/reports`) — financial summaries, incident statistics, response time analysis, audit exports
- Performance dashboard (`/performance`) — query benchmarks and DB metrics
- Dark mode toggle with live sidebar clock

**Database highlights:**
- 8 triggers (low-stock alerts, team status transitions, full audit logging)
- 5 analytical views (`vw_ActiveEmergencies`, `vw_HospitalCapacity`, `vw_TeamActivityHistory`, `vw_WarehouseStockSummary`, `vw_FinancialSummaryByDisaster`)
- 4 ACID transactions with rollback support
- 25+ indexes for query performance
- Per-operation audit log via `sp_set_session_context` — every write is attributed to the authenticated user

---

## Prerequisites

- **Node.js** 18+
- **Microsoft SQL Server** (Express or full edition) — local or remote instance

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create `.env.local` in the project root:

```env
# SQL Server connection
DB_SERVER=DESKTOP-NAME\SQLEXPRESS    # or localhost for default instance
DB_DATABASE=DisasterResponseMIS
DB_USER=sa
DB_PASSWORD=your_password
DB_TRUST_SERVER_CERTIFICATE=true
DB_PORT=1433                         # optional — omit to use SQL Server Browser

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_secret          # generate with: openssl rand -base64 32
```

### 3. Set up the database

Run the SQL scripts **in order** against your SQL Server instance:

| File | Purpose |
|---|---|
| `SQL/01_DDL_CreateTables.sql` | Schema — 17 tables with constraints |
| `SQL/02_DDL_Indexes.sql` | 25+ performance indexes |
| `SQL/03_DML_SampleData.sql` | Base seed data (citizens, teams, reports, inventory) |
| `SQL/04_Triggers.sql` | 8 triggers (audit, stock alerts, team status) |
| `SQL/05_Views.sql` | 5 analytical views |
| `SQL/06_Queries_Transactions.sql` | 9 analytical queries and 4 ACID transactions |
| `SQL/07_AdditionalData.sql` | Extended emergency reports and audit logs |
| `SQL/08_HospitalPatientData.sql` | Hospitals and bulk patient data |
| `SQL/09_MissionData.sql` | Rescue teams and team assignments |
| `SQL/10_ComprehensiveData.sql` | Full dataset — pending approvals, donations, stock alerts |

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the root redirects to `/login`.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Administrator | `admin@mis.pk` | `admin123` |
| Emergency Operator | `operator@mis.pk` | `op123` |
| Warehouse Manager | `warehouse@mis.pk` | `wh123` |
| Finance Officer | `finance@mis.pk` | `fin123` |

The login page includes one-click buttons for each demo account.

---

## Project Structure

```
disaster-mis/
├── app/
│   ├── (dashboard)/
│   │   ├── admin/             # Admin dashboard + user/approval management
│   │   ├── operator/          # Incident queue + hospital availability
│   │   ├── field-officer/     # Mission tracking
│   │   ├── warehouse/         # Inventory management
│   │   ├── finance/           # Financial transactions
│   │   ├── reports/           # Cross-role reporting hub
│   │   └── performance/       # DB performance metrics
│   ├── api/                   # REST API routes (GET/POST/PATCH/DELETE)
│   ├── login/                 # Authentication page
│   └── layout.tsx             # Root layout
├── src/
│   ├── lib/
│   │   ├── db.ts              # MSSQL connection pool + query/transaction helpers
│   │   └── auth.ts            # NextAuth config (JWT, role-based redirects)
│   ├── actions/               # Server-side transaction handlers
│   ├── components/ui/         # Design system (StatCard, DataTable, Modal, StatusBadge…)
│   └── middleware.ts          # Route protection + role-based redirects
└── SQL/                       # All database scripts (run in numbered order)
```

---

## Scripts

```bash
npm run dev      # Development server with hot reload
npm run build    # Production build
npm start        # Start production server
npm run lint     # ESLint
```

---

## Team

**FAST-NUCES — Database Systems, Spring 2026**

| Name | Roll No. |
|---|---|
| Sohaib Akhlaq | 24I-3108 |
| Shaiman Qasir | 24I-3074 |
| Muhammad Hasaam | 24I-3107 |
