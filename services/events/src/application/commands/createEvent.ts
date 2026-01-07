import { randomUUID } from 'node:crypto';
import { memory } from '../state/memory';
import type { ExtendedEventItem } from '../state/memory';

export interface CreateEventInput {
  title: string;
  description?: string;
  start: string;
  end: string;
  location?: string;
  tags?: string[];
  collegeId: string;
  organizerId: string;
  clubId?: string;
  category: string;
  capacity: number;
  imageUrl?: string;
  venue: string;
  isPublic?: boolean;
  registrationDeadline: string;
  rules?: string[];
}

const nowIso = () => new Date().toISOString();

export const createEvent = async (input: CreateEventInput): Promise<ExtendedEventItem> => {
  // Validate category exists
  if (!memory.categories.has(input.category)) {
    throw new Error('Invalid category');
  }

  // Validate dates
  const startDate = new Date(input.start);
  const endDate = new Date(input.end);
  const deadlineDate = new Date(input.registrationDeadline);

  if (startDate >= endDate) {
    throw new Error('End date must be after start date');
  }

  if (deadlineDate >= startDate) {
    throw new Error('Registration deadline must be before event start');
  }

  if (input.capacity <= 0) {
    throw new Error('Capacity must be positive');
  }

  const event: ExtendedEventItem = {
    id: `event-${randomUUID()}`,
    title: input.title,
    description: input.description,
    start: input.start,
    end: input.end,
    location: input.location,
    tags: input.tags || [],
    collegeId: input.collegeId,
    organizerId: input.organizerId,
    clubId: input.clubId,
    category: input.category,
    capacity: input.capacity,
    registeredCount: 0,
    imageUrl: input.imageUrl,
    venue: input.venue,
    isPublic: input.isPublic ?? true,
    registrationDeadline: input.registrationDeadline,
    status: 'draft',
    approvalStatus: 'pending',
    rules: input.rules || [],
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  memory.events.set(event.id, event);
  return event;
};
