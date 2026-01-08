import type { Order, OrderItem } from '@campus-os/types';
import { prisma } from '../state/memory';

export const listOrders = async (collegeId: string): Promise<Order[]> => {
  const dbOrders = await prisma.canteenOrder.findMany({
    where: { collegeId },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return dbOrders.map((dbOrder) => {
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
    };
  });
};
