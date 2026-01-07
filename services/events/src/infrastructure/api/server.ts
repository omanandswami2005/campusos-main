import http, { ServerResponse } from 'node:http';
import { ApiError, ApiResponse, createLogger } from '@campus-os/utils';
const { requestLogger, errorLogger, infoLogger } = createLogger('events');
// Event queries
import { listEvents } from '../../application/queries/listEvents';
import { getEvent } from '../../application/queries/getEvent';
import { listCategories } from '../../application/queries/listCategories';
import { listRegistrations } from '../../application/queries/listRegistrations';
import { getUpcomingEvents } from '../../application/queries/getUpcomingEvents';
// Club queries
import { listClubs } from '../../application/queries/listClubs';
import { getClub } from '../../application/queries/getClub';
// Notification queries
import { listNotifications, getUnreadCount } from '../../application/queries/listNotifications';
// Attendance queries
import {
  getEventAttendance,
  getAttendanceStats,
  getParticipantList,
} from '../../application/queries/getAttendance';
// Feedback queries
import {
  listEventFeedback,
  getFeedbackSummary,
  hasUserSubmittedFeedback,
} from '../../application/queries/listFeedback';
// Certificate queries
import {
  listUserCertificates,
  listEventCertificates,
  getCertificate,
  getCertificateByNumber,
} from '../../application/queries/listCertificates';
// Analytics queries
import { getParticipationAnalytics } from '../../application/queries/getParticipationAnalytics';
// Event commands
import { createEvent } from '../../application/commands/createEvent';
import { updateEvent } from '../../application/commands/updateEvent';
import { registerForEvent } from '../../application/commands/registerForEvent';
import { cancelRegistration } from '../../application/commands/cancelRegistration';
import { login } from '../../application/commands/login';
// Club commands
import { createClub } from '../../application/commands/createClub';
import { updateClub } from '../../application/commands/updateClub';
import { approveClub, suspendClub } from '../../application/commands/approveClub';
// Event approval commands
import { approveEvent, submitEventForApproval } from '../../application/commands/approveEvent';
// Attendance commands
import {
  markAttendance,
  bulkMarkAttendance,
  markCheckOut,
} from '../../application/commands/markAttendance';
// Feedback commands
import { submitFeedback } from '../../application/commands/submitFeedback';
// Certificate commands
import {
  generateCertificate,
  bulkGenerateCertificates,
} from '../../application/commands/generateCertificate';
// Notification commands
import {
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from '../../application/commands/manageNotifications';
import { verifyToken } from '../auth/jwt';

// ============================================================================
// Helpers
// ============================================================================

interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  ip: string;
  startTime: number;
}

const parseBody = async <T>(req: http.IncomingMessage): Promise<T | null> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

const extractToken = (req: http.IncomingMessage): string | null => {
  const auth = req.headers.authorization;
  if (!auth) return null;
  return auth.startsWith('Bearer ') ? auth.slice(7) : null;
};

// Standardized response helpers
function sendJson(res: ServerResponse, status: number, data: unknown, ctx?: RequestContext): void {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  res.writeHead(status);

  let responseData = data;
  if (!(data instanceof ApiResponse) && !(data && (data as any).success !== undefined)) {
    responseData = new ApiResponse(status, data, status < 400 ? 'Success' : 'Error');
  }

  res.end(JSON.stringify(responseData));

  if (ctx) {
    const duration = Date.now() - ctx.startTime;
    requestLogger(ctx.method, ctx.path, status, duration, { requestId: ctx.requestId });
  }
}

function sendError(
  res: ServerResponse,
  status: number,
  message: string,
  ctx?: RequestContext,
  originalError?: any
): void {
  const response = new ApiResponse(status, null, message);
  if (ctx) {
    errorLogger(message, originalError, { requestId: ctx.requestId });
  }
  sendJson(res, status, response, ctx);
}

const requireAuth = (req: http.IncomingMessage, res: http.ServerResponse, ctx: RequestContext) => {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    throw new ApiError(401, 'Unauthorized');
  }
  return payload;
};

const requireRole = (auth: any, roles: string[]) => {
  if (!roles.includes(auth.role)) {
    throw new ApiError(403, 'Forbidden: insufficient permissions');
  }
  return true;
};

