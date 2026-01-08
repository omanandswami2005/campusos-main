import { getEventById } from '../state/db.js';
import type { ExtendedEventItem } from '../state/memory.js';

export const getEvent = async (id: string): Promise<ExtendedEventItem | null> => {
  return getEventById(id);
};
