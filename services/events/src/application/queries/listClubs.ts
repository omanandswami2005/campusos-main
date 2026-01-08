import { getAllClubs } from '../state/db.js';
import type { Club } from '../state/memory.js';

interface ListClubsParams {
  collegeId?: string;
  category?: string;
  status?: Club['status'];
  search?: string;
}

export const listClubs = async (params: ListClubsParams = {}): Promise<Club[]> => {
  let clubs = await getAllClubs({
    status: params.status,
  });

  // Apply additional filters
  if (params.collegeId) {
    clubs = clubs.filter((c) => c.collegeId === params.collegeId);
  }

  if (params.category) {
    clubs = clubs.filter((c) => c.category === params.category);
  }

  if (params.search) {
    const searchLower = params.search.toLowerCase();
    clubs = clubs.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.description.toLowerCase().includes(searchLower)
    );
  }

  return clubs.sort((a, b) => a.name.localeCompare(b.name));
};
