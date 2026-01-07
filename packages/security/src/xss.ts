// ============================================================================
// XSS Prevention Utilities
// ============================================================================

/**
 * HTML entities map for escaping
 */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>"'`=/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Escape string for use in JavaScript context
 */
export function escapeJs(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/</g, '\\u003C')
    .replace(/>/g, '\\u003E')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

/**
 * Escape string for use in URL
 */
export function escapeUrl(str: string): string {
  if (typeof str !== 'string') return '';
  return encodeURIComponent(str);
}

/**
 * Strip HTML tags from string
 */
export function stripTags(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '');
}

/**
 * Sanitize object values recursively (escape HTML in all string values)
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return escapeHtml(obj) as unknown as T;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      sanitized[key] = sanitizeObject(value);
    }
    return sanitized as T;
  }

  return obj;
}

// ============================================================================
// Input Validation Helpers
// ============================================================================

/**
 * Check if string contains potential XSS patterns
 */
export function containsXss(str: string): boolean {
  if (typeof str !== 'string') return false;

  const xssPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<script[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /data:/gi,
    /vbscript:/gi,
    /expression\s*\(/gi,
    /url\s*\(/gi,
  ];

  return xssPatterns.some((pattern) => pattern.test(str));
}

/**
 * Check if URL is safe (not javascript:, data:, etc.)
 */
export function isSafeUrl(url: string): boolean {
  if (typeof url !== 'string') return false;

  const trimmed = url.trim().toLowerCase();
  const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];

  return !dangerousProtocols.some((protocol) => trimmed.startsWith(protocol));
}

/**
 * Sanitize URL (return empty string if unsafe)
 */
export function sanitizeUrl(url: string): string {
  if (!isSafeUrl(url)) return '';
  return url;
}

// ============================================================================
// Content Type Validation
// ============================================================================

const SAFE_CONTENT_TYPES = new Set([
  'application/json',
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain',
]);

/**
 * Check if content type is safe for API requests
 */
export function isSafeContentType(contentType: string | undefined): boolean {
  if (!contentType) return false;

  const type = contentType.split(';')[0].trim().toLowerCase();
  return SAFE_CONTENT_TYPES.has(type);
}
