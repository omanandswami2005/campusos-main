import { memory } from '../../application/state/memory';

export const listOrders = async (collegeId: string) => {
  return Array.from(memory.orders.values()).filter((o) => o.collegeId === collegeId);
};
