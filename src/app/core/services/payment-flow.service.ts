import { Injectable } from '@angular/core';
import { PaymentService } from './payment.service';
import { ToastService } from './toast.service';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { CreatePaymentOrderResponse } from '../models/payment.model';

// Razorpay's checkout.js attaches this constructor to the global window object -- it ships its
// own UI, so there's no TypeScript-typed SDK for it; `any` here is the standard pragmatic
// approach for a third-party UMD script loaded via a plain <script> tag (see index.html).
declare const Razorpay: any;

// Only what this service actually needs -- lets callers pass either a full Product or a
// lighter-weight object (e.g. a cart line item) without an awkward cast at every call site.
export interface BuyableItem {
  id: number;
  name: string;
  payInApp: boolean;
}

/**
 * The single place that decides HOW a "Buy Now" click is handled for a given product, so every
 * button across the app (product cards, product detail, cart, feed) calls one method instead of
 * duplicating this branching logic:
 *
 *  - If the product's seller has a Razorpay Linked Account configured (payInApp),
 *    checkout happens right here in-app via the Razorpay Checkout modal, and money is routed
 *    straight to that seller's own account (Razorpay Route).
 *  - Otherwise, falls back to the original external-redirect flow (BuyNowService) exactly as
 *    before -- so products whose seller hasn't been onboarded to Razorpay keep working unchanged.
 */
@Injectable({ providedIn: 'root' })
export class PaymentFlowService {
  constructor(
    private paymentService: PaymentService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router
  ) {}

  buyNow(item: BuyableItem, quantity: number = 1, _postId?: number, influencerCode?: string): void {
    // Buy Now ALWAYS opens the Razorpay Checkout popup. It never redirects to an external site.
    this.payInApp(item, quantity, influencerCode);
  }

  private payInApp(item: BuyableItem, quantity: number, influencerCode?: string): void {
    if (!this.auth.isLoggedIn()) {
      this.toast.error('Please log in to pay');
      this.router.navigate(['/auth/login']);
      return;
    }
    if (typeof Razorpay === 'undefined') {
      this.toast.error('Razorpay could not load. Check your internet / ad-blocker and refresh the page.');
      return;
    }

    this.paymentService.createOrder({ productId: item.id, quantity, influencerCode }).subscribe({
      next: (order) => this.openCheckout(order, item),
      error: (err) => this.toast.error(err?.error?.message || 'Could not start checkout')
    });
  }

  private openCheckout(order: CreatePaymentOrderResponse, item: BuyableItem): void {
    const options = {
      key: order.razorpayKeyId,
      amount: order.amountInPaise,
      currency: order.currency,
      name: 'Trendly',
      description: order.productName,
      image: order.productImageUrl,
      order_id: order.razorpayOrderId,
      handler: (response: any) => {
        this.paymentService.verify({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature
        }).subscribe({
          next: () => this.toast.success(`Payment successful — ${item.name} is on its way!`),
          error: () => this.toast.error('We could not confirm your payment. If money was deducted, it will be refunded automatically.')
        });
      },
      modal: {
        ondismiss: () => this.toast.error('Payment cancelled')
      },
      theme: { color: '#ff4b2e' }
    };

    const checkout = new Razorpay(options);
    checkout.on('payment.failed', (response: any) => {
      this.toast.error(response?.error?.description || 'Payment failed');
    });
    checkout.open();
  }
}