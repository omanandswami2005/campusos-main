import { randomUUID } from 'node:crypto';
import { memory } from '../state/memory';
import type { EventRegistration } from '../state/memory';

export interface RegisterForEventInput {
  eventId: string;
  userId: string;
}

const nowIso = () => new Date().toISOString();

const generateTicketNumber = (eventId: string): string => {
  const prefix = eventId.replace('event-', '').substring(0, 4).toUpperCase();
  const num = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
  return `${prefix}-${num}`;
};

export const registerForEvent = async (
  input: RegisterForEventInput
): Promise<EventRegistration> => {
  const event = memory.events.get(input.eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  // Check if event is published
  if (event.status !== 'published') {
    throw new Error('Event is not open for registration');
  }

  // Check registration deadline
  if (new Date() > new Date(event.registrationDeadline)) {
    throw new Error('Registration deadline has passed');
  }

  // Check capacity
  if (event.registeredCount >= event.capacity) {
    throw new Error('Event is at full capacity');
  }

  // Check if user already registered
  const existingRegistration = Array.from(memory.registrations.values()).find(
    (r) => r.eventId === input.eventId && r.userId === input.userId && r.status === 'registered'
  );

  if (existingRegistration) {
    throw new Error('Already registered for this event');
  }

  const registration: EventRegistration = {
    id: `reg-${randomUUID()}`,
    eventId: input.eventId,
    userId: input.userId,
    registeredAt: nowIso(),
    status: 'registered',
    ticketNumber: generateTicketNumber(input.eventId),
  };

  memory.registrations.set(registration.id, registration);

  // Update registered count
  event.registeredCount += 1;
  memory.events.set(event.id, event);

  return registration;
};
