import type { IncomingMessage, ServerResponse } from 'http';

// ============================================================================
// Security Headers (Helmet-like functionality)
// ============================================================================

export interface SecurityHeadersConfig {
  /** Enable Content-Security-Policy */
  contentSecurityPolicy?: boolean | ContentSecurityPolicyConfig;
  /** Enable X-Frame-Options */
  frameguard?: boolean | { action: 'DENY' | 'SAMEORIGIN' };
  /** Enable X-Content-Type-Options */
  noSniff?: boolean;
  /** Enable X-XSS-Protection */
  xssFilter?: boolean;
  /** Enable Strict-Transport-Security (HSTS) */
  hsts?: boolean | HstsConfig;
  /** Enable X-DNS-Prefetch-Control */
  dnsPrefetchControl?: boolean | { allow: boolean };
  /** Enable Referrer-Policy */
  referrerPolicy?: boolean | { policy: ReferrerPolicy };
  /** Enable X-Permitted-Cross-Domain-Policies */
  permittedCrossDomainPolicies?:
    | boolean
    | { policy: 'none' | 'master-only' | 'by-content-type' | 'all' };
}

export interface ContentSecurityPolicyConfig {
  directives?: {
    defaultSrc?: string[];
    scriptSrc?: string[];
    styleSrc?: string[];
    imgSrc?: string[];
    connectSrc?: string[];
    fontSrc?: string[];
    objectSrc?: string[];
    mediaSrc?: string[];
    frameSrc?: string[];
    formAction?: string[];
    frameAncestors?: string[];
    baseUri?: string[];
    upgradeInsecureRequests?: boolean;
  };
  reportOnly?: boolean;
}

export interface HstsConfig {
  maxAge?: number;
  includeSubDomains?: boolean;
  preload?: boolean;
}

type ReferrerPolicy =
  | 'no-referrer'
  | 'no-referrer-when-downgrade'
  | 'same-origin'
  | 'origin'
  | 'strict-origin'
  | 'origin-when-cross-origin'
  | 'strict-origin-when-cross-origin'
  | 'unsafe-url';

// Default configuration
const defaultConfig: SecurityHeadersConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
      formAction: ["'self'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: true,
    },
  },
  frameguard: { action: 'DENY' },
  noSniff: true,
  xssFilter: true,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true,
  },
  dnsPrefetchControl: { allow: false },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  permittedCrossDomainPolicies: { policy: 'none' },
};

/**
 * Build security headers object
 */
export function buildSecurityHeaders(
  config: SecurityHeadersConfig = defaultConfig
): Record<string, string> {
  const headers: Record<string, string> = {};

  // Content-Security-Policy
  if (config.contentSecurityPolicy) {
    const cspConfig =
      typeof config.contentSecurityPolicy === 'boolean'
        ? defaultConfig.contentSecurityPolicy
        : config.contentSecurityPolicy;

    if (cspConfig && typeof cspConfig !== 'boolean') {
      const directives = cspConfig.directives || {};
      const parts: string[] = [];

      for (const [key, value] of Object.entries(directives)) {
        if (value === true) {
          parts.push(kebabCase(key));
        } else if (Array.isArray(value)) {
          parts.push(`${kebabCase(key)} ${value.join(' ')}`);
        }
      }

      const headerName = cspConfig.reportOnly
        ? 'Content-Security-Policy-Report-Only'
        : 'Content-Security-Policy';
      headers[headerName] = parts.join('; ');
    }
  }

  // X-Frame-Options
  if (config.frameguard) {
    const action = typeof config.frameguard === 'boolean' ? 'DENY' : config.frameguard.action;
    headers['X-Frame-Options'] = action;
  }

  // X-Content-Type-Options
  if (config.noSniff !== false) {
    headers['X-Content-Type-Options'] = 'nosniff';
  }

  // X-XSS-Protection
  if (config.xssFilter !== false) {
    headers['X-XSS-Protection'] = '1; mode=block';
  }

  // Strict-Transport-Security
  if (config.hsts && process.env.NODE_ENV === 'production') {
    const hstsConfig =
      typeof config.hsts === 'boolean' ? (defaultConfig.hsts as HstsConfig) : config.hsts;

    if (hstsConfig) {
      let value = `max-age=${hstsConfig.maxAge || 31536000}`;
      if (hstsConfig.includeSubDomains) value += '; includeSubDomains';
      if (hstsConfig.preload) value += '; preload';
      headers['Strict-Transport-Security'] = value;
    }
  }

  // X-DNS-Prefetch-Control
  if (config.dnsPrefetchControl !== undefined) {
    const allow =
      typeof config.dnsPrefetchControl === 'boolean' ? false : config.dnsPrefetchControl.allow;
    headers['X-DNS-Prefetch-Control'] = allow ? 'on' : 'off';
  }

  // Referrer-Policy
  if (config.referrerPolicy) {
    const policy =
      typeof config.referrerPolicy === 'boolean'
        ? 'strict-origin-when-cross-origin'
        : config.referrerPolicy.policy;
    headers['Referrer-Policy'] = policy;
  }

  // X-Permitted-Cross-Domain-Policies
  if (config.permittedCrossDomainPolicies) {
    const policy =
      typeof config.permittedCrossDomainPolicies === 'boolean'
        ? 'none'
        : config.permittedCrossDomainPolicies.policy;
    headers['X-Permitted-Cross-Domain-Policies'] = policy;
  }

  // Additional security headers
  headers['X-Download-Options'] = 'noopen';
  headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  headers['Cross-Origin-Resource-Policy'] = 'same-origin';

  return headers;
}

function kebabCase(str: string): string {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Apply security headers to response
 */
export function applySecurityHeaders(res: ServerResponse, config?: SecurityHeadersConfig): void {
  const headers = buildSecurityHeaders(config);
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
}

/**
 * Get security headers as middleware function
 */
export function securityHeadersMiddleware(config?: SecurityHeadersConfig) {
  const headers = buildSecurityHeaders(config);

  return (_req: IncomingMessage, res: ServerResponse, next: () => void) => {
    for (const [key, value] of Object.entries(headers)) {
      res.setHeader(key, value);
    }
    next();
  };
}

// Pre-built headers for common use
export const defaultSecurityHeaders = buildSecurityHeaders(defaultConfig);

// API-specific headers (more permissive CSP for APIs)
export const apiSecurityHeaders = buildSecurityHeaders({
  ...defaultConfig,
  contentSecurityPolicy: false, // APIs don't need CSP
});
