import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

// ANSI color codes (works in both ESM and CJS)
const colors = {
  gray: (s: string) => `\x1b[90m${s}\x1b[0m`,
  blue: (s: string) => `\x1b[34m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  magenta: (s: string) => `\x1b[35m${s}\x1b[0m`,
};

// Helpers
const getTime = () => new Date().toLocaleTimeString();

// Types
export interface ServiceLogger {
  info: (msg: string, meta?: object) => void;
  error: (msg: string, error?: any, meta?: object) => void;
  request: (method: string, url: string, status: number, durationMs: number, meta?: object) => void;
  warn: (msg: string, meta?: object) => void;
  debug: (msg: string, meta?: object) => void;
  infoLogger: (msg: string, meta?: object) => void;
  errorLogger: (msg: string, error?: any, meta?: object) => void;
  requestLogger: (
    method: string,
    url: string,
    status: number,
    durationMs: number,
    meta?: object
  ) => void;
  warnLogger: (msg: string, meta?: object) => void;
  debugLogger: (msg: string, meta?: object) => void;
  pinoLogger: pino.Logger;
}

export const createLogger = (serviceName: string): ServiceLogger => {
  // Base Pino logger configuration
  const pinoLogger = pino({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    base: {
      service: serviceName,
    },
  });

  const info = (message: string, meta?: object) => {
    if (isDev) {
      console.log(`${colors.gray(getTime())} ${colors.blue('INFO ')} ${message}`);
      if (meta) console.log(meta);
    } else {
      pinoLogger.info(meta || {}, message);
    }
  };

  const error = (message: string, err?: any, meta?: object) => {
    if (isDev) {
      console.log(`${colors.gray(getTime())} ${colors.red('ERROR')} ${message}`);

      // Handle ApiError-like structures
      if (err?.statusCode && err?.message) {
        console.log(colors.red(`      [${err.statusCode}] ${err.message}`));
        if (err.errors) console.log(colors.red(`      Errors: ${JSON.stringify(err.errors)}`));
      } else if (err) {
        // Print stack trace if available, else just error
        console.error(colors.red(err.stack || String(err)));
      }

      if (meta) console.log(meta);
    } else {
      pinoLogger.error({ ...meta, err }, message);
    }
  };

  const request = (
    method: string,
    url: string,
    status: number,
    durationMs: number,
    meta?: object
  ) => {
    if (isDev) {
      const statusColor = status >= 500 ? colors.red : status >= 400 ? colors.yellow : colors.green;
      console.log(
        `${colors.gray(getTime())} ${colors.cyan('REQ  ')} ${method} ${url} ${statusColor(String(status))} ${colors.gray(durationMs + 'ms')}`
      );
    } else {
      pinoLogger.info({ method, url, status, durationMs, ...meta }, 'Request completed');
    }
  };

  const warn = (message: string, meta?: object) => {
    if (isDev) {
      console.log(`${colors.gray(getTime())} ${colors.yellow('WARN ')} ${message}`);
      if (meta) console.log(meta);
    } else {
      pinoLogger.warn(meta || {}, message);
    }
  };

  const debug = (message: string, meta?: object) => {
    if (isDev) {
      console.log(`${colors.gray(getTime())} ${colors.magenta('DEBUG')} ${message}`, meta || '');
    } else {
      pinoLogger.debug(meta || {}, message);
    }
  };

  return {
    info,
    error,
    request,
    warn,
    debug,
    infoLogger: info,
    errorLogger: error,
    requestLogger: request,
    warnLogger: warn,
    debugLogger: debug,
    pinoLogger,
  };
};
