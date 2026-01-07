# CampusOS API Contracts

> RESTful API documentation for all CampusOS services.

## Services Overview

| Service  | Port | Base URL  | Description                             |
| -------- | ---- | --------- | --------------------------------------- |
| Auth     | 4300 | `/auth/*` | Authentication & user management        |
| Canteen  | 4000 | `/`       | Food ordering, menu, voting             |
| Events   | 4200 | `/`       | Events, clubs, certificates, attendance |
| Printing | 4100 | `/`       | Print job management                    |

---

## Auth Service (Port 4300)

### Public Endpoints

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| GET    | `/health`               | Health check              |
| POST   | `/auth/register`        | Register new user         |
| POST   | `/auth/login`           | Login with email/password |
| POST   | `/auth/refresh`         | Refresh access token      |
| POST   | `/auth/forgot-password` | Request password reset    |
| POST   | `/auth/reset-password`  | Reset password with token |

### Protected Endpoints (Requires Bearer Token)

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/auth/me`              | Get current user profile |
| PUT    | `/auth/me`              | Update profile           |
| GET    | `/auth/verify`          | Verify token validity    |
| POST   | `/auth/logout`          | Logout (revoke token)    |
| POST   | `/auth/logout-all`      | Logout all devices       |
| POST   | `/auth/change-password` | Change password          |

---

## Canteen Service (Port 4000)

### Public Endpoints

| Method | Endpoint  | Description             |
| ------ | --------- | ----------------------- |
| GET    | `/health` | Health check            |
| POST   | `/login`  | Service login           |
| GET    | `/menu`   | List menu items         |
| GET    | `/offers` | List promotional offers |
| GET    | `/polls`  | List voting polls       |

### Protected Endpoints

| Method | Endpoint             | Description         |
| ------ | -------------------- | ------------------- |
| POST   | `/orders`            | Create order        |
| GET    | `/orders`            | List user orders    |
| GET    | `/orders/:id`        | Get order details   |
| POST   | `/orders/:id/status` | Update order status |
| POST   | `/polls`             | Create poll         |
| POST   | `/vote`              | Vote on poll        |

---

## Events Service (Port 4200)

### Public Endpoints

| Method | Endpoint               | Description           |
| ------ | ---------------------- | --------------------- |
| GET    | `/health`              | Health check          |
| GET    | `/categories`          | List event categories |
| GET    | `/clubs`               | List clubs            |
| GET    | `/clubs/:id`           | Get club details      |
| GET    | `/events`              | List events           |
| GET    | `/events/upcoming`     | Get upcoming events   |
| GET    | `/events/:id`          | Get event details     |
| GET    | `/certificates/verify` | Verify certificate    |

### Protected Endpoints

| Method | Endpoint                  | Description                      |
| ------ | ------------------------- | -------------------------------- |
| POST   | `/clubs`                  | Create club                      |
| PUT    | `/clubs/:id`              | Update club                      |
| POST   | `/events`                 | Create event (coordinator/admin) |
| PUT    | `/events/:id`             | Update event                     |
| POST   | `/events/:id/register`    | Register for event               |
| GET    | `/registrations`          | List user's registrations        |
| DELETE | `/registrations/:id`      | Cancel registration              |
| POST   | `/events/:id/feedback`    | Submit feedback                  |
| GET    | `/certificates`           | List user's certificates         |
| GET    | `/notifications`          | List notifications               |
| PUT    | `/notifications/:id/read` | Mark as read                     |

### Admin Endpoints

| Method | Endpoint                   | Description           |
| ------ | -------------------------- | --------------------- |
| POST   | `/clubs/:id/approve`       | Approve club          |
| POST   | `/clubs/:id/suspend`       | Suspend club          |
| POST   | `/events/:id/approve`      | Approve event         |
| GET    | `/events/:id/attendance`   | Get attendance        |
| POST   | `/events/:id/attendance`   | Mark attendance       |
| GET    | `/events/:id/feedback`     | Get feedback          |
| POST   | `/events/:id/certificates` | Generate certificates |
| GET    | `/analytics/participation` | Get analytics         |

---

## Printing Service (Port 4100)

| Method | Endpoint    | Description      |
| ------ | ----------- | ---------------- |
| GET    | `/health`   | Health check     |
| GET    | `/shops`    | List print shops |
| POST   | `/jobs`     | Create print job |
| GET    | `/jobs/:id` | Get job status   |

---

## Authentication

All protected endpoints require `Authorization: Bearer <token>` header.

```bash
# Example request
curl -H "Authorization: Bearer eyJ..." http://localhost:4000/orders
```

---

## Common Response Formats

### Success

```json
{ "user": {...}, "tokens": {...} }
```

### Error

```json
{ "error": "Error message" }
```

---

## Quick Test Commands

```bash
# Health checks
curl http://localhost:4300/health
curl http://localhost:4000/health
curl http://localhost:4100/health
curl http://localhost:4200/health

# Auth - Register
curl -X POST http://localhost:4300/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@college.edu","password":"Test123!","name":"Test User"}'

# Auth - Login
curl -X POST http://localhost:4300/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@college.edu","password":"Test123!"}'

# Canteen - Get menu
curl http://localhost:4000/menu

# Events - List events
curl http://localhost:4200/events

# Printing - List shops
curl http://localhost:4100/shops
```
