// Database repository for events service
// Provides data access with Prisma when enabled, falls back to in-memory for demo

import {
  memory,
  type ExtendedEventItem,
  type Club,
  type EventRegistration,
  type Certificate,
} from './memory.js';

// Environment check for database mode
const USE_DATABASE = process.env.USE_DATABASE === 'true';

// Dynamic import for Prisma to avoid dependency issues when not using DB
let prisma: any = null;
if (USE_DATABASE) {
  import('@campus-os/database')
    .then((mod) => {
      prisma = mod.prisma;
      console.log('✅ Events service connected to database');
    })
    .catch((err) => {
      console.warn('⚠️ Database not available, using in-memory store');
    });
}

// ============================================================================
// EVENTS REPOSITORY
// ============================================================================

export async function getAllEvents(filters?: {
  collegeId?: string;
  category?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}): Promise<ExtendedEventItem[]> {
  if (!USE_DATABASE || !prisma) {
    // Fallback to in-memory
    let events = Array.from(memory.events.values());

    if (filters?.collegeId) {
      events = events.filter((e) => e.collegeId === filters.collegeId);
    }
    if (filters?.category) {
      events = events.filter((e) => e.category === filters.category);
    }
    if (filters?.status) {
      events = events.filter((e) => e.status === filters.status);
    } else {
      events = events.filter((e) => e.status === 'published');
    }
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(searchLower) ||
          e.description?.toLowerCase().includes(searchLower) ||
          e.tags?.some((t) => t.toLowerCase().includes(searchLower))
      );
    }

    return events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
  }

  // Real database query
  const dbEvents = await prisma.event.findMany({
    where: {
      ...(filters?.collegeId && { collegeId: filters.collegeId }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.status && { status: filters.status.toUpperCase() }),
      ...(filters?.fromDate && { startDate: { gte: new Date(filters.fromDate) } }),
      ...(filters?.toDate && { endDate: { lte: new Date(filters.toDate) } }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
    },
    orderBy: { startDate: 'asc' },
  });

  // Map DB events to ExtendedEventItem format
  return dbEvents.map((e: any) => ({
    id: e.id,
    title: e.title,
    description: e.description,
    start: e.startDate.toISOString(),
    end: e.endDate.toISOString(),
    location: e.location,
    tags: e.tags || [],
    collegeId: e.collegeId,
    organizerId: e.organizerId,
    clubId: e.clubId,
    category: e.category,
    capacity: e.capacity,
    registeredCount: e.registeredCount,
    imageUrl: e.imageUrl,
    venue: e.venue,
    isPublic: e.isPublic,
    registrationDeadline: e.registrationDeadline.toISOString(),
    status: e.status.toLowerCase(),
    approvalStatus: e.approvalStatus.toLowerCase(),
    approvedBy: e.approvedById,
    approvedAt: e.approvedAt?.toISOString(),
    rejectionReason: e.rejectionReason,
    rules: e.rules || [],
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  }));
}

export async function getEventById(id: string): Promise<ExtendedEventItem | null> {
  if (!USE_DATABASE || !prisma) {
    return memory.events.get(id) || null;
  }

  const e = await prisma.event.findUnique({
    where: { id },
    include: { club: true },
  });

  if (!e) return null;

  return {
    id: e.id,
    title: e.title,
    description: e.description,
    start: e.startDate.toISOString(),
    end: e.endDate.toISOString(),
    location: e.location,
    tags: e.tags || [],
    collegeId: e.collegeId,
    organizerId: e.organizerId,
    clubId: e.clubId,
    category: e.category,
    capacity: e.capacity,
    registeredCount: e.registeredCount,
    imageUrl: e.imageUrl,
    venue: e.venue,
    isPublic: e.isPublic,
    registrationDeadline: e.registrationDeadline.toISOString(),
    status: e.status.toLowerCase(),
    approvalStatus: e.approvalStatus.toLowerCase(),
    approvedBy: e.approvedById,
    approvedAt: e.approvedAt?.toISOString(),
    rejectionReason: e.rejectionReason,
    rules: e.rules || [],
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  } as ExtendedEventItem;
}

// ============================================================================
// REGISTRATIONS REPOSITORY
// ============================================================================

