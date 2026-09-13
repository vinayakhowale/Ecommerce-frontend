import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { PostService } from '../../core/services/post.service';
import { CartService } from '../../core/services/cart.service';
import { BuyNowService } from '../../core/services/buy-now.service';
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
  <div class="search-page">
    <header>
      <p class="eyebrow">Find it</p>
      <h1>Search</h1>
      <div class="search-box">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="search-icon"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        <input type="text" placeholder="Search products, brands, influencers…"
               [(ngModel)]="query" (ngModelChange)="onQueryChange($event)" autofocus>
      </div>
    </header>

    @if (!query) {
      <div class="empty-state">
        <span class="emoji">🔍</span>
        <h3>Find products and posts</h3>
        <p>Try a brand, category, or influencer name.</p>
      </div>
    } @else if (loading) {
      <div class="loading-state"><div class="spinner"></div></div>
    } @else {
      @if (products.length > 0) {
        <section>
          <h2>Products</h2>
          <div class="grid">
            @for (p of products; track p.id) {
              <app-product-card [product]="p" (addToCart)="onAddToCart($event)" (buyNow)="onBuyNow($event)"></app-product-card>
            }
          </div>
        </section>
      }
      @if (posts.length > 0) {
        <section>
          <h2>Posts</h2>
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
          <span class="emoji">🕵️</span>
          <h3>No results for "{{ query }}"</h3>
        </div>
      }
    }
  </div>
  `,
  styles: [`
    .search-page { max-width: 1100px; margin: 0 auto; padding: 40px 20px 60px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 28px; margin-bottom: 20px; }
    .search-box {
      display: flex; align-items: center; gap: 12px;
      background: var(--surface); border: 1.5px solid var(--sand);
      border-radius: 999px; padding: 14px 20px;
      transition: border-color var(--dur-fast), box-shadow var(--dur-fast);
    }
    .search-box:focus-within { border-color: var(--poppy); box-shadow: 0 0 0 4px var(--poppy-wash); }
    .search-icon { color: var(--ink-soft); flex-shrink: 0; }
    .search-box input { border: none; outline: none; flex: 1; font-size: 14.5px; background: transparent; }
    .loading-state { display: flex; justify-content: center; padding: 60px 0; }
    section { margin-top: 34px; }
    section h2 { font-size: 17px; margin-bottom: 16px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    .post-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
    .post-tile { position: relative; aspect-ratio: 3/4; border-radius: var(--r-md); overflow: hidden; cursor: pointer; background: var(--ink); transition: transform var(--dur-med) var(--ease-out); }
    .post-tile:hover { transform: translateY(-3px); }
    .post-tile img, .post-tile video { width: 100%; height: 100%; object-fit: cover; }
    .post-caption {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 9px 11px;
      background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
      color: white; font-size: 11.5px;
      display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
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
    private buyNowService: BuyNowService,
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
    this.buyNowService.requestRedirect(product.id).subscribe({
      next: (res) => this.buyNowService.navigateTo(res.redirectUrl),
      error: () => this.toast.error('This product link is currently unavailable')
    });
  }
}
