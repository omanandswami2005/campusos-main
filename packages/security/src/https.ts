import type { IncomingMessage, ServerResponse } from 'http';

// ============================================================================
// HTTPS Enforcement
// ============================================================================

export interface HttpsConfig {
  /** Enable HTTPS redirect in production */
  enabled?: boolean;
  /** Trust proxy headers (X-Forwarded-Proto) */
  trustProxy?: boolean;
  /** Allowed hosts that bypass HTTPS check */
  allowedHosts?: string[];
}

const defaultHttpsConfig: Required<HttpsConfig> = {
  enabled: process.env.NODE_ENV === 'production',
  trustProxy: true,
  allowedHosts: ['localhost', '127.0.0.1'],
};

/**
 * Check if request is over HTTPS
 */
export function isHttps(req: IncomingMessage, config: HttpsConfig = defaultHttpsConfig): boolean {
  // Check direct HTTPS connection
  if ((req.socket as { encrypted?: boolean }).encrypted) {
    return true;
  }

  // Check proxy headers if trusted
  if (config.trustProxy) {
    const proto = req.headers['x-forwarded-proto'];
    if (proto === 'https') return true;

    const forwarded = req.headers['forwarded'];
    if (forwarded && typeof forwarded === 'string') {
      const protoMatch = forwarded.match(/proto=([^;,\s]+)/i);
      if (protoMatch && protoMatch[1].toLowerCase() === 'https') {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if host is allowed to bypass HTTPS
 */
export function isAllowedHost(
  req: IncomingMessage,
  config: HttpsConfig = defaultHttpsConfig
): boolean {
  const host = req.headers.host?.split(':')[0] || '';
  return config.allowedHosts?.includes(host) ?? false;
}

/**
 * Get HTTPS redirect URL
 */
export function getHttpsRedirectUrl(req: IncomingMessage): string {
  const host = req.headers.host || 'localhost';
  const path = req.url || '/';
  return `https://${host}${path}`;
}

/**
 * Enforce HTTPS - redirect HTTP to HTTPS in production
 */
export function enforceHttps(
  req: IncomingMessage,
  res: ServerResponse,
  config?: HttpsConfig
): boolean {
  const cfg = { ...defaultHttpsConfig, ...config };

  // Skip if not enabled
  if (!cfg.enabled) return true;

  // Skip if already HTTPS
  if (isHttps(req, cfg)) return true;

  // Skip for allowed hosts
  if (isAllowedHost(req, cfg)) return true;

  // Redirect to HTTPS
  const redirectUrl = getHttpsRedirectUrl(req);
  res.writeHead(301, {
    Location: redirectUrl,
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  });
  res.end();

  return false;
}

/**
 * HTTPS enforcement middleware
 */
export function httpsMiddleware(config?: HttpsConfig) {
  return (req: IncomingMessage, res: ServerResponse, next: () => void) => {
    if (enforceHttps(req, res, config)) {
      next();
    }
  };
}
