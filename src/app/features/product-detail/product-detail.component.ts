import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
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
    <div class="loading"><div class="spinner"></div></div>
  } @else if (!product) {
    <div class="empty-state">
      <h3>This product isn't available</h3>
      <p>It may have sold out or been removed.</p>
      <a class="btn btn-outline" routerLink="/">Back to store</a>
    </div>
  } @else {
    <div class="container">
      <nav class="crumbs">
        <a routerLink="/">Store</a>
        <span aria-hidden="true">/</span>
        @if (product.category) {
          <a [routerLink]="['/categories']" [queryParams]="{ category: product.category }">{{ product.category }}</a>
          <span aria-hidden="true">/</span>
        }
        <span class="current">{{ product.name }}</span>
      </nav>

      <div class="layout">
        <!-- Gallery: thumbnails beside the main shot on desktop, swipeable below it on mobile -->
        <section class="gallery" aria-label="Product images">
          <div class="stage">
            @if (showingVideo()) {
              <video [src]="featuredVideoUrl! | mediaUrl" [poster]="(images()[0] | mediaUrl) || ''"
                     controls autoplay muted loop playsinline></video>
            } @else if (activeImage()) {
              <img [src]="activeImage()! | mediaUrl" [alt]="product.name">
            } @else {
              <span class="stage-empty">{{ product.name.charAt(0) }}</span>
            }
            @if (product.hasDiscount) { <span class="flag">{{ discountPercentLabel() }}</span> }
          </div>

          @if (thumbCount() > 1) {
            <div class="thumbs" role="tablist">
              @if (featuredVideoUrl) {
                <button class="thumb" role="tab" [class.on]="showingVideo()"
                        [attr.aria-selected]="showingVideo()" (click)="showVideo()" aria-label="Play creator video">
                  <video [src]="featuredVideoUrl | mediaUrl" muted preload="metadata"></video>
                  <span class="play" aria-hidden="true"></span>
                </button>
              }
              @for (url of images(); track url; let i = $index) {
                <button class="thumb" role="tab"
                        [class.on]="!showingVideo() && i === activeIndex()"
                        [attr.aria-selected]="!showingVideo() && i === activeIndex()"
                        (click)="showImage(i)" [attr.aria-label]="'View image ' + (i + 1)">
                  <img [src]="url | mediaUrl" alt="" loading="lazy">
                </button>
              }
            </div>
          }
        </section>

        <!-- Buy panel -->
        <section class="details">
          <div class="detail-inner">
            @if (product.brand) { <p class="brand">{{ product.brand }}</p> }
            <h1>{{ product.name }}</h1>

            <p class="prices">
              @if (product.hasDiscount) {
                <span class="price num">{{ product.currency }} {{ product.discountedPrice | number:'1.0-2' }}</span>
                <span class="was num">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
                @if (product.discountLabel) { <span class="chip chip-brass">{{ product.discountLabel }}</span> }
              } @else {
                <span class="price num">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
              }
            </p>
            <p class="tax-note">Inclusive of all taxes</p>

            @if (product.description) {
              <p class="description">{{ product.description }}</p>
            }

            <div class="qty">
              <span class="qty-label">Quantity</span>
              <div class="stepper">
                <button (click)="changeQty(-1)" [disabled]="quantity() <= 1" aria-label="Decrease quantity">−</button>
                <span class="num">{{ quantity() }}</span>
                <button (click)="changeQty(1)" [disabled]="quantity() >= 10" aria-label="Increase quantity">+</button>
              </div>
            </div>

            <div class="buy">
              <button class="btn btn-outline btn-lg btn-block" (click)="addToCart()">Add to bag</button>
              <button class="btn btn-accent btn-lg btn-block" (click)="buyNow()">Buy now</button>
            </div>

            <ul class="assurances">
              <li>Secure payment through Razorpay</li>
              <li>Dispatched within 2 working days</li>
              <li>7-day returns on unopened items</li>
            </ul>

            @if (product.category) {
              <p class="meta category-line">Category: {{ product.category }}</p>
            }
          </div>
        </section>
      </div>

      @if (relatedPosts.length > 0) {
        <section class="worn">
          <div class="section-head">
            <h2>Worn by</h2>
            <span class="side">{{ relatedPosts.length }} {{ relatedPosts.length === 1 ? 'post' : 'posts' }}</span>
          </div>
          <div class="rail">
            @for (post of relatedPosts; track post.id) {
              <figure class="worn-tile">
                @if (post.mediaType === 'IMAGE') {
                  <img [src]="post.mediaUrl | mediaUrl" [alt]="post.caption || post.influencerName" loading="lazy">
                } @else {
                  <video [src]="post.mediaUrl | mediaUrl" [poster]="post.thumbnailUrl | mediaUrl" muted preload="metadata"></video>
                }
                <figcaption>{{ post.influencerName }}</figcaption>
              </figure>
            }
          </div>
        </section>
      }
    </div>

    <!-- Mobile: price and primary action stay reachable while scrolling -->
    <div class="buy-bar">
      <div class="buy-bar-price">
        <span class="num">{{ product.currency }} {{ (product.hasDiscount ? product.discountedPrice : product.price) | number:'1.0-2' }}</span>
        @if (product.hasDiscount) { <span class="was num">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span> }
      </div>
      <button class="btn btn-accent" (click)="buyNow()">Buy now</button>
    </div>
  }
  `,
  styles: [`
    .loading { display: flex; justify-content: center; padding: 25vh 0; }

    .crumbs {
      display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap;
      padding-block: 1.25rem; font-size: var(--t-xs); color: var(--ink-faint);
    }
    .crumbs a:hover { color: var(--ink); }
    .crumbs .current { color: var(--ink-soft); }

    .layout {
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
      gap: clamp(1.5rem, 4vw, 4rem);
      padding-bottom: clamp(2rem, 5vw, 4rem);
    }

    /* ---- gallery ---- */
    .stage {
      position: relative;
      aspect-ratio: 4 / 5;
      border-radius: var(--r-lg);
      overflow: hidden;
      background: var(--paper-deep);
    }
    .stage img, .stage video { width: 100%; height: 100%; object-fit: cover; background: #000; }
    .stage-empty {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-family: var(--font-display); font-size: 4rem; color: var(--ink-faint);
    }
    .flag {
      position: absolute; top: 1rem; left: 1rem;
      background: var(--brass-wash); color: var(--brass);
      font-size: var(--t-xs); font-weight: 700; padding: 0.3rem 0.65rem; border-radius: var(--r-sm);
    }
    .thumbs {
      display: flex; gap: 0.5rem; margin-top: 0.65rem;
      overflow-x: auto; scrollbar-width: none;
    }
    .thumbs::-webkit-scrollbar { display: none; }
    .thumb {
      position: relative; flex: 0 0 auto;
      width: 68px; aspect-ratio: 4 / 5;
      padding: 0; border: 1px solid var(--line); border-radius: var(--r-sm);
      overflow: hidden; background: var(--paper-deep);
      transition: border-color var(--dur-fast);
    }
    .thumb img, .thumb video { width: 100%; height: 100%; object-fit: cover; }
    .thumb.on { border-color: var(--ink); }
    .thumb .play {
      position: absolute; inset: 0; margin: auto;
      width: 0; height: 0;
      border-left: 11px solid #fff;
      border-top: 7px solid transparent;
      border-bottom: 7px solid transparent;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,.6));
    }

    /* ---- details ---- */
    .detail-inner { position: sticky; top: 96px; }
    .brand { font-size: var(--t-sm); color: var(--ink-faint); font-weight: 600; margin-bottom: 0.4rem; }
    .details h1 { font-size: var(--t-h1); margin-bottom: 1rem; }
    .prices { display: flex; align-items: baseline; gap: 0.75rem; flex-wrap: wrap; margin: 0; }
    .price { font-size: 1.6rem; }
    .was { font-size: 1rem; color: var(--ink-faint); text-decoration: line-through; }
    .tax-note { font-size: var(--t-xs); color: var(--ink-faint); margin: 0.3rem 0 1.5rem; }
    .description {
      color: var(--ink-soft); line-height: 1.75; font-size: var(--t-sm);
      padding-bottom: 1.5rem; border-bottom: 1px solid var(--line); margin-bottom: 1.5rem;
    }

    .qty { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-bottom: 1.25rem; }
    .qty-label { font-size: var(--t-sm); font-weight: 600; }
    .stepper { display: flex; align-items: center; border: 1px solid var(--line-strong); border-radius: var(--r-sm); }
    .stepper button {
      width: 44px; height: 44px; border: none; background: transparent;
      font-size: 1.1rem; color: var(--ink);
    }
    .stepper button:disabled { opacity: 0.3; cursor: not-allowed; }
    .stepper span { min-width: 2.5rem; text-align: center; font-size: 0.95rem; }

    .buy { display: flex; flex-direction: column; gap: 0.6rem; }

    .assurances { list-style: none; padding: 1.5rem 0 0; margin: 0; display: grid; gap: 0.55rem; }
    .assurances li {
      position: relative; padding-left: 1.1rem;
      font-size: var(--t-sm); color: var(--ink-soft);
    }
    .assurances li::before {
      content: ''; position: absolute; left: 0; top: 0.55em;
      width: 5px; height: 5px; border-radius: 50%; background: var(--vetiver);
    }
    .category-line { margin-top: 1.25rem; }

    /* ---- worn by ---- */
    .worn { padding-top: clamp(2rem, 4vw, 3.5rem); }
    .worn-tile { margin: 0; width: clamp(150px, 38vw, 200px); }
    .worn-tile img, .worn-tile video {
      width: 100%; aspect-ratio: 3 / 4; object-fit: cover;
      border-radius: var(--r-md); background: var(--ink);
    }
    .worn-tile figcaption { padding-top: 0.5rem; font-size: var(--t-xs); color: var(--ink-soft); font-weight: 600; }

    /* ---- sticky mobile bar ---- */
    .buy-bar { display: none; }

    @media (max-width: 860px) {
      .layout { grid-template-columns: 1fr; }
      .detail-inner { position: static; }
      .stage { aspect-ratio: 1; }
      .buy { flex-direction: row; }
      .buy .btn { flex: 1; }

      .buy-bar {
        display: flex;
        position: fixed;
        inset-inline: 0;
        bottom: 58px;                   /* sits above the bottom nav */
        z-index: 44;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.65rem var(--gutter);
        background: color-mix(in srgb, var(--surface) 94%, transparent);
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border-top: 1px solid var(--line);
      }
      .buy-bar-price { display: flex; align-items: baseline; gap: 0.5rem; }
      .buy-bar-price .num { font-size: 1.05rem; }
      .buy-bar .was { font-size: var(--t-xs); }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  relatedPosts: Post[] = [];
  featuredVideoUrl: string | null = null;
  loading = true;

  readonly activeIndex = signal(0);
  readonly showingVideo = signal(false);
  readonly quantity = signal(1);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private paymentFlowService: PaymentFlowService,
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
          // A creator video, when one exists, is offered as the first thumbnail -- but the
          // product photo stays the default view so the page never autoplays over the product.
          const videoPost = posts.find(x => x.mediaType === 'VIDEO');
          this.featuredVideoUrl = videoPost ? videoPost.mediaUrl : null;
        });
      },
      error: () => { this.loading = false; }
    });
  }

  /** Gallery images, falling back to the single legacy image. */
  images(): string[] {
    if (!this.product) return [];
    if (this.product.imageUrls?.length) return this.product.imageUrls;
    return this.product.productImageUrl ? [this.product.productImageUrl] : [];
  }

  thumbCount(): number {
    return this.images().length + (this.featuredVideoUrl ? 1 : 0);
  }

  activeImage(): string | undefined {
    return this.images()[this.activeIndex()];
  }

  showImage(index: number) {
    this.activeIndex.set(index);
    this.showingVideo.set(false);
  }

  showVideo() {
    this.showingVideo.set(true);
  }

  changeQty(delta: number) {
    this.quantity.update(q => Math.min(10, Math.max(1, q + delta)));
  }

  addToCart() {
    if (!this.product) return;
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(this.product.id, this.quantity()).subscribe({
      next: () => this.toast.success(`${this.product!.name} added to your bag`),
      error: () => this.toast.error('Could not add to bag')
    });
  }

  buyNow() {
    if (!this.product) return;
    this.paymentFlowService.buyNow(this.product, this.quantity());
  }

  discountPercentLabel(): string {
    if (!this.product || !this.product.hasDiscount || this.product.price <= 0) return '';
    const pct = Math.round((1 - this.product.discountedPrice / this.product.price) * 100);
    return `${pct}% off`;
  }
}