export async function getRegistrationsByUser(userId: string): Promise<EventRegistration[]> {
  if (!USE_DATABASE || !prisma) {
    return Array.from(memory.registrations.values()).filter((r) => r.userId === userId);
  }

  const regs = await prisma.eventRegistration.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { registeredAt: 'desc' },
  });

  return regs.map((r: any) => ({
    id: r.id,
    eventId: r.eventId,
    userId: r.userId,
    registeredAt: r.registeredAt.toISOString(),
    status: r.status.toLowerCase(),
    ticketNumber: r.ticketNumber,
  }));
}

export async function getRegistrationsByEvent(eventId: string): Promise<EventRegistration[]> {
  if (!USE_DATABASE || !prisma) {
    return Array.from(memory.registrations.values()).filter((r) => r.eventId === eventId);
  }

  const regs = await prisma.eventRegistration.findMany({
    where: { eventId },
    include: { user: true },
  });

  return regs.map((r: any) => ({
    id: r.id,
    eventId: r.eventId,
    userId: r.userId,
    registeredAt: r.registeredAt.toISOString(),
    status: r.status.toLowerCase(),
    ticketNumber: r.ticketNumber,
  }));
}

// ============================================================================
// CLUBS REPOSITORY
// ============================================================================

export async function getAllClubs(filters?: { status?: string }): Promise<Club[]> {
  if (!USE_DATABASE || !prisma) {
    let clubs = Array.from(memory.clubs.values());
    if (filters?.status) {
      clubs = clubs.filter((c) => c.status === filters.status);
    }
    return clubs;
  }

  const dbClubs = await prisma.club.findMany({
    where: filters?.status ? { status: filters.status.toUpperCase() } : {},
    orderBy: { name: 'asc' },
  });

  return dbClubs.map((c: any) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    logoUrl: c.logoUrl,
    coverImageUrl: c.coverImageUrl,
    collegeId: c.collegeId,
    coordinatorId: c.coordinatorId,
    category: c.category,
    status: c.status.toLowerCase(),
    memberCount: c.memberCount || 0,
    foundedDate: c.foundedDate?.toISOString?.() || c.foundedDate,
    email: c.email,
    createdAt: c.createdAt?.toISOString?.() || '',
    updatedAt: c.updatedAt?.toISOString?.() || '',
  }));
}

export async function getClubById(id: string): Promise<Club | null> {
  if (!USE_DATABASE || !prisma) {
    return memory.clubs.get(id) || null;
  }

  const c = await prisma.club.findUnique({ where: { id } });
  if (!c) return null;

  return {
    id: c.id,
    name: c.name,
    description: c.description,
    logoUrl: c.logoUrl,
    coverImageUrl: c.coverImageUrl,
    collegeId: c.collegeId,
    coordinatorId: c.coordinatorId,
    category: c.category,
    status: c.status.toLowerCase(),
    memberCount: c.memberCount || 0,
    foundedDate: c.foundedDate?.toISOString?.() || c.foundedDate,
    email: c.email,
    createdAt: c.createdAt?.toISOString?.() || '',
    updatedAt: c.updatedAt?.toISOString?.() || '',
  } as Club;
}

// ============================================================================
// CERTIFICATES REPOSITORY
// ============================================================================

export async function getCertificatesByUser(userId: string): Promise<Certificate[]> {
  if (!USE_DATABASE || !prisma) {
    return Array.from(memory.certificates.values()).filter((c) => c.userId === userId);
  }

  const certs = await prisma.certificate.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { issuedAt: 'desc' },
  });

  return certs.map((c: any) => ({
    id: c.id,
    eventId: c.eventId,
    userId: c.userId,
    type: c.type.toLowerCase(),
    certificateNumber: c.certificateNumber,
    issuedAt: c.issuedAt.toISOString(),
    downloadUrl: c.downloadUrl || '',
    studentName: c.user?.name || '',
    eventName: c.event?.title || '',
    eventDate: c.event?.startDate?.toISOString() || '',
  }));
}

// ============================================================================
// AUTH HELPERS (keep using memory for demo)
// ============================================================================

export { memory };
export { findUserByEmail, createNotification } from './memory.js';
