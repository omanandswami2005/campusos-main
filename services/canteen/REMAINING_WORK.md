# Canteen Service - Remaining Work

> **Last Updated**: 2026-01-08  
> **Status**: MVP Implementation In Progress

---

## ✅ What's Complete

- API structure (commands/queries pattern)
- HTTP server with CORS, logging, auth middleware
- Menu listing endpoint
- Order creation logic (validation, discount calculation)
- Order status updates with OTP verification
- Promotional offers system
- Mess voting/polls system
- API client in `@campus-os/api-client`
- Prisma schema ready (`CanteenOrder`, `MenuItem`, `OrderItem`)

---

## 🔴 Critical - Must Have for MVP

### 1. Database Persistence

**Current**: In-memory storage (`application/state/memory.ts`)  
**Needed**: Migrate to Prisma/PostgreSQL

```typescript
// Replace memory.orders.set() with:
await prisma.canteenOrder.create({ data: orderData });
```

**Files to modify:**

- `application/state/memory.ts` → Remove or replace
- `application/commands/createOrder.ts` → Use Prisma
- `application/commands/updateOrderStatus.ts` → Use Prisma
- `application/queries/*.ts` → Use Prisma queries

### 2. Payment Integration

**Current**: No real payment processing  
**Needed**: Razorpay integration

- Create Razorpay order when user checks out
- Return `razorpay_order_id` to frontend
- Verify payment signature on callback
- Update order `paymentStatus` after verification

### 3. Web Checkout Flow

**Current**: Shows "not implemented" alert  
**Needed**: Working Razorpay popup

**File**: `apps/web/app/canteen/page.tsx` (line 120)

```typescript
// Replace:
onClick={() => alert('Checkout not implemented')}
// With Razorpay checkout integration
```

---

## 🟡 Important - Should Have

### 4. Seed Data

Add sample menu items to database:

```sql
INSERT INTO menu_items (name, price_cents, category, college_id, available)
VALUES
  ('Masala Dosa', 6000, 'MEALS', 'college-a', true),
  ('Samosa', 2000, 'SNACKS', 'college-a', true),
  ('Chai', 1500, 'BEVERAGES', 'college-a', true);
```

### 5. Order History Page

- Create `/canteen/orders` page
- Show user's past orders
- Display order status with timeline

### 6. Real-time Order Updates

- WebSocket or polling for order status
- Push notifications when order ready

---

## 🟢 Nice to Have - Future

### 7. Admin Panel

- Canteen staff dashboard
- Update order status (preparing → ready)
- Manage menu items
- View analytics

### 8. Promotional Offers

- Apply coupon codes at checkout
- First-order discounts
- Referral bonuses

### 9. Mess Voting (Already has API)

- UI for voting on mess food
- Results visualization
- Weekly poll scheduling

### 10. Mobile App Updates

- Push notifications
- Order tracking with map
- Save favorite orders

---

## Environment Variables Needed

Add these to your `.env` file:

```env
# Database
DATABASE_URL=postgresql://...

# Razorpay (get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx

# Service URLs (for frontend)
NEXT_PUBLIC_CANTEEN_API=http://localhost:4000
NEXT_PUBLIC_PAYMENT_API=http://localhost:4400

# Optional
JWT_SECRET=your-secret-key-change-in-prod
CANTEEN_OTP_EXPIRY_MINS=30
```

---

## Quick Start Commands

```bash
# Install dependencies
pnpm install

# Push database schema
pnpm db:push

# Start canteen service
pnpm dev:canteen   # or: cd services/canteen && pnpm dev

# Start payment service
pnpm dev:payment   # or: cd services/payment && pnpm dev

# Start web frontend
cd apps/web && pnpm dev
```

---

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web/App   │────▶│   Canteen   │────▶│   Payment   │
│  Frontend   │     │   :4000     │     │   :4400     │
└─────────────┘     └──────┬──────┘     └──────┬──────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐      ┌─────────────┐
                    │  PostgreSQL │      │  Razorpay   │
                    │   (Neon)    │      │    API      │
                    └─────────────┘      └─────────────┘
```
