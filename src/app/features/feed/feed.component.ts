import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
  <div class="feed-page">
    <header class="feed-header">
      <p class="eyebrow">New in</p>
      <h1>Shop what creators<br>are wearing right now</h1>
    </header>

    @if (newLaunchesLoading) {
      <section class="new-launches">
        <div class="section-head"><h2>New Launches</h2></div>
        <div class="new-launches-strip">
          @for (i of [1,2,3,4]; track i) { <div class="skeleton nl-skeleton-card"></div> }
        </div>
      </section>
    } @else if (newLaunches.length > 0) {
      <section class="new-launches">
        <div class="section-head">
          <h2>New Launches</h2>
          <span class="chip">Added in the last {{ newLaunchWindowLabel }}</span>
        </div>
        <div class="new-launches-strip">
          @for (p of newLaunches; track p.id) {
            <div class="nl-item">
              <app-product-card [product]="p" (addToCart)="onAddToCart($event)" (buyNow)="onBuyNow($event)"></app-product-card>
            </div>
          }
        </div>
      </section>
    }

    <div class="section-head all-head">
      <h2>All Products</h2>
    </div>

    @if (loading && products.length === 0) {
      <div class="grid">
        @for (i of [1,2,3,4,5,6,7,8]; track i) { <div class="skeleton skeleton-card"></div> }
      </div>
    } @else if (products.length === 0) {
      <div class="empty-state">
        <span class="emoji">🛍️</span>
        <h3>No products yet</h3>
        <p>Check back soon — new arrivals are on the way.</p>
      </div>
    } @else {
      <div class="grid">
        @for (p of products; track p.id; let i = $index) {
          <div class="stagger-in" [style.animation-delay.ms]="i < 12 ? i * 30 : 0">
            <app-product-card [product]="p" (addToCart)="onAddToCart($event)" (buyNow)="onBuyNow($event)"></app-product-card>
          </div>
        }
      </div>
      @if (!lastPage) {
        <div class="load-more">
          <button class="btn btn-outline" (click)="loadMore()" [disabled]="loading">
            {{ loading ? 'Loading…' : 'Show more' }}
          </button>
        </div>
      }
    }
  </div>
  `,
  styles: [`
    .feed-page { max-width: 1200px; margin: 0 auto; padding: 40px 20px 60px; }
    .feed-header { margin-bottom: 28px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    .feed-header h1 { font-size: 30px; line-height: 1.2; }

    .section-head { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
    .section-head h2 { font-size: 19px; }
    .section-head .chip { font-size: 11px; }
    .all-head { margin-top: 8px; }

    .new-launches { margin-bottom: 36px; }
    .new-launches-strip {
      display: flex; gap: 14px; overflow-x: auto; padding-bottom: 6px; scroll-snap-type: x proximity;
      -ms-overflow-style: none; scrollbar-width: none;
    }
    .new-launches-strip::-webkit-scrollbar { display: none; }
    .nl-item { flex: 0 0 auto; width: 200px; scroll-snap-align: start; }
    .nl-skeleton-card { flex: 0 0 auto; width: 200px; aspect-ratio: 0.72; }

    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
    .skeleton-card { aspect-ratio: 0.72; }
    .load-more { display: flex; justify-content: center; padding: 32px 0 20px; }
    @media (max-width: 560px) {
      .grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
      .feed-header h1 { font-size: 24px; }
      .nl-item, .nl-skeleton-card { width: 150px; }
    }
  `]
})
export class FeedComponent implements OnInit {
  products: Product[] = [];
  newLaunches: Product[] = [];
  newLaunchesLoading = true;
  newLaunchWindowLabel = '3 weeks'; // matches the backend default (app.catalog.new-launch-window-days: 21)
  page = 0;
  loading = false;
  lastPage = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private paymentFlowService: PaymentFlowService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPage();
    this.loadNewLaunches();
  }

  loadNewLaunches() {
    this.newLaunchesLoading = true;
    this.productService.newLaunches(0, 12).subscribe({
      next: (res) => { this.newLaunches = res.content; this.newLaunchesLoading = false; },
      error: () => { this.newLaunchesLoading = false; }
    });
  }

  loadPage() {
    this.loading = true;
    this.productService.list(this.page, 20).subscribe({
      next: (res) => {
        this.products = [...this.products, ...res.content];
        this.lastPage = res.last;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  loadMore() {
    this.page++;
    this.loadPage();
  }

  onAddToCart(product: Product) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(product.id, 1).subscribe({
      next: () => this.toast.success(`${product.name} added to cart`),
      error: () => this.toast.error('Could not add to cart')
    });
  }

  onBuyNow(product: Product) {
    this.paymentFlowService.buyNow(product);
  }
}
