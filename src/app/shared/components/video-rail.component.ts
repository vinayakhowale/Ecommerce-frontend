import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { StorefrontService } from '../../core/services/storefront.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Post } from '../../core/models/post.model';
import { Product } from '../../core/models/product.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

/**
 * "See what the hype's about": approved creator videos, each with the product it promotes.
 * Videos play muted only while on screen, so a long rail doesn't download everything at once.
 */
@Component({
  selector: 'app-video-rail',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  @if (videos().length) {
    <section class="hype">
      <div class="section-head">
        <h2>{{ heading }}</h2>
        <span class="side">Real creators, real reviews</span>
      </div>
      <div class="rail video-rail">
        @for (v of videos(); track v.id) {
          <article class="clip">
            <div class="frame" (click)="toggleSound(v)">
              <video #vid [src]="v.mediaUrl | mediaUrl" [poster]="(v.thumbnailUrl | mediaUrl) || null"
                     muted loop playsinline preload="metadata" [muted]="v.muted !== false"></video>
              <span class="who">
                @if (v.influencerProfileImageUrl) { <img [src]="v.influencerProfileImageUrl | mediaUrl" alt=""> }
                {{ v.influencerName }}
              </span>
              <button class="sound" type="button" [attr.aria-label]="v.muted === false ? 'Mute' : 'Unmute'"
                      (click)="toggleSound(v); $event.stopPropagation()">
                @if (v.muted === false) {
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                } @else {
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" fill="currentColor"/><path d="m16 9.5 5 5m0-5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
                }
              </button>
            </div>

            @if (v.products[0]; as p) {
              <div class="product">
                <a class="thumb" [routerLink]="['/product', p.id]">
                  @if (image(p)) { <img [src]="image(p) | mediaUrl" [alt]="p.name" loading="lazy"> }
                </a>
                <div class="info">
                  <a class="name" [routerLink]="['/product', p.id]">{{ p.name }}</a>
                  <div class="prices">
                    <span class="price num">{{ p.currency }} {{ (p.hasDiscount ? p.discountedPrice : p.price) | number:'1.0-0' }}</span>
                    @if (p.hasDiscount) {
                      <span class="was num">{{ p.currency }} {{ p.price | number:'1.0-0' }}</span>
                      <span class="off">{{ percentOff(p) }}% off</span>
                    }
                  </div>
                </div>
              </div>
              <button class="btn btn-primary btn-sm btn-block add" (click)="add(p)" [disabled]="adding() === p.id">
                {{ adding() === p.id ? 'Adding…' : 'Add to cart' }}
              </button>
            }
          </article>
        }
      </div>
    </section>
  }
  `,
  styles: [`
    .hype { padding-bottom: clamp(2.5rem, 5vw, 4.5rem); }
    .clip { width: clamp(200px, 58vw, 260px); display: flex; flex-direction: column; gap: 0.6rem; }
    .frame { position: relative; aspect-ratio: 9 / 16; border-radius: var(--r-md); overflow: hidden; background: var(--ink); cursor: pointer; }
    video { width: 100%; height: 100%; object-fit: cover; display: block; }
    .who {
      position: absolute; left: 0.6rem; top: 0.6rem; display: inline-flex; align-items: center; gap: 0.4rem;
      color: #fff; font-size: var(--t-xs); font-weight: 700; text-shadow: 0 1px 4px rgba(0,0,0,.5);
    }
    .who img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1.5px solid #fff; }
    .sound {
      position: absolute; right: 0.55rem; bottom: 0.55rem; width: 34px; height: 34px; border-radius: 50%; border: 0;
      background: rgba(0,0,0,.5); color: #fff; display: grid; place-items: center; cursor: pointer;
    }
    .sound svg { width: 18px; height: 18px; }
    .product { display: grid; grid-template-columns: 46px 1fr; gap: 0.6rem; align-items: center; }
    .thumb { width: 46px; height: 46px; border-radius: var(--r-sm); overflow: hidden; background: var(--paper-deep); display: block; }
    .thumb img { width: 100%; height: 100%; object-fit: cover; }
    .info { min-width: 0; display: flex; flex-direction: column; gap: 0.1rem; }
    .name { font-size: var(--t-sm); font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .name:hover { text-decoration: underline; text-underline-offset: 3px; }
    .prices { display: flex; gap: 0.4rem; align-items: baseline; flex-wrap: wrap; font-size: var(--t-xs); }
    .price { font-size: var(--t-sm); font-weight: 700; color: var(--ink); }
    .was { color: var(--ink-faint); text-decoration: line-through; }
    .off { color: var(--vetiver-deep); font-weight: 700; }
  `]
})
export class VideoRailComponent implements OnInit, AfterViewInit, OnDestroy {
  heading = "See what the hype's about";

  private api = inject(StorefrontService);
  private cart = inject(CartService);
  private auth = inject(AuthService);
  private toast = inject(ToastService);
  private router = inject(Router);

  readonly videos = signal<Post[]>([]);
  readonly adding = signal<number | null>(null);

  @ViewChildren('vid') players!: QueryList<ElementRef<HTMLVideoElement>>;
  private observer?: IntersectionObserver;

  ngOnInit() {
    this.api.videos(0, 12).subscribe({
      next: page => this.videos.set(page.content.filter(v => v.products?.length)),
      error: () => this.videos.set([])
    });
  }

  ngAfterViewInit() {
    if (typeof IntersectionObserver === 'undefined') return;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.observer = new IntersectionObserver(entries => {
      for (const e of entries) {
        const el = e.target as HTMLVideoElement;
        if (e.isIntersecting && !reduce) el.play().catch(() => {});
        else el.pause();
      }
    }, { threshold: 0.6 });
    this.players.changes.subscribe(() => this.observeAll());
    this.observeAll();
  }

  ngOnDestroy() { this.observer?.disconnect(); }

  private observeAll() {
    this.players.forEach(p => {
      p.nativeElement.muted = true;
      this.observer?.observe(p.nativeElement);
    });
  }

  toggleSound(v: Post) {
    const unmute = v.muted !== false ? true : false;
    // Only one clip plays with sound at a time.
    this.videos.update(list => list.map(x => ({ ...x, muted: x.id === v.id ? !unmute : true })));
  }

  image(p: Product): string | undefined {
    return p.imageUrls?.[0] ?? p.productImageUrl;
  }

  percentOff(p: Product): number {
    return p.price > 0 ? Math.round((1 - p.discountedPrice / p.price) * 100) : 0;
  }

  add(p: Product) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    this.adding.set(p.id);
    this.cart.addItem(p.id, 1).subscribe({
      next: () => this.adding.set(null),
      error: (e) => { this.adding.set(null); this.toast.error(e?.error?.message || 'Could not add to cart'); }
    });
  }
}
