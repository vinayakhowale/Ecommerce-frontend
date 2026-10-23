import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorefrontAdminService } from '../../core/services/storefront.service';
import { ToastService } from '../../core/services/toast.service';
import { CreatorVideo } from '../../core/models/storefront.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { ADMIN_LIST_STYLES } from './admin-shared.styles';

/** Videos creators uploaded from their own accounts, waiting for approval before they go on the home page. */
@Component({
  selector: 'app-admin-creator-videos',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header class="page">
      <div>
        <p class="eyebrow">Creators</p>
        <h1>Video approvals</h1>
      </div>
      <span class="muted small">Approved videos appear in “See what the hype's about” on the home page. Manage live ones under Posts.</span>
    </header>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (videos.length === 0) {
      <div class="empty-state">
        <h3>All caught up</h3>
        <p>No videos are waiting for review.</p>
      </div>
    } @else {
      <div class="grid">
        @for (v of videos; track v.id) {
          <article class="card v">
            <video [src]="v.mediaUrl | mediaUrl" [poster]="(v.thumbnailUrl | mediaUrl) || null" controls playsinline preload="metadata"></video>
            <div class="body">
              <strong>{{ v.influencerName }}</strong>
              <span class="muted small">{{ v.createdAt | date:'d MMM y, h:mm a' }}</span>
              <p class="small"><span class="muted">Products:</span> {{ names(v) }}</p>
              @if (v.caption) { <p class="small cap">{{ v.caption }}</p> }
              @if (v.hashtags) { <p class="small muted">{{ v.hashtags }}</p> }
              @if (rejecting === v.id) {
                <div class="field">
                  <label>Reason (shown to the creator)</label>
                  <input [(ngModel)]="note" name="note" maxlength="512" placeholder="e.g. Product isn't clearly visible">
                </div>
                <div class="row-actions">
                  <button class="btn btn-ghost btn-sm" (click)="rejecting = null">Cancel</button>
                  <button class="btn btn-outline btn-sm danger" [disabled]="busy === v.id" (click)="reject(v)">Reject</button>
                </div>
              } @else {
                <div class="row-actions">
                  <button class="btn btn-ghost btn-sm danger" (click)="rejecting = v.id; note = ''">Reject…</button>
                  <button class="btn btn-accent btn-sm" [disabled]="busy === v.id" (click)="approve(v)">Approve &amp; publish</button>
                </div>
              }
            </div>
          </article>
        }
      </div>
    }
  </div>
  `,
  styles: [ADMIN_LIST_STYLES, `
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
    .v { overflow: hidden; padding: 0; display: flex; flex-direction: column; }
    .v video { width: 100%; aspect-ratio: 9/16; max-height: 420px; object-fit: cover; background: #000; }
    .body { padding: 14px; display: flex; flex-direction: column; gap: 4px; }
    .body p { margin: 4px 0 0; }
    .cap { white-space: pre-line; }
    .row-actions { justify-content: flex-start; margin-top: 10px; }
  `]
})
export class AdminCreatorVideosComponent implements OnInit {
  private api = inject(StorefrontAdminService);
  private toast = inject(ToastService);

  videos: CreatorVideo[] = [];
  loading = true;
  rejecting: number | null = null;
  busy: number | null = null;
  note = '';

  ngOnInit() {
    this.api.pendingVideos().subscribe({
      next: p => { this.videos = p.content; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Could not load videos'); }
    });
  }

  names(v: CreatorVideo) { return v.products?.map(p => p.name).join(', ') || '—'; }

  approve(v: CreatorVideo) {
    this.busy = v.id;
    this.api.approveVideo(v.id).subscribe({
      next: () => { this.busy = null; this.drop(v); this.toast.success('Approved — it’s live on the home page'); },
      error: e => { this.busy = null; this.toast.error(e?.error?.message || 'Could not approve'); }
    });
  }

  reject(v: CreatorVideo) {
    this.busy = v.id;
    this.api.rejectVideo(v.id, this.note.trim()).subscribe({
      next: () => { this.busy = null; this.rejecting = null; this.drop(v); this.toast.success('Rejected'); },
      error: e => { this.busy = null; this.toast.error(e?.error?.message || 'Could not reject'); }
    });
  }

  private drop(v: CreatorVideo) { this.videos = this.videos.filter(x => x.id !== v.id); }
}
