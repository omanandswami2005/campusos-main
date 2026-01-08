import { randomUUID } from 'node:crypto';
import type { Order, OrderItem } from '@campus-os/types';
import { prisma } from '../state/memory';

export interface CreateOrderInput {
  userId: string;
  collegeId: string;
  deliveryLocation: string;
  paymentMethod: Order['paymentMethod'];
  appliedOffer?: string;
  items: { menuItemId: string; quantity: number }[];
}

const nowIso = () => new Date().toISOString();

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  if (!input.items.length) throw new Error('No items');

  // Fetch menu items from database
  const menuItemIds = input.items.map((i) => i.menuItemId);
  const dbMenuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  const menuItemsMap = new Map(dbMenuItems.map((m) => [m.id, m] as const));

  const orderItems: OrderItem[] = input.items.map(({ menuItemId, quantity }) => {
    const item = menuItemsMap.get(menuItemId);
    if (!item || !item.available) throw new Error(`Item ${menuItemId} not available`);
    if (item.collegeId !== input.collegeId) throw new Error('College mismatch');
    return {
      menuItemId,
      menuItemName: item.name,
      quantity,
      priceCents: item.priceCents,
    };
  });

  const subtotalCents = orderItems.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);

  let discountCents = 0;
  let appliedOfferId: string | undefined;

  if (input.appliedOffer) {
    const now = new Date();
    const offer = await prisma.promotionalOffer.findFirst({
      where: {
        code: input.appliedOffer,
        isActive: true,
        validFrom: { lte: now },
        validUntil: { gte: now },
      },
    });

    if (!offer) throw new Error('Invalid offer');
    if (offer.minOrderCents && subtotalCents < offer.minOrderCents) {
      throw new Error('Order below minimum');
    }
    if (offer.maxUses && offer.usedCount >= offer.maxUses) {
      throw new Error('Offer usage exceeded');
    }

    discountCents =
      offer.discountType === 'percentage'
        ? Math.floor((subtotalCents * offer.value) / 100)
        : offer.value;

    appliedOfferId = offer.id;

    // Increment usage count
    await prisma.promotionalOffer.update({
      where: { id: offer.id },
      data: { usedCount: { increment: 1 } },
    });
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);
  const orderId = randomUUID();

  // Create order in database
  const dbOrder = await prisma.canteenOrder.create({
    data: {
      id: orderId,
      userId: input.userId,
      collegeId: input.collegeId,
      status: 'PENDING',
      paymentStatus: input.paymentMethod === 'cash' ? 'PENDING' : 'COMPLETED',
      paymentMethod: input.paymentMethod.toUpperCase() as any,
      deliveryLocation: input.deliveryLocation,
      subtotalCents,
      discountCents,
      totalCents,
      appliedOfferId,
      items: {
        create: orderItems.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          priceCents: item.priceCents,
        })),
      },
    },
    include: { items: true },
  });

  // Return in the expected format
  const order: Order = {
    id: dbOrder.id,
    userId: dbOrder.userId,
    collegeId: dbOrder.collegeId,
    items: orderItems,
    deliveryLocation: dbOrder.deliveryLocation || '',
    paymentMethod: input.paymentMethod,
    paymentStatus: dbOrder.paymentStatus.toLowerCase() as Order['paymentStatus'],
    appliedOffer: input.appliedOffer,
    subtotalCents: dbOrder.subtotalCents,
    discountCents: dbOrder.discountCents,
    totalCents: dbOrder.totalCents,
    status: dbOrder.status.toLowerCase() as Order['status'],
    createdAt: dbOrder.createdAt.toISOString(),
    updatedAt: dbOrder.updatedAt.toISOString(),
    otp: dbOrder.otp || undefined,
  };

  return order;
};
