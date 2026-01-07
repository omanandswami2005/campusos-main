import type { Role } from './auth';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  collegeId: string;
  role: Role; // Primary role (unified across all services)
  clubIds?: string[]; // For coordinators - clubs they manage
}
