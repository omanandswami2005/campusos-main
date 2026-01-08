import { getOffers } from '../state/db.js';
import type { PromotionalOffer } from '@campus-os/types';

export const listOffers = async (collegeId?: string): Promise<PromotionalOffer[]> => {
  return getOffers(collegeId);
};
