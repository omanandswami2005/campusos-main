import { memory } from '../state/memory';
import type { EventCategory } from '../state/memory';

export const listCategories = async (): Promise<EventCategory[]> => {
  return Array.from(memory.categories.values());
};
