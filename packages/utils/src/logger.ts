import pino from 'pino';
import chalk from 'chalk';

const isDev = process.env.NODE_ENV !== 'production';

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
      console.log(`${chalk.gray(getTime())} ${chalk.blue('INFO ')} ${message}`);
      if (meta) console.log(meta);
    } else {
      pinoLogger.info(meta || {}, message);
    }
  };

  const error = (message: string, err?: any, meta?: object) => {
    if (isDev) {
      console.log(`${chalk.gray(getTime())} ${chalk.red('ERROR')} ${message}`);

      // Handle ApiError-like structures
      if (err?.statusCode && err?.message) {
        console.log(chalk.red(`      [${err.statusCode}] ${err.message}`));
        if (err.errors) console.log(chalk.red(`      Errors: ${JSON.stringify(err.errors)}`));
      } else if (err) {
        // Print stack trace if available, else just error
        console.error(chalk.red(err.stack || err));
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
      const statusColor = status >= 500 ? chalk.red : status >= 400 ? chalk.yellow : chalk.green;
      console.log(
        `${chalk.gray(getTime())} ${chalk.cyan('REQ  ')} ${method} ${url} ${statusColor(status)} ${chalk.gray(durationMs + 'ms')}`
      );
    } else {
      pinoLogger.info({ method, url, status, durationMs, ...meta }, 'Request completed');
    }
  };

  const warn = (message: string, meta?: object) => {
    if (isDev) {
      console.log(`${chalk.gray(getTime())} ${chalk.yellow('WARN ')} ${message}`);
      if (meta) console.log(meta);
    } else {
      pinoLogger.warn(meta || {}, message);
    }
  };

  const debug = (message: string, meta?: object) => {
    if (isDev) {
      console.log(`${chalk.gray(getTime())} ${chalk.magenta('DEBUG')} ${message}`, meta || '');
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
