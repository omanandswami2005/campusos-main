import http from 'node:http';
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

const parseBody = async (req: http.IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.from(chunk));
  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
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

export const createServer = () => {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
      res.writeHead(204).end();
      return;
    }
    const url = new URL(req.url || '/', 'http://localhost');

    if (url.pathname === '/health') {
      res.writeHead(200).end(JSON.stringify({ status: 'ok' }));
      return;
    }

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

    if (req.method === 'GET' && url.pathname === '/menu') {
      const collegeId = url.searchParams.get('collegeId') || undefined;
      const menu = await listMenu(collegeId);
      res.writeHead(200).end(JSON.stringify(menu));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/offers') {
      const collegeId = url.searchParams.get('collegeId') || undefined;
      const offers = await listOffers(collegeId);
      res.writeHead(200).end(JSON.stringify(offers));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/orders') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const body = (await parseBody(req)) || {};
      try {
        const order = await createOrder(body);
        res.writeHead(201).end(JSON.stringify(order));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/orders/')) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const id = url.pathname.split('/')[2];
      const order = await getOrder(id);
      if (!order) {
        res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
      } else {
        res.writeHead(200).end(JSON.stringify(order));
      }
      return;
    }

    if (req.method === 'POST' && url.pathname.startsWith('/orders/') && url.pathname.endsWith('/status')) {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const [, , id] = url.pathname.split('/');
      const body = (await parseBody(req)) || {};
      try {
        const updated = await updateOrderStatus({ orderId: id, nextStatus: body.nextStatus, otpProvided: body.otp });
        res.writeHead(200).end(JSON.stringify(updated));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    if (req.method === 'GET' && url.pathname === '/orders') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const collegeId = url.searchParams.get('collegeId') || auth.email.split('@')[1];
      try {
        const orders = await listOrders(collegeId);
        res.writeHead(200).end(JSON.stringify(orders));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    if (req.method === 'GET' && url.pathname === '/polls') {
      const collegeId = url.searchParams.get('collegeId') || 'college-a';
      try {
        const polls = await listPolls(collegeId);
        res.writeHead(200).end(JSON.stringify(polls));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/polls') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const body = (await parseBody(req)) || {};
      try {
        const poll = await createPoll({ collegeId: auth.email.split('@')[1] || 'college-a', ...body });
        res.writeHead(201).end(JSON.stringify(poll));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    if (req.method === 'POST' && url.pathname === '/vote') {
      const auth = requireAuth(req, res);
      if (!auth) return;
      const body = (await parseBody(req)) || {};
      try {
        const result = await vote({ userId: auth.userId, ...body });
        res.writeHead(200).end(JSON.stringify(result));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
  });

  return server;
};

export const startServer = (port = 4000) => {
  const server = createServer();
  server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[canteen] listening on http://localhost:${port}`);
  });
  return server;
};
