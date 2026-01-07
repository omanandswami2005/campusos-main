import { memory } from '../state/memory';
import type { ExtendedEventItem } from '../state/memory';

export const getUpcomingEvents = async (
  collegeId?: string,
  limit: number = 5
): Promise<ExtendedEventItem[]> => {
  const now = new Date();
  let events = Array.from(memory.events.values())
    .filter((e) => e.status === 'published')
    .filter((e) => new Date(e.start) > now);

  if (collegeId) {
    events = events.filter((e) => e.collegeId === collegeId);
  }

  // Sort by start date and take limit
  events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return events.slice(0, limit);
};
