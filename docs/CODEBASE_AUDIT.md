# Campus OS — Codebase Audit & Improvement Plan

> **Date**: 2026-01-07  
> **Auditor**: Production Engineer Review  
> **Scope**: Full monorepo analysis

---

## Table of Contents

1. [Directory Structure](#directory-structure)
2. [Module Purpose & Current State](#module-purpose--current-state)
3. [Critical Issues](#critical-issues)
4. [Production Readiness Checklist](#production-readiness-checklist)
5. [Recommended Improvements](#recommended-improvements)
6. [Priority Action Items](#priority-action-items)

---

## Directory Structure

```
campus-os/
├── .github/                    # CI/CD workflows
├── apps/
│   ├── web/                    # Next.js 14 App Router (PWA)
│   │   ├── app/                # App router pages
│   │   │   ├── canteen/        # Canteen ordering demo
│   │   │   ├── canteen-auth/   # Auth + voting demo
│   │   │   ├── printing/       # Print shop demo
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── page.tsx        # Landing page
│   │   │   └── global.css      # Tailwind + custom styles
│   │   ├── src/                # (unused currently)
│   │   ├── tailwind.config.ts
│   │   ├── next.config.mjs
│   │   └── package.json
│   └── mobile/                 # Vite + React + Capacitor
│       ├── src/
│       │   ├── App.tsx         # Root component
│       │   ├── CanteenView.tsx
│       │   ├── CanteenAuthView.tsx
│       │   ├── PrintingView.tsx
│       │   └── main.tsx
│       ├── capacitor.config.ts
│       ├── vite.config.ts
│       └── package.json
├── packages/
│   ├── api-client/             # HTTP clients for services
│   │   └── src/
│   │       ├── http.ts         # Generic HTTP client
│   │       ├── canteen.ts      # Canteen API client
│   │       ├── printing.ts     # Printing API client
│   │       └── index.ts
│   ├── types/                  # Shared TypeScript interfaces
│   │   └── src/
│   │       ├── auth.ts         # Session, Role
│   │       ├── user.ts         # UserProfile
│   │       ├── canteen.ts      # MenuItem, Order, Offer, Poll, etc.
│   │       ├── printing.ts     # PrintShop, PrintJob, PrintJobConfig
│   │       ├── events.ts       # EventItem
│   │       └── index.ts
│   ├── ui/                     # Shared React components
│   │   └── src/
│   │       ├── primitives/
│   │       │   └── Button.tsx
│   │       ├── shell/
│   │       │   └── AppShell.tsx
│   │       └── index.tsx
│   ├── utils/                  # Shared utilities
│   │   └── src/
│   │       └── index.ts        # invariant, sleep, currency
│   └── config/                 # Shared configs
│       ├── eslint/index.cjs
│       ├── prettier/index.cjs
│       └── tsconfig/base.json
├── services/
│   ├── canteen/                # Food & Dining microservice
│   │   └── src/
│   │       ├── application/
│   │       │   ├── commands/   # createOrder, login, vote, etc.
│   │       │   ├── queries/    # listMenu, listOffers, listOrders, etc.
│   │       │   └── state/      # In-memory store
│   │       ├── domain/
│   │       │   └── entities/   # MenuItem entity
│   │       ├── infrastructure/
│   │       │   ├── api/        # HTTP server
│   │       │   └── auth/       # JWT helpers
│   │       └── index.ts
│   ├── printing/               # Smart Printing microservice
│   │   └── src/
│   │       ├── application/
│   │       │   ├── commands/   # createPrintJob
│   │       │   ├── queries/    # listShops, getJobStatus
│   │       │   └── state/      # In-memory store
│   │       ├── domain/
│   │       │   └── entities/   # PrintShop entity
│   │       ├── infrastructure/
│   │       │   └── api/        # HTTP server
│   │       └── index.ts
│   ├── auth/                   # (placeholder)
│   ├── events/                 # (placeholder)
│   ├── navigation/             # (placeholder)
│   ├── study-gpt/              # (placeholder)
│   └── users/                  # (placeholder)
├── docs/
│   ├── adr/                    # Architecture Decision Records
│   ├── api/                    # API documentation
│   ├── srs/                    # Software Requirements Specs
│   ├── printmodule.pdf         # Printing SRS
│   └── college-event.pdf       # Food & Dining SRS
├── infra/                      # IaC (empty placeholder)
├── scripts/                    # Automation scripts (empty)
├── package.json                # Root workspace config
├── pnpm-workspace.yaml         # Workspace definition
├── turbo.json                  # Turborepo task config
└── tsconfig.base.json          # Shared TS config
```

---

## Module Purpose & Current State

### Apps

| Module | Tech Stack | Purpose | State |
|--------|------------|---------|-------|
| `apps/web` | Next.js 14, Tailwind, React 18 | Main web application (PWA) | ✅ Running, basic pages |
| `apps/mobile` | Vite, React, Capacitor 6 | Cross-platform mobile app | ✅ Scaffolded, no native builds |

### Packages

| Package | Purpose | State |
|---------|---------|-------|
| `@campus-os/types` | Shared TypeScript interfaces | ✅ Complete for canteen/printing |
| `@campus-os/api-client` | HTTP clients for backend services | ✅ Functional, needs error handling |
| `@campus-os/ui` | Shared UI primitives | ⚠️ Minimal (Button, AppShell only) |
| `@campus-os/utils` | Helper functions | ⚠️ Minimal (3 functions) |
| `@campus-os/config` | ESLint, Prettier, TSConfig presets | ✅ Complete |

### Services

| Service | Port | Purpose | State |
|---------|------|---------|-------|
| `service-canteen` | 4000 | Menu, orders, offers, voting | ⚠️ Demo only, in-memory |
| `service-printing` | 4100 | Print shops, jobs | ⚠️ Demo only, in-memory |
| `auth` | — | Authentication service | ❌ Placeholder |
| `events` | — | Campus events | ❌ Placeholder |
| `users` | — | User profiles | ❌ Placeholder |
| `navigation` | — | Campus navigation | ❌ Placeholder |
| `study-gpt` | — | AI study assistant | ❌ Placeholder |

---

## Critical Issues

### 🔴 P0 — Must Fix Before Any Deployment

1. **Duplicate code blocks in config files**
   - `apps/mobile/capacitor.config.ts` has two config exports
   - `packages/api-client/src/http.ts` has two class definitions (ApiClient + HttpClient)
   - Causes unpredictable behavior

2. **No persistent storage**
   - All services use in-memory Maps
   - Data lost on restart
   - No database integration

3. **Insecure authentication**
   - JWT implementation is fake (signature not verified)
   - Hardcoded secret in memory.ts (`'demo-secret-key-change-in-prod'`)
   - No password hashing
   - No token expiration enforcement

4. **Missing CORS on printing service**
   - Canteen has CORS, printing does not
   - Browser calls will fail

5. **Hardcoded localhost URLs in frontend**
   - Services assume `localhost:4000` and `localhost:4100`
   - Won't work in Codespaces/production without env vars

### 🟡 P1 — Fix Before Beta

6. **No input validation**
   - Services accept any JSON without schema validation
   - No Zod/Yup/Joi integration

7. **No error boundaries**
   - Frontend crashes on any unhandled error
   - No React Error Boundaries

8. **No logging/observability**
   - No structured logging
   - No metrics/traces
   - No health check endpoints with dependencies

9. **No rate limiting**
   - APIs vulnerable to abuse
   - No request throttling

10. **No tests**
    - Zero unit/integration/e2e tests
    - No test infrastructure

---

## Production Readiness Checklist

| Category | Item | Status |
|----------|------|--------|
| **Build** | TypeScript compiles | ✅ |
| | ESLint passes | ⚠️ Not enforced in CI |
| | Turbo caching works | ✅ |
| **Security** | Secrets management | ❌ Hardcoded |
| | Auth tokens secure | ❌ Fake JWT |
| | Input sanitization | ❌ None |
| | CORS configured | ⚠️ Partial |
| | HTTPS enforced | ❌ Not configured |
| **Reliability** | Error handling | ❌ Minimal |
| | Graceful shutdown | ❌ Not implemented |
| | Health checks | ⚠️ Basic `/health` only |
| | Circuit breakers | ❌ None |
| **Observability** | Structured logging | ❌ console.log only |
| | Metrics | ❌ None |
| | Tracing | ❌ None |
| | Alerting | ❌ None |
| **Database** | Persistent storage | ❌ In-memory only |
| | Migrations | ❌ None |
| | Connection pooling | ❌ N/A |
| **Testing** | Unit tests | ❌ None |
| | Integration tests | ❌ None |
| | E2E tests | ❌ None |
| **DevOps** | CI pipeline | ⚠️ Placeholder |
| | CD pipeline | ❌ None |
| | Docker images | ❌ None |
| | K8s manifests | ❌ None |
| **Documentation** | API docs | ❌ Empty |
| | ADRs | ❌ Empty |
| | Runbooks | ❌ None |

---

## Recommended Improvements

### Tier 1: Foundation (Week 1-2)

#### 1.1 Fix Duplicate Code
```bash
# Files to deduplicate:
apps/mobile/capacitor.config.ts
packages/api-client/src/http.ts
```

#### 1.2 Add Database Layer
- Integrate PostgreSQL or MongoDB
- Add Prisma/Drizzle ORM
- Create migration system
- Implement repository pattern

```typescript
// Suggested structure
services/canteen/src/infrastructure/db/
├── client.ts         # DB connection
├── repositories/
│   ├── orderRepository.ts
│   ├── menuRepository.ts
│   └── pollRepository.ts
└── migrations/
```

#### 1.3 Implement Real Authentication
- Use `jose` or `jsonwebtoken` for proper JWT
- Add bcrypt password hashing
- Implement refresh tokens
- Add OAuth2 providers (Google, Microsoft)

```typescript
// packages/auth/
├── src/
│   ├── jwt.ts           # Real JWT signing/verification
│   ├── hash.ts          # bcrypt wrapper
│   ├── oauth/
│   │   ├── google.ts
│   │   └── microsoft.ts
│   └── middleware.ts    # Express/Hono auth middleware
```

#### 1.4 Environment Configuration
```bash
# Create .env.example for each app/service
apps/web/.env.example:
  NEXT_PUBLIC_CANTEEN_API=
  NEXT_PUBLIC_PRINTING_API=
  NEXT_PUBLIC_AUTH_API=

services/canteen/.env.example:
  PORT=4000
  DATABASE_URL=
  JWT_SECRET=
  CORS_ORIGINS=
```

### Tier 2: Reliability (Week 3-4)

#### 2.1 Input Validation
```typescript
// Add Zod schemas
// packages/types/src/canteen.schema.ts
import { z } from 'zod';

export const CreateOrderSchema = z.object({
  userId: z.string().uuid(),
  collegeId: z.string(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().positive()
  })).min(1),
  deliveryLocation: z.string().min(1),
  paymentMethod: z.enum(['online', 'cash']),
  appliedOffer: z.string().optional()
});
```

#### 2.2 Error Handling
```typescript
// packages/utils/src/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public isOperational = true
  ) {
    super(message);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 'NOT_FOUND', 404);
  }
}
```

#### 2.3 Structured Logging
```typescript
// packages/utils/src/logger.ts
import pino from 'pino';

export const createLogger = (service: string) => pino({
  name: service,
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  }
});
```

#### 2.4 Health Checks
```typescript
// Proper health check with dependencies
app.get('/health', async (req, res) => {
  const checks = {
    database: await checkDb(),
    redis: await checkRedis(),
    memory: process.memoryUsage()
  };
  const healthy = Object.values(checks).every(c => c.status === 'ok');
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'degraded', checks });
});
```

### Tier 3: Testing (Week 5-6)

#### 3.1 Test Infrastructure
```bash
pnpm add -Dw vitest @testing-library/react @playwright/test msw
```

```typescript
// vitest.workspace.ts
export default [
  'packages/*',
  'services/*',
  'apps/*'
];
```

#### 3.2 Unit Tests
```typescript
// services/canteen/src/application/commands/__tests__/createOrder.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createOrder } from '../createOrder';
import { memory } from '../../state/memory';

describe('createOrder', () => {
  beforeEach(() => {
    memory.orders.clear();
  });

  it('calculates correct total with percentage discount', async () => {
    const order = await createOrder({
      userId: 'user-1',
      collegeId: 'college-a',
      items: [{ menuItemId: 'item-coffee', quantity: 2 }],
      deliveryLocation: 'Block A',
      paymentMethod: 'online',
      appliedOffer: 'SAVE10'
    });
    expect(order.discountCents).toBeGreaterThan(0);
    expect(order.totalCents).toBeLessThan(order.subtotalCents);
  });
});
```

#### 3.3 E2E Tests
```typescript
// apps/web/e2e/canteen.spec.ts
import { test, expect } from '@playwright/test';

test('can place an order', async ({ page }) => {
  await page.goto('/canteen');
  await page.click('text=Login');
  await page.fill('[placeholder="Email"]', 'demo@college.edu');
  await page.fill('[placeholder="Password"]', 'demo123');
  await page.click('button:has-text("Login")');
  await page.click('button:has-text("Order")');
  await expect(page.locator('text=Order placed')).toBeVisible();
});
```

### Tier 4: DevOps (Week 7-8)

#### 4.1 Dockerfiles
```dockerfile
# services/canteen/Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages ./packages
COPY services/canteen ./services/canteen
RUN corepack enable && pnpm install --frozen-lockfile
RUN pnpm --filter @campus-os/service-canteen build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/services/canteen/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 4000
CMD ["node", "dist/index.js"]
```

#### 4.2 Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: campus_os
      POSTGRES_USER: campus
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pgdata:/var/lib/postgresql/data

  canteen:
    build:
      context: .
      dockerfile: services/canteen/Dockerfile
    environment:
      DATABASE_URL: postgres://campus:${DB_PASSWORD}@postgres:5432/campus_os
      JWT_SECRET: ${JWT_SECRET}
    depends_on:
      - postgres
    ports:
      - "4000:4000"

  printing:
    build:
      context: .
      dockerfile: services/printing/Dockerfile
    ports:
      - "4100:4100"

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    environment:
      NEXT_PUBLIC_CANTEEN_API: http://canteen:4000
      NEXT_PUBLIC_PRINTING_API: http://printing:4100
    ports:
      - "3000:3000"

volumes:
  pgdata:
```

#### 4.3 GitHub Actions CI
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]

jobs:
  lint-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm test

  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

### Tier 5: UI/UX (Ongoing)

#### 5.1 Expand UI Library
```
packages/ui/src/
├── primitives/
│   ├── Button.tsx        ✅ Exists
│   ├── Input.tsx         ❌ Add
│   ├── Select.tsx        ❌ Add
│   ├── Modal.tsx         ❌ Add
│   ├── Toast.tsx         ❌ Add
│   ├── Card.tsx          ❌ Add
│   ├── Badge.tsx         ❌ Add
│   └── Spinner.tsx       ❌ Add
├── patterns/
│   ├── FormField.tsx     ❌ Add
│   ├── DataTable.tsx     ❌ Add
│   └── EmptyState.tsx    ❌ Add
├── shell/
│   ├── AppShell.tsx      ✅ Exists
│   ├── Sidebar.tsx       ❌ Add
│   └── NavBar.tsx        ❌ Add
└── index.tsx
```

#### 5.2 Add Loading & Error States
```tsx
// packages/ui/src/patterns/AsyncView.tsx
export const AsyncView = <T,>({
  loading,
  error,
  data,
  children
}: {
  loading: boolean;
  error: Error | null;
  data: T | null;
  children: (data: T) => ReactNode;
}) => {
  if (loading) return <Spinner />;
  if (error) return <ErrorCard error={error} />;
  if (!data) return <EmptyState />;
  return <>{children(data)}</>;
};
```

---

## Priority Action Items

### Immediate (This Week)
| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 1 | Fix duplicate capacitor config | `apps/mobile/capacitor.config.ts` | 5 min |
| 2 | Fix duplicate http client | `packages/api-client/src/http.ts` | 10 min |
| 3 | Add CORS to printing service | `services/printing/src/infrastructure/api/server.ts` | 10 min |
| 4 | Add env var support for API URLs | `apps/web/app/canteen/page.tsx`, etc. | 30 min |
| 5 | Create `.env.example` files | All apps/services | 20 min |

### Short-term (Next 2 Weeks)
| # | Task | Effort |
|---|------|--------|
| 6 | Add PostgreSQL + Prisma to canteen service | 1 day |
| 7 | Implement real JWT with jose | 4 hours |
| 8 | Add bcrypt password hashing | 2 hours |
| 9 | Add Zod validation to all endpoints | 1 day |
| 10 | Add Vitest + first unit tests | 1 day |

### Medium-term (Next Month)
| # | Task | Effort |
|---|------|--------|
| 11 | Implement all SRS requirements for canteen | 1 week |
| 12 | Implement all SRS requirements for printing | 1 week |
| 13 | Add Playwright E2E tests | 2 days |
| 14 | Create Dockerfiles + compose | 1 day |
| 15 | Set up GitHub Actions CI | 4 hours |

---

## Architecture Recommendations

### Current vs Recommended

```
CURRENT (Monolithic Services)          RECOMMENDED (Clean Architecture)
┌─────────────────────────────┐       ┌─────────────────────────────────────┐
│  HTTP Handler               │       │  Infrastructure Layer               │
│  ├─ routes all in server.ts │       │  ├─ api/ (HTTP/GraphQL handlers)    │
│  ├─ business logic inline   │       │  ├─ db/ (repositories)              │
│  └─ in-memory state         │       │  ├─ auth/ (JWT, OAuth)              │
└─────────────────────────────┘       │  └─ messaging/ (events, queues)     │
                                      ├─────────────────────────────────────┤
                                      │  Application Layer                  │
                                      │  ├─ commands/ (write operations)    │
                                      │  ├─ queries/ (read operations)      │
                                      │  └─ services/ (orchestration)       │
                                      ├─────────────────────────────────────┤
                                      │  Domain Layer                       │
                                      │  ├─ entities/ (business objects)    │
                                      │  ├─ value-objects/                  │
                                      │  └─ domain-events/                  │
                                      └─────────────────────────────────────┘
```

### API Gateway Pattern
For production, consider adding an API gateway:

```
┌──────────┐     ┌─────────────┐     ┌──────────────┐
│  Client  │────▶│ API Gateway │────▶│ Auth Service │
└──────────┘     │ (Kong/Envoy)│     └──────────────┘
                 │             │     ┌──────────────┐
                 │  - Auth     │────▶│   Canteen    │
                 │  - Rate Limit│    └──────────────┘
                 │  - Logging  │     ┌──────────────┐
                 │             │────▶│   Printing   │
                 └─────────────┘     └──────────────┘
```

---

## Conclusion

The Campus OS codebase has a solid **monorepo foundation** with proper tooling (pnpm, Turbo, shared configs). However, it's currently a **demo/prototype** with critical gaps in:

1. **Security** — No real auth, hardcoded secrets
2. **Persistence** — In-memory only
3. **Reliability** — No validation, error handling, or tests
4. **Operability** — No logging, metrics, or deployment configs

**Estimated effort to production-ready MVP**: 4-6 weeks with 1-2 engineers.

The SRS documents (printmodule.pdf, college-event.pdf) outline comprehensive requirements that are ~20% implemented. Prioritize database integration and auth before adding more features.

---

*Generated by Production Engineer Audit • Campus OS v0.1.0*
