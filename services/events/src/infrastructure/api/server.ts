import http from 'node:http';
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

const parseBody = async (req: http.IncomingMessage) => {
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

const requireAuth = (req: http.IncomingMessage, res: http.ServerResponse) => {
  const token = extractToken(req);
  const payload = token ? verifyToken(token) : null;
  if (!payload) {
    res.writeHead(401).end(JSON.stringify({ error: 'Unauthorized' }));
    return null;
  }
  return payload;
};

const requireRole = (auth: any, roles: string[], res: http.ServerResponse) => {
  if (!roles.includes(auth.role)) {
    res.writeHead(403).end(JSON.stringify({ error: 'Forbidden: insufficient permissions' }));
    return false;
  }
  return true;
};

export const createServer = () => {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204).end();
      return;
    }

    const url = new URL(req.url || '/', 'http://localhost');

    // ==================== HEALTH ====================
    if (url.pathname === '/health') {
      res.writeHead(200).end(JSON.stringify({ status: 'ok', service: 'events', version: '2.0.0' }));
      return;
    }

    // ==================== AUTH ====================
    if (req.method === 'POST' && url.pathname === '/login') {
      const body = (await parseBody(req)) || {};
      try {
        const result = await login(body);
        res.writeHead(200).end(JSON.stringify(result));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    // ==================== CATEGORIES ====================
    if (req.method === 'GET' && url.pathname === '/categories') {
      const categories = await listCategories();
      res.writeHead(200).end(JSON.stringify(categories));
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
      res.writeHead(200).end(JSON.stringify(clubs));
      return;
    }

    // Get single club
    if (req.method === 'GET' && url.pathname.match(/^\/clubs\/[^/]+$/)) {
      const id = url.pathname.split('/')[2];
      const club = getClub(id);
      if (!club) {
        res.writeHead(404).end(JSON.stringify({ error: 'Club not found' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(club));
      return;
    }

    // Create club (auth required)
    if (req.method === 'POST' && url.pathname === '/clubs') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const body = (await parseBody(req)) || {};
      try {
        const club = createClub({
          ...body,
          collegeId: auth.collegeId,
          coordinatorId: auth.sub,
        });
        res.writeHead(201).end(JSON.stringify(club));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    // Update club (auth required - coordinator/admin)
    if (req.method === 'PUT' && url.pathname.match(/^\/clubs\/[^/]+$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const clubId = url.pathname.split('/')[2];
      const body = (await parseBody(req)) || {};
      const club = updateClub({ ...body, clubId }, auth.sub);
      if (!club) {
        res.writeHead(403).end(JSON.stringify({ error: 'Forbidden or club not found' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(club));
      return;
    }

    // Approve/reject club (admin only)
    if (req.method === 'POST' && url.pathname.match(/^\/clubs\/[^/]+\/approve$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['admin'], res)) return;

      const clubId = url.pathname.split('/')[2];
      const body = (await parseBody(req)) || {};
      const club = approveClub({
        clubId,
        adminId: auth.sub,
        approved: body.approved !== false,
        rejectionReason: body.rejectionReason,
      });
      if (!club) {
        res.writeHead(400).end(JSON.stringify({ error: 'Failed to approve club' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(club));
      return;
    }

    // Suspend club (admin only)
    if (req.method === 'POST' && url.pathname.match(/^\/clubs\/[^/]+\/suspend$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['admin'], res)) return;

      const clubId = url.pathname.split('/')[2];
      const club = suspendClub(clubId, auth.sub);
      if (!club) {
        res.writeHead(400).end(JSON.stringify({ error: 'Failed to suspend club' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(club));
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
        res.writeHead(404).end(JSON.stringify({ error: 'Event not found' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(event));
      return;
    }

    // Create event (auth required, coordinator/admin only)
    if (req.method === 'POST' && url.pathname === '/events') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const body = (await parseBody(req)) || {};
      try {
        const event = await createEvent({
          ...body,
          collegeId: auth.collegeId,
          organizerId: auth.sub,
        });
        res.writeHead(201).end(JSON.stringify(event));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    // Update event (auth required)
    if (req.method === 'PUT' && url.pathname.match(/^\/events\/[^/]+$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const id = url.pathname.split('/')[2];
      const body = (await parseBody(req)) || {};
      try {
        const event = await updateEvent({ ...body, id });
        res.writeHead(200).end(JSON.stringify(event));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    // Submit event for approval
    if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/submit$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const eventId = url.pathname.split('/')[2];
      const event = submitEventForApproval(eventId, auth.sub);
      if (!event) {
        res.writeHead(400).end(JSON.stringify({ error: 'Failed to submit event' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(event));
      return;
    }

    // Approve/reject event (admin only)
    if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/approve$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['admin'], res)) return;

      const eventId = url.pathname.split('/')[2];
      const body = (await parseBody(req)) || {};
      const event = approveEvent({
        eventId,
        adminId: auth.sub,
        approved: body.approved !== false,
        rejectionReason: body.rejectionReason,
      });
      if (!event) {
        res.writeHead(400).end(JSON.stringify({ error: 'Failed to approve event' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(event));
      return;
    }

    // Register for event (auth required)
    if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/register$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const eventId = url.pathname.split('/')[2];
      try {
        const registration = await registerForEvent({
          eventId,
          userId: auth.sub,
        });
        res.writeHead(201).end(JSON.stringify(registration));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    // ==================== REGISTRATIONS ====================
    // List user's registrations
    if (req.method === 'GET' && url.pathname === '/registrations') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const eventId = url.searchParams.get('eventId') || undefined;
      const registrations = await listRegistrations(auth.sub, eventId);
      res.writeHead(200).end(JSON.stringify(registrations));
      return;
    }

    // Cancel registration
    if (req.method === 'DELETE' && url.pathname.match(/^\/registrations\/[^/]+$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const registrationId = url.pathname.split('/')[2];
      try {
        const registration = await cancelRegistration({
          registrationId,
          userId: auth.sub,
        });
        res.writeHead(200).end(JSON.stringify(registration));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    // ==================== ATTENDANCE ====================
    // Get event attendance (coordinator/admin)
    if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/attendance$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const eventId = url.pathname.split('/')[2];
      const attendance = getEventAttendance({ eventId });
      res.writeHead(200).end(JSON.stringify(attendance));
      return;
    }

    // Get attendance stats (coordinator/admin)
    if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/attendance\/stats$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const eventId = url.pathname.split('/')[2];
      const stats = getAttendanceStats(eventId);
      res.writeHead(200).end(JSON.stringify(stats));
      return;
    }

    // Get participant list (coordinator/admin)
    if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/participants$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const eventId = url.pathname.split('/')[2];
      const participants = getParticipantList(eventId);
      res.writeHead(200).end(JSON.stringify(participants));
      return;
    }

    // Mark attendance (coordinator/admin)
    if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/attendance$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const eventId = url.pathname.split('/')[2];
      const body = (await parseBody(req)) || {};

      // Bulk or single
      if (Array.isArray(body.attendees)) {
        const attendance = bulkMarkAttendance({
          eventId,
          markedBy: auth.sub,
          attendees: body.attendees,
        });
        res.writeHead(200).end(JSON.stringify({ marked: attendance.length, attendance }));
      } else {
        const attendance = markAttendance({
          eventId,
          userId: body.userId,
          markedBy: auth.sub,
          status: body.status || 'present',
        });
        if (!attendance) {
          res.writeHead(400).end(JSON.stringify({ error: 'Failed to mark attendance' }));
          return;
        }
        res.writeHead(200).end(JSON.stringify(attendance));
      }
      return;
    }

    // Mark check-out
    if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/checkout$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const eventId = url.pathname.split('/')[2];
      const attendance = markCheckOut(eventId, auth.sub);
      if (!attendance) {
        res.writeHead(400).end(JSON.stringify({ error: 'Failed to mark check-out' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(attendance));
      return;
    }

    // ==================== FEEDBACK ====================
    // Get event feedback (coordinator/admin)
    if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/feedback$/)) {
      const eventId = url.pathname.split('/')[2];
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const feedback = listEventFeedback(eventId);
      res.writeHead(200).end(JSON.stringify(feedback));
      return;
    }

    // Get feedback summary (coordinator/admin)
    if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/feedback\/summary$/)) {
      const eventId = url.pathname.split('/')[2];
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const summary = getFeedbackSummary(eventId);
      res.writeHead(200).end(JSON.stringify(summary));
      return;
    }

    // Submit feedback
    if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/feedback$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const eventId = url.pathname.split('/')[2];
      const body = (await parseBody(req)) || {};

      // Check if already submitted
      if (hasUserSubmittedFeedback(eventId, auth.sub)) {
        res.writeHead(400).end(JSON.stringify({ error: 'Feedback already submitted' }));
        return;
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
        res.writeHead(400).end(JSON.stringify({ error: 'Failed to submit feedback' }));
        return;
      }
      res.writeHead(201).end(JSON.stringify(feedback));
      return;
    }

    // ==================== CERTIFICATES ====================
    // Get user's certificates
    if (req.method === 'GET' && url.pathname === '/certificates') {
      const auth = requireAuth(req, res);
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
        res.writeHead(404).end(JSON.stringify({ error: 'Certificate not found' }));
        return;
      }
      res.writeHead(200).end(JSON.stringify(cert));
      return;
    }

    // Verify certificate by number
    if (req.method === 'GET' && url.pathname === '/certificates/verify') {
      const certNumber = url.searchParams.get('number');
      if (!certNumber) {
        res.writeHead(400).end(JSON.stringify({ error: 'Certificate number required' }));
        return;
      }
      const cert = getCertificateByNumber(certNumber);
      if (!cert) {
        res.writeHead(404).end(JSON.stringify({ error: 'Certificate not found', valid: false }));
        return;
      }
      res.writeHead(200).end(JSON.stringify({ valid: true, certificate: cert }));
      return;
    }

    // Get event certificates (coordinator/admin)
    if (req.method === 'GET' && url.pathname.match(/^\/events\/[^/]+\/certificates$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const eventId = url.pathname.split('/')[2];
      const certificates = listEventCertificates(eventId);
      res.writeHead(200).end(JSON.stringify(certificates));
      return;
    }

    // Generate certificate(s) (coordinator/admin)
    if (req.method === 'POST' && url.pathname.match(/^\/events\/[^/]+\/certificates$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['coordinator', 'admin'], res)) return;

      const eventId = url.pathname.split('/')[2];
      const body = (await parseBody(req)) || {};

      if (body.bulk) {
        // Generate for all participants
        const certificates = bulkGenerateCertificates({
          eventId,
          type: body.type || 'participation',
          issuedBy: auth.sub,
        });
        res.writeHead(201).end(JSON.stringify({ generated: certificates.length, certificates }));
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
          res.writeHead(400).end(JSON.stringify({ error: 'Failed to generate certificate' }));
          return;
        }
        res.writeHead(201).end(JSON.stringify(cert));
      }
      return;
    }

    // ==================== NOTIFICATIONS ====================
    // Get user's notifications
    if (req.method === 'GET' && url.pathname === '/notifications') {
      const auth = requireAuth(req, res);
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

      res.writeHead(200).end(JSON.stringify({ notifications, unreadCount }));
      return;
    }

    // Mark notification as read
    if (req.method === 'PUT' && url.pathname.match(/^\/notifications\/[^/]+\/read$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const notificationId = url.pathname.split('/')[2];
      const success = markNotificationRead(notificationId, auth.sub);
      res.writeHead(200).end(JSON.stringify({ success }));
      return;
    }

    // Mark all notifications as read
    if (req.method === 'PUT' && url.pathname === '/notifications/read-all') {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const count = markAllNotificationsRead(auth.sub);
      res.writeHead(200).end(JSON.stringify({ markedRead: count }));
      return;
    }

    // Delete notification
    if (req.method === 'DELETE' && url.pathname.match(/^\/notifications\/[^/]+$/)) {
      const auth = requireAuth(req, res);
      if (!auth) return;

      const notificationId = url.pathname.split('/')[2];
      const success = deleteNotification(notificationId, auth.sub);
      res.writeHead(200).end(JSON.stringify({ success }));
      return;
    }

    // ==================== ANALYTICS ====================
    // Get participation analytics (admin only)
    if (req.method === 'GET' && url.pathname === '/analytics/participation') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      if (!requireRole(auth, ['admin'], res)) return;

      const collegeId = url.searchParams.get('collegeId') || undefined;
      const analytics = getParticipationAnalytics(collegeId);
      res.writeHead(200).end(JSON.stringify(analytics));
      return;
    }

    // 404
    res.writeHead(404).end(JSON.stringify({ error: 'Not Found' }));
  });

  return server;
};

export const startServer = (port: number) => {
  const server = createServer();
  server.listen(port, () => {
    console.log(`🎉 Events service v2.0.0 running at http://localhost:${port}`);
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
    console.log(`   Read All:      PUT  /notifications/read-all`);
    console.log(`\n📊 Analytics:`);
    console.log(`   Participation: GET  /analytics/participation (admin)`);
  });
  return server;
};