export const createServer = () => {
  const server = http.createServer(async (req, res) => {
    // Basic CORS for OPTIONS
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.writeHead(204).end();
      return;
    }

    const ctx: RequestContext = {
      requestId: Math.random().toString(36).substring(2, 15),
      method: req.method || 'GET',
      path: req.url || '/',
      ip: req.socket.remoteAddress || 'unknown',
      startTime: Date.now(),
    };

    try {
      const url = new URL(req.url || '/', 'http://localhost');

      // ==================== HEALTH ====================
      if (url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok', service: 'events', version: '2.0.0' }, ctx);
        return;
      }

      // ==================== AUTH ====================
      if (req.method === 'POST' && url.pathname === '/login') {
        const body = (await parseBody<any>(req)) || {};
        try {
          const result = await login(body);
          sendJson(res, 200, result, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      // ==================== CATEGORIES ====================
      if (req.method === 'GET' && url.pathname === '/categories') {
        const categories = await listCategories();
        sendJson(res, 200, categories, ctx);
        return;
      }

      // ==================== CLUBS ====================
      // List clubs
      if (req.method === 'GET' && url.pathname === '/clubs') {
        const collegeId = url.searchParams.get('collegeId') || undefined;
        const category = url.searchParams.get('category') || undefined;
        const status = url.searchParams.get('status') || undefined;
        const search = url.searchParams.get('search') || undefined;

        const clubs = listClubs({ collegeId, category, status: status as any, search });
        sendJson(res, 200, clubs, ctx);
        return;
      }

      // Get single club
      if (req.method === 'GET' && url.pathname.match(/^\/clubs\/[^/]+$/)) {
        const id = url.pathname.split('/')[2];
        const club = getClub(id);
        if (!club) {
          throw new ApiError(404, 'Club not found');
        }
        sendJson(res, 200, club, ctx);
        return;
      }

      // Create club (auth required)
      if (req.method === 'POST' && url.pathname === '/clubs') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const body = (await parseBody<any>(req)) || {};
        try {
          const club = createClub({
            ...body,
            collegeId: auth.collegeId,
            coordinatorId: auth.sub,
          });
          sendJson(res, 201, club, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      // Update club (auth required - coordinator/admin)
      if (req.method === 'PUT' && url.pathname.match(/^\/clubs\/[^/]+$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const clubId = url.pathname.split('/')[2];
        const body = (await parseBody<any>(req)) || {};
        const club = updateClub({ ...body, clubId }, auth.sub);
        if (!club) {
          throw new ApiError(403, 'Forbidden or club not found');
        }
        sendJson(res, 200, club, ctx);
        return;
      }

      // Approve/reject club (admin only)
      if (req.method === 'POST' && url.pathname.match(/^\/clubs\/[^/]+\/approve$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['admin'])) return;

        const clubId = url.pathname.split('/')[2];
        const body = (await parseBody<any>(req)) || {};
        const club = approveClub({
          clubId,
          adminId: auth.sub,
          approved: body.approved !== false,
          rejectionReason: body.rejectionReason,
        });
        if (!club) {
          throw new ApiError(400, 'Failed to approve club');
        }
        sendJson(res, 200, club, ctx);
        return;
      }

      // Suspend club (admin only)
      if (req.method === 'POST' && url.pathname.match(/^\/clubs\/[^/]+\/suspend$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['admin'])) return;

        const clubId = url.pathname.split('/')[2];
        const club = suspendClub(clubId, auth.sub);
        if (!club) {
          throw new ApiError(400, 'Failed to suspend club');
        }
        sendJson(res, 200, club, ctx);
        return;
      }

      // ==================== EVENTS ====================
      // List events
      if (req.method === 'GET' && url.pathname === '/events') {
        const collegeId = url.searchParams.get('collegeId') || undefined;
        const category = url.searchParams.get('category') || undefined;
        const status = url.searchParams.get('status') || undefined;
        const fromDate = url.searchParams.get('fromDate') || undefined;
        const toDate = url.searchParams.get('toDate') || undefined;
        const search = url.searchParams.get('search') || undefined;

        const events = await listEvents({ collegeId, category, status, fromDate, toDate, search });
        res.writeHead(200).end(JSON.stringify(events));
        return;
      }

      // Get upcoming events
      if (req.method === 'GET' && url.pathname === '/events/upcoming') {
        const collegeId = url.searchParams.get('collegeId') || undefined;
        const limit = parseInt(url.searchParams.get('limit') || '5', 10);
        const events = await getUpcomingEvents(collegeId, limit);
        res.writeHead(200).end(JSON.stringify(events));
        return;
      }

      // Get single event
      if (
        req.method === 'GET' &&
        url.pathname.match(/^\/events\/[^/]+$/) &&
        !url.pathname.includes('upcoming')
      ) {
        const id = url.pathname.split('/')[2];
        const event = await getEvent(id);
        if (!event) {
          throw new ApiError(404, 'Event not found');
        }
        sendJson(res, 200, event, ctx);
        return;
      }

      // Create event (auth required, coordinator/admin only)
      if (req.method === 'POST' && url.pathname === '/events') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const body = (await parseBody<any>(req)) || {};
        try {
          const event = await createEvent({
            ...body,
            collegeId: auth.collegeId,
            organizerId: auth.sub,
          });
          sendJson(res, 201, event, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      // Update event (auth required)
      if (req.method === 'PUT' && url.pathname.match(/^\/events\/[^/]+$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const id = url.pathname.split('/')[2];
        const body = (await parseBody<any>(req)) || {};
        try {
          const event = await updateEvent({ ...body, id });
          sendJson(res, 200, event, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      // Submit event for approval
      if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/submit$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const eventId = url.pathname.split('/')[2];
        const event = submitEventForApproval(eventId, auth.sub);
        if (!event) {
          throw new ApiError(400, 'Failed to submit event');
        }
        sendJson(res, 200, event, ctx);
        return;
      }

      // Approve/reject event (admin only)
      if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/approve$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['admin'])) return;

        const eventId = url.pathname.split('/')[2];
        const body = (await parseBody<any>(req)) || {};
        const event = approveEvent({
          eventId,
          adminId: auth.sub,
          approved: body.approved !== false,
          rejectionReason: body.rejectionReason,
        });
        if (!event) {
          throw new ApiError(400, 'Failed to approve event');
        }
        sendJson(res, 200, event, ctx);
        return;
      }

      // Register for event (auth required)
      if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/register$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const eventId = url.pathname.split('/')[2];
        try {
          const registration = await registerForEvent({
            eventId,
            userId: auth.sub,
          });
          sendJson(res, 201, registration, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      // ==================== REGISTRATIONS ====================
      // List user's registrations
      if (req.method === 'GET' && url.pathname === '/registrations') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const eventId = url.searchParams.get('eventId') || undefined;
        const registrations = await listRegistrations(auth.sub, eventId);
        sendJson(res, 200, registrations, ctx);
        return;
      }

      // Cancel registration
      if (req.method === 'DELETE' && url.pathname.match(/^\/registrations\/[^/]+$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const registrationId = url.pathname.split('/')[2];
        try {
          const registration = await cancelRegistration({
            registrationId,
            userId: auth.sub,
          });
          sendJson(res, 200, registration, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      // ==================== ATTENDANCE ====================
      // Get event attendance (coordinator/admin)
      if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/attendance$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const eventId = url.pathname.split('/')[2];
        const attendance = getEventAttendance({ eventId });
        res.writeHead(200).end(JSON.stringify(attendance));
        return;
      }

      // Get attendance stats (coordinator/admin)
      if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/attendance\/stats$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const eventId = url.pathname.split('/')[2];
        const stats = getAttendanceStats(eventId);
        sendJson(res, 200, stats, ctx);
        return;
      }

      // Get participant list (coordinator/admin)
      if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/participants$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const eventId = url.pathname.split('/')[2];
        const participants = getParticipantList(eventId);
        sendJson(res, 200, participants, ctx);
        return;
      }

      // Mark attendance (coordinator/admin)
      if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/attendance$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const eventId = url.pathname.split('/')[2];
        const body = (await parseBody<any>(req)) || {};

        // Bulk or single
        if (Array.isArray(body.attendees)) {
          const attendance = bulkMarkAttendance({
            eventId,
            markedBy: auth.sub,
            attendees: body.attendees,
          });
          sendJson(res, 200, { marked: attendance.length, attendance }, ctx);
        } else {
          const attendance = markAttendance({
            eventId,
            userId: body.userId,
            markedBy: auth.sub,
            status: body.status || 'present',
          });
          if (!attendance) {
            throw new ApiError(400, 'Failed to mark attendance');
          }
          sendJson(res, 200, attendance, ctx);
        }
        return;
      }

      // Mark check-out
      if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/checkout$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const eventId = url.pathname.split('/')[2];
        const attendance = markCheckOut(eventId, auth.sub);
        if (!attendance) {
          throw new ApiError(400, 'Failed to mark check-out');
        }
        sendJson(res, 200, attendance, ctx);
        return;
      }

      // ==================== FEEDBACK ====================
      // Get event feedback (coordinator/admin)
      if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/feedback$/)) {
        const eventId = url.pathname.split('/')[2];
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const feedback = listEventFeedback(eventId);
        sendJson(res, 200, feedback, ctx);
        return;
      }

      // Get feedback summary (coordinator/admin)
      if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/feedback\/summary$/)) {
        const eventId = url.pathname.split('/')[2];
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const summary = getFeedbackSummary(eventId);
        sendJson(res, 200, summary, ctx);
        return;
      }

      // Submit feedback
      if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/feedback$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const eventId = url.pathname.split('/')[2];
        const body = (await parseBody<any>(req)) || {};

        // Check if already submitted
        if (hasUserSubmittedFeedback(eventId, auth.sub)) {
          throw new ApiError(400, 'Feedback already submitted');
        }

        const feedback = submitFeedback({
          eventId,
          userId: auth.sub,
          rating: body.rating,
          comment: body.comment,
          categories: body.categories,
          isAnonymous: body.isAnonymous,
        });

        if (!feedback) {
          throw new ApiError(400, 'Failed to submit feedback');
        }
        sendJson(res, 201, feedback, ctx);
        return;
      }

      // ==================== CERTIFICATES ====================
      // Get user's certificates
      if (req.method === 'GET' && url.pathname === '/certificates') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const certificates = listUserCertificates(auth.sub);
        res.writeHead(200).end(JSON.stringify(certificates));
        return;
      }

      // Get certificate by ID
      if (req.method === 'GET' && url.pathname.match(/^\/certificates\/[^/]+$/)) {
        const id = url.pathname.split('/')[2];
        const cert = getCertificate(id);
        if (!cert) {
          throw new ApiError(404, 'Certificate not found');
        }
        sendJson(res, 200, cert, ctx);
        return;
      }

      // Verify certificate by number
      if (req.method === 'GET' && url.pathname === '/certificates/verify') {
        const certNumber = url.searchParams.get('number');
        if (!certNumber) {
          throw new ApiError(400, 'Certificate number required');
        }
        const cert = getCertificateByNumber(certNumber);
        if (!cert) {
          throw new ApiError(404, 'Certificate not found');
        }
        sendJson(res, 200, { valid: true, certificate: cert }, ctx);
        return;
      }

      // Get event certificates (coordinator/admin)
      if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/certificates$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const eventId = url.pathname.split('/')[2];
        const certificates = listEventCertificates(eventId);
        res.writeHead(200).end(JSON.stringify(certificates));
        return;
      }

      // Generate certificate(s) (coordinator/admin)
      if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/certificates$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['coordinator', 'admin'])) return;

        const eventId = url.pathname.split('/')[2];
        const body = (await parseBody<any>(req)) || {};

        if (body.bulk) {
          // Generate for all participants
          const certificates = bulkGenerateCertificates({
            eventId,
            type: body.type || 'participation',
            issuedBy: auth.sub,
          });
          sendJson(res, 201, { generated: certificates.length, certificates }, ctx);
        } else {
          // Generate for single user
          const cert = generateCertificate({
            eventId,
            userId: body.userId,
            type: body.type || 'participation',
            position: body.position,
            issuedBy: auth.sub,
          });
          if (!cert) {
            throw new ApiError(400, 'Failed to generate certificate');
          }
          sendJson(res, 201, cert, ctx);
        }
        return;
      }

      // ==================== NOTIFICATIONS ====================
      // Get user's notifications
      if (req.method === 'GET' && url.pathname === '/notifications') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const unreadOnly = url.searchParams.get('unreadOnly') === 'true';
        const type = url.searchParams.get('type') || undefined;
        const limit = url.searchParams.get('limit')
          ? parseInt(url.searchParams.get('limit')!)
          : undefined;

        const notifications = listNotifications({
          userId: auth.sub,
          unreadOnly,
          type: type as any,
          limit,
        });
        const unreadCount = getUnreadCount(auth.sub);

        sendJson(res, 200, { notifications, unreadCount }, ctx);
        return;
      }

      // Mark notification as read
      if (req.method === 'PUT' && url.pathname.match(/^\/notifications\/[^/]+\/read$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const notificationId = url.pathname.split('/')[2];
        const success = markNotificationRead(notificationId, auth.sub);
        sendJson(res, 200, { success }, ctx);
        return;
      }

      // Mark all notifications as read
      if (req.method === 'PUT' && url.pathname === '/notifications/read-all') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const count = markAllNotificationsRead(auth.sub);
        sendJson(res, 200, { markedRead: count }, ctx);
        return;
      }

      // Delete notification
      if (req.method === 'DELETE' && url.pathname.match(/^\/notifications\/[^/]+$/)) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;

        const notificationId = url.pathname.split('/')[2];
        const success = deleteNotification(notificationId, auth.sub);
        sendJson(res, 200, { success }, ctx);
        return;
      }

      // ==================== ANALYTICS ====================
      // Get participation analytics (admin only)
      if (req.method === 'GET' && url.pathname === '/analytics/participation') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        if (!requireRole(auth, ['admin'])) return;

        const collegeId = url.searchParams.get('collegeId') || undefined;
        const analytics = getParticipationAnalytics(collegeId);
        sendJson(res, 200, analytics, ctx);
        return;
      }

      // 404
      throw new ApiError(404, 'Not Found');
    } catch (error: any) {
      if (error instanceof ApiError) {
        const payload: any = { message: error.message };
        if (error.errors) payload.errors = error.errors;
        sendJson(res, error.statusCode, payload, ctx);
        return;
      }
      sendError(res, 500, 'Internal Server Error', ctx, error);
    }
  });

  return server;
};

