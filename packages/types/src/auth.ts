// ============================================================================
// Role Definitions
// ============================================================================

/**
 * Unified roles across all Campus OS services
 * Matches Prisma enum: STUDENT, STAFF, COORDINATOR, ADMIN
 */
export type Role = 'STUDENT' | 'STAFF' | 'COORDINATOR' | 'ADMIN';

// ============================================================================
// Permission Definitions
// ============================================================================

/**
 * Module-specific permissions for fine-grained access control
 */
export type ModulePermission =
  // Canteen Module
  | 'canteen:menu:read'
  | 'canteen:menu:write'
  | 'canteen:order:create'
  | 'canteen:order:read:own'
  | 'canteen:order:read:all'
  | 'canteen:order:update'
  // Printing Module
  | 'printing:job:create'
  | 'printing:job:read:own'
  | 'printing:job:read:all'
  | 'printing:shop:manage'
  // Events Module
  | 'events:read'
  | 'events:register'
  | 'events:manage'
  | 'clubs:manage'
  | 'attendance:manage'
  | 'certificates:manage'
  // Administration
  | 'users:read'
  | 'users:manage'
  | 'audit:read';

// ============================================================================
// Role to Permissions Mapping
// ============================================================================

/**
 * Defines what permissions each role has
 */
export const ROLE_PERMISSIONS: Record<Role, ModulePermission[]> = {
  STUDENT: [
    'canteen:menu:read',
    'canteen:order:create',
    'canteen:order:read:own',
    'printing:job:create',
    'printing:job:read:own',
    'events:read',
    'events:register',
  ],
  STAFF: [
    'canteen:menu:read',
    'canteen:menu:write',
    'canteen:order:create',
    'canteen:order:read:own',
    'canteen:order:read:all',
    'canteen:order:update',
    'printing:job:create',
    'printing:job:read:own',
    'printing:job:read:all',
    'printing:shop:manage',
    'events:read',
    'events:register',
  ],
  COORDINATOR: [
    'canteen:menu:read',
    'canteen:order:create',
    'canteen:order:read:own',
    'printing:job:create',
    'printing:job:read:own',
    'events:read',
    'events:register',
    'events:manage',
    'clubs:manage',
    'attendance:manage',
    'certificates:manage',
  ],
  ADMIN: [
    'canteen:menu:read',
    'canteen:menu:write',
    'canteen:order:create',
    'canteen:order:read:own',
    'canteen:order:read:all',
    'canteen:order:update',
    'printing:job:create',
    'printing:job:read:own',
    'printing:job:read:all',
    'printing:shop:manage',
    'events:read',
    'events:register',
    'events:manage',
    'clubs:manage',
    'attendance:manage',
    'certificates:manage',
    'users:read',
    'users:manage',
    'audit:read',
  ],
};

// ============================================================================
// Token Types
// ============================================================================

/**
 * Access token payload structure
 */
export interface TokenPayload {
  sub: string;
  email: string;
  name: string;
  role: Role;
  collegeId?: string;
  type: 'access' | 'refresh';
  iat?: number;
  exp?: number;
  iss?: string;
  aud?: string;
}

/**
 * Session information
 */
export interface Session {
  userId: string;
  email: string;
  name: string;
  role: Role;
  collegeId?: string;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role: Role, permission: ModulePermission): boolean => {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
};

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (role: Role, permissions: ModulePermission[]): boolean => {
  return permissions.some((p) => hasPermission(role, p));
};

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (role: Role, permissions: ModulePermission[]): boolean => {
  return permissions.every((p) => hasPermission(role, p));
};

/**
 * Get all permissions for a role
 */
export const getPermissions = (role: Role): ModulePermission[] => {
  return ROLE_PERMISSIONS[role] ?? [];
};
