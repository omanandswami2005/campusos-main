import http, { ServerResponse } from 'node:http';
import { ApiError, ApiResponse, createLogger } from '@campus-os/utils';
const { requestLogger, errorLogger, infoLogger } = createLogger('printing');
import { listShops } from '../../application/queries/listShops.js';
import { createPrintJob } from '../../application/commands/createPrintJob.js';
import { getJobStatus } from '../../application/queries/getJobStatus.js';
import { listUserJobs } from '../../application/queries/listUserJobs.js';
import { updateJobStatus } from '../../application/commands/updateJobStatus.js';

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

      // Health check
      if (url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok', service: 'printing' }, ctx);
        return;
      }

      // GET /shops - List print shops
      if (req.method === 'GET' && url.pathname === '/shops') {
        const collegeId = url.searchParams.get('collegeId') || undefined;
        const shops = await listShops(collegeId);
        sendJson(res, 200, shops, ctx);
        return;
      }

      // GET /shops/:id - Get shop details
      if (req.method === 'GET' && url.pathname.match(/^\/shops\/[^/]+$/)) {
        const shopId = url.pathname.split('/')[2];
        const shops = await listShops();
        const shop = shops.find((s: any) => s.id === shopId);
        if (!shop) throw new ApiError(404, 'Shop not found');
        sendJson(res, 200, shop, ctx);
        return;
      }

      // POST /jobs - Create print job
      if (req.method === 'POST' && url.pathname === '/jobs') {
        const body = (await parseBody<any>(req)) || {};
        try {
          const job = await createPrintJob(body);
          sendJson(res, 201, job, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Bad Request');
        }
        return;
      }

      // GET /jobs - List jobs (with userId filter)
      if (req.method === 'GET' && url.pathname === '/jobs') {
        const userId = url.searchParams.get('userId');
        if (!userId) {
          throw new ApiError(400, 'userId query parameter required');
        }
        const jobs = await listUserJobs(userId);
        sendJson(res, 200, jobs, ctx);
        return;
      }

      // GET /jobs/:id - Get job status
      if (req.method === 'GET' && url.pathname.match(/^\/jobs\/[^/]+$/)) {
        const id = url.pathname.split('/')[2];
        const status = await getJobStatus(id);
        if (!status) {
          throw new ApiError(404, 'Job not found');
        }
        sendJson(res, 200, status, ctx);
        return;
      }

      // PATCH /jobs/:id - Update job status
      if (req.method === 'PATCH' && url.pathname.match(/^\/jobs\/[^/]+$/)) {
        const jobId = url.pathname.split('/')[2];
        const body = (await parseBody<any>(req)) || {};
        try {
          const job = await updateJobStatus({ jobId, status: body.status });
          sendJson(res, 200, job, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Failed to update job');
        }
        return;
      }

      // DELETE /jobs/:id - Cancel job
      if (req.method === 'DELETE' && url.pathname.match(/^\/jobs\/[^/]+$/)) {
        const jobId = url.pathname.split('/')[2];
        try {
          const job = await updateJobStatus({ jobId, status: 'cancelled' });
          sendJson(res, 200, { message: 'Job cancelled', job }, ctx);
        } catch (e: any) {
          throw new ApiError(400, e?.message || 'Failed to cancel job');
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

export const startServer = (port = 4100) => {
  const server = createServer();
  server.listen(port, () => {
    infoLogger(`🖨️  Printing service listening on http://localhost:${port}`);
  });
  return server;
};
