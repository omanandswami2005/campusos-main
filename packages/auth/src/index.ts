import * as jose from 'jose';
import type { Role, ModulePermission, ROLE_PERMISSIONS } from '@campus-os/types';

// ============================================================================
// Configuration
// ============================================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'campus-os-dev-secret-change-in-production'
);

const JWT_ISSUER = process.env.JWT_ISSUER || 'campus-os-auth';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'campus-os-services';

// ============================================================================
// Token Payload Types
// ============================================================================

/**
 * Access token payload structure
 */
export interface AccessTokenPayload {
  /** User ID */
  sub: string;
  /** User email */
  email: string;
  /** User display name */
  name: string;
  /** User role for RBAC */
  role: Role;
  /** Associated college ID (optional) */
  collegeId?: string;
  /** Token type discriminator */
  type: 'access';
}

/**
 * Decoded user from token (without type field)
 */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  collegeId?: string;
}

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify and decode an access token
 * @param token The JWT access token
 * @returns The token payload if valid, null otherwise
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    // Validate token type
    if (payload.type !== 'access') {
      return null;
    }

    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract bearer token from Authorization header
 * @param authHeader The Authorization header value
 * @returns The token string or null
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}

/**
 * Verify token from Authorization header
 * @param authHeader The Authorization header value
 * @returns The token payload if valid, null otherwise
 */
export async function verifyAuthHeader(
  authHeader: string | null | undefined
): Promise<AccessTokenPayload | null> {
  const token = extractBearerToken(authHeader);
  if (!token) return null;
  return verifyAccessToken(token);
}

// ============================================================================
// Permission Helpers
// ============================================================================

// Re-export role permissions from types
import { ROLE_PERMISSIONS as rolePermissions } from '@campus-os/types';
export { rolePermissions as ROLE_PERMISSIONS };

/**
 * Check if a role has a specific permission
 * @param role The user's role
 * @param permission The permission to check
 * @returns true if the role has the permission
 */
export function hasPermission(role: Role, permission: ModulePermission): boolean {
  const permissions = rolePermissions[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Check if a user has any of the specified permissions
 * @param role The user's role
 * @param permissions The permissions to check
 * @returns true if the role has any of the permissions
 */
export function hasAnyPermission(role: Role, permissions: ModulePermission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}

/**
 * Check if a user has all of the specified permissions
 * @param role The user's role
 * @param permissions The permissions to check
 * @returns true if the role has all of the permissions
 */
export function hasAllPermissions(role: Role, permissions: ModulePermission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * Get all permissions for a role
 * @param role The user's role
 * @returns Array of permissions
 */
export function getPermissions(role: Role): ModulePermission[] {
  return rolePermissions[role] ?? [];
}

// ============================================================================
// Role Helpers
// ============================================================================

/**
 * Check if a role has at least the specified role level
 * @param userRole The user's role
 * @param requiredRole The minimum required role
 * @returns true if userRole >= requiredRole
 */
export function hasRole(userRole: Role, requiredRole: Role): boolean {
  const roleHierarchy: Record<Role, number> = {
    STUDENT: 1,
    STAFF: 2,
    COORDINATOR: 2, // Same level as staff but different permissions
    ADMIN: 3,
  };

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
}

/**
 * Check if a role is exactly one of the specified roles
 * @param userRole The user's role
 * @param allowedRoles Array of allowed roles
 * @returns true if userRole is in allowedRoles
 */
export function isRole(userRole: Role, allowedRoles: Role[]): boolean {
  return allowedRoles.includes(userRole);
}

// ============================================================================
// HTTP Helper Types
// ============================================================================

/**
 * Standard error response
 */
export interface AuthError {
  error: string;
  code?: string;
  statusCode: number;
}

/**
 * Create an unauthorized error
 */
export function unauthorizedError(message = 'Authentication required'): AuthError {
  return {
    error: message,
    code: 'UNAUTHORIZED',
    statusCode: 401,
  };
}

/**
 * Create a forbidden error
 */
export function forbiddenError(message = 'Insufficient permissions'): AuthError {
  return {
    error: message,
    code: 'FORBIDDEN',
    statusCode: 403,
  };
}

// ============================================================================
// Exports
// ============================================================================

export type { Role, ModulePermission } from '@campus-os/types';
