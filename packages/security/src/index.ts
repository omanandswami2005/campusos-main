// Rate Limiting with Redis
export {
  RateLimiter,
  getRedisClient,
  closeRedis,
  authRateLimiter,
  apiRateLimiter,
  passwordResetLimiter,
  registrationLimiter,
  type RateLimitConfig,
  type RateLimitResult,
} from './rate-limiter';

// Security Headers (Helmet-like)
export {
  buildSecurityHeaders,
  applySecurityHeaders,
  securityHeadersMiddleware,
  defaultSecurityHeaders,
  apiSecurityHeaders,
  type SecurityHeadersConfig,
  type ContentSecurityPolicyConfig,
  type HstsConfig,
} from './headers';

// CSRF Protection
export {
  CsrfProtection,
  csrf,
  extractCsrfFromCookie,
  extractCsrfFromHeader,
  type CsrfConfig,
} from './csrf';

// XSS Prevention
export {
  escapeHtml,
  escapeJs,
  escapeUrl,
  stripTags,
  sanitizeObject,
  containsXss,
  isSafeUrl,
  sanitizeUrl,
  isSafeContentType,
} from './xss';

// HTTPS Enforcement
export {
  isHttps,
  isAllowedHost,
  getHttpsRedirectUrl,
  enforceHttps,
  httpsMiddleware,
  type HttpsConfig,
} from './https';

// SQL Injection Prevention
export {
  isValidColumnName,
  validateColumn,
  validateSortDirection,
  buildOrderBy,
  sanitizeLikePattern,
  buildSearchPattern,
} from './sql-injection';
