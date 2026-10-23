import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { ActivatedRoute, Router } from '@angular/router';
import { StorefrontService } from '../../core/services/storefront.service';
import { BannerCarouselComponent } from '../../shared/components/banner-carousel.component';
import { BreadcrumbsComponent, Crumb } from '../../shared/components/breadcrumbs.component';

/** Used only if the category list can't be loaded. */
const FALLBACK_CATEGORIES = ['Fashion', 'Beauty', 'Fragrance', 'Healthcare', 'Electronics', 'Home', 'Fitness', 'Accessories', 'Kids'];
const ALL = 'All';
const NEW = 'New in';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ProductCardComponent, BannerCarouselComponent, BreadcrumbsComponent],
  template: `
  <div class="container categories-page">
    <app-breadcrumbs [items]="crumbs()" />

    <app-banner-carousel placement="COLLECTIONS" variant="slim" class="collections-banner" />

    <header class="page-head">
      <h1>{{ selected === ALL ? 'Shop all' : selected }}</h1>
      <p>{{ selected === ALL ? 'Narrow the store down to what you came for.' : (selected === NEW ? 'The latest additions to the store.' : 'Everything we carry in ' + selected + '.') }}</p>
    </header>

    <div class="filter-rail" role="tablist" aria-label="Categories">
      @for (c of categories; track c) {
        <button class="filter" role="tab" [attr.aria-selected]="selected === c"
                [class.active]="selected === c" (click)="select(c)">{{ c }}</button>
      }
    </div>

    @if (loading) {
      <div class="product-grid">
        @for (i of [1,2,3,4,5,6,7,8]; track i) { <div class="skeleton card-skeleton"></div> }
      </div>
    } @else if (products.length === 0) {
      <div class="empty-state">
        <h3>Nothing in {{ selected }} yet</h3>
        <p>Try another collection, or browse everything in the store.</p>
      </div>
    } @else {
      <div class="product-grid">
        @for (p of products; track p.id; let i = $index) {
          <div class="stagger-in" [style.animation-delay.ms]="i < 12 ? i * 30 : 0">
            <app-product-card [product]="p" (addToCart)="onAddToCart($event)" (buyNow)="onBuyNow($event)"></app-product-card>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    .categories-page { padding-block: 0 var(--section); }
    .collections-banner { display: block; margin-bottom: clamp(1rem, 3vw, 1.75rem); }
    .page-head h1 { font-size: var(--t-h1); }
    .page-head p { margin-top: 0.7rem; color: var(--ink-soft); font-size: var(--t-sm); }

    /* Scrolls horizontally on a phone instead of wrapping into a tall block. */
    .filter-rail {
      display: flex; gap: 0.5rem;
      margin: clamp(1.25rem, 3vw, 2rem) 0;
      overflow-x: auto; scrollbar-width: none;
      margin-inline: calc(var(--gutter) * -1);
      padding-inline: var(--gutter);
    }
    .filter-rail::-webkit-scrollbar { display: none; }
    .filter {
      flex: 0 0 auto;
      min-height: 40px;
      padding: 0.5rem 1.05rem;
      border-radius: var(--r-pill);
      border: 1px solid var(--line-strong);
      background: transparent;
      font-weight: 600; font-size: var(--t-sm); color: var(--ink-soft);
      transition: background var(--dur-fast), color var(--dur-fast), border-color var(--dur-fast);
    }
    .filter:hover { border-color: var(--ink); color: var(--ink); }
    .filter.active { background: var(--ink); border-color: var(--ink); color: var(--surface); }

    .card-skeleton { aspect-ratio: 4 / 5; }
`]
})
export class CategoriesComponent implements OnInit {
  readonly ALL = ALL;
  readonly NEW = NEW;
  categories: string[] = [ALL, NEW, ...FALLBACK_CATEGORIES];
  selected = ALL;
  private route = inject(ActivatedRoute);
  private storefront = inject(StorefrontService);
  products: Product[] = [];
  loading = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private paymentFlowService: PaymentFlowService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.storefront.categories().subscribe({
      next: list => { if (list.length) this.categories = [ALL, NEW, ...list.map(c => c.name)]; },
      error: () => {}
    });
    // The Shop menu, breadcrumbs and banners all link here with ?category= or ?new=1.
    this.route.queryParamMap.subscribe(q => {
      const cat = q.get('category');
      this.selected = q.get('new') ? NEW : (cat?.trim() || ALL);
      this.load();
    });
  }

  crumbs(): Crumb[] {
    const items: Crumb[] = [{ label: 'Home', link: '/' }, { label: 'Shop', link: '/categories' }];
    if (this.selected !== ALL) items.push({ label: this.selected });
    else items[1] = { label: 'Shop' };
    return items;
  }

  select(c: string) {
    const queryParams = c === ALL ? {} : c === NEW ? { new: 1 } : { category: c };
    this.router.navigate(['/categories'], { queryParams });
  }

  load() {
    this.loading = true;
    const done = { next: (res: { content: Product[] }) => { this.products = res.content; this.loading = false; },
                   error: () => { this.loading = false; } };
    if (this.selected === NEW) {
      this.productService.newLaunches(0, 40).subscribe(done);
      return;
    }
    const category = this.selected === ALL ? undefined : this.selected;
    this.productService.list(0, 40, category).subscribe(done);
  }

  onAddToCart(product: Product) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(product.id, 1).subscribe({
      next: () => {},
      error: () => this.toast.error('Could not add to cart')
    });
  }

  onBuyNow(product: Product) {
    this.paymentFlowService.buyNow(product);
  }
}
