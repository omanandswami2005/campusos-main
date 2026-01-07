# CampusOS Database Design

> Professional PostgreSQL database design for a multi-tenant campus management system.

## Architecture Overview

```mermaid
erDiagram
    College ||--o{ User : has
    College ||--o{ Club : hosts
    College ||--o{ Event : organizes
    College ||--o{ MenuItem : offers
    College ||--o{ PrintShop : has

    User ||--o{ RefreshToken : has
    User ||--o{ ClubMember : joins
    User ||--o{ EventRegistration : registers
    User ||--o{ CanteenOrder : places
    User ||--o{ PrintJob : submits

    Club ||--o{ ClubMember : has
    Club ||--o{ Event : organizes

    Event ||--o{ EventRegistration : accepts
    Event ||--o{ EventAttendance : tracks
    Event ||--o{ Certificate : issues

    CanteenOrder ||--o{ OrderItem : contains
    MenuItem ||--o{ OrderItem : included_in

    PrintShop ||--o{ PrintJob : processes
```

## Design Principles

### 1. Multi-Tenancy

- **College-scoped data**: All major entities (users, clubs, events, menu items) are scoped to a college
- **Tenant isolation**: `collegeId` foreign keys ensure data segregation
- **Indexing strategy**: All college-scoped tables have `@@index([collegeId])` for efficient queries

### 2. Normalization (3NF)

- Properly normalized to Third Normal Form
- Junction tables for many-to-many relationships (`ClubMember`, `EventRegistration`)
- Denormalized counts (`memberCount`, `registeredCount`) for read performance with triggers/app-level updates

### 3. Audit & Compliance

- `AuditLog` table captures all significant actions
- `createdAt`/`updatedAt` timestamps on all mutable entities
- Soft-delete pattern via `isActive` flags where appropriate

### 4. Security

- Password hashes stored (never plaintext)
- Refresh tokens with expiry and revocation support
- Role-based access control (RBAC) with `Role` enum

---

## Schema Modules

### Auth & Users

| Table            | Purpose                                   |
| ---------------- | ----------------------------------------- |
| `users`          | Core user accounts with role-based access |
| `refresh_tokens` | JWT refresh token management              |
| `colleges`       | Multi-tenant organization units           |

**Key Features:**

- CUID primary keys (URL-safe, unguessable)
- Email uniqueness constraint
- Last login tracking for analytics
- Email verification status

### Clubs & Events

| Table                 | Purpose                            |
| --------------------- | ---------------------------------- |
| `clubs`               | Student organizations              |
| `club_members`        | Club membership with roles         |
| `events`              | Campus events                      |
| `event_registrations` | Event sign-ups with ticket numbers |
| `event_attendance`    | Check-in/check-out tracking        |
| `event_feedback`      | Post-event ratings and comments    |
| `certificates`        | Achievement certificates           |

**Key Features:**

- Approval workflows (ClubStatus, ApprovalStatus)
- Capacity management with registeredCount
- Ticket number generation for registrations
- Multi-category feedback with JSON

### Canteen

| Table                | Purpose               |
| -------------------- | --------------------- |
| `menu_items`         | Food/beverage catalog |
| `canteen_orders`     | Order transactions    |
| `order_items`        | Line items per order  |
| `promotional_offers` | Discount codes        |
| `mess_voting_polls`  | Mess menu voting      |
| `mess_votes`         | Individual votes      |

**Key Features:**

- Price in cents (avoids floating-point issues)
- Order status workflow
- Promotional code with usage limits
- Voting with unique constraint per user

### Printing

| Table         | Purpose                |
| ------------- | ---------------------- |
| `print_shops` | Campus print locations |
| `print_jobs`  | Print requests         |

**Key Features:**

- Black/white vs color pricing
- Double-sided printing support
- Job status tracking

---

## Indexing Strategy

| Index Type         | Examples                                    | Purpose                 |
| ------------------ | ------------------------------------------- | ----------------------- |
| Primary            | `@id @default(cuid())`                      | Row identification      |
| Unique             | `email @unique`, `code @unique`             | Data integrity          |
| Foreign Key        | `@@index([collegeId])`                      | Join performance        |
| Query Optimization | `@@index([status])`, `@@index([createdAt])` | Filter/sort performance |
| Composite          | `@@unique([eventId, userId])`               | Prevent duplicates      |

---

## Production Considerations

### Scaling

- **Read replicas**: Schema supports read-heavy workloads
- **Partitioning candidates**: `notifications`, `audit_logs` by `createdAt`
- **Connection pooling**: Use Prisma Accelerate or PgBouncer

### Backup & Recovery

- Point-in-time recovery via PostgreSQL WAL
- Daily snapshots recommended
- `AuditLog` enables forensic analysis

### Migration Strategy

- Use `prisma migrate` for schema changes
- Always run migrations in transactions
- Test migrations on staging first

---

## Scripts Reference

| Command            | Description                            |
| ------------------ | -------------------------------------- |
| `pnpm db:generate` | Generate Prisma client                 |
| `pnpm db:push`     | Push schema to database (dev)          |
| `pnpm db:migrate`  | Create and run migrations (production) |
| `pnpm db:seed`     | Seed initial data                      |
| `pnpm db:studio`   | Open Prisma Studio GUI                 |

---

## Environment Variables

```bash
DATABASE_URL="postgresql://user:password@host:5432/campus_os?schema=public"
```

> **Note**: Use connection pooling URL for serverless deployments (Neon, Supabase).
