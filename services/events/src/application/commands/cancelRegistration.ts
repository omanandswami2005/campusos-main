import { memory } from '../state/memory';
import type { EventRegistration } from '../state/memory';

export interface CancelRegistrationInput {
  registrationId: string;
  userId: string;
}

const nowIso = () => new Date().toISOString();

export const cancelRegistration = async (
  input: CancelRegistrationInput
): Promise<EventRegistration> => {
  const registration = memory.registrations.get(input.registrationId);
  if (!registration) {
    throw new Error('Registration not found');
  }

  // Check ownership
  if (registration.userId !== input.userId) {
    throw new Error('Not authorized to cancel this registration');
  }

  // Check if already cancelled
  if (registration.status === 'cancelled') {
    throw new Error('Registration already cancelled');
  }

  // Update registration status
  const updatedRegistration: EventRegistration = {
    ...registration,
    status: 'cancelled',
  };

  memory.registrations.set(input.registrationId, updatedRegistration);

  // Update event registered count
  const event = memory.events.get(registration.eventId);
  if (event) {
    event.registeredCount = Math.max(0, event.registeredCount - 1);
    memory.events.set(event.id, event);
  }

  return updatedRegistration;
};
