import { createServer, IncomingMessage, ServerResponse } from 'http';
import { requestLogger, errorLogger, infoLogger } from '../../infrastructure/logging/logger';
import { verifyAccessToken, extractBearerToken } from '../../infrastructure/auth';
import { ApiError, ApiResponse } from '@campus-os/utils';
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword,
} from '../../application/auth-service';
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
  ChangePasswordSchema,
  UpdateProfileSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '../../application/validation/schemas';
import type { AccessTokenPayload } from '../../infrastructure/auth';

// Security imports
import {
  authRateLimiter,
  registrationLimiter,
  passwordResetLimiter,
  apiSecurityHeaders,
  enforceHttps,
  csrf,
  extractCsrfFromCookie,
  extractCsrfFromHeader,
  escapeHtml,
  isSafeContentType,
  type RateLimitResult,
} from '@campus-os/security';

// ============================================================================
// Configuration
// ============================================================================

const PORT = parseInt(process.env.AUTH_PORT || '4300', 10);
const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173'
).split(',');
const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const CSRF_ENABLED = process.env.CSRF_ENABLED === 'true';

// ============================================================================
// Request Helpers
// ============================================================================

interface RequestContext {
  requestId: string;
  method: string;
  path: string;
  ip: string;
  user?: AccessTokenPayload;
  startTime: number;
}

function generateRequestId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

async function parseBody<T>(req: IncomingMessage): Promise<T | null> {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : null);
      } catch {
        resolve(null);
      }
    });
    req.on('error', () => resolve(null));
  });
}

function sendJson(res: ServerResponse, status: number, data: unknown, ctx?: RequestContext): void {
  // Apply security headers
  for (const [key, value] of Object.entries(apiSecurityHeaders)) {
    res.setHeader(key, value);
  }

  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...getCorsHeaders(),
  });

  // Wrap standard data in ApiResponse if not already done (for backward compatibility if needed, but we enforce standard here)
  let responseData = data;
  if (!(data instanceof ApiResponse) && !(data && (data as any).success !== undefined)) {
    // If passing raw object, wrap it?
    // User wants "use ApiResponse".
    // We'll trust logic to pass ApiResponse, or we auto-wrap.
    // Auto-wrap for convenience:
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
  // Escape error message to prevent XSS
  // Use ApiResponse structure
  const response = new ApiResponse(status, null, escapeHtml(message));

  if (ctx) {
    // Log the error before sending
    errorLogger(message, originalError, {
      requestId: ctx.requestId,
      status,
      method: ctx.method,
      path: ctx.path,
    });
  }

  // sendJson will log the request completion (but we might want to log it as request log too? yes sendJson calls requestLogger)
  // But requestLogger logs detailed info?
  // sendJson calls requestLogger. So we just need to ensure error is logged.

  // Actually sendJson calls requestLogger. So we don't need to log request again here.
  // But we want to log the ERROR content.

  sendJson(res, status, response, ctx);
}

function sendRateLimitError(
  res: ServerResponse,
  result: RateLimitResult,
  ctx: RequestContext
): void {
  res.setHeader('Retry-After', result.retryAfter?.toString() || '60');
  res.setHeader('X-RateLimit-Remaining', '0');
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
  sendError(res, 429, 'Too many requests. Please try again later.', ctx);
}

function getCorsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0] || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-CSRF-Token',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Expose-Headers': 'X-RateLimit-Remaining, X-RateLimit-Reset, Retry-After',
  };
}

// ============================================================================
// Security Middleware
// ============================================================================

async function checkRateLimit(
  limiter: typeof authRateLimiter,
  identifier: string,
  res: ServerResponse,
  ctx: RequestContext
): Promise<boolean> {
  const result = await limiter.check(identifier);

  if (!result.allowed) {
    infoLogger('Rate limit exceeded', { requestId: ctx.requestId, identifier });
    sendRateLimitError(res, result, ctx);
    return false;
  }

  res.setHeader('X-RateLimit-Remaining', result.remaining.toString());
  res.setHeader('X-RateLimit-Reset', result.resetAt.toISOString());
  return true;
}

function validateContentType(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): boolean {
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    if (!isSafeContentType(req.headers['content-type'])) {
      throw new ApiError(415, 'Unsupported Content-Type');
    }
  }
  return true;
}

function validateCsrf(req: IncomingMessage, res: ServerResponse, ctx: RequestContext): boolean {
  if (!CSRF_ENABLED) return true;
  if (!csrf.requiresValidation(req.method || 'GET')) return true;

  const cookieToken = extractCsrfFromCookie(req.headers.cookie);
  const headerToken = extractCsrfFromHeader(req.headers as Record<string, string | undefined>);

  if (!headerToken || !csrf.verifyToken(headerToken)) {
    infoLogger('CSRF validation failed', { requestId: ctx.requestId });
    throw new ApiError(403, 'Invalid CSRF token');
  }

  // Double submit cookie pattern
  if (cookieToken && cookieToken !== headerToken) {
    infoLogger('CSRF cookie mismatch', { requestId: ctx.requestId });
    throw new ApiError(403, 'CSRF token mismatch');
  }

  return true;
}

