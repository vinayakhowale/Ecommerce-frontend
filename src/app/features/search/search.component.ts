import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { PostService } from '../../core/services/post.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { Post } from '../../core/models/post.model';
import { debounceTime, Subject } from 'rxjs';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductCardComponent, MediaUrlPipe],
  template: `
  <div class="container search-page">
    <header class="page-head">
      <h1>Search</h1>
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="search-icon"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input type="text" placeholder="Search products, brands or creators"
               [(ngModel)]="query" (ngModelChange)="onQueryChange($event)" autofocus>
      </div>
    </header>

    @if (!query) {
      <div class="empty-state">
        <h3>What are you after?</h3>
        <p>Search by product, brand, category or creator name.</p>
      </div>
    } @else if (loading) {
      <div class="loading-state"><div class="spinner"></div></div>
    } @else {
      @if (products.length > 0) {
        <section>
          <div class="section-head"><h2>Products</h2><span class="side">{{ products.length }}</span></div>
          <div class="product-grid">
            @for (p of products; track p.id) {
              <app-product-card [product]="p" (addToCart)="onAddToCart($event)" (buyNow)="onBuyNow($event)"></app-product-card>
            }
          </div>
        </section>
      }
      @if (posts.length > 0) {
        <section>
          <div class="section-head"><h2>Posts</h2><span class="side">{{ posts.length }}</span></div>
          <div class="post-grid">
            @for (post of posts; track post.id) {
              <div class="post-tile" (click)="goToFirstProduct(post)">
                @if (post.mediaType === 'IMAGE') {
                  <img [src]="post.mediaUrl | mediaUrl" [alt]="post.caption" loading="lazy">
                } @else {
                  <video [src]="post.mediaUrl | mediaUrl" [poster]="post.thumbnailUrl | mediaUrl" muted preload="metadata"></video>
                }
                <span class="post-caption">{{ post.caption }}</span>
              </div>
            }
          </div>
        </section>
      }
      @if (products.length === 0 && posts.length === 0) {
        <div class="empty-state">
          <h3>Nothing matches "{{ query }}"</h3>
          <p>Check the spelling, or try a shorter, broader word.</p>
        </div>
      }
    }
  </div>
  `,
  styles: [`
    .search-page { padding-block: clamp(1.5rem, 4vw, 3rem) var(--section); }
    .page-head { margin-bottom: clamp(1.5rem, 3vw, 2.5rem); }
    .page-head h1 { font-size: var(--t-h1); margin-bottom: 1.25rem; }

    .search-box {
      display: flex; align-items: center; gap: 0.75rem;
      background: var(--surface);
      border: 1px solid var(--line-strong);
      border-radius: var(--r-sm);
      padding: 0 1rem;
      max-width: 560px;
      transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
    }
    .search-box:focus-within { border-color: var(--vetiver); box-shadow: 0 0 0 3px var(--vetiver-wash); }
    .search-icon { color: var(--ink-faint); flex-shrink: 0; }
    .search-box input {
      flex: 1; border: none; background: transparent; outline: none;
      min-height: 52px; font-size: 16px; color: var(--ink);
    }
    .search-box input::placeholder { color: var(--ink-faint); }

    section { margin-bottom: clamp(2rem, 4vw, 3.5rem); }
    .loading-state { display: flex; justify-content: center; padding: 4rem 0; }

    .post-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr));
      gap: clamp(0.6rem, 1.4vw, 1rem);
    }
    .post-tile {
      position: relative; aspect-ratio: 3 / 4; cursor: pointer;
      border-radius: var(--r-md); overflow: hidden; background: var(--paper-deep);
    }
    .post-tile img, .post-tile video { width: 100%; height: 100%; object-fit: cover; }
    .post-caption {
      position: absolute; inset-inline: 0; bottom: 0;
      padding: 1.5rem 0.7rem 0.6rem;
      background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
      color: #fff; font-size: var(--t-xs); font-weight: 600;
      display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
    }
`]
})
export class SearchComponent {
  query = '';
  products: Product[] = [];
  posts: Post[] = [];
  loading = false;
  private queryChange$ = new Subject<string>();

  constructor(
    private productService: ProductService,
    private postService: PostService,
    private cartService: CartService,
    private paymentFlowService: PaymentFlowService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router
  ) {
    this.queryChange$.pipe(debounceTime(350)).subscribe(q => this.runSearch(q));
  }

  onQueryChange(q: string) {
    this.queryChange$.next(q);
  }

  private runSearch(q: string) {
    if (!q.trim()) { this.products = []; this.posts = []; return; }
    this.loading = true;
    this.productService.search(q, 0, 20).subscribe({
      next: (res) => { this.products = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.postService.search(q, 0, 20).subscribe({ next: (res) => { this.posts = res.content; } });
  }

  goToFirstProduct(post: Post) {
    if (post.products[0]) this.router.navigate(['/product', post.products[0].id]);
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
