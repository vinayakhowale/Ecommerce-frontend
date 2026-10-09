import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Post } from '../../core/models/post.model';
import { Product } from '../../core/models/product.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-post-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  <article class="post-card">
    <div class="media-wrap" #mediaWrap>
      @if (post.mediaType === 'VIDEO') {
        <video #videoEl
          [src]="post.mediaUrl | mediaUrl"
          [poster]="(post.thumbnailUrl | mediaUrl) || ''"
          loop playsinline preload="metadata"
          [muted]="post.muted !== false"
          (click)="togglePlay()">
        </video>
        <button class="mute-btn" (click)="toggleMute($event)" aria-label="Toggle sound">
          @if (post.muted !== false) {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"/><path d="m16 9 5 6M21 9l-5 6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          } @else {
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 9v6h4l5 4V5L8 9H4Z" fill="currentColor"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
          }
        </button>
      } @else {
        <img [src]="post.mediaUrl | mediaUrl" [alt]="post.caption" loading="lazy">
      }

      <div class="scrim-top"></div>

      <div class="influencer-bar">
        @if (post.influencerProfileImageUrl) {
          <img class="avatar" [src]="post.influencerProfileImageUrl | mediaUrl" [alt]="post.influencerName">
        } @else {
          <div class="avatar avatar-fallback">{{ post.influencerName.charAt(0) }}</div>
        }
        <div class="influencer-meta">
          <span class="influencer-name">{{ post.influencerName }}</span>
          <span class="handle">&#64;{{ slug(post.influencerName) }}</span>
        </div>
      </div>

      @if (post.products.length) {
        <div class="price-sticker" (click)="scrollToProducts()">
          <span class="sticker-label">from</span>
          <span class="sticker-price">{{ post.products[0].currency }} {{ minPrice() | number:'1.0-2' }}</span>
        </div>
      }

      <div class="side-actions">
        <div class="share-wrap">
          <button (click)="toggleShareMenu($event)" aria-label="Share" [class.active]="shareMenuOpen">
            <span class="icon-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="18" cy="5" r="2.5" stroke="currentColor" stroke-width="1.7"/><circle cx="6" cy="12" r="2.5" stroke="currentColor" stroke-width="1.7"/><circle cx="18" cy="19" r="2.5" stroke="currentColor" stroke-width="1.7"/><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" stroke="currentColor" stroke-width="1.7"/></svg>
            </span>
            <span class="count">Share</span>
          </button>

          @if (shareMenuOpen) {
            <div class="share-menu" (click)="$event.stopPropagation()">
              <button (click)="shareVia('email')">
                <span class="share-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="m4 6.5 8 6.5 8-6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                Email
              </button>
              <button (click)="shareVia('whatsapp')">
                <span class="share-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-3.6-6.7" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M20 12a8 8 0 0 1-11.3 7.3L4 20l1-4.4A8 8 0 1 1 20 12Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 9.3c.2-.6.7-.6 1-.6h.4c.2 0 .5 0 .7.5.2.5.7 1.7.8 1.8.1.2.1.4 0 .6-.1.2-.2.3-.4.5-.2.2-.4.4-.2.7.2.4 1 1.5 2.1 2.2 1.4.9 1.6.7 1.9.6.3-.1.6-.6.8-.8.2-.2.4-.2.6-.1.2.1 1.5.7 1.8.9.3.1.4.2.5.3 0 .2 0 .8-.3 1.5-.3.7-1.6 1.3-2.2 1.3-.6 0-1.4.1-4.3-1.3-3-1.6-4.4-4.5-4.5-4.7-.1-.2-.9-1.3-.9-2.5 0-1.2.6-1.8.8-2Z" fill="currentColor"/></svg>
                </span>
                WhatsApp
              </button>
            </div>
          }
        </div>
      </div>
    </div>

    <div class="post-body">
      @if (post.caption) { <p class="caption">{{ post.caption }}</p> }
      @if (post.hashtags) {
        <p class="hashtags">
          @for (tag of hashtagList(); track tag) { <span>#{{ tag }}</span> }
        </p>
      }

      @if (post.products.length) {
        <div class="products-strip" #productsStrip>
          @for (product of post.products; track product.id) {
            <div class="tagged-product">
              <a class="tp-link" [routerLink]="['/product', product.id]">
                <div class="tp-media">
                  @if (product.productImageUrl) {
                    <img [src]="product.productImageUrl | mediaUrl" [alt]="product.name">
                  } @else {
                    <div class="tp-fallback">{{ product.name.charAt(0) }}</div>
                  }
                </div>
                <span class="tp-name">{{ product.name }}</span>
                @if (product.hasDiscount) {
                  <span class="tp-price-row">
                    <span class="tp-price num">{{ product.currency }} {{ product.discountedPrice | number:'1.0-2' }}</span>
                    <span class="tp-mrp">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
                  </span>
                } @else {
                  <span class="tp-price num">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
                }
              </a>
              <div class="tp-actions">
                <button class="tp-btn tp-btn-outline" (click)="addToCart.emit(product)" aria-label="Add to cart">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M4 4h2l1.2 12.4a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L21 8H6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.2" fill="currentColor"/><circle cx="17.5" cy="21" r="1.2" fill="currentColor"/></svg>
                </button>
                <button class="tp-btn tp-btn-accent" (click)="buyNow.emit({product, post})">Buy</button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  </article>
  `,
  styleUrl: './post-card.component.scss'
})
export class PostCardComponent implements AfterViewInit, OnDestroy {
  @Input({ required: true }) post!: Post;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<{ product: Product; post: Post }>();
  @Output() viewed = new EventEmitter<Post>();

  @ViewChild('mediaWrap') mediaWrap?: ElementRef<HTMLDivElement>;
  @ViewChild('videoEl') videoEl?: ElementRef<HTMLVideoElement>;
  @ViewChild('productsStrip') productsStrip?: ElementRef<HTMLDivElement>;

  shareMenuOpen = false;

  private observer?: IntersectionObserver;
  private hasRecordedView = false;

  ngAfterViewInit() {
    if (!this.mediaWrap) return;
    this.observer = new IntersectionObserver(
      (entries) => entries.forEach(entry => this.onIntersect(entry)),
      { threshold: 0.6 }
    );
    this.observer.observe(this.mediaWrap.nativeElement);
  }

  private onIntersect(entry: IntersectionObserverEntry) {
    const video = this.videoEl?.nativeElement;
    if (entry.isIntersecting) {
      video?.play().catch(() => {});
      if (!this.hasRecordedView) {
        this.hasRecordedView = true;
        this.viewed.emit(this.post);
      }
    } else {
      video?.pause();
    }
  }

  togglePlay() {
    const video = this.videoEl?.nativeElement;
    if (!video) return;
    video.paused ? video.play().catch(() => {}) : video.pause();
  }

  toggleMute(evt: Event) {
    evt.stopPropagation();
    this.post.muted = this.post.muted === false ? true : false;
  }

  minPrice(): number {
    return Math.min(...this.post.products.map(p => p.price));
  }

  scrollToProducts() {
    this.productsStrip?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  toggleShareMenu(evt: Event) {
    evt.stopPropagation();
    this.shareMenuOpen = !this.shareMenuOpen;
  }

  @HostListener('document:click')
  closeShareMenu() {
    this.shareMenuOpen = false;
  }

  shareVia(channel: 'email' | 'whatsapp') {
    this.shareMenuOpen = false;
    const product = this.post.products[0];
    const productUrl = product
      ? `${window.location.origin}/product/${product.id}`
      : window.location.origin;

    const title = product ? product.name : this.post.influencerName;
    const priceLine = product ? `${product.currency} ${product.price}` : '';
    const messageLines = [
      `${this.post.influencerName} shared: ${title}`,
      priceLine,
      this.post.caption || '',
      productUrl
    ].filter(Boolean);
    const message = messageLines.join('\n');

    if (channel === 'email') {
      const subject = encodeURIComponent(`Check out: ${title}`);
      const body = encodeURIComponent(message);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    } else {
      const text = encodeURIComponent(message);
      window.open(`https://wa.me/?text=${text}`, '_blank', 'noopener,noreferrer');
    }
  }

  hashtagList(): string[] {
    return (this.post.hashtags || '').split(',').map(t => t.trim()).filter(Boolean);
  }

  slug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '');
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
