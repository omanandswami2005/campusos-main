import { HttpClient, HttpOptions } from './http';
import type { Role } from '@campus-os/types';

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  collegeId?: string | null;
  rollNumber?: string | null;
}

export interface UserProfile extends User {
  college?: {
    id: string;
    name: string;
    code: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresAt: string;
  refreshTokenExpiresAt: string;
}

export interface AuthResponse {
  user: User;
  tokens: TokenPair;
}

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
  rollNumber?: string;
  collegeId?: string;
  role?: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  name?: string;
  rollNumber?: string;
}

export interface VerifyResponse {
  valid: boolean;
  user: {
    id: string;
    email: string;
    name: string;
    role: Role;
    collegeId?: string;
  };
}

// ============================================================================
// Auth API Client
// ============================================================================

export function createAuthApi(options: HttpOptions) {
  const http = new HttpClient(options);

  return {
    /**
     * Register a new user
     */
    register: (input: RegisterInput): Promise<AuthResponse> => http.post('/auth/register', input),

    /**
     * Login with email and password
     */
    login: (input: LoginInput): Promise<AuthResponse> => http.post('/auth/login', input),

    /**
     * Refresh access token using refresh token
     */
    refresh: (refreshToken: string): Promise<AuthResponse> =>
      http.post('/auth/refresh', { refreshToken }),

    /**
     * Logout (revoke refresh token)
     */
    logout: (refreshToken: string): Promise<{ message: string }> =>
      http.post('/auth/logout', { refreshToken }),

    /**
     * Logout from all devices
     */
    logoutAll: (): Promise<{ message: string }> => http.post('/auth/logout-all'),

    /**
     * Get current user profile
     */
    getProfile: (): Promise<UserProfile> => http.get('/auth/me'),

    /**
     * Update current user profile
     */
    updateProfile: (input: UpdateProfileInput): Promise<UserProfile> => http.put('/auth/me', input),

    /**
     * Change password
     */
    changePassword: (input: ChangePasswordInput): Promise<{ message: string }> =>
      http.post('/auth/change-password', input),

    /**
     * Request password reset
     */
    forgotPassword: (email: string): Promise<{ message: string; resetToken?: string }> =>
      http.post('/auth/forgot-password', { email }),

    /**
     * Reset password with token
     */
    resetPassword: (token: string, newPassword: string): Promise<{ message: string }> =>
      http.post('/auth/reset-password', { token, newPassword }),

    /**
     * Verify access token
     */
    verify: (): Promise<VerifyResponse> => http.get('/auth/verify'),

    /**
     * Health check
     */
    health: (): Promise<{ status: string; service: string; timestamp: string }> =>
      http.get('/health'),
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
