import { memory } from '../state/memory';
import type { ExtendedEventItem } from '../state/memory';

export interface ListEventsFilter {
  collegeId?: string;
  category?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export const listEvents = async (filter: ListEventsFilter = {}): Promise<ExtendedEventItem[]> => {
  let events = Array.from(memory.events.values());

  // Filter by college
  if (filter.collegeId) {
    events = events.filter((e) => e.collegeId === filter.collegeId);
  }

  // Filter by category
  if (filter.category) {
    events = events.filter((e) => e.category === filter.category);
  }

  // Filter by status
  if (filter.status) {
    events = events.filter((e) => e.status === filter.status);
  } else {
    // Default to showing only published events
    events = events.filter((e) => e.status === 'published');
  }

  // Filter by date range
  if (filter.fromDate) {
    events = events.filter((e) => new Date(e.start) >= new Date(filter.fromDate!));
  }

  if (filter.toDate) {
    events = events.filter((e) => new Date(e.end) <= new Date(filter.toDate!));
  }

  // Search in title, description, tags
  if (filter.search) {
    const searchLower = filter.search.toLowerCase();
    events = events.filter(
      (e) =>
        e.title.toLowerCase().includes(searchLower) ||
        e.description?.toLowerCase().includes(searchLower) ||
        e.tags?.some((t) => t.toLowerCase().includes(searchLower))
    );
  }

  // Sort by start date
  events.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  return events;
};
