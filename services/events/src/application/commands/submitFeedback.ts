import { memory, Feedback } from '../state/memory';
import { hasUserSubmittedFeedback } from '../queries/listFeedback';

interface SubmitFeedbackInput {
  eventId: string;
  userId: string;
  rating: number;
  comment?: string;
  categories: {
    organization: number;
    content: number;
    venue: number;
    overall: number;
  };
  isAnonymous?: boolean;
}

export const submitFeedback = (input: SubmitFeedbackInput): Feedback | null => {
  const event = memory.events.get(input.eventId);
  if (!event) return null;

  // Event must be completed to submit feedback
  if (event.status !== 'completed') return null;

  // Check if user already submitted feedback
  if (hasUserSubmittedFeedback(input.eventId, input.userId)) return null;

  // Verify user attended the event
  const attendance = Array.from(memory.attendance.values()).find(
    (a) => a.eventId === input.eventId && a.userId === input.userId && a.status !== 'absent'
  );

  const registration = Array.from(memory.registrations.values()).find(
    (r) => r.eventId === input.eventId && r.userId === input.userId
  );

  // User must have attended or registered
  if (!attendance && !registration) return null;

  // Validate ratings (1-5)
  const validateRating = (r: number) => r >= 1 && r <= 5;
  if (
    !validateRating(input.rating) ||
    !validateRating(input.categories.organization) ||
    !validateRating(input.categories.content) ||
    !validateRating(input.categories.venue) ||
    !validateRating(input.categories.overall)
  ) {
    return null;
  }

  const id = `feedback-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const feedback: Feedback = {
    id,
    eventId: input.eventId,
    userId: input.userId,
    rating: input.rating,
    comment: input.comment,
    categories: input.categories,
    isAnonymous: input.isAnonymous ?? false,
    submittedAt: new Date().toISOString(),
  };

  memory.feedback.set(id, feedback);
  return feedback;
};
