export interface CreatePaymentOrderRequest {
  productId: number;
  quantity: number;
  influencerCode?: string;
}

export interface CreatePaymentOrderResponse {
  paymentOrderId: number;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amountInPaise: number;
  currency: string;
  productName: string;
  productImageUrl?: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  paymentOrderId: number;
  status: string;
  productName: string;
  totalAmount: number;
  currency: string;
}
