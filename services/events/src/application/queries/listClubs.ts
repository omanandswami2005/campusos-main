import { memory, Club } from '../state/memory';

interface ListClubsParams {
  collegeId?: string;
  category?: string;
  status?: Club['status'];
  search?: string;
}

export const listClubs = (params: ListClubsParams = {}): Club[] => {
  let clubs = Array.from(memory.clubs.values());

  if (params.collegeId) {
    clubs = clubs.filter((c) => c.collegeId === params.collegeId);
  }

  if (params.category) {
    clubs = clubs.filter((c) => c.category === params.category);
  }

  if (params.status) {
    clubs = clubs.filter((c) => c.status === params.status);
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
