import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontAdminService } from '../../core/services/storefront.service';
import { ToastService } from '../../core/services/toast.service';
import { Review } from '../../core/models/storefront.model';
import { StarRatingComponent } from '../../shared/components/star-rating.component';
import { ADMIN_LIST_STYLES } from './admin-shared.styles';

/** Every product review, newest first, with the option to remove spam or abuse. */
@Component({
  selector: 'app-admin-reviews',
  standalone: true,
  imports: [CommonModule, RouterLink, StarRatingComponent],
  template: `
  <div class="admin-page">
    <header class="page">
      <div>
        <p class="eyebrow">Storefront</p>
        <h1>Reviews</h1>
      </div>
    </header>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (reviews.length === 0) {
      <div class="empty-state"><h3>No reviews yet</h3><p>Customer reviews appear here as soon as they're posted.</p></div>
    } @else {
      <div class="table card">
        @for (r of reviews; track r.id) {
          <div class="row" style="grid-template-columns: 1.2fr 2.4fr auto">
            <div>
              <a class="prod" [routerLink]="['/product', r.productId]" target="_blank">{{ r.productName }}</a>
              <div class="muted small">{{ r.reviewerName }} · {{ r.createdAt | date:'d MMM y' }}
                @if (r.verifiedPurchase) { · <span class="ok">Verified</span> }</div>
            </div>
            <div>
              <app-stars [value]="r.rating" [size]="13" />
              @if (r.title) { <strong class="title">{{ r.title }}</strong> }
              @if (r.comment) { <p class="small body">{{ r.comment }}</p> }
            </div>
            <div class="row-actions"><button class="btn btn-ghost btn-sm danger" (click)="remove(r)">Delete</button></div>
          </div>
        }
      </div>
      @if (totalPages > 1) {
        <div class="pager">
          <button class="btn btn-ghost btn-sm" [disabled]="page === 0" (click)="go(page - 1)">← Prev</button>
          <span>Page {{ page + 1 }} of {{ totalPages }}</span>
          <button class="btn btn-ghost btn-sm" [disabled]="page + 1 >= totalPages" (click)="go(page + 1)">Next →</button>
        </div>
      }
    }
  </div>
  `,
  styles: [ADMIN_LIST_STYLES, `
    .prod { font-weight: 700; }
    .prod:hover { text-decoration: underline; }
    .title { margin-left: 8px; font-size: 13.5px; }
    .body { margin: 6px 0 0; white-space: pre-line; }
    .ok { color: var(--vetiver-deep); font-weight: 700; }
  `]
})
export class AdminReviewsComponent implements OnInit {
  private api = inject(StorefrontAdminService);
  private toast = inject(ToastService);

  reviews: Review[] = [];
  loading = true;
  page = 0;
  totalPages = 0;

  ngOnInit() { this.load(); }
  go(p: number) { this.page = p; this.load(); }

  load() {
    this.loading = true;
    this.api.reviews(this.page).subscribe({
      next: p => { this.reviews = p.content; this.totalPages = p.totalPages; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Could not load reviews'); }
    });
  }

  remove(r: Review) {
    if (!confirm(`Delete this review from ${r.reviewerName}?`)) return;
    this.api.deleteReview(r.id).subscribe({
      next: () => this.reviews = this.reviews.filter(x => x.id !== r.id),
      error: () => this.toast.error('Could not delete review')
    });
  }
}
