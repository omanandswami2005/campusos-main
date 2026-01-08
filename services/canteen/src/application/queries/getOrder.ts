import type { Order, OrderItem } from '@campus-os/types';
import { prisma } from '../state/memory';

export const getOrder = async (id: string): Promise<Order | null> => {
  const dbOrder = await prisma.canteenOrder.findUnique({
    where: { id },
    include: { items: { include: { menuItem: true } } },
  });

  if (!dbOrder) return null;

  const items: OrderItem[] = dbOrder.items.map((item) => ({
    menuItemId: item.menuItemId,
    menuItemName: item.menuItem.name,
    quantity: item.quantity,
    priceCents: item.priceCents,
  }));

  return {
    id: dbOrder.id,
    userId: dbOrder.userId,
    collegeId: dbOrder.collegeId,
    items,
    deliveryLocation: dbOrder.deliveryLocation || '',
    paymentMethod: (dbOrder.paymentMethod?.toLowerCase() || 'online') as Order['paymentMethod'],
    paymentStatus: dbOrder.paymentStatus.toLowerCase() as Order['paymentStatus'],
    appliedOffer: dbOrder.appliedOfferId || undefined,
    subtotalCents: dbOrder.subtotalCents,
    discountCents: dbOrder.discountCents,
    totalCents: dbOrder.totalCents,
    status: dbOrder.status.toLowerCase() as Order['status'],
    createdAt: dbOrder.createdAt.toISOString(),
    updatedAt: dbOrder.updatedAt.toISOString(),
    otp: dbOrder.otp || undefined,
    otpExpiresAt: dbOrder.otpExpiresAt?.toISOString(),
  };
};
