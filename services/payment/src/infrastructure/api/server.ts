import http, { ServerResponse } from 'node:http';
import { createLogger } from '@campus-os/utils';
import { createPaymentOrder } from '../../application/commands/createPaymentOrder';
import { verifyPayment } from '../../application/commands/verifyPayment';

const { requestLogger, errorLogger, infoLogger } = createLogger('payment');

interface RequestContext {
  requestId: string;
  method: string;
  path: string;
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
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.writeHead(status);
  res.end(JSON.stringify({ success: status < 400, data, statusCode: status }));

  if (ctx) {
    const duration = Date.now() - ctx.startTime;
    requestLogger(ctx.method, ctx.path, status, duration, { requestId: ctx.requestId });
  }
}

export const createServer = () => {
  const server = http.createServer(async (req, res) => {
    // CORS preflight
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.writeHead(204).end();
      return;
    }

    const ctx: RequestContext = {
      requestId: Math.random().toString(36).substring(2, 15),
      method: req.method || 'GET',
      path: req.url || '/',
      startTime: Date.now(),
    };

    try {
      const url = new URL(req.url || '/', 'http://localhost');

      // Health check
      if (url.pathname === '/health') {
        sendJson(res, 200, { status: 'ok' }, ctx);
        return;
      }

      // Create Razorpay order
      if (req.method === 'POST' && url.pathname === '/payments/create') {
        const body = await parseBody<{
          amountCents: number;
          orderId: string;
          currency?: string;
          notes?: Record<string, string>;
        }>(req);

        if (!body || !body.amountCents || !body.orderId) {
          sendJson(res, 400, { error: 'Missing amountCents or orderId' }, ctx);
          return;
        }

        const order = await createPaymentOrder({
          amountCents: body.amountCents,
          orderId: body.orderId,
          currency: body.currency,
          notes: body.notes,
        });

        sendJson(
          res,
          201,
          {
            razorpayOrderId: order.razorpayOrderId,
            amount: order.amount,
            currency: order.currency,
            keyId: process.env.RAZORPAY_KEY_ID, // Frontend needs this
          },
          ctx
        );
        return;
      }

      // Verify payment
      if (req.method === 'POST' && url.pathname === '/payments/verify') {
        const body = await parseBody<{
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }>(req);

        if (
          !body ||
          !body.razorpay_order_id ||
          !body.razorpay_payment_id ||
          !body.razorpay_signature
        ) {
          sendJson(res, 400, { error: 'Missing payment verification fields' }, ctx);
          return;
        }

        const result = verifyPayment({
          razorpayOrderId: body.razorpay_order_id,
          razorpayPaymentId: body.razorpay_payment_id,
          razorpaySignature: body.razorpay_signature,
        });

        if (result.valid) {
          sendJson(res, 200, { verified: true, paymentId: result.paymentId }, ctx);
        } else {
          sendJson(res, 400, { verified: false, error: 'Invalid signature' }, ctx);
        }
        return;
      }

      sendJson(res, 404, { error: 'Not found' }, ctx);
    } catch (error: any) {
      errorLogger(error.message, error, { requestId: ctx.requestId });
      sendJson(res, 500, { error: 'Internal server error' }, ctx);
    }
  });

  return server;
};

export const startServer = (port = 4400) => {
  const server = createServer();
  server.listen(port, () => {
    infoLogger(`[payment] listening on http://localhost:${port}`);
  });
  return server;
};
