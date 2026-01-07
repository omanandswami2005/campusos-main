import { startServer } from './infrastructure/api/server';

startServer(Number(process.env.PORT) || 4100);
