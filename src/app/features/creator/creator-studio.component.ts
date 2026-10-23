import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StorefrontService } from '../../core/services/storefront.service';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { CreatorProfile, CreatorVideo } from '../../core/models/storefront.model';
import { Product } from '../../core/models/product.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';

/**
 * Creator studio: an influencer signs in with the email the admin saved on their influencer
 * profile, uploads a video, tags the products it promotes, and submits it for approval.
 */
@Component({
  selector: 'app-creator-studio',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MediaUrlPipe, BreadcrumbsComponent],
  template: `
  <div class="container studio">
    <app-breadcrumbs [items]="[{ label: 'Home', link: '/' }, { label: 'Account', link: '/profile' }, { label: 'Creator studio' }]" />

    @if (state() === 'loading') {
      <div class="skeleton" style="height: 240px"></div>
    } @else if (state() === 'not-creator') {
      <div class="empty-state">
        <h3>This account isn't linked to a creator profile</h3>
        <p>Ask the store team to add your sign-in email to your influencer profile, then come back here to upload videos.</p>
        <a class="btn btn-outline" routerLink="/profile">Back to account</a>
      </div>
    } @else {
      <header class="page-head">
        <div>
          <p class="eyebrow">Creator studio</p>
          <h1>Hi, {{ profile()?.name }}</h1>
          <p class="sub">Upload short videos featuring products from the store. The team reviews each one before it appears on the home page.</p>
        </div>
        @if (profile()?.code) { <span class="code">Your code <strong>{{ profile()!.code }}</strong></span> }
      </header>

      <div class="layout">
        <form class="card upload" (ngSubmit)="submit()">
          <h2>New video</h2>

          <div class="field">
            <label>Video *</label>
            @if (videoUrl()) {
              <div class="preview">
                <video [src]="videoUrl() | mediaUrl" controls playsinline preload="metadata"></video>
                <button type="button" class="btn btn-ghost btn-sm" (click)="videoUrl.set('')">Replace</button>
              </div>
            } @else {
              <label class="drop" [class.busy]="uploading() === 'VIDEO'">
                <input type="file" accept="video/mp4,video/webm,video/quicktime" (change)="upload($event, 'VIDEO')" hidden>
                @if (uploading() === 'VIDEO') { Uploading… large videos can take a minute } @else { Choose a video (MP4, vertical works best) }
              </label>
            }
          </div>

          <div class="field">
            <label>Cover image <span class="opt">(optional)</span></label>
            @if (thumbUrl()) {
              <div class="thumb-row">
                <img [src]="thumbUrl() | mediaUrl" alt="Cover">
                <button type="button" class="btn btn-ghost btn-sm" (click)="thumbUrl.set('')">Remove</button>
              </div>
            } @else {
              <label class="drop small" [class.busy]="uploading() === 'IMAGE'">
                <input type="file" accept="image/*" (change)="upload($event, 'IMAGE')" hidden>
                {{ uploading() === 'IMAGE' ? 'Uploading…' : 'Choose an image' }}
              </label>
            }
          </div>

          <div class="field">
            <label>Products in this video *</label>
            <input type="search" [ngModel]="query()" (ngModelChange)="query.set($event)" name="q" placeholder="Search the store">
            @if (selected().length) {
              <div class="chips">
                @for (p of selected(); track p.id) {
                  <span class="chip">{{ p.name }} <button type="button" (click)="toggle(p)" [attr.aria-label]="'Remove ' + p.name">×</button></span>
                }
              </div>
            }
            <ul class="picker">
              @for (p of filtered(); track p.id) {
                <li>
                  <label>
                    <input type="checkbox" [checked]="isSelected(p)" (change)="toggle(p)">
                    <span class="p-img">@if (img(p)) { <img [src]="img(p) | mediaUrl" alt=""> }</span>
                    <span class="p-name">{{ p.name }}</span>
                  </label>
                </li>
              } @empty {
                <li class="none">No products match.</li>
              }
            </ul>
          </div>

          <div class="field">
            <label for="cap">Caption</label>
            <textarea id="cap" name="caption" [(ngModel)]="caption" rows="3" maxlength="4000" placeholder="What should shoppers know?"></textarea>
          </div>
          <div class="field">
            <label for="tags">Hashtags</label>
            <input id="tags" name="hashtags" [(ngModel)]="hashtags" maxlength="1000" placeholder="#skincare #grwm">
          </div>

          @if (error()) { <p class="error">{{ error() }}</p> }
          <button class="btn btn-primary btn-block" type="submit" [disabled]="saving() || !videoUrl() || !selected().length || !!uploading()">
            {{ saving() ? 'Submitting…' : 'Submit for review' }}
          </button>
        </form>

        <section class="mine">
          <h2>Your videos</h2>
          @if (videos().length === 0) {
            <p class="muted">Nothing uploaded yet.</p>
          }
          <div class="grid">
            @for (v of videos(); track v.id) {
              <article class="v card">
                <div class="v-frame">
                  <video [src]="v.mediaUrl | mediaUrl" [poster]="(v.thumbnailUrl | mediaUrl) || null" muted playsinline preload="metadata"
                         (mouseenter)="$any($event.target).play()" (mouseleave)="$any($event.target).pause()"></video>
                  <span class="badge" [attr.data-s]="statusOf(v)">{{ statusLabel(v) }}</span>
                </div>
                <div class="v-body">
                  <p class="v-products">{{ productNames(v) }}</p>
                  @if (v.reviewStatus === 'REJECTED' && v.reviewNote) { <p class="v-note">“{{ v.reviewNote }}”</p> }
                  <p class="v-meta">{{ v.createdAt | date:'d MMM y' }} · {{ v.viewCount }} views</p>
                  <button class="btn btn-ghost btn-sm" (click)="remove(v)">Delete</button>
                </div>
              </article>
            }
          </div>
        </section>
      </div>
    }
  </div>
  `,
  styles: [`
    .studio { padding-bottom: var(--section); }
    .page-head { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; margin-bottom: clamp(1.25rem, 3vw, 2rem); }
    .eyebrow { font-size: var(--t-xs); font-weight: 700; letter-spacing: .08em; text-transform: uppercase; color: var(--vetiver-deep); margin: 0 0 .4rem; }
    h1 { font-size: var(--t-h1); }
    .sub { color: var(--ink-soft); font-size: var(--t-sm); max-width: 60ch; margin: .6rem 0 0; }
    .code { font-size: var(--t-sm); background: var(--paper-deep); padding: .5rem .9rem; border-radius: var(--r-pill); }
    .layout { display: grid; grid-template-columns: minmax(0, 420px) minmax(0, 1fr); gap: clamp(1.25rem, 4vw, 3rem); align-items: start; }
    .upload { padding: 1.5rem; }
    h2 { font-size: 1.2rem; margin-bottom: 1rem; }
    .opt { font-weight: 500; color: var(--ink-faint); }
    .drop { display: grid; place-items: center; min-height: 120px; border: 1.5px dashed var(--line-strong); border-radius: var(--r-md); color: var(--ink-soft); font-size: var(--t-sm); cursor: pointer; text-align: center; padding: 1rem; }
    .drop.small { min-height: 56px; }
    .drop:hover { border-color: var(--ink); color: var(--ink); }
    .drop.busy { pointer-events: none; opacity: .7; }
    .preview { display: flex; flex-direction: column; gap: .4rem; align-items: flex-start; }
    .preview video { width: 100%; max-height: 360px; border-radius: var(--r-md); background: #000; }
    .thumb-row { display: flex; align-items: center; gap: .75rem; }
    .thumb-row img { width: 64px; height: 64px; object-fit: cover; border-radius: var(--r-sm); }
    .chips { display: flex; flex-wrap: wrap; gap: .35rem; margin-top: .25rem; }
    .chips .chip { display: inline-flex; align-items: center; gap: .3rem; }
    .chips button { border: 0; background: none; cursor: pointer; font-size: 1rem; line-height: 1; color: inherit; }
    .picker { list-style: none; margin: .35rem 0 0; padding: 0; max-height: 240px; overflow-y: auto; border: 1px solid var(--line); border-radius: var(--r-sm); }
    .picker li + li { border-top: 1px solid var(--line); }
    .picker label { display: grid; grid-template-columns: auto 36px 1fr; gap: .6rem; align-items: center; padding: .45rem .6rem; cursor: pointer; font-size: var(--t-sm); font-weight: 500; color: var(--ink); }
    .picker .none { padding: .7rem; color: var(--ink-faint); font-size: var(--t-sm); }
    .p-img { width: 36px; height: 36px; border-radius: 4px; overflow: hidden; background: var(--paper-deep); }
    .p-img img { width: 100%; height: 100%; object-fit: cover; }
    .p-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .error { color: var(--poppy, #c0392b); font-size: var(--t-sm); }
    .muted { color: var(--ink-soft); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 1rem; }
    .v { overflow: hidden; padding: 0; }
    .v-frame { position: relative; aspect-ratio: 9/16; background: #000; }
    .v-frame video { width: 100%; height: 100%; object-fit: cover; }
    .badge { position: absolute; top: .5rem; left: .5rem; font-size: 11px; font-weight: 800; padding: .25rem .55rem; border-radius: 99px; background: #fff; color: var(--ink); }
    .badge[data-s="PENDING"] { background: #fff4d6; color: #8a6100; }
    .badge[data-s="LIVE"] { background: var(--vetiver-wash); color: var(--vetiver-deep); }
    .badge[data-s="REJECTED"] { background: #fde2dd; color: #a3311c; }
    .v-body { padding: .7rem; display: flex; flex-direction: column; gap: .25rem; }
    .v-products { font-size: var(--t-xs); font-weight: 600; margin: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .v-note { font-size: var(--t-xs); color: #a3311c; margin: 0; }
    .v-meta { font-size: 11px; color: var(--ink-faint); margin: 0; }
    .v-body .btn { align-self: flex-start; padding-inline: 0; }
    @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } }
  `]
})
export class CreatorStudioComponent implements OnInit {
  private api = inject(StorefrontService);
  private products = inject(ProductService);
  private toast = inject(ToastService);

