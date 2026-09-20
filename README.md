# Mind Refill

A serious production-grade psychology and mental wellbeing platform connecting:
* **Clients** seeking psychological support
* **Verified psychologists** providing professional care
* **Human coordinators** facilitating thoughtful, empathetic matching
* **Platform administrators** ensuring regulatory compliance, credential verification, and financial integrity

Built with **Next.js (App Router)**, **TypeScript**, **PostgreSQL**, **Prisma ORM**, **Tailwind CSS**, **Zod**, and **Vitest**.

---

## 1. Architecture Overview

The system follows a **Modular Monolith** architecture pattern. Business logic lives strictly within decoupled domain modules and shared layers rather than leaking into UI components or external service boundaries.

```text
src/
├── app/                  # Next.js App Router (Public routes, dashboards, safe API endpoints)
├── modules/              # 22 Domain Modules
│   ├── identity          # Users, sessions, credentials, auth accounts
│   ├── authorization     # RBAC (CLIENT, PSYCHOLOGIST, COORDINATOR, ADMIN), capabilities
│   ├── profiles          # Client, Psychologist, Staff profile records
│   ├── directory         # Public directory search, filtering, and indexing
│   ├── verification      # License review workflow and document audit
│   ├── portfolio         # Psychologist portfolio and template system
│   ├── intake            # Client intake surveys & triage assessment
│   ├── coordination      # Coordinator matching queues, notes, and workflows
│   ├── scheduling        # Availability rules, exceptions, booking holds
│   ├── billing           # Payment intents, transactions, commission calculation
│   ├── payouts           # Psychologist settlement items and payout batches
│   ├── subscriptions     # Psychologist platform subscription tiers
│   ├── content           # Professional articles, resources, and video references
│   ├── commerce          # E-books, orders, and authorized downloads
│   ├── events            # Workshops, webinars, atomic capacity registrations
│   ├── notifications     # In-app and transactional notifications
│   ├── analytics         # Safe aggregated metrics without exposing sensitive PII
│   ├── admin             # Platform management, moderation, user control
│   ├── audit             # Audit logging for sensitive state transitions
│   ├── platform-settings # Configurable platform policies, fees, currencies
│   ├── storage           # Secure private object storage and signed URLs
│   └── jobs              # Background queue abstractions and workers
└── shared/               # Cross-Cutting Shared Modules
    ├── config            # Typed Zod environment and platform configuration
    ├── database          # Prisma client connection manager
    ├── errors            # Standard error hierarchy and safe sanitization
    ├── logging           # Structured JSON logger with automated PII redaction
    ├── security          # Input sanitization and authorization guards
    ├── types             # Monetary math (BigInt minors) and domain types
    └── validation        # Common validation rules and schemas
```

---

## 2. Core Architectural Principles

1. **Human-Led Clinical Matching**: AI never diagnoses clients, never provides clinical recommendations, and never independently decides suitability. Clinical matching is coordinator-led.
2. **Strict Public vs. Private Data Boundary**: Public DTOs explicitly strip private fields. Verification documents, clinical intake notes, and financial details are inaccessible via public APIs.
3. **No Floating-Point Money**: All financial values are stored in minor units (`amountMinor BigInt`, `currency Char(3)`). Platform commission and net psychologist earnings are snapshot at transaction time.
4. **Provider Neutrality**: Payment (`PaymentProvider`), AI (`AIProvider`), Email (`EmailProvider`), and Storage (`StorageProvider`) are decoupled behind clean interfaces.

---

## 3. Setup & Installation

### Prerequisites
* Node.js `v20+` (Tested on `v24.14.1`)
* PostgreSQL `v14+`
* npm / pnpm

### Quick Start
```bash
# 1. Clone or navigate to the repository
cd psychology-platform

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env

# 4. Generate Prisma Client
npm run prisma:generate

# 5. Run Database Migrations (against your PostgreSQL instance)
npm run prisma:migrate

# 6. Start Development Server
npm run dev
```

Visit `http://localhost:3000` to view the platform.

---

## 4. Environment Variables

All variables are strictly validated at runtime using Zod in `src/shared/config/env.ts`.

| Variable | Description | Default |
| :--- | :--- | :--- |
| `NODE_ENV` | Runtime environment (`development`, `test`, `production`) | `development` |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `SESSION_SECRET` | Cryptographic secret for session cookie signing (min 32 chars) | Required |
| `STORAGE_PROVIDER` | Object storage engine (`local`, `s3`) | `local` |
| `PAYMENT_PROVIDER` | Payment adapter (`mock`, `stripe`, `razorpay`) | `mock` |
| `AI_PROVIDER` | AI provider for structured portfolio generation (`mock`, `openai`, `gemini`) | `mock` |
| `EMAIL_PROVIDER` | Transactional email provider (`mock`, `resend`, `ses`) | `mock` |
| `DEFAULT_CURRENCY` | Default ISO currency code | `INR` |
| `DEFAULT_COMMISSION_PERCENT` | Default platform commission percentage | `10` |
| `DEFAULT_SETTLEMENT_DAYS` | Days before transaction is eligible for psychologist payout | `7` |

See `.env.example` for the complete list of variables.

---

## 5. Database & Migrations

The database uses **Prisma ORM** targeting **PostgreSQL**.

* **Schema**: [`prisma/schema.prisma`](prisma/schema.prisma)
* **Generate Client**: `npm run prisma:generate`
* **Create Migration**: `npm run prisma:migrate`
* **Prisma Studio**: `npm run prisma:studio`

> **Note**: In production, migrations must be executed as a controlled deployment step (`npx prisma migrate deploy`). Destructive migrations should never run automatically during container startup.

---

## 6. Verification & Quality Gates

Run the verification pipeline:

```bash
# 1. Type Checking
npm run typecheck

# 2. Linting
npm run lint

# 3. Unit & Architecture Tests
npm run test

# 4. Production Build
npm run build
```

---

## 7. Roadmap Phases

* [x] **PHASE 0** — Architecture + Repository Foundation *(Completed)*
* [ ] **PHASE 1** — Identity, Authentication, RBAC + Core Infrastructure
* [ ] **PHASE 2** — Psychologist Profiles + Verification + Public Directory
* [ ] **PHASE 3** — Client Intake + Coordinator Matching
* [ ] **PHASE 4** — Availability + Booking + Appointment Management
* [ ] **PHASE 5** — Payments + Commission + Settlement + Payouts
* [ ] **PHASE 6** — Psychologist Subscriptions
* [ ] **PHASE 7** — AI Professional Portfolio Builder
* [ ] **PHASE 8** — Content + E-books + Events
* [ ] **PHASE 9** — Notifications + Analytics
* [ ] **PHASE 10** — Security Hardening + Testing + Production Readiness
* [ ] **PHASE 11** — Launch Preparation + Scale Foundation
