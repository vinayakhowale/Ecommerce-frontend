import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { BuyNowService } from '../../core/services/buy-now.service';
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
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; }
    .skeleton-card { aspect-ratio: 0.72; }
    .load-more { display: flex; justify-content: center; padding: 32px 0 20px; }
    @media (max-width: 560px) {
      .grid { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
      .feed-header h1 { font-size: 24px; }
    }
  `]
})
export class FeedComponent implements OnInit {
  products: Product[] = [];
  page = 0;
  loading = false;
  lastPage = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private buyNowService: BuyNowService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPage();
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
    this.buyNowService.requestRedirect(product.id).subscribe({
      next: (res) => this.buyNowService.navigateTo(res.redirectUrl),
      error: () => this.toast.error('This product link is currently unavailable')
    });
  }
}
