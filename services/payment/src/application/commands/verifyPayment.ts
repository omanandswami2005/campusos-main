import crypto from 'node:crypto';

export interface VerifyPaymentInput {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResult {
  valid: boolean;
  orderId: string;
  paymentId: string;
}

export const verifyPayment = (input: VerifyPaymentInput): VerifyPaymentResult => {
  const secret = process.env.RAZORPAY_KEY_SECRET || '';

  // Generate expected signature
  const body = input.razorpayOrderId + '|' + input.razorpayPaymentId;
  const expectedSignature = crypto.createHmac('sha256', secret).update(body).digest('hex');

  const valid = expectedSignature === input.razorpaySignature;

  return {
    valid,
    orderId: input.razorpayOrderId,
    paymentId: input.razorpayPaymentId,
  };
};