  readonly state = signal<'loading' | 'ready' | 'not-creator'>('loading');
  readonly profile = signal<CreatorProfile | null>(null);
  readonly videos = signal<CreatorVideo[]>([]);
  readonly catalogue = signal<Product[]>([]);
  readonly selected = signal<Product[]>([]);
  readonly query = signal('');
  readonly videoUrl = signal('');
  readonly thumbUrl = signal('');
  readonly uploading = signal<'VIDEO' | 'IMAGE' | null>(null);
  readonly progress = signal(0);
  readonly saving = signal(false);
  readonly error = signal('');
  caption = '';
  hashtags = '';

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const list = this.catalogue();
    return (q ? list.filter(p => p.name.toLowerCase().includes(q) || p.brand?.toLowerCase().includes(q)) : list).slice(0, 60);
  });

  ngOnInit() {
    this.api.creatorProfile().subscribe({
      next: p => {
        this.profile.set(p);
        this.state.set('ready');
        this.loadVideos();
        this.products.list(0, 200).subscribe({ next: page => this.catalogue.set(page.content), error: () => {} });
      },
      error: () => this.state.set('not-creator')
    });
  }

  img(p: Product) { return p.imageUrls?.[0] ?? p.productImageUrl; }
  isSelected(p: Product) { return this.selected().some(x => x.id === p.id); }
  toggle(p: Product) {
    this.selected.update(list => this.isSelected(p) ? list.filter(x => x.id !== p.id) : [...list, p]);
  }

  statusOf(v: CreatorVideo): string {
    if (v.reviewStatus === 'REJECTED') return 'REJECTED';
    if (v.status === 'PUBLISHED') return 'LIVE';
    if (v.reviewStatus === 'PENDING') return 'PENDING';
    return v.status;
  }
  statusLabel(v: CreatorVideo): string {
    return ({ REJECTED: 'Not approved', LIVE: 'Live', PENDING: 'In review' } as Record<string, string>)[this.statusOf(v)] ?? 'Hidden';
  }
  productNames(v: CreatorVideo): string {
    return v.products?.map(p => p.name).join(', ') || '—';
  }

  upload(e: Event, type: 'VIDEO' | 'IMAGE') {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (type === 'VIDEO' && file.size > 200 * 1024 * 1024) { this.toast.error('Videos must be under 200 MB'); return; }
    this.uploading.set(type);
    this.progress.set(0);
    this.api.creatorUpload(file, type).subscribe({
      next: res => {
        (type === 'VIDEO' ? this.videoUrl : this.thumbUrl).set(res.url);
        this.uploading.set(null);
      },
      error: err => {
        this.uploading.set(null);
        this.toast.error(err?.error?.message || (err?.status === 413 ? 'That file is too large' : 'Upload failed'));
      }
    });
  }

  submit() {
    if (!this.videoUrl() || !this.selected().length) return;
    this.saving.set(true);
    this.error.set('');
    this.api.submitCreatorVideo({
      mediaUrl: this.videoUrl(),
      thumbnailUrl: this.thumbUrl() || null,
      caption: this.caption.trim() || null,
      hashtags: this.hashtags.trim() || null,
      productIds: this.selected().map(p => p.id)
    }).subscribe({
      next: v => {
        this.saving.set(false);
        this.videos.update(list => [v, ...list]);
        this.videoUrl.set(''); this.thumbUrl.set(''); this.selected.set([]); this.caption = ''; this.hashtags = '';
        this.toast.success('Submitted — we’ll review it shortly');
      },
      error: e => { this.saving.set(false); this.error.set(e?.error?.message || 'Could not submit the video'); }
    });
  }

  remove(v: CreatorVideo) {
    if (!confirm('Delete this video? This can’t be undone.')) return;
    this.api.deleteCreatorVideo(v.id).subscribe({
      next: () => this.videos.update(list => list.filter(x => x.id !== v.id)),
      error: e => this.toast.error(e?.error?.message || 'Could not delete')
    });
  }

  private loadVideos() {
    this.api.creatorVideos().subscribe({ next: list => this.videos.set(list), error: () => {} });
  }
}
