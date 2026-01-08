import type { Order, OrderItem } from '@campus-os/types';
import { prisma } from '../state/memory';

export type UpdateStatusInput = {
  orderId: string;
  nextStatus: 'confirmed' | 'preparing' | 'out-for-delivery' | 'delivered' | 'cancelled';
  otpProvided?: string;
};

const genOtp = () => String(Math.floor(1000 + Math.random() * 9000));

const statusMap: Record<string, string> = {
  confirmed: 'CONFIRMED',
  preparing: 'PREPARING',
  'out-for-delivery': 'OUT_FOR_DELIVERY',
  delivered: 'DELIVERED',
  cancelled: 'CANCELLED',
};

export const updateOrderStatus = async ({
  orderId,
  nextStatus,
  otpProvided,
}: UpdateStatusInput): Promise<Order> => {
  const dbOrder = await prisma.canteenOrder.findUnique({
    where: { id: orderId },
    include: { items: { include: { menuItem: true } } },
  });

  if (!dbOrder) throw new Error('Order not found');

  // OTP validation for delivery
  if (nextStatus === 'delivered') {
    if (!dbOrder.otp) throw new Error('OTP not issued');
    if (!otpProvided) throw new Error('OTP required');
    if (otpProvided !== dbOrder.otp) throw new Error('Invalid OTP');
  }

  // Generate OTP when out for delivery
  const updateData: any = {
    status: statusMap[nextStatus] || nextStatus.toUpperCase(),
    updatedAt: new Date(),
  };

  if (nextStatus === 'out-for-delivery' && !dbOrder.otp) {
    updateData.otp = genOtp();
    updateData.otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  }

  const updated = await prisma.canteenOrder.update({
    where: { id: orderId },
    data: updateData,
    include: { items: { include: { menuItem: true } } },
  });

  const items: OrderItem[] = updated.items.map((item) => ({
    menuItemId: item.menuItemId,
    menuItemName: item.menuItem.name,
    quantity: item.quantity,
    priceCents: item.priceCents,
  }));

  return {
    id: updated.id,
    userId: updated.userId,
    collegeId: updated.collegeId,
    items,
    deliveryLocation: updated.deliveryLocation || '',
    paymentMethod: (updated.paymentMethod?.toLowerCase() || 'online') as Order['paymentMethod'],
    paymentStatus: updated.paymentStatus.toLowerCase() as Order['paymentStatus'],
    appliedOffer: updated.appliedOfferId || undefined,
    subtotalCents: updated.subtotalCents,
    discountCents: updated.discountCents,
    totalCents: updated.totalCents,
    status: nextStatus,
    createdAt: updated.createdAt.toISOString(),
    updatedAt: updated.updatedAt.toISOString(),
    otp: updated.otp || undefined,
    otpExpiresAt: updated.otpExpiresAt?.toISOString(),
  };
};
