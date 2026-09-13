import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { BuyNowService } from '../../core/services/buy-now.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { Post } from '../../core/models/post.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  @if (loading) {
    <div class="loading-state"><div class="spinner"></div></div>
  } @else if (!product) {
    <div class="empty-state">
      <span class="emoji">📦</span>
      <h3>This product isn't available</h3>
      <p><a class="btn btn-outline" routerLink="/">Back to home</a></p>
    </div>
  } @else {
    <div class="product-page">
      <div class="gallery">
        @if (featuredVideoUrl) {
          <video [src]="featuredVideoUrl | mediaUrl" [poster]="(product.productImageUrl | mediaUrl) || ''"
                 controls autoplay muted loop playsinline></video>
        } @else if (product.productImageUrl) {
          <img [src]="product.productImageUrl | mediaUrl" [alt]="product.name">
        } @else {
          <div class="gallery-fallback">{{ product.name.charAt(0) }}</div>
        }
        @if (product.brand) { <span class="brand-tag">{{ product.brand }}</span> }
        @if (product.hasDiscount) { <span class="discount-badge">{{ discountPercentLabel() }}</span> }
      </div>

      <div class="info">
        @if (product.category) { <span class="category-chip chip">{{ product.category }}</span> }
        <h1>{{ product.name }}</h1>
        <div class="price-row">
          @if (product.hasDiscount) {
            <span class="price num">{{ product.currency }} {{ product.discountedPrice | number:'1.0-2' }}</span>
            <span class="mrp">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
            @if (product.discountLabel) { <span class="discount-tag chip">{{ product.discountLabel }}</span> }
          } @else {
            <span class="price num">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
          }
          @if (product.seller) { <span class="seller">Sold by {{ product.seller }}</span> }
        </div>
        @if (product.description) { <p class="description">{{ product.description }}</p> }

        <div class="actions">
          <button class="btn btn-outline btn-block" (click)="addToCart()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M4 4h2l1.2 12.4a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L21 8H6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.3" fill="currentColor"/><circle cx="17.5" cy="21" r="1.3" fill="currentColor"/></svg>
            Add to Cart
          </button>
          <button class="btn btn-accent btn-block" (click)="buyNow()">Buy Now</button>
        </div>
        <p class="redirect-note">You'll be redirected to the seller's site to complete your purchase.</p>
      </div>

      @if (relatedPosts.length > 0) {
        <div class="related">
          <h2>Featured in these posts</h2>
          <div class="related-strip">
            @for (post of relatedPosts; track post.id) {
              <div class="related-tile">
                @if (post.mediaType === 'IMAGE') {
                  <img [src]="post.mediaUrl | mediaUrl" [alt]="post.caption" loading="lazy">
                } @else {
                  <video [src]="post.mediaUrl | mediaUrl" [poster]="post.thumbnailUrl | mediaUrl" muted preload="metadata"></video>
                }
                <div class="related-meta">
                  <span>{{ post.influencerName }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  }
  `,
  styles: [`
    .loading-state { display: flex; justify-content: center; padding: 100px 0; }
    .product-page { max-width: 1000px; margin: 0 auto; padding: 36px 20px 60px; display: grid; grid-template-columns: 1.1fr 1fr; gap: 48px; }
    .gallery { position: relative; aspect-ratio: 1; border-radius: var(--r-lg); overflow: hidden; background: var(--mist-deep); }
    .gallery img, .gallery video { width: 100%; height: 100%; object-fit: cover; display: block; background: #000; }
    .gallery-fallback {
      width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-size: 72px; font-weight: 700; color: var(--poppy);
      background: var(--poppy-wash);
    }
    .brand-tag {
      position: absolute; top: 16px; left: 16px;
      background: rgba(21,18,28,0.75); color: white; backdrop-filter: blur(4px);
      font-size: 11.5px; font-weight: 700; padding: 6px 13px; border-radius: 999px;
    }
    .discount-badge {
      position: absolute; top: 16px; right: 16px;
      background: var(--poppy); color: white; font-size: 11.5px; font-weight: 800;
      letter-spacing: 0.02em; padding: 7px 14px; border-radius: 999px;
      box-shadow: 0 6px 14px -3px rgba(255,75,46,0.5);
    }
    .info { display: flex; flex-direction: column; position: sticky; top: 24px; align-self: start; }
    .category-chip { margin-bottom: 14px; width: fit-content; }
    .info h1 { font-size: 30px; margin-bottom: 14px; }
    .price-row { display: flex; align-items: baseline; gap: 14px; margin-bottom: 18px; flex-wrap: wrap; }
    .price { font-size: 30px; color: var(--poppy-deep); }
    .mrp { font-size: 17px; color: var(--ink-soft); text-decoration: line-through; }
    .discount-tag { font-size: 12px; }
    .seller { font-size: 13px; color: var(--ink-soft); }
    .description { color: var(--ink-soft); line-height: 1.7; margin-bottom: 26px; }
    .actions { display: flex; gap: 12px; margin-top: auto; }
    .redirect-note { font-size: 12px; color: var(--ink-soft); margin-top: 12px; }
    .related { grid-column: 1 / -1; margin-top: 20px; padding-top: 32px; border-top: 1px solid var(--sand); }
    .related h2 { font-size: 18px; margin-bottom: 16px; }
    .related-strip { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 6px; }
    .related-tile { position: relative; flex: 0 0 auto; width: 160px; aspect-ratio: 3/4; border-radius: var(--r-md); overflow: hidden; background: var(--ink); }
    .related-tile img, .related-tile video { width: 100%; height: 100%; object-fit: cover; }
    .related-meta {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 9px;
      background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
      color: white; font-size: 12px; font-weight: 700;
    }
    @media (max-width: 760px) {
      .product-page { grid-template-columns: 1fr; gap: 24px; }
      .info { position: static; }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedPosts: Post[] = [];
  featuredVideoUrl: string | null = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private buyNowService: BuyNowService,
    private toast: ToastService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) { this.loading = false; return; }
    this.productService.get(id).subscribe({
      next: (p) => {
        this.product = p;
        this.loading = false;
        this.productService.postsForProduct(id).subscribe(posts => {
          this.relatedPosts = posts;
          // Prefer showing the actual influencer video (if this product was tagged in one)
          // front and center in the gallery, since that's usually more compelling than the
          // plain product photo -- falls back to the product image when no video exists.
          const videoPost = posts.find(p => p.mediaType === 'VIDEO');
          this.featuredVideoUrl = videoPost ? videoPost.mediaUrl : null;
        });
      },
      error: () => { this.loading = false; }
    });
  }

  addToCart() {
    if (!this.product) return;
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(this.product.id, 1).subscribe({
      next: () => this.toast.success(`${this.product!.name} added to cart`),
      error: () => this.toast.error('Could not add to cart')
    });
  }

  buyNow() {
    if (!this.product) return;
    this.buyNowService.requestRedirect(this.product.id).subscribe({
      next: (res) => this.buyNowService.navigateTo(res.redirectUrl),
      error: () => this.toast.error('This product link is currently unavailable')
    });
  }

  discountPercentLabel(): string {
    if (!this.product || !this.product.hasDiscount || this.product.price <= 0) return '';
    const pct = Math.round((1 - this.product.discountedPrice / this.product.price) * 100);
    return `${pct}% OFF`;
  }
}
