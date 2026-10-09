import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, MediaUrlPipe],
  template: `
  <!-- Hero: the newest product becomes the cover shot. No stock imagery, no placeholder. -->
  <section class="hero">
    <div class="container hero-inner">
      <div class="hero-copy">
        <h1>Worn first by the people you follow.</h1>
        <p>Every piece here was picked by a creator before it reached this page. Browse what's just landed.</p>
        <div class="hero-actions">
          <a class="btn btn-primary btn-lg" routerLink="/categories">Browse collections</a>
          <a class="link-quiet" routerLink="/explore">See the edit</a>
        </div>
      </div>

      <div class="hero-art">
        @if (coverProduct()?.productImageUrl) {
          <a [routerLink]="['/product', coverProduct()!.id]" class="hero-frame">
            <img [src]="coverProduct()!.productImageUrl! | mediaUrl" [alt]="coverProduct()!.name" fetchpriority="high">
            <span class="hero-caption">
              <span class="hero-caption-name">{{ coverProduct()!.name }}</span>
              <span class="num">{{ coverProduct()!.currency }} {{ coverProduct()!.discountedPrice | number:'1.0-2' }}</span>
            </span>
          </a>
        } @else {
          <div class="hero-frame skeleton"></div>
        }
      </div>
    </div>
  </section>

  <div class="container">
    @if (newLaunchesLoading || newLaunches.length > 0) {
      <section class="block">
        <div class="section-head">
          <h2>Just arrived</h2>
          <span class="side">Added in the last {{ newLaunchWindowLabel }}</span>
        </div>

        @if (newLaunchesLoading) {
          <div class="rail">
            @for (i of [1,2,3,4,5]; track i) { <div class="rail-item skeleton rail-skeleton"></div> }
          </div>
        } @else {
          <div class="rail">
            @for (p of newLaunches; track p.id) {
              <div class="rail-item">
                <app-product-card [product]="p" (addToCart)="onAddToCart($event)" (buyNow)="onBuyNow($event)" />
              </div>
            }
          </div>
        }
      </section>
    }

    <section class="block">
      <div class="section-head">
        <h2>Everything in store</h2>
        @if (products.length > 0) { <span class="side">{{ products.length }} pieces</span> }
      </div>

      @if (loading && products.length === 0) {
        <div class="product-grid">
          @for (i of [1,2,3,4,5,6,7,8]; track i) { <div class="skeleton card-skeleton"></div> }
        </div>
      } @else if (products.length === 0) {
        <div class="empty-state">
          <h3>Nothing here yet</h3>
          <p>The first drop is being put together. Check back shortly.</p>
        </div>
      } @else {
        <div class="product-grid">
          @for (p of products; track p.id; let i = $index) {
            <div class="stagger-in" [style.animation-delay.ms]="i < 10 ? i * 40 : 0">
              <app-product-card [product]="p" (addToCart)="onAddToCart($event)" (buyNow)="onBuyNow($event)" />
            </div>
          }
        </div>

        @if (!lastPage) {
          <div class="more">
            <button class="btn btn-outline btn-lg" (click)="loadMore()" [disabled]="loading">
              {{ loading ? 'Loading…' : 'Show more' }}
            </button>
          </div>
        }
      }
    </section>
  </div>
  `,
  styles: [`
    .hero { padding-block: clamp(2rem, 5vw, 4.5rem) clamp(2.5rem, 5vw, 5rem); }
    .hero-inner {
      display: grid;
      grid-template-columns: 1fr 1fr;
      align-items: center;
      gap: clamp(1.75rem, 5vw, 4.5rem);
    }
    .hero-copy h1 { font-size: var(--t-hero); max-width: 14ch; }
    .hero-copy p {
      margin-top: 1.1rem;
      color: var(--ink-soft);
      max-width: 42ch;
      font-size: clamp(0.95rem, 0.9rem + 0.3vw, 1.1rem);
    }
    .hero-actions { display: flex; align-items: center; gap: 1.5rem; margin-top: 1.9rem; flex-wrap: wrap; }

    .hero-frame {
      display: block;
      position: relative;
      aspect-ratio: 4 / 5;
      border-radius: var(--r-lg);
      overflow: hidden;
      background: var(--paper-deep);
    }
    .hero-frame img { width: 100%; height: 100%; object-fit: cover; }
    .hero-caption {
      position: absolute;
      left: 0.9rem;
      bottom: 0.9rem;
      right: 0.9rem;
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.75rem;
      background: var(--surface);
      padding: 0.7rem 0.9rem;
      border-radius: var(--r-sm);
      font-size: var(--t-sm);
    }
    .hero-caption-name {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .block { padding-bottom: clamp(2.5rem, 5vw, 4.5rem); }
    .rail-item { width: clamp(165px, 42vw, 250px); }
    .rail-skeleton { aspect-ratio: 4 / 5; }
    .card-skeleton { aspect-ratio: 4 / 5; }
    .more { display: flex; justify-content: center; padding-top: clamp(2rem, 4vw, 3rem); }

    @media (max-width: 860px) {
      .hero-inner { grid-template-columns: 1fr; }
      .hero-art { order: -1; }
      .hero-frame { aspect-ratio: 3 / 2; }
      .hero-copy h1 { max-width: 18ch; }
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

  /** Newest launch if there is one, otherwise the first catalogue item. */
  coverProduct(): Product | null {
    return this.newLaunches[0] ?? this.products[0] ?? null;
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
      next: () => this.toast.success(`${product.name} added to your bag`),
      error: () => this.toast.error('Could not add to bag')
    });
  }

  onBuyNow(product: Product) {
    this.paymentFlowService.buyNow(product);
  }
}
