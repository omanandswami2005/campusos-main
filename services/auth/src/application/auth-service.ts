import { db } from '@campus-os/database';
import { randomUUID } from 'crypto';
import {
  hashPassword,
  verifyPassword,
  generateTokenPair,
  verifyRefreshToken,
  generateSecureToken,
} from '../infrastructure/auth';
import { logger } from '../infrastructure/logging/logger';
import type { Role } from '@campus-os/types';
import type {
  RegisterInput,
  LoginInput,
  ChangePasswordInput,
  UpdateProfileInput,
} from './validation/schemas';

// ============================================================================
// Types
// ============================================================================

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    role: Role;
    collegeId?: string | null;
    rollNumber?: string | null;
  };
  tokens?: {
    accessToken: string;
    refreshToken: string;
    accessTokenExpiresAt: Date;
    refreshTokenExpiresAt: Date;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: Role;
  collegeId?: string | null;
  rollNumber?: string | null;
  college?: {
    id: string;
    name: string;
    code: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// Service Functions
// ============================================================================

/**
 * Register a new user
 */
export async function register(input: RegisterInput): Promise<AuthResult> {
  const log = logger.child({ operation: 'register', email: input.email });

  try {
    // Check if user already exists
    const existing = await db.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      log.warn('Registration failed: email already exists');
      return { success: false, error: 'Email already registered' };
    }

    // Hash password
    const passwordHash = await hashPassword(input.password);

    // Create user
    const user = await db.user.create({
      data: {
        id: randomUUID(),
        email: input.email,
        passwordHash,
        name: input.name,
        role: input.role,
        rollNumber: input.rollNumber,
        collegeId: input.collegeId,
      },
    });

    // Generate tokens
    const refreshTokenId = randomUUID();
    const tokens = await generateTokenPair(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        collegeId: user.collegeId ?? undefined,
      },
      refreshTokenId
    );

    // Store refresh token
    await db.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: tokens.refreshTokenExpiresAt,
      },
    });

    log.info({ userId: user.id }, 'User registered successfully');

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        collegeId: user.collegeId,
        rollNumber: user.rollNumber,
      },
      tokens,
    };
  } catch (error) {
    log.error({ error }, 'Registration failed');
    return { success: false, error: 'Registration failed' };
  }
}

/**
 * Authenticate a user
 */
export async function login(input: LoginInput): Promise<AuthResult> {
  const log = logger.child({ operation: 'login', email: input.email });

  try {
    // Find user
    const user = await db.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.isActive) {
      log.warn('Login failed: user not found or inactive');
      return { success: false, error: 'Invalid email or password' };
    }

    // Verify password
    const isValid = await verifyPassword(input.password, user.passwordHash);

    if (!isValid) {
      log.warn({ userId: user.id }, 'Login failed: invalid password');
      return { success: false, error: 'Invalid email or password' };
    }

    // Generate tokens
    const refreshTokenId = randomUUID();
    const tokens = await generateTokenPair(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        collegeId: user.collegeId ?? undefined,
      },
      refreshTokenId
    );

    // Store refresh token
    await db.refreshToken.create({
      data: {
        id: refreshTokenId,
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: tokens.refreshTokenExpiresAt,
      },
    });

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    log.info({ userId: user.id }, 'User logged in successfully');

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        collegeId: user.collegeId,
        rollNumber: user.rollNumber,
      },
      tokens,
    };
  } catch (error) {
    log.error({ error }, 'Login failed');
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Refresh access token using refresh token
 */
export async function refresh(refreshToken: string): Promise<AuthResult> {
  const log = logger.child({ operation: 'refresh' });

  try {
    // Verify refresh token
    const payload = await verifyRefreshToken(refreshToken);

    if (!payload) {
      log.warn('Refresh failed: invalid token');
      return { success: false, error: 'Invalid refresh token' };
    }

    // Check if token exists in database and is not revoked
    const storedToken = await db.refreshToken.findUnique({
      where: { id: payload.tokenId },
      include: { user: true },
    });

    if (!storedToken || storedToken.revokedAt) {
      log.warn({ tokenId: payload.tokenId }, 'Refresh failed: token revoked');
      return { success: false, error: 'Invalid refresh token' };
    }

    if (storedToken.expiresAt < new Date()) {
      log.warn({ tokenId: payload.tokenId }, 'Refresh failed: token expired');
      return { success: false, error: 'Refresh token expired' };
    }

    const user = storedToken.user;

    if (!user.isActive) {
      log.warn({ userId: user.id }, 'Refresh failed: user inactive');
      return { success: false, error: 'User account is inactive' };
    }

    // Revoke old refresh token
    await db.refreshToken.update({
      where: { id: payload.tokenId },
      data: { revokedAt: new Date() },
    });

    // Generate new tokens
    const newRefreshTokenId = randomUUID();
    const tokens = await generateTokenPair(
      {
        sub: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        collegeId: user.collegeId ?? undefined,
      },
      newRefreshTokenId
    );

    // Store new refresh token
    await db.refreshToken.create({
      data: {
        id: newRefreshTokenId,
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: tokens.refreshTokenExpiresAt,
      },
    });

    log.info({ userId: user.id }, 'Token refreshed successfully');

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        collegeId: user.collegeId,
        rollNumber: user.rollNumber,
      },
      tokens,
    };
  } catch (error) {
    log.error({ error }, 'Token refresh failed');
    return { success: false, error: 'Token refresh failed' };
  }
}

