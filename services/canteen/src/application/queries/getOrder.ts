import { getOrders } from '../state/db.js';
import type { Order } from '@campus-os/types';

export const getOrder = async (id: string): Promise<Order | null> => {
  // Using list orders to filter, since we don't have getById exposed yet in repo
  // This is a quick fix, repo handles logic
  const allOrders = await getOrders(); // Potentially inefficient but OK for MVP
  return allOrders.find((o) => o.id === id) || null;
};
