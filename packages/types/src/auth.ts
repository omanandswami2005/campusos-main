export type Role = 'student' | 'staff' | 'admin';

export interface Session {
  userId: string;
  roles: Role[];
  issuedAt: string; // ISO
  expiresAt: string; // ISO
  token: string;
}