/**
 * Logout user by revoking refresh token
 */
export async function logout(refreshToken: string): Promise<{ success: boolean; error?: string }> {
  const log = logger.child({ operation: 'logout' });

  try {
    const payload = await verifyRefreshToken(refreshToken);

    if (payload) {
      await db.refreshToken.updateMany({
        where: { id: payload.tokenId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
      log.info({ tokenId: payload.tokenId }, 'User logged out');
    }

    return { success: true };
  } catch (error) {
    log.error({ error }, 'Logout failed');
    return { success: false, error: 'Logout failed' };
  }
}

/**
 * Logout user from all devices by revoking all refresh tokens
 */
export async function logoutAll(userId: string): Promise<{ success: boolean; error?: string }> {
  const log = logger.child({ operation: 'logoutAll', userId });

  try {
    await db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    log.info('User logged out from all devices');
    return { success: true };
  } catch (error) {
    log.error({ error }, 'Logout all failed');
    return { success: false, error: 'Logout failed' };
  }
}

/**
 * Get user profile by ID
 */
export async function getProfile(userId: string): Promise<UserProfile | null> {
  const log = logger.child({ operation: 'getProfile', userId });

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { college: true },
    });

    if (!user) {
      log.warn('User not found');
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as Role,
      collegeId: user.collegeId,
      rollNumber: user.rollNumber,
      college: user.college
        ? {
            id: user.college.id,
            name: user.college.name,
            code: user.college.code,
          }
        : null,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  } catch (error) {
    log.error({ error }, 'Get profile failed');
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  userId: string,
  input: UpdateProfileInput
): Promise<{ success: boolean; error?: string; user?: UserProfile }> {
  const log = logger.child({ operation: 'updateProfile', userId });

  try {
    const user = await db.user.update({
      where: { id: userId },
      data: input,
      include: { college: true },
    });

    log.info('Profile updated successfully');

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        collegeId: user.collegeId,
        rollNumber: user.rollNumber,
        college: user.college
          ? {
              id: user.college.id,
              name: user.college.name,
              code: user.college.code,
            }
          : null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  } catch (error) {
    log.error({ error }, 'Profile update failed');
    return { success: false, error: 'Profile update failed' };
  }
}

/**
 * Change user password
 */
export async function changePassword(
  userId: string,
  input: ChangePasswordInput
): Promise<{ success: boolean; error?: string }> {
  const log = logger.child({ operation: 'changePassword', userId });

  try {
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      log.warn('User not found');
      return { success: false, error: 'User not found' };
    }

    // Verify current password
    const isValid = await verifyPassword(input.currentPassword, user.passwordHash);

    if (!isValid) {
      log.warn('Invalid current password');
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const passwordHash = await hashPassword(input.newPassword);

    // Update password
    await db.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke all refresh tokens (force re-login)
    await db.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    log.info('Password changed successfully');
    return { success: true };
  } catch (error) {
    log.error({ error }, 'Password change failed');
    return { success: false, error: 'Password change failed' };
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(
  email: string
): Promise<{ success: boolean; error?: string; resetToken?: string }> {
  const log = logger.child({ operation: 'requestPasswordReset', email });

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration
    if (!user) {
      log.warn('Password reset requested for non-existent email');
      return { success: true }; // Don't reveal if email exists
    }

    const resetToken = generateSecureToken();
    const resetTokenHash = await hashPassword(resetToken);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetExpires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
      },
    });

    log.info({ userId: user.id }, 'Password reset token generated');

    // In production, send email instead of returning token
    return { success: true, resetToken };
  } catch (error) {
    log.error({ error }, 'Password reset request failed');
    return { success: false, error: 'Password reset request failed' };
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const log = logger.child({ operation: 'resetPassword' });

  try {
    // Find users with non-expired reset tokens
    const users = await db.user.findMany({
      where: {
        passwordResetToken: { not: null },
        passwordResetExpires: { gt: new Date() },
      },
    });

    // Find the user whose token matches
    let matchedUser = null;
    for (const user of users) {
      if (user.passwordResetToken) {
        const isValid = await verifyPassword(token, user.passwordResetToken);
        if (isValid) {
          matchedUser = user;
          break;
        }
      }
    }

    if (!matchedUser) {
      log.warn('Invalid or expired reset token');
      return { success: false, error: 'Invalid or expired reset token' };
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword);

    // Update password and clear reset token
    await db.user.update({
      where: { id: matchedUser.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    // Revoke all refresh tokens
    await db.refreshToken.updateMany({
      where: { userId: matchedUser.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });

    log.info({ userId: matchedUser.id }, 'Password reset successfully');
    return { success: true };
  } catch (error) {
    log.error({ error }, 'Password reset failed');
    return { success: false, error: 'Password reset failed' };
  }
}
