import type { TokenPayload, Role, ModulePermission } from '@campus-os/types';
import { ROLE_PERMISSIONS, hasPermission } from '@campus-os/types';

// Demo secret - in production, use environment variable
export const JWT_SECRET = process.env.JWT_SECRET || 'campus-os-demo-secret-key-change-in-prod';

// Token expiration: 24 hours
const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000;

/**
 * Generate a demo JWT token (not cryptographically secure - for demo only)
 * In production, use a proper JWT library like jsonwebtoken
 */
export const generateToken = (user: {
  id: string;
  email: string;
  name: string;
  role: Role;
  collegeId: string;
}): string => {
  const now = Date.now();

  const payload: TokenPayload = {
    sub: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    collegeId: user.collegeId,
    type: 'access',
    iat: now,
    exp: now + TOKEN_EXPIRY_MS,
  };

  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = Buffer.from(JWT_SECRET + body)
    .toString('base64url')
    .substring(0, 16);

  return `${header}.${body}.${signature}`;
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [, body, sig] = parts;
    if (!body || !sig) return null;

    // Verify signature (demo only - not secure)
    const expectedSig = Buffer.from(JWT_SECRET + body)
      .toString('base64url')
      .substring(0, 16);
    if (sig !== expectedSig) return null;

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf-8')) as TokenPayload;

    // Check expiration
    if (!payload.exp || payload.exp < Date.now()) return null;

    return payload;
  } catch {
    return null;
  }
};

/**
 * Check if a token has a specific permission
 */
export const tokenHasPermission = (token: string, permission: ModulePermission): boolean => {
  const payload = verifyToken(token);
  if (!payload) return false;
  return hasPermission(payload.role, permission);
};

/**
 * Check if a role has permission (re-export for convenience)
 */
export { hasPermission, ROLE_PERMISSIONS };

/**
 * Extract token from Authorization header
 */
export const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
};

// Export types
export type { TokenPayload, Role, ModulePermission };
