import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorefrontAdminService } from '../../core/services/storefront.service';
import { ToastService } from '../../core/services/toast.service';
import { Banner, BannerPlacement, BannerRequest } from '../../core/models/storefront.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { ADMIN_LIST_STYLES } from './admin-shared.styles';

const EMPTY: BannerRequest = {
  placement: 'HOME', imageUrl: '', mobileImageUrl: '', title: '', subtitle: '', ctaLabel: '', linkUrl: '', sortOrder: 0, active: true
};

@Component({
  selector: 'app-admin-banners',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header class="page">
      <div>
        <p class="eyebrow">Storefront</p>
        <h1>Banners</h1>
      </div>
      <button class="btn btn-accent" (click)="openNew()">+ New banner</button>
    </header>

    @if (showForm) {
      <form class="form-card card" (ngSubmit)="save()">
        <h2>{{ editId ? 'Edit banner' : 'New banner' }}</h2>

        <div class="two-col">
          <div class="field">
            <label>Where it appears *</label>
            <select [(ngModel)]="form.placement" name="placement">
              <option value="HOME">Home page (large carousel)</option>
              <option value="COLLECTIONS">Collections page (slim strip)</option>
            </select>
          </div>
          <div class="field">
            <label>Order</label>
            <input type="number" [(ngModel)]="form.sortOrder" name="sortOrder" min="0">
            <span class="hint">Lower numbers show first.</span>
          </div>
        </div>

        <div class="two-col">
          <div class="field">
            <label>Desktop image *</label>
            <label class="upload-btn">
              <input type="file" accept="image/*" (change)="upload($event, 'imageUrl')" hidden>
              {{ uploading === 'imageUrl' ? 'Uploading…' : (form.imageUrl ? 'Replace image' : 'Choose image') }}
            </label>
            <span class="hint">{{ form.placement === 'HOME' ? 'About 2100 × 800 px' : 'About 2400 × 400 px' }}. Keep text off the left third if you add a title.</span>
            @if (form.imageUrl) { <img class="prev wide" [src]="form.imageUrl | mediaUrl" alt=""> }
          </div>
          <div class="field">
            <label>Mobile image <span class="hint">(optional)</span></label>
            <label class="upload-btn">
              <input type="file" accept="image/*" (change)="upload($event, 'mobileImageUrl')" hidden>
              {{ uploading === 'mobileImageUrl' ? 'Uploading…' : (form.mobileImageUrl ? 'Replace image' : 'Choose image') }}
            </label>
            <span class="hint">{{ form.placement === 'HOME' ? 'About 1200 × 900 px' : 'About 1200 × 400 px' }}. Falls back to the desktop image.</span>
            @if (form.mobileImageUrl) { <img class="prev" [src]="form.mobileImageUrl | mediaUrl" alt=""> }
          </div>
        </div>

        <div class="two-col">
          <div class="field">
            <label>Title</label>
            <input [(ngModel)]="form.title" name="title" maxlength="120" placeholder="Leave blank if the image has its own text">
          </div>
          <div class="field">
            <label>Button label</label>
            <input [(ngModel)]="form.ctaLabel" name="ctaLabel" maxlength="40" placeholder="e.g. Shop now">
          </div>
        </div>
        <div class="field">
          <label>Subtitle</label>
          <input [(ngModel)]="form.subtitle" name="subtitle" maxlength="240">
        </div>
        <div class="field">
          <label>Link</label>
          <input [(ngModel)]="form.linkUrl" name="linkUrl" maxlength="1024" placeholder="/categories?category=Fragrance  or  /product/12">
          <span class="hint">A store path starting with / or a full https:// address.</span>
        </div>
        <label class="check"><input type="checkbox" [(ngModel)]="form.active" name="active"> Show on the store</label>

        @if (error) { <p class="error">{{ error }}</p> }
        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="showForm = false">Cancel</button>
          <button type="submit" class="btn btn-accent" [disabled]="saving || !form.imageUrl || !!uploading">{{ saving ? 'Saving…' : 'Save banner' }}</button>
        </div>
      </form>
    }

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (banners.length === 0) {
      <div class="empty-state">
        <h3>No banners yet</h3>
        <p>Add one for the home page carousel or the Collections page strip.</p>
      </div>
    } @else {
      @for (group of groups; track group.key) {
        <h2 class="group-title">{{ group.label }}</h2>
        <div class="table card">
          @for (b of byPlacement(group.key); track b.id) {
            <div class="row" style="grid-template-columns: 180px 1fr auto auto">
              <img class="thumb" [src]="b.imageUrl | mediaUrl" alt="">
              <div>
                <strong>{{ b.title || 'Untitled banner' }}</strong>
                <div class="muted small">{{ b.linkUrl || 'No link' }} · order {{ b.sortOrder }}</div>
              </div>
              <span class="status" [class.ok]="b.active">{{ b.active ? 'Live' : 'Hidden' }}</span>
              <div class="row-actions">
                <button class="btn btn-outline btn-sm" (click)="openEdit(b)">Edit</button>
                <button class="btn btn-ghost btn-sm" (click)="toggle(b)">{{ b.active ? 'Hide' : 'Show' }}</button>
                <button class="btn btn-ghost btn-sm danger" (click)="remove(b)">Delete</button>
              </div>
            </div>
          } @empty {
            <div class="row muted">None yet.</div>
          }
        </div>
      }
    }
  </div>
  `,
  styles: [ADMIN_LIST_STYLES, `
    .prev { margin-top: 8px; max-width: 160px; border-radius: 8px; display: block; }
    .prev.wide { max-width: 100%; }
    .check { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .thumb { width: 180px; aspect-ratio: 21/8; object-fit: cover; border-radius: 8px; background: var(--paper-deep); }
    .group-title { font-size: 15px; margin: 22px 0 10px; }
  `]
})
export class AdminBannersComponent implements OnInit {
  private api = inject(StorefrontAdminService);
  private toast = inject(ToastService);

  readonly groups: { key: BannerPlacement; label: string }[] = [
    { key: 'HOME', label: 'Home page carousel' },
    { key: 'COLLECTIONS', label: 'Collections page strip' },
  ];

  banners: Banner[] = [];
  loading = true;
  showForm = false;
  editId: number | null = null;
  form: BannerRequest = { ...EMPTY };
  saving = false;
  uploading: 'imageUrl' | 'mobileImageUrl' | null = null;
  error = '';

  ngOnInit() { this.load(); }

  byPlacement(p: BannerPlacement) { return this.banners.filter(b => b.placement === p); }

  load() {
    this.loading = true;
    this.api.banners().subscribe({
      next: list => { this.banners = list; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Could not load banners'); }
    });
  }

  openNew() {
    this.editId = null;
    this.form = { ...EMPTY };
    this.error = '';
    this.showForm = true;
  }

  openEdit(b: Banner) {
    this.editId = b.id;
    this.form = {
      placement: b.placement, imageUrl: b.imageUrl, mobileImageUrl: b.mobileImageUrl ?? '', title: b.title ?? '',
      subtitle: b.subtitle ?? '', ctaLabel: b.ctaLabel ?? '', linkUrl: b.linkUrl ?? '', sortOrder: b.sortOrder, active: b.active
    };
    this.error = '';
    this.showForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  upload(e: Event, field: 'imageUrl' | 'mobileImageUrl') {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.uploading = field;
    this.api.uploadBannerImage(file).subscribe({
      next: r => { this.form[field] = r.url; this.uploading = null; },
      error: err => { this.uploading = null; this.toast.error(err?.error?.message || 'Upload failed'); }
    });
  }

  save() {
    const clean = (v?: string | null) => (v ?? '').trim() || null;
    const payload: BannerRequest = {
      ...this.form,
      mobileImageUrl: clean(this.form.mobileImageUrl), title: clean(this.form.title), subtitle: clean(this.form.subtitle),
      ctaLabel: clean(this.form.ctaLabel), linkUrl: clean(this.form.linkUrl), sortOrder: Number(this.form.sortOrder) || 0
    };
    this.saving = true;
    this.error = '';
    const req = this.editId ? this.api.updateBanner(this.editId, payload) : this.api.createBanner(payload);
    req.subscribe({
      next: () => { this.saving = false; this.showForm = false; this.toast.success('Banner saved'); this.load(); },
      error: err => { this.saving = false; this.error = err?.error?.message || 'Could not save banner'; }
    });
  }

  toggle(b: Banner) {
    this.api.setBannerActive(b.id, !b.active).subscribe({
      next: updated => this.banners = this.banners.map(x => x.id === b.id ? updated : x),
      error: () => this.toast.error('Could not update banner')
    });
  }

  remove(b: Banner) {
    if (!confirm('Delete this banner?')) return;
    this.api.deleteBanner(b.id).subscribe({
      next: () => this.banners = this.banners.filter(x => x.id !== b.id),
      error: () => this.toast.error('Could not delete banner')
    });
  }
}
