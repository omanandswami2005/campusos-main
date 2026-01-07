# Events Service (Campus Bot)

Campus OS Event Management Microservice - A centralized digital platform for college clubs to manage events and for students to register and participate.

## Overview

The Events service provides comprehensive functionality for campus event management:

- **🏢 Club Management**: Register, approve, and manage college clubs
- **📅 Event Management**: Create, update, approve, and publish campus events
- **🔒 Admin Approval**: Workflow for club and event approval
- **👥 Student Registration**: Browse and register for events
- **✅ Attendance Tracking**: Mark and track participant attendance
- **🔔 Notifications**: Automated notifications and reminders
- **⭐ Feedback System**: Collect ratings and feedback after events
- **🏆 Certificate Generation**: Auto-generate participation certificates
- **📊 Analytics**: Participation and engagement analytics

## User Roles (RBAC)

| Role            | Permissions                                                           |
| --------------- | --------------------------------------------------------------------- |
| **Student**     | Browse events/clubs, register, submit feedback, download certificates |
| **Coordinator** | All student permissions + create events, manage club, mark attendance |
| **Admin**       | All permissions + approve clubs/events, view analytics, manage users  |

## Running the Service

```bash
# From root directory
pnpm dev:events

# Or directly
pnpm --filter @campus-os/service-events dev
```

The service runs on **http://localhost:4200**

## API Endpoints

### 🔓 Public Endpoints

| Method | Endpoint               | Description                  |
| ------ | ---------------------- | ---------------------------- |
| GET    | `/health`              | Health check                 |
| GET    | `/categories`          | List all event categories    |
| GET    | `/events`              | List events (with filters)   |
| GET    | `/events/upcoming`     | Get upcoming events          |
| GET    | `/events/:id`          | Get single event details     |
| GET    | `/clubs`               | List all clubs               |
| GET    | `/clubs/:id`           | Get club details             |
| POST   | `/login`               | Authenticate user            |
| GET    | `/certificates/verify` | Verify certificate by number |

### 👤 User Endpoints (auth required)

| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| POST   | `/events/:id/register`    | Register for an event     |
| GET    | `/registrations`          | List user's registrations |
| DELETE | `/registrations/:id`      | Cancel registration       |
| POST   | `/events/:id/feedback`    | Submit event feedback     |
| GET    | `/certificates`           | List user's certificates  |
| GET    | `/notifications`          | Get user's notifications  |
| PUT    | `/notifications/:id/read` | Mark notification as read |
| PUT    | `/notifications/read-all` | Mark all as read          |
| POST   | `/events/:id/checkout`    | Self check-out            |

### 📋 Club Management

| Method | Endpoint             | Description                  |
| ------ | -------------------- | ---------------------------- |
| POST   | `/clubs`             | Register new club (any user) |
| PUT    | `/clubs/:id`         | Update club (coordinator)    |
| POST   | `/clubs/:id/approve` | Approve/reject club (admin)  |
| POST   | `/clubs/:id/suspend` | Suspend club (admin)         |

### 📅 Event Management (Coordinator/Admin)

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | `/events`             | Create new event       |
| PUT    | `/events/:id`         | Update event           |
| POST   | `/events/:id/submit`  | Submit for approval    |
| POST   | `/events/:id/approve` | Approve/reject (admin) |

### ✅ Attendance (Coordinator/Admin)

| Method | Endpoint                       | Description                   |
| ------ | ------------------------------ | ----------------------------- |
| GET    | `/events/:id/attendance`       | Get attendance list           |
| GET    | `/events/:id/attendance/stats` | Get attendance statistics     |
| GET    | `/events/:id/participants`     | Get participant list          |
| POST   | `/events/:id/attendance`       | Mark attendance (single/bulk) |

### ⭐ Feedback (Coordinator/Admin)

| Method | Endpoint                       | Description                    |
| ------ | ------------------------------ | ------------------------------ |
| GET    | `/events/:id/feedback`         | Get all feedback               |
| GET    | `/events/:id/feedback/summary` | Get feedback summary/analytics |

### 🏆 Certificates (Coordinator/Admin)

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| GET    | `/events/:id/certificates` | List event certificates |
| POST   | `/events/:id/certificates` | Generate certificates   |

### 📊 Analytics (Admin only)

| Method | Endpoint                   | Description             |
| ------ | -------------------------- | ----------------------- |
| GET    | `/analytics/participation` | Participation analytics |

## Query Parameters

### GET /events

| Parameter   | Description                                               |
| ----------- | --------------------------------------------------------- |
| `collegeId` | Filter by college                                         |
| `category`  | Filter by category ID                                     |
| `status`    | Filter by status (draft, published, cancelled, completed) |
| `fromDate`  | Events starting after this date                           |
| `toDate`    | Events ending before this date                            |
| `search`    | Search in title, description, tags                        |

### GET /events/upcoming

| Parameter   | Description                             |
| ----------- | --------------------------------------- |
| `collegeId` | Filter by college                       |
| `limit`     | Number of events to return (default: 5) |

## Demo Users

| Email                     | Password    | Role        |
| ------------------------- | ----------- | ----------- |
| student@campus.edu        | password123 | student     |
| coordinator@campus.edu    | password123 | coordinator |
| cultural.coord@campus.edu | password123 | coordinator |
| sports.coord@campus.edu   | password123 | coordinator |
| admin@campus.edu          | password123 | admin       |

## Example Usage

