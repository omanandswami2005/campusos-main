import { createLogger } from '@campus-os/utils';

// Instantiate logger for 'auth' service
const serviceLogger = createLogger('auth');

// Export individual methods to match existing interface
export const logger = {
  info: serviceLogger.info,
  error: serviceLogger.error,
  warn: serviceLogger.warn,
  debug: serviceLogger.debug,
  child: () => logger, // simplified stub
};

export const requestLogger = serviceLogger.request;
export const errorLogger = serviceLogger.error;
export const infoLogger = serviceLogger.info;

export const createRequestLogger = (requestId: string) => {
  return logger;
};
