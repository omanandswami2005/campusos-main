import { memory, Club } from '../state/memory';

export const getClub = (clubId: string): Club | null => {
  return memory.clubs.get(clubId) || null;
};
