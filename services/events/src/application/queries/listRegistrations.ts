import { getRegistrationsByUser, getRegistrationsByEvent } from '../state/db.js';
import type { EventRegistration } from '../state/memory.js';

export const listRegistrations = async (
  userId?: string,
  eventId?: string
): Promise<EventRegistration[]> => {
  if (userId) {
    return getRegistrationsByUser(userId);
  }

  if (eventId) {
    return getRegistrationsByEvent(eventId);
  }

  return [];
};
