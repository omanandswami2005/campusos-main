// Re-export Prisma Client and types
export { prisma, default as db } from './client';
export * from '@prisma/client';

// Re-export generated types for convenience
export type {
  User,
  College,
  Club,
  ClubMember,
  Event,
  EventRegistration,
  EventAttendance,
  EventFeedback,
  Certificate,
  Notification,
  MenuItem,
  PromotionalOffer,
  CanteenOrder,
  OrderItem,
  MessVotingPoll,
  MessVote,
  PrintShop,
  PrintJob,
  RefreshToken,
  AuditLog,
} from '@prisma/client';
