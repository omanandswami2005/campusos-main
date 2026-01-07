import * as jose from 'jose';
import type { Role } from '@campus-os/types';

// ============================================================================
// Configuration
// ============================================================================

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'campus-os-dev-secret-change-in-production'
);

const JWT_ISSUER = process.env.JWT_ISSUER || 'campus-os-auth';
const JWT_AUDIENCE = process.env.JWT_AUDIENCE || 'campus-os-services';

// Token expiration times
const ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
const REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

// ============================================================================
// Token Payload Types
// ============================================================================

export interface AccessTokenPayload {
  sub: string; // User ID
  email: string;
  name: string;
  role: Role;
  collegeId?: string;
  type: 'access';
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  tokenId: string; // Unique ID for this refresh token (for revocation)
  type: 'refresh';
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: Date;
  refreshTokenExpiresAt: Date;
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Generate an access token for a user
 */
export async function generateAccessToken(
  payload: Omit<AccessTokenPayload, 'type'>
): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const token = await new jose.SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return { token, expiresAt };
}

/**
 * Generate a refresh token for a user
 */
export async function generateRefreshToken(
  userId: string,
  tokenId: string
): Promise<{ token: string; expiresAt: Date }> {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const token = await new jose.SignJWT({
    sub: userId,
    tokenId,
    type: 'refresh',
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(JWT_SECRET);

  return { token, expiresAt };
}

/**
 * Generate both access and refresh tokens
 */
export async function generateTokenPair(
  user: Omit<AccessTokenPayload, 'type'>,
  refreshTokenId: string
): Promise<TokenPair> {
  const [access, refresh] = await Promise.all([
    generateAccessToken(user),
    generateRefreshToken(user.sub, refreshTokenId),
  ]);

  return {
    accessToken: access.token,
    refreshToken: refresh.token,
    accessTokenExpiresAt: access.expiresAt,
    refreshTokenExpiresAt: refresh.expiresAt,
  };
}

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify and decode an access token
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (payload.type !== 'access') {
      return null;
    }

    return payload as unknown as AccessTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Verify and decode a refresh token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });

    if (payload.type !== 'refresh') {
      return null;
    }

    return payload as unknown as RefreshTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Extract token from Authorization header
 */
export function extractBearerToken(authHeader: string | null | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.slice(7);
}
