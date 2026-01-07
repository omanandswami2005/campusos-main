import http from 'node:http';
import { listShops } from '../../application/queries/listShops';
import { createPrintJob } from '../../application/commands/createPrintJob';
import { getJobStatus } from '../../application/queries/getJobStatus';

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

export const createServer = () => {
  const server = http.createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    const url = new URL(req.url || '/', 'http://localhost');

    if (url.pathname === '/health') {
      res.writeHead(200).end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.method === 'GET' && url.pathname === '/shops') {
      const collegeId = url.searchParams.get('collegeId') || undefined;
      const shops = await listShops(collegeId);
      res.writeHead(200).end(JSON.stringify(shops));
      return;
    }

    if (req.method === 'POST' && url.pathname === '/jobs') {
      const body = (await parseBody(req)) || {};
      try {
        const job = await createPrintJob(body);
        res.writeHead(201).end(JSON.stringify(job));
      } catch (e: any) {
        res.writeHead(400).end(JSON.stringify({ error: e?.message || 'Bad Request' }));
      }
      return;
    }

    if (req.method === 'GET' && url.pathname.startsWith('/jobs/')) {
      const id = url.pathname.split('/')[2];
      const status = await getJobStatus(id);
      if (!status) {
        res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
      } else {
        res.writeHead(200).end(JSON.stringify(status));
      }
      return;
    }

    res.writeHead(404).end(JSON.stringify({ error: 'Not found' }));
  });
  return server;
};

export const startServer = (port = 4100) => {
  const server = createServer();
  server.listen(port, () => {
    console.log(`[printing] listening on http://localhost:${port}`);
  });
  return server;
};
