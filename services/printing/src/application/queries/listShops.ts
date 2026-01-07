import { memory } from '../state/memory';
import type { PrintShop } from '@campus-os/types';

export const listShops = async (collegeId?: string): Promise<PrintShop[]> => {
  const shops = Array.from(memory.shops.values());
  return collegeId ? shops.filter((s) => s.collegeId === collegeId) : shops;
};
