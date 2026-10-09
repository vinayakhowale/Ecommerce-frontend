import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItemView } from '../../core/models/cart.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  <div class="container cart-page">
    <header class="page-head">
      <h1>Your bag</h1>
      @if (cart.cart().items.length > 0) {
        <button class="btn btn-ghost" (click)="clearCart()">Empty bag</button>
      }
    </header>

    @if (!auth.isLoggedIn()) {
      <div class="empty-state">
        <h3>Log in to see your bag</h3>
        <p>Your saved items are tied to your account.</p>
        <a class="btn btn-primary" routerLink="/auth/login">Log in</a>
      </div>
    } @else if (loading) {
      <div class="loading-state"><div class="spinner"></div></div>
    } @else if (cart.cart().items.length === 0) {
      <div class="empty-state">
        <h3>Your bag is empty</h3>
        <p>Browse the store and add something you like.</p>
        <a class="btn btn-primary" routerLink="/">Start shopping</a>
      </div>
    } @else {
      <div class="cart-layout">
        <div class="items">
          @for (item of cart.cart().items; track item.id) {
            <div class="cart-item" [class.inactive]="!item.productActive">
              @if (item.productImageUrl) {
                <img [src]="item.productImageUrl | mediaUrl" [alt]="item.productName">
              } @else {
                <div class="img-fallback">{{ item.productName.charAt(0) }}</div>
              }
              <div class="item-info">
                <span class="item-name">{{ item.productName }}</span>
                @if (!item.productActive) {
                  <span class="unavailable-tag">No longer available</span>
                }
                @if (item.hasDiscount) {
                  <span class="item-price-row">
                    <span class="item-price num">{{ item.currency }} {{ item.discountedPrice | number:'1.0-2' }}</span>
                    <span class="item-mrp">{{ item.currency }} {{ item.price | number:'1.0-2' }}</span>
                  </span>
                } @else {
                  <span class="item-price num">{{ item.currency }} {{ item.price | number:'1.0-2' }}</span>
                }
              </div>
              <div class="qty-control">
                <button (click)="updateQty(item, item.quantity - 1)" [disabled]="!item.productActive" aria-label="Decrease quantity">−</button>
                <span>{{ item.quantity }}</span>
                <button (click)="updateQty(item, item.quantity + 1)" [disabled]="!item.productActive" aria-label="Increase quantity">+</button>
              </div>
              <span class="subtotal num">{{ item.currency }} {{ item.subtotal | number:'1.0-2' }}</span>
              <button class="btn btn-accent btn-sm buy-btn" (click)="buyNow(item)" [disabled]="!item.productActive">Buy now</button>
              <button class="remove-btn" (click)="remove(item)" aria-label="Remove item">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6 6 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
              </button>
            </div>
          }
        </div>

        <div class="summary card">
          <h2>Order summary</h2>
          <div class="receipt">
            <div class="receipt-row">
              <span>Items ({{ cart.cart().itemCount }})</span>
              <span class="num">{{ cart.cart().total | number:'1.0-2' }}</span>
            </div>
            <div class="receipt-dashes"></div>
            <div class="receipt-row total">
              <span>Total</span>
              <span class="num">{{ cart.cart().total | number:'1.0-2' }}</span>
            </div>
          </div>
          <p class="checkout-note">Items are paid for one at a time through Razorpay. Use "Buy now" on an item to check out.</p>
          <a class="btn btn-outline btn-block" routerLink="/">Keep shopping</a>
        </div>
      </div>
    }
  </div>
  `,
  styles: [`
    .cart-page { padding-block: clamp(1.5rem, 4vw, 3rem) var(--section); }
    .page-head {
      display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
      padding-bottom: 1rem; margin-bottom: clamp(1.25rem, 3vw, 2rem);
      border-bottom: 1px solid var(--line);
    }
    .page-head h1 { font-size: var(--t-h1); }
    .loading-state { display: flex; justify-content: center; padding: 4rem 0; }

    .cart-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 320px;
      align-items: start;
      gap: clamp(1.5rem, 4vw, 3rem);
    }

    .cart-item {
      display: grid;
      grid-template-columns: 88px minmax(0, 1fr) auto auto auto auto;
      align-items: center;
      gap: clamp(0.75rem, 2vw, 1.25rem);
      padding: 1.25rem 0;
      border-bottom: 1px solid var(--line);
    }
    .cart-item.inactive { opacity: 0.55; }
    .cart-item img, .img-fallback {
      width: 88px; aspect-ratio: 4 / 5; object-fit: cover;
      border-radius: var(--r-sm); background: var(--paper-deep);
    }
    .img-fallback {
      display: grid; place-items: center;
      font-family: var(--font-display); font-size: 1.5rem; color: var(--ink-faint);
    }
    .item-info { display: flex; flex-direction: column; gap: 0.25rem; min-width: 0; }
    .item-name { font-weight: 600; font-size: var(--t-sm); }
    .item-price-row { display: flex; align-items: baseline; gap: 0.5rem; }
    .item-price { font-size: 0.95rem; }
    .item-mrp { font-size: var(--t-xs); color: var(--ink-faint); text-decoration: line-through; }
    .unavailable-tag { font-size: var(--t-xs); color: var(--brass); font-weight: 600; }

    .qty-control { display: flex; align-items: center; border: 1px solid var(--line-strong); border-radius: var(--r-sm); }
    .qty-control button {
      width: 38px; height: 38px; border: none; background: transparent; color: var(--ink); font-size: 1rem;
    }
    .qty-control button:disabled { opacity: 0.3; cursor: not-allowed; }
    .qty-control span { min-width: 2rem; text-align: center; font-size: var(--t-sm); }

    .subtotal { font-size: 0.95rem; white-space: nowrap; }
    .remove-btn {
      width: 36px; height: 36px; border: none; background: transparent;
      color: var(--ink-faint); border-radius: 50%;
    }
    .remove-btn:hover { background: var(--paper-deep); color: var(--ink); }

    .summary { padding: 1.5rem; position: sticky; top: 96px; }
    .summary h2 { font-size: var(--t-h3); margin-bottom: 1rem; }
    .receipt { display: flex; flex-direction: column; gap: 0.75rem; }
    .receipt-row { display: flex; justify-content: space-between; gap: 1rem; font-size: var(--t-sm); color: var(--ink-soft); }
    .receipt-row.total { color: var(--ink); font-weight: 700; font-size: 1rem; }
    .receipt-row.total .num { font-size: 1.25rem; }
    .receipt-dashes { border-top: 1px dashed var(--line-strong); }
    .checkout-note { font-size: var(--t-xs); color: var(--ink-faint); margin: 1rem 0; }

    @media (max-width: 900px) {
      .cart-layout { grid-template-columns: 1fr; }
      .summary { position: static; }
    }
    @media (max-width: 640px) {
      .cart-item {
        grid-template-columns: 72px minmax(0, 1fr) auto;
        grid-template-areas:
          'img info remove'
          'img qty  subtotal'
          'buy buy  buy';
        row-gap: 0.65rem;
      }
      .cart-item img, .img-fallback { grid-area: img; width: 72px; }
      .item-info { grid-area: info; }
      .qty-control { grid-area: qty; justify-self: start; }
      .subtotal { grid-area: subtotal; justify-self: end; }
      .remove-btn { grid-area: remove; justify-self: end; }
      .buy-btn { grid-area: buy; width: 100%; }
    }
`]
})
export class CartComponent implements OnInit {
  loading = false;

  constructor(
    public cart: CartService,
    private paymentFlowService: PaymentFlowService,
    private toast: ToastService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      this.loading = true;
      this.cart.refresh().subscribe({
        next: () => this.loading = false,
        error: () => this.loading = false
      });
    }
  }

  updateQty(item: CartItemView, quantity: number) {
    if (quantity < 1) { this.remove(item); return; }
    this.cart.updateQuantity(item.id, quantity).subscribe({ error: () => this.toast.error('Could not update quantity') });
  }

  remove(item: CartItemView) {
    this.cart.removeItem(item.id).subscribe({
      next: () => this.toast.success('Removed from cart'),
      error: () => this.toast.error('Could not remove item')
    });
  }

  buyNow(item: CartItemView) {
    this.paymentFlowService.buyNow(
      { id: item.productId, name: item.productName, payInApp: item.payInApp },
      item.quantity
    );
  }

  clearCart() {
    this.cart.clear().subscribe({ next: () => this.toast.success('Cart cleared') });
  }
}
