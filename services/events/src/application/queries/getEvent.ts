import { memory } from '../state/memory';
import type { ExtendedEventItem } from '../state/memory';

export const getEvent = async (id: string): Promise<ExtendedEventItem | null> => {
  return memory.events.get(id) || null;
};
