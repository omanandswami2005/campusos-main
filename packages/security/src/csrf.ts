import { randomBytes, createHmac, timingSafeEqual } from 'crypto';

// ============================================================================
// CSRF Protection
// ============================================================================

export interface CsrfConfig {
  /** Secret for signing tokens */
  secret?: string;
  /** Token validity in seconds (default: 1 hour) */
  tokenValiditySec?: number;
  /** Cookie name for CSRF token */
  cookieName?: string;
  /** Header name for CSRF token */
  headerName?: string;
  /** Safe methods that don't require CSRF */
  safeMethods?: string[];
}

const defaultCsrfConfig: Required<CsrfConfig> = {
  secret: process.env.CSRF_SECRET || process.env.JWT_SECRET || 'csrf-secret-change-me',
  tokenValiditySec: 3600, // 1 hour
  cookieName: 'csrf-token',
  headerName: 'x-csrf-token',
  safeMethods: ['GET', 'HEAD', 'OPTIONS'],
};

/**
 * CSRF Token Manager
 */
export class CsrfProtection {
  private config: Required<CsrfConfig>;

  constructor(config?: CsrfConfig) {
    this.config = { ...defaultCsrfConfig, ...config };
  }

  /**
   * Generate a new CSRF token
   */
  generateToken(sessionId?: string): string {
    const timestamp = Date.now().toString(36);
    const randomPart = randomBytes(16).toString('hex');
    const payload = `${timestamp}.${randomPart}${sessionId ? `.${sessionId}` : ''}`;
    const signature = this.sign(payload);
    return `${payload}.${signature}`;
  }

  /**
   * Verify a CSRF token
   */
  verifyToken(token: string, sessionId?: string): boolean {
    if (!token) return false;

    const parts = token.split('.');
    if (parts.length < 3) return false;

    const timestamp = parts[0];
    const randomPart = parts[1];
    const tokenSessionId = parts.length === 4 ? parts[2] : undefined;
    const signature = parts[parts.length - 1];

    // Verify session ID matches if provided
    if (sessionId && tokenSessionId !== sessionId) {
      return false;
    }

    // Reconstruct payload and verify signature
    const payload = parts.slice(0, -1).join('.');
    const expectedSignature = this.sign(payload);

    try {
      const sigBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (sigBuffer.length !== expectedBuffer.length) {
        return false;
      }

      if (!timingSafeEqual(sigBuffer, expectedBuffer)) {
        return false;
      }
    } catch {
      return false;
    }

    // Check token expiration
    const tokenTime = parseInt(timestamp, 36);
    const now = Date.now();
    const maxAge = this.config.tokenValiditySec * 1000;

    if (now - tokenTime > maxAge) {
      return false;
    }

    return true;
  }

  /**
   * Check if method requires CSRF validation
   */
  requiresValidation(method: string): boolean {
    return !this.config.safeMethods.includes(method.toUpperCase());
  }

  /**
   * Get cookie options for CSRF token
   */
  getCookieOptions(): string {
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${this.config.cookieName}=; Path=/; HttpOnly; SameSite=Strict${secure}`;
  }

  /**
   * Build Set-Cookie header value
   */
  buildCookie(token: string): string {
    const maxAge = this.config.tokenValiditySec;
    const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
    return `${this.config.cookieName}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure}`;
  }

  private sign(payload: string): string {
    return createHmac('sha256', this.config.secret).update(payload).digest('hex');
  }
}

// Default instance
export const csrf = new CsrfProtection();

// ============================================================================
// Double Submit Cookie Pattern Helper
// ============================================================================

/**
 * Extract CSRF token from cookie header
 */
export function extractCsrfFromCookie(
  cookieHeader: string | undefined,
  cookieName = 'csrf-token'
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, value] = cookie.split('=');
    if (name === cookieName) {
      return value;
    }
  }
  return null;
}

/**
 * Extract CSRF token from request header
 */
export function extractCsrfFromHeader(
  headers: Record<string, string | string[] | undefined>,
  headerName = 'x-csrf-token'
): string | null {
  const value = headers[headerName] || headers[headerName.toLowerCase()];
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}
