import { memory, Feedback } from '../state/memory';

interface FeedbackSummary {
  totalResponses: number;
  averageRating: number;
  categoryAverages: {
    organization: number;
    content: number;
    venue: number;
    overall: number;
  };
  ratingDistribution: { [key: number]: number };
  recentComments: string[];
}

export const listEventFeedback = (eventId: string): Feedback[] => {
  return Array.from(memory.feedback.values())
    .filter((f) => f.eventId === eventId)
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
};

export const getFeedbackSummary = (eventId: string): FeedbackSummary => {
  const feedbacks = listEventFeedback(eventId);
  const totalResponses = feedbacks.length;

  if (totalResponses === 0) {
    return {
      totalResponses: 0,
      averageRating: 0,
      categoryAverages: { organization: 0, content: 0, venue: 0, overall: 0 },
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentComments: [],
    };
  }

  const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / totalResponses;

  const categoryAverages = {
    organization: feedbacks.reduce((sum, f) => sum + f.categories.organization, 0) / totalResponses,
    content: feedbacks.reduce((sum, f) => sum + f.categories.content, 0) / totalResponses,
    venue: feedbacks.reduce((sum, f) => sum + f.categories.venue, 0) / totalResponses,
    overall: feedbacks.reduce((sum, f) => sum + f.categories.overall, 0) / totalResponses,
  };

  const ratingDistribution: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  feedbacks.forEach((f) => {
    ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
  });

  const recentComments = feedbacks
    .filter((f) => f.comment && !f.isAnonymous)
    .slice(0, 5)
    .map((f) => f.comment as string);

  return {
    totalResponses,
    averageRating: Math.round(averageRating * 10) / 10,
    categoryAverages: {
      organization: Math.round(categoryAverages.organization * 10) / 10,
      content: Math.round(categoryAverages.content * 10) / 10,
      venue: Math.round(categoryAverages.venue * 10) / 10,
      overall: Math.round(categoryAverages.overall * 10) / 10,
    },
    ratingDistribution,
    recentComments,
  };
};

export const hasUserSubmittedFeedback = (eventId: string, userId: string): boolean => {
  return Array.from(memory.feedback.values()).some(
    (f) => f.eventId === eventId && f.userId === userId
  );
};
