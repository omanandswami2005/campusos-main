import { memory } from '../state/memory';
import type { ExtendedEventItem } from '../state/memory';

export interface UpdateEventInput {
  id: string;
  title?: string;
  description?: string;
  start?: string;
  end?: string;
  location?: string;
  tags?: string[];
  category?: string;
  capacity?: number;
  imageUrl?: string;
  venue?: string;
  isPublic?: boolean;
  registrationDeadline?: string;
  status?: 'draft' | 'published' | 'cancelled' | 'completed';
}

const nowIso = () => new Date().toISOString();

export const updateEvent = async (input: UpdateEventInput): Promise<ExtendedEventItem> => {
  const event = memory.events.get(input.id);
  if (!event) {
    throw new Error('Event not found');
  }

  // Cannot update cancelled or completed events
  if (event.status === 'cancelled' || event.status === 'completed') {
    throw new Error('Cannot update cancelled or completed events');
  }

  // Validate category if provided
  if (input.category && !memory.categories.has(input.category)) {
    throw new Error('Invalid category');
  }

  // Validate dates if provided
  const startDate = new Date(input.start || event.start);
  const endDate = new Date(input.end || event.end);

  if (input.start || input.end) {
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }
  }

  // Cannot reduce capacity below registered count
  if (input.capacity !== undefined && input.capacity < event.registeredCount) {
    throw new Error('Cannot reduce capacity below registered count');
  }

  const updatedEvent: ExtendedEventItem = {
    ...event,
    title: input.title ?? event.title,
    description: input.description ?? event.description,
    start: input.start ?? event.start,
    end: input.end ?? event.end,
    location: input.location ?? event.location,
    tags: input.tags ?? event.tags,
    category: input.category ?? event.category,
    capacity: input.capacity ?? event.capacity,
    imageUrl: input.imageUrl ?? event.imageUrl,
    venue: input.venue ?? event.venue,
    isPublic: input.isPublic ?? event.isPublic,
    registrationDeadline: input.registrationDeadline ?? event.registrationDeadline,
    status: input.status ?? event.status,
    updatedAt: nowIso(),
  };

  memory.events.set(input.id, updatedEvent);
  return updatedEvent;
};