// ============================================================================
// Authentication Middleware
// ============================================================================

async function authenticate(req: IncomingMessage): Promise<AccessTokenPayload | null> {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) return null;
  return verifyAccessToken(token);
}

// ============================================================================
// Route Handlers
// ============================================================================

async function handleRegister(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  const body = await parseBody(req);
  const parsed = RegisterSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, errors);
  }

  const result = await register(parsed.data);

  if (!result.success) {
    throw new ApiError(400, result.error || 'Registration failed');
  }

  sendJson(res, 201, { user: result.user, tokens: result.tokens }, ctx);
}

async function handleLogin(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  const body = await parseBody(req);
  const parsed = LoginSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, errors);
  }

  const result = await login(parsed.data);

  if (!result.success) {
    throw new ApiError(401, result.error || 'Login failed');
  }

  sendJson(res, 200, { user: result.user, tokens: result.tokens }, ctx);
}

async function handleRefresh(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  const body = await parseBody<{ refreshToken?: string }>(req);
  const parsed = RefreshTokenSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, errors);
  }

  const result = await refresh(parsed.data.refreshToken);

  if (!result.success) {
    throw new ApiError(401, result.error || 'Token refresh failed');
  }

  sendJson(res, 200, { user: result.user, tokens: result.tokens }, ctx);
}

async function handleLogout(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  const body = await parseBody<{ refreshToken?: string }>(req);

  if (!body?.refreshToken) {
    throw new ApiError(400, 'Refresh token is required');
  }

  await logout(body.refreshToken);
  sendJson(res, 200, { message: 'Logged out successfully' }, ctx);
}

async function handleLogoutAll(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  if (!ctx.user) {
    throw new ApiError(401, 'Authentication required');
  }

  await logoutAll(ctx.user.sub);
  sendJson(res, 200, { message: 'Logged out from all devices' }, ctx);
}

async function handleGetProfile(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  if (!ctx.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const profile = await getProfile(ctx.user.sub);

  if (!profile) {
    throw new ApiError(404, 'User not found');
  }

  sendJson(res, 200, profile, ctx);
}

async function handleUpdateProfile(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  if (!ctx.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const body = await parseBody(req);
  const parsed = UpdateProfileSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, errors);
  }

  const result = await updateProfile(ctx.user.sub, parsed.data);

  if (!result.success) {
    throw new ApiError(400, result.error || 'Update failed');
  }

  sendJson(res, 200, result.user, ctx);
}

async function handleChangePassword(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  if (!ctx.user) {
    throw new ApiError(401, 'Authentication required');
  }

  const body = await parseBody(req);
  const parsed = ChangePasswordSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, errors);
  }

  const result = await changePassword(ctx.user.sub, parsed.data);

  if (!result.success) {
    throw new ApiError(400, result.error || 'Password change failed');
  }

  sendJson(res, 200, { message: 'Password changed successfully' }, ctx);
}

async function handleForgotPassword(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  const body = await parseBody(req);
  const parsed = ForgotPasswordSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, errors);
  }

  const result = await requestPasswordReset(parsed.data.email);

  // Always return success to prevent email enumeration
  sendJson(
    res,
    200,
    {
      message: 'If the email exists, a password reset link has been sent',
      ...(process.env.NODE_ENV !== 'production' && result.resetToken
        ? { resetToken: result.resetToken }
        : {}),
    },
    ctx
  );
}

async function handleResetPassword(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  const body = await parseBody(req);
  const parsed = ResetPasswordSchema.safeParse(body);

  if (!parsed.success) {
    const errors = parsed.error.errors.map((e) => e.message).join(', ');
    throw new ApiError(400, errors);
  }

  const result = await resetPassword(parsed.data.token, parsed.data.newPassword);

  if (!result.success) {
    throw new ApiError(400, result.error || 'Password reset failed');
  }

  sendJson(res, 200, { message: 'Password reset successfully' }, ctx);
}

async function handleVerifyToken(
  req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  if (!ctx.user) {
    throw new ApiError(401, 'Invalid token');
  }

  sendJson(
    res,
    200,
    {
      valid: true,
      user: {
        id: ctx.user.sub,
        email: ctx.user.email,
        name: ctx.user.name,
        role: ctx.user.role,
        collegeId: ctx.user.collegeId,
      },
    },
    ctx
  );
}

async function handleHealthCheck(
  _req: IncomingMessage,
  res: ServerResponse,
  ctx: RequestContext
): Promise<void> {
  sendJson(
    res,
    200,
    {
      status: 'healthy',
      service: 'auth',
      timestamp: new Date().toISOString(),
    },
    ctx
  );
}

// ============================================================================
// Router
// ============================================================================

