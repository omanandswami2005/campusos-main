import { memory } from '../state/memory';
import type { EventRegistration } from '../state/memory';

export const listRegistrations = async (
  userId?: string,
  eventId?: string
): Promise<EventRegistration[]> => {
  let registrations = Array.from(memory.registrations.values());

  if (userId) {
    registrations = registrations.filter((r) => r.userId === userId);
  }

  if (eventId) {
    registrations = registrations.filter((r) => r.eventId === eventId);
  }

  return registrations;
};
