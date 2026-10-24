# Medi Lanka - Embassy Aid Connect
### Medical Consultation System (Full-Stack Architecture)

A secure, web-based medical consultation system designed for embassy-recommended doctors serving foreign visitors in Sri Lanka.

---

## 🏗️ Architecture Overview

The project is structured with clean separation of concerns:

```
embassy-aid-connect/
├── frontend/                     # React 18 + Vite + TypeScript + TailwindCSS
│   ├── .env                      # Frontend environment variables
│   ├── .env.example              # Frontend environment template
│   ├── src/
│   │   ├── components/           # UI & Layout components (Unchanged UI)
│   │   ├── hooks/                # React hooks (useAuth, useToast, etc.)
│   │   ├── pages/                # Patient flow, Doctor queue, Admin dashboards
│   │   ├── services/             # Clean API client replacing Supabase
│   │   └── types/                # TypeScript interfaces matching PostgreSQL schema
│   ├── package.json
│   └── vite.config.ts
│
├── server/                       # Node.js + Express + TypeScript + PostgreSQL
│   ├── .env                      # Server environment variables (PostgreSQL config)
│   ├── .env.example              # Server environment template
│   ├── src/
│   │   ├── config/               # PostgreSQL pool connection (pg)
│   │   ├── controllers/          # Controllers (Auth, Consultations, Patients, Payments, Reports, Audit)
│   │   ├── db/
│   │   │   ├── schema.sql        # Complete PostgreSQL DDL (Tables, Enums, Triggers, Seeds)
│   │   │   └── initDb.ts         # Automated database schema initializer
│   │   ├── middleware/           # Auth JWT verification and error handlers
│   │   ├── routes/               # Clean RESTful API routes
│   │   └── index.ts              # Express application entry point
│   ├── package.json
│   └── tsconfig.json
│
└── package.json                  # Root monorepo orchestration scripts
```

---

## 🚀 Quick Start

### 1. Install Dependencies
Run in the root directory:
```bash
# Install frontend dependencies
cd frontend && npm install && cd ..

# Install server dependencies
cd server && npm install && cd ..
```

### 2. Run the Development Servers
From the root directory:
```bash
# Start frontend (Vite on http://localhost:8080)
npm run dev:frontend

# Start backend (Express on http://localhost:5000)
npm run dev:server
```

---

## 🗄️ PostgreSQL Setup

### 1. Configure Database Credentials
Open `server/.env` and update `DATABASE_URL` with your PostgreSQL connection string:
```env
DATABASE_URL=postgresql://your_user:your_password@your_host:5432/your_database
```

Or configure individual parameters:
```env
PGHOST=localhost
PGPORT=5432
PGDATABASE=medilanka
PGUSER=postgres
PGPASSWORD=your_password
```

### 2. Initialize Database Tables & Seed Data
Run the automated schema runner to create all tables, indexes, enums, triggers, and default seed accounts:
```bash
npm run db:init
```
*(Or inside `server/`: `npm run db:init`)*

This executes `server/src/db/schema.sql` automatically!

---

## 🔑 Default Accounts (Seed Data)

| Role | Email | Password |
|---|---|---|
| **Doctor** | `doctor@medilanka.com` | `doctor123` |
| **Admin** | `admin@medilanka.com` | `admin123` |

---

## 🛡️ Key Security & Data Privacy
- **Separated Environment Files**: No root `.env` file containing mixed credentials.
- **Data Protection**: Patient passport and emergency contacts are masked in patient-facing screens and restricted to verified medical personnel.
- **Audit Logging**: Full audit trail of system activities recorded in the `audit_logs` table.
