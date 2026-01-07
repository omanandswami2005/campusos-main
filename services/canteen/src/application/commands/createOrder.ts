import { randomUUID } from 'node:crypto';
import type { Order, OrderItem } from '@campus-os/types';
import { memory } from '../state/memory';

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
  const menuItems = new Map(memory.menu.map((m) => [m.id, m] as const));
  if (!input.items.length) throw new Error('No items');

  const orderItems: OrderItem[] = input.items.map(({ menuItemId, quantity }) => {
    const item = menuItems.get(menuItemId);
    if (!item || !item.available) throw new Error('Item not available');
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
  if (input.appliedOffer) {
    const offer = memory.offers.find((o) => o.code === input.appliedOffer && o.active);
    if (!offer) throw new Error('Invalid offer');
    const now = Date.now();
    if (now < Date.parse(offer.startDate) || now > Date.parse(offer.endDate)) {
      throw new Error('Offer not active');
    }
    if (offer.collegeId !== input.collegeId) throw new Error('Offer not valid for college');
    if (offer.minOrderValue && subtotalCents < offer.minOrderValue)
      throw new Error('Order below minimum');
    if (offer.usageLimit && offer.usedCount >= offer.usageLimit)
      throw new Error('Offer usage exceeded');
    discountCents =
      offer.discountType === 'percentage'
        ? Math.floor((subtotalCents * offer.discountValue) / 100)
        : offer.discountValue;
    offer.usedCount += 1;
  }

  const totalCents = Math.max(0, subtotalCents - discountCents);
  const id = randomUUID();
  const order: Order = {
    id,
    userId: input.userId,
    collegeId: input.collegeId,
    items: orderItems,
    deliveryLocation: input.deliveryLocation,
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentMethod === 'cash' ? 'pending' : 'completed',
    appliedOffer: input.appliedOffer,
    subtotalCents,
    discountCents,
    totalCents,
    status: 'pending',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  memory.orders.set(id, order);
  return order;
};