```bash
# List all clubs
curl http://localhost:4200/clubs

# List active clubs only
curl http://localhost:4200/clubs?status=approved

# List all events
curl http://localhost:4200/events

# Get upcoming events
curl http://localhost:4200/events/upcoming?limit=3

# Search events
curl "http://localhost:4200/events?search=hackathon"

# Login as student
curl -X POST http://localhost:4200/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@campus.edu","password":"password123"}'

# Register for event (with token)
curl -X POST http://localhost:4200/events/event-hackathon/register \
  -H "Authorization: Bearer <token>"

# Submit feedback after event
curl -X POST http://localhost:4200/events/event-hackathon/feedback \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"rating":5,"comment":"Great event!","categories":{"organization":5,"content":5,"venue":4,"overall":5}}'

# Get user's certificates
curl http://localhost:4200/certificates \
  -H "Authorization: Bearer <token>"

# Verify a certificate
curl "http://localhost:4200/certificates/verify?number=CERT-12345-ABC"

# Mark attendance (coordinator/admin)
curl -X POST http://localhost:4200/events/event-hackathon/attendance \
  -H "Authorization: Bearer <coordinator-token>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-student1","status":"present"}'

# Generate certificates for all attendees (coordinator/admin)
curl -X POST http://localhost:4200/events/event-hackathon/certificates \
  -H "Authorization: Bearer <coordinator-token>" \
  -H "Content-Type: application/json" \
  -d '{"bulk":true,"type":"participation"}'

# Get participation analytics (admin only)
curl http://localhost:4200/analytics/participation \
  -H "Authorization: Bearer <admin-token>"
```

## Data Models

### Club

```typescript
{
  id: string;
  name: string;
  description: string;
  logoUrl?: string;
  collegeId: string;
  coordinatorId: string;
  category: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  memberCount: number;
  foundedDate: string;
  email: string;
}
```

### Event

```typescript
{
  id: string;
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  tags?: string[];
  collegeId: string;
  organizerId: string;
  clubId?: string;
  category: string;
  capacity: number;
  registeredCount: number;
  venue: string;
  isPublic: boolean;
  registrationDeadline: string;
  status: 'draft' | 'pending_approval' | 'published' | 'cancelled' | 'completed';
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rules?: string[];
}
```

### Attendance

```typescript
{
  id: string;
  eventId: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  markedBy: string;
  status: 'present' | 'absent' | 'late';
}
```

### Feedback

```typescript
{
  id: string;
  eventId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string;
  categories: {
    organization: number;
    content: number;
    venue: number;
    overall: number;
  };
  isAnonymous: boolean;
}
```

### Certificate

```typescript
{
  id: string;
  eventId: string;
  userId: string;
  type: 'participation' | 'winner' | 'runner_up' | 'organizer';
  certificateNumber: string;
  issuedAt: string;
  downloadUrl: string;
  studentName: string;
  eventName: string;
  eventDate: string;
}
```

### Notification

```typescript
{
  id: string;
  userId: string;
  type: 'registration_confirmation' | 'event_update' | 'event_cancelled' | 'event_reminder' | 'club_approved' | 'certificate_ready';
  title: string;
  message: string;
  eventId?: string;
  clubId?: string;
  isRead: boolean;
}
```

## Architecture

```
services/events/
├── src/
│   ├── index.ts                      # Entry point
│   ├── application/
│   │   ├── commands/                 # Write operations
│   │   │   ├── createEvent.ts
│   │   │   ├── updateEvent.ts
│   │   │   ├── registerForEvent.ts
│   │   │   ├── cancelRegistration.ts
│   │   │   ├── createClub.ts
│   │   │   ├── updateClub.ts
│   │   │   ├── approveClub.ts
│   │   │   ├── approveEvent.ts
│   │   │   ├── markAttendance.ts
│   │   │   ├── submitFeedback.ts
│   │   │   ├── generateCertificate.ts
│   │   │   ├── manageNotifications.ts
│   │   │   └── login.ts
│   │   ├── queries/                  # Read operations
│   │   │   ├── listEvents.ts
│   │   │   ├── getEvent.ts
│   │   │   ├── listCategories.ts
│   │   │   ├── listRegistrations.ts
│   │   │   ├── getUpcomingEvents.ts
│   │   │   ├── listClubs.ts
│   │   │   ├── getClub.ts
│   │   │   ├── listNotifications.ts
│   │   │   ├── getAttendance.ts
│   │   │   ├── listFeedback.ts
│   │   │   ├── listCertificates.ts
│   │   │   └── getParticipationAnalytics.ts
│   │   └── state/
│   │       └── memory.ts             # In-memory store
│   ├── domain/
│   │   └── entities/
│   │       └── event.ts              # Event entity
│   └── infrastructure/
│       ├── api/
│       │   └── server.ts             # HTTP server (50+ endpoints)
│       └── auth/
│           └── jwt.ts                # JWT utilities
├── package.json
├── tsconfig.json
└── README.md
```

## SRS Features Implemented

| SRS Section | Feature                             | Status |
| ----------- | ----------------------------------- | ------ |
| 3.1         | User Authentication & Authorization | ✅     |
| 3.2         | Club Management                     | ✅     |
| 3.3         | Event Creation & Management         | ✅     |
| 3.4         | Student Event Registration          | ✅     |
| 3.5         | Notifications & Announcements       | ✅     |
| 3.6         | Attendance & Participation Tracking | ✅     |
| 3.7         | Feedback & Rating System            | ✅     |
| 3.8         | Certificate Generation              | ✅     |

## Notes

- This is a **demo service** using in-memory storage
- Data is lost on restart
- JWT implementation is simplified for demo purposes
- Replace with real database and auth in production
- Notifications are stored but not actually sent (no email/SMS integration)
