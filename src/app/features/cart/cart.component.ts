import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { BuyNowService } from '../../core/services/buy-now.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItemView } from '../../core/models/cart.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  <div class="cart-page">
    <header>
      <div>
        <p class="eyebrow">Your bag</p>
        <h1>Cart</h1>
      </div>
      @if (cart.cart().items.length > 0) {
        <button class="btn-ghost" (click)="clearCart()">Clear cart</button>
      }
    </header>

    @if (!auth.isLoggedIn()) {
      <div class="empty-state">
        <span class="emoji">🔐</span>
        <h3>Log in to view your cart</h3>
        <a class="btn btn-primary" routerLink="/auth/login">Log in</a>
      </div>
    } @else if (loading) {
      <div class="loading-state"><div class="spinner"></div></div>
    } @else if (cart.cart().items.length === 0) {
      <div class="empty-state">
        <span class="emoji">🛍️</span>
        <h3>Your cart is empty</h3>
        <p>Discover products from the feed and add them here.</p>
        <a class="btn btn-primary" routerLink="/">Continue shopping</a>
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
              <button class="btn btn-accent btn-sm buy-btn" (click)="buyNow(item)" [disabled]="!item.productActive">Buy Now</button>
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
          <p class="checkout-note">Each item is purchased on the seller's own website. Use "Buy Now" on a product to complete checkout there.</p>
          <a class="btn btn-outline btn-block" routerLink="/">Continue Shopping</a>
        </div>
      </div>
    }
  </div>
  `,
  styles: [`
    .cart-page { max-width: 980px; margin: 0 auto; padding: 40px 20px 60px; }
    header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 28px; }
    .btn-ghost { background: none; border: none; color: var(--ink-soft); font-weight: 700; font-size: 13px; padding: 8px 0; }
    .btn-ghost:hover { color: var(--poppy); }
    .loading-state { display: flex; justify-content: center; padding: 60px 0; }
    .empty-state a { margin-top: 14px; display: inline-flex; }
    .cart-layout { display: grid; grid-template-columns: 1fr 320px; gap: 28px; align-items: start; }
    .items { display: flex; flex-direction: column; gap: 12px; }
    .cart-item {
      display: grid; grid-template-columns: 64px 1fr auto auto auto auto; align-items: center; gap: 14px;
      background: var(--surface); border-radius: var(--r-md); padding: 14px; box-shadow: var(--shadow-card);
      transition: opacity var(--dur-med);
    }
    .cart-item.inactive { opacity: 0.5; }
    .cart-item img, .img-fallback { width: 64px; height: 64px; border-radius: 12px; object-fit: cover; }
    .img-fallback {
      display: flex; align-items: center; justify-content: center; background: var(--poppy-wash);
      color: var(--poppy); font-weight: 700; font-family: var(--font-display); font-size: 22px;
    }
    .item-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .item-name { font-weight: 600; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .item-price { font-size: 14px; color: var(--ink-soft); }
    .item-price-row { display: flex; align-items: baseline; gap: 7px; flex-wrap: wrap; }
    .item-price-row .item-price { color: var(--poppy-deep); font-weight: 700; }
    .item-mrp { font-size: 12px; color: var(--ink-soft); text-decoration: line-through; }
    .unavailable-tag { font-size: 11px; font-weight: 700; color: var(--poppy); }
    .qty-control { display: flex; align-items: center; gap: 10px; }
    .qty-control button {
      width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--sand); background: var(--surface); font-weight: 700;
      transition: border-color var(--dur-fast);
    }
    .qty-control button:hover:not(:disabled) { border-color: var(--ink); }
    .subtotal { min-width: 90px; text-align: right; font-size: 16px; }
    .buy-btn { white-space: nowrap; }
    .remove-btn { background: none; border: none; color: var(--ink-soft); padding: 6px; }
    .remove-btn:hover { color: var(--poppy); }
    .summary { padding: 24px; position: sticky; top: 24px; }
    .summary h2 { font-size: 16px; margin-bottom: 18px; }
    .receipt-row { display: flex; justify-content: space-between; font-size: 14px; padding: 6px 0; color: var(--ink-soft); }
    .receipt-dashes {
      height: 0; border-top: 1.5px dashed var(--sand); margin: 6px 0;
    }
    .receipt-row.total { font-weight: 700; font-size: 19px; color: var(--ink); padding-top: 8px; }
    .receipt-row.total .num { color: var(--poppy-deep); }
    .checkout-note { font-size: 12px; color: var(--ink-soft); margin: 16px 0; line-height: 1.6; }
    @media (max-width: 760px) {
      .cart-layout { grid-template-columns: 1fr; }
      .cart-item { grid-template-columns: 50px 1fr auto; grid-template-rows: auto auto auto; row-gap: 10px; }
      .qty-control { grid-column: 2; grid-row: 2; }
      .subtotal { grid-column: 3; grid-row: 1 / 3; }
      .buy-btn { grid-column: 1 / -1; grid-row: 3; }
      .remove-btn { position: absolute; top: 14px; right: 14px; }
      .cart-item { position: relative; }
    }
  `]
})
export class CartComponent implements OnInit {
  loading = false;

  constructor(
    public cart: CartService,
    private buyNowService: BuyNowService,
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
    this.buyNowService.requestRedirect(item.productId).subscribe({
      next: (res) => this.buyNowService.navigateTo(res.redirectUrl),
      error: () => this.toast.error('This product link is currently unavailable')
    });
  }

  clearCart() {
    this.cart.clear().subscribe({ next: () => this.toast.success('Cart cleared') });
  }
}