export const startServer = (port: number) => {
  const server = createServer();
  server.listen(port, () => {
    infoLogger(`🎉 Events service v2.0.0 running at http://localhost:${port}`);
    console.log(`\n📚 API Endpoints:`);
    console.log(`   Health:        GET  /health`);
    console.log(`   Auth:          POST /login`);
    console.log(`\n📋 Clubs:`);
    console.log(`   List:          GET  /clubs`);
    console.log(`   Get:           GET  /clubs/:id`);
    console.log(`   Create:        POST /clubs`);
    console.log(`   Update:        PUT  /clubs/:id`);
    console.log(`   Approve:       POST /clubs/:id/approve (admin)`);
    console.log(`\n📅 Events:`);
    console.log(`   List:          GET  /events`);
    console.log(`   Upcoming:      GET  /events/upcoming`);
    console.log(`   Get:           GET  /events/:id`);
    console.log(`   Create:        POST /events (coordinator/admin)`);
    console.log(`   Submit:        POST /events/:id/submit`);
    console.log(`   Approve:       POST /events/:id/approve (admin)`);
    console.log(`   Register:      POST /events/:id/register`);
    console.log(`\n✅ Attendance:`);
    console.log(`   List:          GET  /events/:id/attendance`);
    console.log(`   Stats:         GET  /events/:id/attendance/stats`);
    console.log(`   Participants:  GET  /events/:id/participants`);
    console.log(`   Mark:          POST /events/:id/attendance`);
    console.log(`\n⭐ Feedback:`);
    console.log(`   List:          GET  /events/:id/feedback`);
    console.log(`   Summary:       GET  /events/:id/feedback/summary`);
    console.log(`   Submit:        POST /events/:id/feedback`);
    console.log(`\n🏆 Certificates:`);
    console.log(`   My Certs:      GET  /certificates`);
    console.log(`   Verify:        GET  /certificates/verify?number=XXX`);
    console.log(`   Generate:      POST /events/:id/certificates`);
    console.log(`\n🔔 Notifications:`);
    console.log(`   List:          GET  /notifications`);
    console.log(`   Mark Read:     PUT  /notifications/:id/read`);
    infoLogger(`   Read All:      PUT  /notifications/read-all`);
    console.log(`\n📊 Analytics:`);
    infoLogger(`   Participation: GET  /analytics/participation (admin)`);
  });
  return server;
};
