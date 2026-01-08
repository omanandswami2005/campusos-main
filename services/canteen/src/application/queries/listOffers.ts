import { prisma } from '../state/memory';
import type { PromotionalOffer } from '@campus-os/types';

export const listOffers = async (collegeId?: string): Promise<PromotionalOffer[]> => {
  const now = new Date();

  const offers = await prisma.promotionalOffer.findMany({
    where: {
      isActive: true,
      validFrom: { lte: now },
      validUntil: { gte: now },
    },
  });

  return offers.map((o) => ({
    id: o.id,
    code: o.code,
    description: o.description || '',
    discountType: o.discountType as 'percentage' | 'flat',
    discountValue: o.value,
    minOrderValue: o.minOrderCents || 0,
    startDate: o.validFrom.toISOString(),
    endDate: o.validUntil.toISOString(),
    usageLimit: o.maxUses || 0,
    usedCount: o.usedCount,
    active: o.isActive,
    collegeId: collegeId || 'default', // Offers are global in this schema
  }));
};
