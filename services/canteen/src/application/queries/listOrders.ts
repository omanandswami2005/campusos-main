import { getOrders } from '../state/db.js';
import type { Order } from '@campus-os/types';

export const listOrders = async (collegeId?: string, userId?: string): Promise<Order[]> => {
  return getOrders(collegeId, userId);
};