async function handleRequest(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const ctx: RequestContext = {
    requestId: generateRequestId(),
    method: req.method || 'GET',
    path: req.url || '/',
    ip: getClientIp(req),
    startTime: Date.now(),
  };

  // logger.debug(ctx, 'Incoming request'); // Remove debug log or use infoLogger if needed, but requestLogger handles completion

  // HTTPS enforcement in production
  if (IS_PRODUCTION && !enforceHttps(req, res)) {
    return;
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, getCorsHeaders());
    res.end();
    return;
  }

  try {
    // Validate Content-Type
    validateContentType(req, res, ctx);

    // CSRF validation (if enabled)
    validateCsrf(req, res, ctx);

    // Parse URL
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    const path = url.pathname;

    // Authenticate if token present
    ctx.user = (await authenticate(req)) ?? undefined;

    // Route requests with rate limiting
    // Health check (no rate limit)
    if (path === '/health' && req.method === 'GET') {
      return handleHealthCheck(req, res, ctx);
    }

    // CSRF token endpoint (for SPA clients)
    if (path === '/auth/csrf-token' && req.method === 'GET') {
      const token = csrf.generateToken();
      res.setHeader('Set-Cookie', csrf.buildCookie(token));
      return sendJson(res, 200, { csrfToken: token }, ctx);
    }

    // Registration (strict rate limit by IP)
    if (path === '/auth/register' && req.method === 'POST') {
      if (!(await checkRateLimit(registrationLimiter, ctx.ip, res, ctx))) return;
      return handleRegister(req, res, ctx);
    }

    // Login (strict rate limit by IP + email)
    if (path === '/auth/login' && req.method === 'POST') {
      if (!(await checkRateLimit(authRateLimiter, ctx.ip, res, ctx))) return;
      return handleLogin(req, res, ctx);
    }

    // Token refresh (moderate rate limit)
    if (path === '/auth/refresh' && req.method === 'POST') {
      if (!(await checkRateLimit(authRateLimiter, ctx.ip, res, ctx))) return;
      return handleRefresh(req, res, ctx);
    }

    // Forgot password (very strict rate limit)
    if (path === '/auth/forgot-password' && req.method === 'POST') {
      if (!(await checkRateLimit(passwordResetLimiter, ctx.ip, res, ctx))) return;
      return handleForgotPassword(req, res, ctx);
    }

    // Reset password (strict rate limit)
    if (path === '/auth/reset-password' && req.method === 'POST') {
      if (!(await checkRateLimit(authRateLimiter, ctx.ip, res, ctx))) return;
      return handleResetPassword(req, res, ctx);
    }

    // Protected routes (standard rate limit by user)
    const userId = ctx.user?.sub || ctx.ip;

    if (path === '/auth/logout' && req.method === 'POST') {
      return handleLogout(req, res, ctx);
    }
    if (path === '/auth/logout-all' && req.method === 'POST') {
      return handleLogoutAll(req, res, ctx);
    }
    if (path === '/auth/verify' && req.method === 'GET') {
      return handleVerifyToken(req, res, ctx);
    }
    if (path === '/auth/me' && req.method === 'GET') {
      return handleGetProfile(req, res, ctx);
    }
    if (path === '/auth/me' && req.method === 'PUT') {
      return handleUpdateProfile(req, res, ctx);
    }
    if (path === '/auth/change-password' && req.method === 'POST') {
      if (!(await checkRateLimit(authRateLimiter, userId, res, ctx))) return;
      return handleChangePassword(req, res, ctx);
    }

    // 404
    throw new ApiError(404, 'Not found');
  } catch (error) {
    if (error instanceof ApiError) {
      // Use standard ApiResponse for error
      const payload: any = {
        message: error.message,
      };
      if (error.errors && error.errors.length) {
        payload.errors = error.errors;
      }
      sendJson(res, error.statusCode, payload, ctx);
      return;
    }

    sendError(res, 500, 'Internal server error', ctx, error);
  }
}

// ============================================================================
// Server
// ============================================================================

export function startServer(): void {
  const server = createServer(handleRequest);

  server.listen(PORT, () => {
    infoLogger('🔐 Auth service started', { port: PORT });
    infoLogger(`   Health: http://localhost:${PORT}/health`);
    infoLogger(`   API:    http://localhost:${PORT}/auth/*`);
    infoLogger(`   Security: Rate limiting ${process.env.REDIS_URL ? '(Redis)' : '(in-memory)'}`);
    infoLogger(`   HTTPS: ${IS_PRODUCTION ? 'enforced' : 'disabled (dev)'}`);
    infoLogger(`   CSRF: ${CSRF_ENABLED ? 'enabled' : 'disabled'}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    infoLogger('Shutting down auth service...');

    // Close Redis connection
    const { closeRedis } = await import('@campus-os/security');
    await closeRedis();

    server.close(() => {
      infoLogger('Auth service stopped');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}
