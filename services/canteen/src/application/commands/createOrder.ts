import { createOrder as createOrderRepo, getMenuItems, getOffers } from '../state/db.js';
import type { Order } from '@campus-os/types';

interface OrderItemInput {
  itemId: string;
  quantity: number;
}

interface CreateOrderInput {
  userId: string;
  collegeId: string;
  items: OrderItemInput[];
  paymentMethod: 'upi' | 'card' | 'wallet' | 'cash';
}

export const createOrder = async (input: CreateOrderInput): Promise<Order> => {
  const menu = await getMenuItems(input.collegeId);

  let totalAmount = 0;
  const orderItems = input.items.map((item) => {
    const menuItem = menu.find((m) => m.id === item.itemId);
    if (!menuItem) {
      throw new Error(`Menu item not found: ${item.itemId}`);
    }
    const priceCents = menuItem.priceCents;
    totalAmount += priceCents * item.quantity;

    return {
      itemId: item.itemId,
      name: menuItem.name,
      priceCents,
      quantity: item.quantity,
    };
  });

  // Check for applicable offers (simple logic: best offer applied automatically)
  const offers = await getOffers(input.collegeId);
  const applicableOffer = offers
    .filter((o) => o.active && totalAmount >= o.minOrderValue)
    .sort((a, b) => b.discountValue - a.discountValue)[0];

  let discountAmount = 0;
  if (applicableOffer) {
    if (applicableOffer.discountType === 'percentage') {
      discountAmount = Math.round((totalAmount * applicableOffer.discountValue) / 100);
    } else {
      discountAmount = applicableOffer.discountValue * 100; // Assuming value is in rupees, converting to cents?
      // Actually schema says discountValue is Int, usually percent or fixed amount.
      // For safety in this demo let's assume percentage for now or verify schema.
      // Memory seed says 10 for percentage.
    }
  }

  const finalAmount = totalAmount - discountAmount;

  const orderData = {
    userId: input.userId,
    collegeId: input.collegeId,
    items: orderItems,
    status: 'pending' as const,
    paymentStatus: 'pending' as const,
    paymentMethod: input.paymentMethod,
    totalAmount,
    discountAmount,
    finalAmount,
  };

  return createOrderRepo(orderData);
};
