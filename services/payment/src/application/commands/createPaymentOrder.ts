import Razorpay from 'razorpay';

// Initialize Razorpay instance
// User will add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export interface CreatePaymentOrderInput {
  amountCents: number;
  currency?: string;
  orderId: string;
  notes?: Record<string, string>;
}

export interface PaymentOrder {
  id: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  status: 'created' | 'paid' | 'failed';
}

export const createPaymentOrder = async (input: CreatePaymentOrderInput): Promise<PaymentOrder> => {
  const options = {
    amount: input.amountCents, // Razorpay expects amount in paise
    currency: input.currency || 'INR',
    receipt: input.orderId,
    notes: input.notes || {},
  };

  const order = await razorpay.orders.create(options);

  return {
    id: input.orderId,
    razorpayOrderId: order.id,
    amount: order.amount as number,
    currency: order.currency,
    status: 'created',
  };
};
