import { memory } from '../state/memory';

export type UpdateStatusInput = {
  orderId: string;
  nextStatus: 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  otpProvided?: string;
};

const genOtp = () => String(Math.floor(1000 + Math.random() * 9000));

export const updateOrderStatus = async ({
  orderId,
  nextStatus,
  otpProvided,
}: UpdateStatusInput) => {
  const order = memory.orders.get(orderId);
  if (!order) throw new Error('Order not found');

  if (nextStatus === 'delivered') {
    if (!order.otp) throw new Error('OTP not issued');
    if (!otpProvided) throw new Error('OTP required');
    if (otpProvided !== order.otp) throw new Error('Invalid OTP');
  }

  if (nextStatus === 'out-for-delivery' && !order.otp) {
    order.otp = genOtp();
    order.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
  }

  order.status = nextStatus;
  order.updatedAt = new Date().toISOString();
  memory.orders.set(orderId, order);
  return order;
};
