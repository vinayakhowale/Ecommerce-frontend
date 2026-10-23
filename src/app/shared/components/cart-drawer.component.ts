import { Component, HostListener, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
import { ToastService } from '../../core/services/toast.service';
import { CartItemView } from '../../core/models/cart.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

/** Slide-in bag: opens whenever something is added, and from the header bag icon. */
@Component({
  selector: 'app-cart-drawer',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  @if (cart.drawerOpen()) {
    <div class="scrim" (click)="close()"></div>
  }
  <aside class="bag" [class.open]="cart.drawerOpen()" role="dialog" aria-modal="true" aria-label="Your bag"
         [attr.aria-hidden]="!cart.drawerOpen()">
    <header class="bag-head">
      <h2>Your bag <span class="count">({{ cart.cart().itemCount }})</span></h2>
      <button class="close" (click)="close()" aria-label="Close bag">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
      </button>
    </header>

    @if (cart.cart().items.length === 0) {
      <div class="empty">
        <p>Your bag is empty.</p>
        <a class="btn btn-primary" routerLink="/categories" (click)="close()">Start shopping</a>
      </div>
    } @else {
      <ul class="lines">
        @for (item of cart.cart().items; track item.id) {
          <li class="line" [class.busy]="busy() === item.id">
            <a class="thumb" [routerLink]="['/product', item.productId]" (click)="close()">
              @if (item.productImageUrl) {
                <img [src]="item.productImageUrl | mediaUrl" [alt]="item.productName">
              } @else {
                <span>{{ item.productName.charAt(0) }}</span>
              }
            </a>
            <div class="line-info">
              <a class="name" [routerLink]="['/product', item.productId]" (click)="close()">{{ item.productName }}</a>
              <div class="price">
                <span class="num">{{ item.currency }} {{ unitPrice(item) | number:'1.0-2' }}</span>
                @if (item.hasDiscount) {
                  <span class="was num">{{ item.currency }} {{ item.price | number:'1.0-2' }}</span>
                }
              </div>
              @if (!item.productActive) { <span class="warn">No longer available</span> }
              <div class="row">
                <div class="qty" role="group" [attr.aria-label]="'Quantity for ' + item.productName">
                  <button (click)="change(item, -1)" [disabled]="item.quantity <= 1 || busy() === item.id" aria-label="Decrease">−</button>
                  <span class="num">{{ item.quantity }}</span>
                  <button (click)="change(item, 1)" [disabled]="busy() === item.id" aria-label="Increase">+</button>
                </div>
                <button class="remove" (click)="remove(item)" [disabled]="busy() === item.id" [attr.aria-label]="'Remove ' + item.productName">
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 7h14M10 7V5h4v2M7 7l.8 12h8.4L17 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </button>
              </div>
            </div>
          </li>
        }
      </ul>

      <footer class="bag-foot">
        <div class="total">
          <span>Estimated total</span>
          <strong class="num">{{ currency() }} {{ cart.cart().total | number:'1.0-2' }}</strong>
        </div>
        <p class="note">Taxes and shipping are confirmed at payment.</p>
        <button class="btn btn-primary btn-block btn-lg" (click)="checkout()">Checkout</button>
        <a class="view" routerLink="/cart" (click)="close()">View bag</a>
      </footer>
    }
  </aside>
  `,
  styles: [`
    .scrim { position: fixed; inset: 0; background: rgba(25,23,20,.38); z-index: 70; animation: fade var(--dur-fast) ease-out; }
    @keyframes fade { from { opacity: 0; } }
    .bag {
      position: fixed; inset-block: 0; right: 0; z-index: 71;
      width: min(100vw, 420px); background: var(--surface);
      display: flex; flex-direction: column;
      transform: translateX(100%); visibility: hidden;
      transition: transform var(--dur-med) var(--ease-out), visibility var(--dur-med);
      box-shadow: -18px 0 40px -28px rgba(25,23,20,.5);
    }
    .bag.open { transform: none; visibility: visible; }
    .bag-head { display: flex; align-items: center; justify-content: space-between; padding: 1.1rem var(--gutter); border-bottom: 1px solid var(--line); }
    .bag-head h2 { font-size: 1.35rem; }
    .bag-head .count { color: var(--ink-faint); font-size: 1rem; }
    .close { width: 40px; height: 40px; border: 0; background: transparent; border-radius: 50%; display: grid; place-items: center; color: var(--ink); cursor: pointer; }
    .close:hover { background: var(--paper-deep); }
    .close svg { width: 20px; height: 20px; }

    .empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--ink-soft); }

    .lines { list-style: none; margin: 0; padding: 0 var(--gutter); flex: 1; overflow-y: auto; }
    .line { display: grid; grid-template-columns: 84px 1fr; gap: 0.9rem; padding: 1rem 0; border-bottom: 1px solid var(--line); transition: opacity var(--dur-fast); }
    .line.busy { opacity: .55; }
    .thumb { aspect-ratio: 4/5; border-radius: var(--r-sm); overflow: hidden; background: var(--paper-deep); display: grid; place-items: center; font-family: var(--font-display); color: var(--ink-faint); }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .line-info { display: flex; flex-direction: column; gap: 0.3rem; min-width: 0; color: var(--ink); }
    .name { font-weight: 600; font-size: var(--t-sm); line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .price { display: flex; gap: 0.45rem; align-items: baseline; font-size: var(--t-sm); }
    .was { color: var(--ink-faint); text-decoration: line-through; font-size: var(--t-xs); }
    .warn { font-size: var(--t-xs); color: var(--brass); font-weight: 600; }
    .row { display: flex; align-items: center; justify-content: space-between; margin-top: 0.35rem; }
    .qty { display: inline-flex; align-items: center; border: 1px solid var(--line-strong); border-radius: var(--r-pill); }
    .qty button { width: 34px; height: 34px; border: 0; background: transparent; font-size: 1.05rem; cursor: pointer; color: var(--ink); border-radius: 50%; }
    .qty button:disabled { opacity: .35; cursor: not-allowed; }
    .qty span { min-width: 1.6rem; text-align: center; font-size: var(--t-sm); font-weight: 600; }
    .remove { width: 36px; height: 36px; border: 0; background: transparent; border-radius: 50%; color: var(--ink-soft); cursor: pointer; display: grid; place-items: center; }
    .remove:hover { background: var(--paper-deep); color: var(--ink); }
    .remove svg { width: 19px; height: 19px; }

    .bag-foot { padding: 1rem var(--gutter) calc(1rem + env(safe-area-inset-bottom)); border-top: 1px solid var(--line); display: flex; flex-direction: column; gap: 0.6rem; }
    .total { display: flex; justify-content: space-between; align-items: baseline; font-size: var(--t-sm); }
    .total strong { font-size: 1.15rem; }
    .note { font-size: var(--t-xs); color: var(--ink-faint); margin: 0; }
    .view { text-align: center; font-size: var(--t-sm); font-weight: 600; color: var(--ink-soft); text-decoration: underline; text-underline-offset: 3px; padding: 0.25rem; }
    .view:hover { color: var(--ink); }
  `]
})
export class CartDrawerComponent {
  readonly cart = inject(CartService);
  private payment = inject(PaymentFlowService);
  private toast = inject(ToastService);
  private router = inject(Router);
  readonly busy = signal<number | null>(null);

  constructor() {
    effect(() => { document.body.style.overflow = this.cart.drawerOpen() ? 'hidden' : ''; });
  }

  @HostListener('document:keydown.escape')
  close() { this.cart.closeDrawer(); }

  unitPrice(item: CartItemView): number {
    return item.hasDiscount ? item.discountedPrice : item.price;
  }

  currency(): string {
    return this.cart.cart().items[0]?.currency ?? 'INR';
  }

  change(item: CartItemView, delta: number) {
    const quantity = item.quantity + delta;
    if (quantity < 1) return;
    this.busy.set(item.id);
    this.cart.updateQuantity(item.id, quantity).subscribe({
      next: () => this.busy.set(null),
      error: (e) => { this.busy.set(null); this.toast.error(e?.error?.message || 'Could not update quantity'); }
    });
  }

  remove(item: CartItemView) {
    this.busy.set(item.id);
    this.cart.removeItem(item.id).subscribe({
      next: () => this.busy.set(null),
      error: () => { this.busy.set(null); this.toast.error('Could not remove item'); }
    });
  }

  /**
   * Payments are taken one product at a time, so a single-item bag goes straight to Razorpay;
   * with several items the bag page lets the shopper pay for each.
   */
  checkout() {
    const items = this.cart.cart().items.filter(i => i.productActive);
    if (items.length === 1) {
      const i = items[0];
      this.close();
      this.payment.buyNow({ id: i.productId, name: i.productName, payInApp: i.payInApp }, i.quantity);
    } else {
      this.close();
      this.router.navigate(['/cart']);
    }
  }
}
