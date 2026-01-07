import { memory } from '../state/memory';
import type { PromotionalOffer } from '@campus-os/types';

export const listOffers = async (collegeId?: string): Promise<PromotionalOffer[]> => {
  return memory.offers.filter((o) => o.active).filter((o) => (collegeId ? o.collegeId === collegeId : true));
};
