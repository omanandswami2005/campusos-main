import type { Order } from '@campus-os/types';
import { memory } from '../state/memory';

export const getOrder = async (id: string): Promise<Order | null> => {
  return memory.orders.get(id) ?? null;
};
