import { getAllEvents } from '../state/db.js';
import type { ExtendedEventItem } from '../state/memory.js';

export interface ListEventsFilter {
  collegeId?: string;
  category?: string;
  status?: string;
  fromDate?: string;
  toDate?: string;
  search?: string;
}

export const listEvents = async (filter: ListEventsFilter = {}): Promise<ExtendedEventItem[]> => {
  return getAllEvents({
    collegeId: filter.collegeId,
    category: filter.category,
    status: filter.status, // Repository handles default
    fromDate: filter.fromDate,
    toDate: filter.toDate,
    search: filter.search,
  });
};
