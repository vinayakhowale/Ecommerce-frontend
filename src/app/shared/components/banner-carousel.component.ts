import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { StorefrontService } from '../../core/services/storefront.service';
import { Banner, BannerPlacement } from '../../core/models/storefront.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

/**
 * Admin-managed banners. "HOME" is a tall hero carousel; "COLLECTIONS" is a slim strip.
 * Renders nothing at all when no banner is active, so the page never shows an empty box.
 */
@Component({
  selector: 'app-banner-carousel',
  standalone: true,
  imports: [RouterLink, NgTemplateOutlet, MediaUrlPipe],
  template: `
  @if (banners().length) {
    <section class="banners" [class.slim]="variant === 'slim'" aria-roledescription="carousel" aria-label="Featured">
      <div class="track" [style.transform]="'translateX(-' + index() * 100 + '%)'"
           (touchstart)="touchStart($event)" (touchend)="touchEnd($event)">
        @for (b of banners(); track b.id; let i = $index) {
          <div class="slide" [attr.aria-hidden]="i !== index()" role="group" [attr.aria-label]="(i + 1) + ' of ' + banners().length">
            @if (isInternal(b.linkUrl)) {
              <a class="slide-link" [routerLink]="path(b.linkUrl!)" [queryParams]="query(b.linkUrl!)" [attr.tabindex]="i === index() ? 0 : -1">
                <ng-container *ngTemplateOutlet="body; context: { $implicit: b, i: i }"></ng-container>
              </a>
            } @else if (b.linkUrl) {
              <a class="slide-link" [href]="b.linkUrl" target="_blank" rel="noopener" [attr.tabindex]="i === index() ? 0 : -1">
                <ng-container *ngTemplateOutlet="body; context: { $implicit: b, i: i }"></ng-container>
              </a>
            } @else {
              <div class="slide-link">
                <ng-container *ngTemplateOutlet="body; context: { $implicit: b, i: i }"></ng-container>
              </div>
            }
          </div>
        }
      </div>

      <ng-template #body let-b let-i="i">
        <picture>
          @if (b.mobileImageUrl) { <source media="(max-width: 640px)" [srcset]="b.mobileImageUrl | mediaUrl"> }
          <img [src]="b.imageUrl | mediaUrl" [alt]="b.title || ''" [attr.loading]="i === 0 ? 'eager' : 'lazy'"
               [attr.fetchpriority]="i === 0 ? 'high' : null">
        </picture>
        @if (b.title || b.subtitle || b.ctaLabel) {
          <div class="copy">
            @if (b.title) { <h2>{{ b.title }}</h2> }
            @if (b.subtitle) { <p>{{ b.subtitle }}</p> }
            @if (b.ctaLabel) { <span class="cta">{{ b.ctaLabel }}</span> }
          </div>
        }
      </ng-template>

      @if (banners().length > 1) {
        <button class="nav prev" (click)="go(-1)" aria-label="Previous banner">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14.5 6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <button class="nav next" (click)="go(1)" aria-label="Next banner">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.5 6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        <div class="dots">
          @for (b of banners(); track b.id; let i = $index) {
            <button [class.on]="i === index()" (click)="show(i)" [attr.aria-label]="'Show banner ' + (i + 1)"></button>
          }
        </div>
      }
    </section>
  }
  `,
  styles: [`
    .banners { position: relative; overflow: hidden; border-radius: var(--r-lg); background: var(--paper-deep); }
    .track { display: flex; transition: transform 600ms var(--ease-out); }
    .slide { flex: 0 0 100%; min-width: 0; }
    .slide-link { display: block; position: relative; aspect-ratio: 21 / 8; color: #fff; }
    .slim .slide-link { aspect-ratio: 6 / 1; }
    picture, img { display: block; width: 100%; height: 100%; }
    img { object-fit: cover; }
    .copy {
      position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: center; align-items: flex-start;
      gap: .6rem; padding: clamp(1rem, 5vw, 4rem);
      background: linear-gradient(90deg, rgba(20,18,16,.55) 0%, rgba(20,18,16,.15) 55%, transparent 80%);
    }
    .copy h2 { color: #fff; font-size: clamp(1.4rem, 1rem + 2.6vw, 3.2rem); max-width: 16ch; line-height: 1.05; }
    .copy p { color: rgba(255,255,255,.88); max-width: 40ch; font-size: clamp(.85rem, .8rem + .3vw, 1.05rem); margin: 0; }
    .cta { margin-top: .4rem; background: #fff; color: var(--ink); font-weight: 700; font-size: var(--t-sm); padding: .7rem 1.4rem; border-radius: var(--r-pill); }
    .slim .copy { gap: .2rem; padding-block: .75rem; }
    .slim .copy h2 { font-size: clamp(1.05rem, .9rem + 1.2vw, 1.9rem); max-width: 28ch; }
    .slim .copy p { font-size: var(--t-xs); }
    .slim .cta { padding: .45rem 1rem; font-size: var(--t-xs); margin-top: .25rem; }

    .nav {
      position: absolute; top: 50%; translate: 0 -50%; width: 40px; height: 40px; border-radius: 50%; border: 0;
      background: rgba(255,255,255,.88); color: var(--ink); display: grid; place-items: center; cursor: pointer;
      opacity: 0; transition: opacity var(--dur-fast);
    }
    .nav svg { width: 20px; height: 20px; }
    .prev { left: .75rem; } .next { right: .75rem; }
    .banners:hover .nav, .nav:focus-visible { opacity: 1; }
    .slim .nav { width: 32px; height: 32px; }
    .dots { position: absolute; bottom: .75rem; left: 50%; translate: -50% 0; display: flex; gap: 6px; }
    .dots button { width: 8px; height: 8px; border-radius: 99px; border: 0; padding: 0; background: rgba(255,255,255,.55); cursor: pointer; transition: width var(--dur-fast), background var(--dur-fast); }
    .dots button.on { width: 22px; background: #fff; }
    .slim .dots { bottom: .4rem; }

    @media (max-width: 640px) {
      .banners { border-radius: var(--r-md); }
      .slide-link { aspect-ratio: 4 / 3; }
      .slim .slide-link { aspect-ratio: 3 / 1; }
      .copy { background: linear-gradient(0deg, rgba(20,18,16,.6) 0%, transparent 70%); justify-content: flex-end; }
      .slim .copy { justify-content: center; background: linear-gradient(90deg, rgba(20,18,16,.55), transparent 85%); }
      .nav { display: none; }
    }
    @media (prefers-reduced-motion: reduce) { .track { transition: none; } }
  `]
})
export class BannerCarouselComponent implements OnInit, OnDestroy {
  @Input({ required: true }) placement!: BannerPlacement;
  @Input() variant: 'hero' | 'slim' = 'hero';
  /** How many active banners there are, once known (0 on error). */
  @Output() loaded = new EventEmitter<number>();

