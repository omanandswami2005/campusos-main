import { updateOrder as updateOrderRepo } from '../state/db.js';
import type { Order } from '@campus-os/types';

interface UpdateOrderStatusInput {
  orderId: string;
  status: Order['status'];
}

export const updateOrderStatus = async (input: UpdateOrderStatusInput): Promise<Order> => {
  const updated = await updateOrderRepo(input.orderId, { status: input.status });
  if (!updated) {
    throw new Error('Order not found');
  }
  return updated;
};
