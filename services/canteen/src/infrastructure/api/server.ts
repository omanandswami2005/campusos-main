import http, { ServerResponse } from 'node:http';
import { ApiError, ApiResponse, createLogger } from '@campus-os/utils';
const { requestLogger, errorLogger, infoLogger } = createLogger('canteen');
import { listMenu } from '../../application/queries/listMenu';
import { listOffers } from '../../application/queries/listOffers';
import { createOrder } from '../../application/commands/createOrder';
import { getOrder } from '../../application/queries/getOrder';
import { updateOrderStatus } from '../../application/commands/updateOrderStatus';
import { login } from '../../application/commands/login';
import { createPoll } from '../../application/commands/createPoll';
import { vote } from '../../application/commands/vote';
import { listPolls } from '../../application/queries/listPolls';
import { listOrders } from '../../application/queries/listOrders';
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

      if (url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok' }, ctx);
        return;
      }

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

      if (req.method === 'GET' && url.pathname === '/menu') {
        const collegeId = url.searchParams.get('collegeId') || undefined;
        const menu = await listMenu(collegeId);
        sendJson(res, 200, menu, ctx);
        return;
      }

      if (req.method === 'GET' && url.pathname === '/offers') {
        const collegeId = url.searchParams.get('collegeId') || undefined;
        const offers = await listOffers(collegeId);
        sendJson(res, 200, offers, ctx);
        return;
      }

      if (req.method === 'POST' && url.pathname === '/orders') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        const body = (await parseBody<any>(req)) || {};
        try {
          const order = await createOrder(body);
          sendJson(res, 201, order, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      if (req.method === 'GET' && url.pathname.startsWith('/orders/')) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        const id = url.pathname.split('/')[2];
        const order = await getOrder(id);
        if (!order) {
          throw new ApiError(404, 'Not found');
        } else {
          sendJson(res, 200, order, ctx);
        }
        return;
      }

      if (
        req.method === 'POST' &&
        url.pathname.startsWith('/orders/') &&
        url.pathname.endsWith('/status')
      ) {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        const [, , id] = url.pathname.split('/');
        const body = (await parseBody<any>(req)) || {};
        try {
          const updated = await updateOrderStatus({
            orderId: id,
            nextStatus: body.nextStatus,
            otpProvided: body.otp,
          });
          sendJson(res, 200, updated, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      if (req.method === 'GET' && url.pathname === '/orders') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        const collegeId = url.searchParams.get('collegeId') || auth.email.split('@')[1];
        try {
          const orders = await listOrders(collegeId);
          sendJson(res, 200, orders, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      if (req.method === 'GET' && url.pathname === '/polls') {
        const collegeId = url.searchParams.get('collegeId') || 'college-a';
        try {
          const polls = await listPolls(collegeId);
          sendJson(res, 200, polls, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      if (req.method === 'POST' && url.pathname === '/polls') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        const body = (await parseBody<any>(req)) || {};
        try {
          const poll = await createPoll({
            collegeId: auth.email.split('@')[1] || 'college-a',
            ...body,
          });
          sendJson(res, 201, poll, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      if (req.method === 'POST' && url.pathname === '/vote') {
        const auth = requireAuth(req, res, ctx);
        if (!auth) return;
        const body = (await parseBody<any>(req)) || {};
        try {
          const result = await vote({ userId: auth.userId, ...body });
          sendJson(res, 200, result, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      throw new ApiError(404, 'Not found');
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

export const startServer = (port = 4000) => {
  const server = createServer();
  server.listen(port, () => {
    infoLogger(`[canteen] listening on http://localhost:${port}`);
  });
  return server;
};