  private api = inject(StorefrontService);
  readonly banners = signal<Banner[]>([]);
  readonly index = signal(0);
  private timer: ReturnType<typeof setInterval> | null = null;
  private touchX = 0;

  ngOnInit() {
    this.api.banners(this.placement).subscribe({
      next: list => { this.banners.set(list); this.loaded.emit(list.length); this.restart(); },
      error: () => { this.banners.set([]); this.loaded.emit(0); }
    });
  }

  ngOnDestroy() { this.stop(); }

  go(delta: number) {
    const n = this.banners().length;
    this.show((this.index() + delta + n) % n);
  }

  show(i: number) {
    this.index.set(i);
    this.restart();
  }

  touchStart(e: TouchEvent) { this.touchX = e.touches[0].clientX; }
  touchEnd(e: TouchEvent) {
    const dx = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(dx) > 40) this.go(dx < 0 ? 1 : -1);
  }

  isInternal(url?: string): boolean { return !!url && url.startsWith('/'); }
  path(url: string): string { return url.split('?')[0]; }
  query(url: string): Record<string, string> | null {
    const q = url.split('?')[1];
    if (!q) return null;
    const out: Record<string, string> = {};
    new URLSearchParams(q).forEach((v, k) => out[k] = v);
    return out;
  }

  private restart() {
    this.stop();
    const reduce = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (this.banners().length > 1 && !reduce) this.timer = setInterval(() => this.go(1), 6000);
  }
  private stop() { if (this.timer) { clearInterval(this.timer); this.timer = null; } }
}
