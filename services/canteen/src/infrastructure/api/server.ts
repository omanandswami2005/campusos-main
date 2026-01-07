import http from 'node:http';
import { listMenu } from '../../application/queries/listMenu';

export const createServer = () => {
  const server = http.createServer(async (req, res) => {
    if (!req.url) return res.end('Not found');

    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ status: 'ok' }));
      return;
    }

    if (req.url === '/menu') {
      const menu = await listMenu();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(menu));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
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
