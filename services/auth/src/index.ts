export { startServer } from './infrastructure/api/server';
export {
  verifyAccessToken,
  extractBearerToken,
  type AccessTokenPayload,
} from './infrastructure/auth';

// Start server if running directly
if (require.main === module) {
  // Load environment variables
  require('dotenv/config');

  const { startServer } = require('./infrastructure/api/server');
  startServer();
}
