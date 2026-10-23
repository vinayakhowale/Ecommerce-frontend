import { Component, ElementRef, OnInit, Signal, ViewChild, inject, signal } from '@angular/core';
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
import { BreadcrumbsComponent, Crumb } from '../../shared/components/breadcrumbs.component';
import { StarRatingComponent } from '../../shared/components/star-rating.component';
import { ProductReviewsComponent } from './product-reviews.component';
import { ReviewSummaryService } from '../../core/services/review-summary.service';
import { ReviewSummary } from '../../core/models/storefront.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe, BreadcrumbsComponent, StarRatingComponent, ProductReviewsComponent],
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
      <app-breadcrumbs [items]="crumbs()" />

      <div class="layout">
        <!-- Gallery: thumbnails beside the main shot on desktop, swipeable below it on mobile -->
        <section class="gallery" aria-label="Product media">
          <!-- One horizontal track. On desktop only the active slide is shown; on a phone the
               track scrolls and snaps, so swiping feels native instead of button-driven. -->
          <div class="track" #track (scroll)="onTrackScroll($event)">
            @for (m of media(); track m.url; let i = $index) {
              <div class="slide" [class.active]="i === activeIndex()">
                @if (m.kind === 'video') {
                  <video [src]="m.url | mediaUrl" [poster]="(posterUrl() | mediaUrl) || ''"
                         controls muted loop playsinline preload="metadata"></video>
                } @else {
                  <img [src]="m.url | mediaUrl" [alt]="product.name"
                       [attr.fetchpriority]="i === 0 ? 'high' : null"
                       (mousemove)="onZoomMove($event)" (mouseleave)="resetZoom($event)">
                }
              </div>
            }
            @if (media().length === 0) {
              <div class="slide active"><span class="stage-empty">{{ (product.name || '?').charAt(0) }}</span></div>
            }
          </div>

          @if (product.hasDiscount) { <span class="flag">{{ discountPercentLabel() }}</span> }

          <!-- Phone: dots. Desktop: thumbnails. Same state, two affordances. -->
          @if (media().length > 1) {
            <div class="dots" aria-hidden="true">
              @for (m of media(); track m.url; let i = $index) {
                <span class="dot" [class.on]="i === activeIndex()"></span>
              }
            </div>

            <div class="thumbs" role="tablist">
              @for (m of media(); track m.url; let i = $index) {
                <button class="thumb" role="tab"
                        [class.on]="i === activeIndex()"
                        [attr.aria-selected]="i === activeIndex()"
                        (click)="showMedia(i)"
                        [attr.aria-label]="(m.kind === 'video' ? 'Play video ' : 'View image ') + (i + 1)">
                  @if (m.kind === 'video') {
                    <video [src]="m.url | mediaUrl" muted preload="metadata"></video>
                    <span class="play" aria-hidden="true"></span>
                  } @else {
                    <img [src]="m.url | mediaUrl" alt="" loading="lazy">
                  }
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

            @if (rating && rating(); as r) {
              @if (r.reviewCount > 0) {
                <a class="rating-line" href="#reviews" (click)="scrollToReviews($event)">
                  <app-stars [value]="r.averageRating" [size]="15" />
                  <span class="num">{{ r.averageRating | number:'1.1-1' }}</span>
                  <span class="muted">({{ r.reviewCount }} {{ r.reviewCount === 1 ? 'review' : 'reviews' }})</span>
                </a>
              }
            }

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
              <button class="btn btn-accent btn-lg btn-block buy-inline" (click)="buyNow()">Buy now</button>
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

      <app-product-reviews [productId]="product.id" />

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
    @media (max-width: 860px) { :host { display: block; padding-bottom: 72px; } }

    .rating-line { display: inline-flex; align-items: center; gap: 0.45rem; margin-top: 0.5rem; font-size: var(--t-sm); font-weight: 600; }
    .rating-line .muted { color: var(--ink-soft); font-weight: 500; }
    .rating-line:hover .muted { text-decoration: underline; text-underline-offset: 3px; }
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
    .gallery { position: relative; }

    .track {
      display: flex;
      border-radius: var(--r-lg);
      overflow: hidden;
      background: var(--paper-deep);
    }
    .slide {
      flex: 0 0 100%;
      aspect-ratio: 4 / 5;
      position: relative;
      overflow: hidden;
      /* Capped so the thumbnail strip stays above the fold on a laptop. */
      max-height: min(74vh, 720px);
    }
    /* Desktop: the track is not scrollable, so inactive slides collapse away. */
    .slide:not(.active) { display: none; }
    .slide img, .slide video {
      width: 100%; height: 100%; object-fit: cover; background: #000;
      display: block;
    }
    .slide img {
      transition: transform var(--dur-slow) var(--ease-out);
      transform-origin: center;
    }
    .stage-empty {
      position: absolute; inset: 0; display: grid; place-items: center;
      font-family: var(--font-display); font-size: 4rem; color: var(--ink-faint);
    }

    .flag {
      position: absolute; top: 1rem; left: 1rem; z-index: 2;
      background: var(--brass-wash); color: var(--brass);
      font-size: var(--t-xs); font-weight: 700; padding: 0.3rem 0.65rem; border-radius: var(--r-sm);
    }

    .dots { display: none; }

    .thumbs {
      display: flex; gap: 0.5rem; margin-top: 0.65rem;
      overflow-x: auto; scrollbar-width: none;
    }
    .thumbs::-webkit-scrollbar { display: none; }
    .thumb {
      position: relative; flex: 0 0 auto;
      width: 68px; aspect-ratio: 4 / 5;
      padding: 0; border: 1px solid var(--line); border-radius: var(--r-sm);
      overflow: hidden; background: var(--paper-deep); cursor: pointer;
      transition: border-color var(--dur-fast) var(--ease-soft), opacity var(--dur-fast);
      opacity: 0.68;
    }
    .thumb:hover { opacity: 1; }
    .thumb img, .thumb video { width: 100%; height: 100%; object-fit: cover; }
    .thumb.on { border-color: var(--ink); opacity: 1; }
    .thumb .play {
      position: absolute; inset: 0; margin: auto;
      width: 0; height: 0;
      border-left: 11px solid #fff;
      border-top: 7px solid transparent;
      border-bottom: 7px solid transparent;
      filter: drop-shadow(0 1px 3px rgba(0,0,0,.6));
    }

    /* Desktop only: a restrained zoom that follows the cursor. */
    @media (hover: hover) and (pointer: fine) and (min-width: 861px) {
      .slide img { cursor: zoom-in; }
      .slide img:hover { transform: scale(1.6); }
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
      /* The sticky bar already offers Buy now, so the inline one would be a duplicate. */
      .buy-inline { display: none; }

      /* Phone: real swiping with scroll snap, dots instead of thumbnails. */
      .track {
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      .track::-webkit-scrollbar { display: none; }
      .slide { scroll-snap-align: center; aspect-ratio: 1; }
      .slide:not(.active) { display: block; }
      .thumbs { display: none; }
      .dots {
        display: flex; justify-content: center; gap: 0.4rem; padding-top: 0.75rem;
      }
      .dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: var(--line-strong);
        transition: background var(--dur-fast), transform var(--dur-fast) var(--ease-out);
      }
      .dot.on { background: var(--ink); transform: scale(1.35); }

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
        background: var(--surface);
        border-top: 1px solid var(--line);
        box-shadow: 0 -8px 24px -20px rgba(25, 23, 20, 0.55);
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
  loading = true;

  /** Videos first, then images -- the order shown in the gallery. */
  private mediaList: { kind: 'video' | 'image'; url: string }[] = [];

  @ViewChild('track') trackRef?: ElementRef<HTMLDivElement>;

  readonly activeIndex = signal(0);
  readonly quantity = signal(1);

  private reviewSummaries = inject(ReviewSummaryService);
  rating?: Signal<ReviewSummary | undefined>;

  crumbs(): Crumb[] {
    const p = this.product;
    const items: Crumb[] = [{ label: 'Home', link: '/' }];
    if (p?.category) items.push({ label: p.category, link: '/categories', queryParams: { category: p.category } });
    else items.push({ label: 'Shop', link: '/categories' });
    if (p) items.push({ label: p.name });
    return items;
  }

  scrollToReviews(e: Event) {
    e.preventDefault();
    document.getElementById('reviews')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

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
        this.rating = this.reviewSummaries.summary(p.id);
        this.buildMedia(p, []);
        this.loading = false;
        this.productService.postsForProduct(id).subscribe(posts => {
          this.relatedPosts = posts;
          // Rebuild once posts arrive, so a creator video can fill in for a product with none.
          this.buildMedia(p, posts);
        });
      },
      error: () => { this.loading = false; }
    });
  }

  /**
   * Builds the gallery: the product's own videos first, then its images. A creator post video
   * is appended only when the product has no video of its own, so the product's media wins.
   */
  private buildMedia(p: Product, posts: Post[]) {
    const videos = p.videoUrls?.length ? [...p.videoUrls] : (p.videoUrl ? [p.videoUrl] : []);
    if (videos.length === 0) {
      const postVideo = posts.find(x => x.mediaType === 'VIDEO');
      if (postVideo) videos.push(postVideo.mediaUrl);
    }
    const images = p.imageUrls?.length ? [...p.imageUrls] : (p.productImageUrl ? [p.productImageUrl] : []);

    this.mediaList = [
      ...videos.map(url => ({ kind: 'video' as const, url })),
      ...images.map(url => ({ kind: 'image' as const, url }))
    ];
    this.activeIndex.set(0);
  }

  media(): { kind: 'video' | 'image'; url: string }[] {
    return this.mediaList;
  }

  activeMedia(): { kind: 'video' | 'image'; url: string } | undefined {
    return this.mediaList[this.activeIndex()];
  }

  /** First image, used as the video poster so the stage is never blank while loading. */
  posterUrl(): string | undefined {
    return this.mediaList.find(m => m.kind === 'image')?.url;
  }

  showMedia(index: number) {
    this.activeIndex.set(index);
    // On a phone the track is the source of truth, so scroll it to match the tap.
    const track = this.trackRef?.nativeElement;
    if (track && track.scrollWidth > track.clientWidth) {
      track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
    }
  }

  /** Keeps the dots in step while the viewer swipes. */
  onTrackScroll(event: Event) {
    const el = event.target as HTMLDivElement;
    if (el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    if (index !== this.activeIndex() && index >= 0 && index < this.mediaList.length) {
      this.activeIndex.set(index);
    }
  }

  /** Cursor-following zoom: the point under the pointer stays under the pointer. */
  onZoomMove(event: MouseEvent) {
    const img = event.currentTarget as HTMLImageElement;
    const rect = img.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    img.style.transformOrigin = `${x}% ${y}%`;
  }

  resetZoom(event: MouseEvent) {
    (event.currentTarget as HTMLImageElement).style.transformOrigin = 'center';
  }

  changeQty(delta: number) {
    this.quantity.update(q => Math.min(10, Math.max(1, q + delta)));
  }

  addToCart() {
    if (!this.product) return;
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(this.product.id, this.quantity()).subscribe({
      next: () => {},
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
