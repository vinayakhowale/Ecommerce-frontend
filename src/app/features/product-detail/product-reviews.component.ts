import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { StorefrontService } from '../../core/services/storefront.service';
import { ReviewSummaryService } from '../../core/services/review-summary.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Review, ReviewDetail } from '../../core/models/storefront.model';
import { StarRatingComponent } from '../../shared/components/star-rating.component';

/** Ratings summary, star breakdown, the review list, and a form to write or edit your own. */
@Component({
  selector: 'app-product-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, StarRatingComponent],
  template: `
  <section class="reviews" id="reviews" aria-labelledby="reviews-title">
    <div class="section-head">
      <h2 id="reviews-title">Customer reviews</h2>
      @if (detail(); as d) { @if (d.reviewCount) { <span class="side">{{ d.reviewCount }} {{ d.reviewCount === 1 ? 'review' : 'reviews' }}</span> } }
    </div>

    <div class="layout">
      <aside class="summary">
        @if (detail(); as d) {
          <div class="avg">
            <span class="avg-num num">{{ d.reviewCount ? (d.averageRating | number:'1.1-1') : '–' }}</span>
            <div>
              <app-stars [value]="d.averageRating" [size]="18" />
              <p class="based">{{ d.reviewCount ? 'Based on ' + d.reviewCount + (d.reviewCount === 1 ? ' review' : ' reviews') : 'No reviews yet' }}</p>
            </div>
          </div>
          <ul class="bars">
            @for (star of [5,4,3,2,1]; track star) {
              <li>
                <span class="lbl">{{ star }} ★</span>
                <span class="bar"><span [style.width.%]="pct(d, star)"></span></span>
                <span class="cnt num">{{ d.distribution[star] || 0 }}</span>
              </li>
            }
          </ul>
        }

        @if (!formOpen()) {
          @if (auth.isLoggedIn()) {
            <button class="btn btn-outline btn-block" (click)="openForm()">{{ mine() ? 'Edit your review' : 'Write a review' }}</button>
          } @else {
            <a class="btn btn-outline btn-block" routerLink="/auth/login">Log in to write a review</a>
          }
        }
      </aside>

      <div class="main">
        @if (formOpen()) {
          <form class="form card" (ngSubmit)="submit()">
            <p class="form-title">{{ mine() ? 'Edit your review' : 'Write a review' }}</p>
            <div class="pick" role="radiogroup" aria-label="Your rating">
              @for (s of [1,2,3,4,5]; track s) {
                <button type="button" role="radio" [attr.aria-checked]="rating === s" [attr.aria-label]="s + ' star' + (s > 1 ? 's' : '')"
                        [class.on]="(hover || rating) >= s" (mouseenter)="hover = s" (mouseleave)="hover = 0" (click)="rating = s">★</button>
              }
              <span class="pick-label">{{ ratingWords[(hover || rating)] }}</span>
            </div>
            <div class="field">
              <label for="rv-title">Headline</label>
              <input id="rv-title" name="title" [(ngModel)]="title" maxlength="120" placeholder="Sum it up in a few words">
            </div>
            <div class="field">
              <label for="rv-comment">Your review</label>
              <textarea id="rv-comment" name="comment" [(ngModel)]="comment" maxlength="2000" rows="4"
                        placeholder="What did you like or dislike? How did it fit, smell, last?"></textarea>
            </div>
            @if (error()) { <p class="error">{{ error() }}</p> }
            <div class="actions">
              <button type="button" class="btn btn-ghost" (click)="formOpen.set(false)">Cancel</button>
              <button type="submit" class="btn btn-primary" [disabled]="!rating || saving()">{{ saving() ? 'Saving…' : 'Post review' }}</button>
            </div>
          </form>
        }

        @if (reviews().length === 0 && !loading()) {
          <p class="none">Be the first to review this product.</p>
        }
        <ul class="list">
          @for (r of reviews(); track r.id) {
            <li class="review">
              <div class="r-head">
                <app-stars [value]="r.rating" [size]="14" />
                @if (r.title) { <strong>{{ r.title }}</strong> }
              </div>
              @if (r.comment) { <p class="r-body">{{ r.comment }}</p> }
              <p class="r-meta">
                {{ r.reviewerName }} · {{ r.createdAt | date:'d MMM y' }}
                @if (r.verifiedPurchase) { <span class="verified">✓ Verified purchase</span> }
              </p>
            </li>
          }
        </ul>
        @if (!last()) {
          <button class="btn btn-outline btn-sm" (click)="loadMore()" [disabled]="loading()">{{ loading() ? 'Loading…' : 'More reviews' }}</button>
        }
      </div>
    </div>
  </section>
  `,
  styles: [`
    .reviews { padding-block: clamp(2rem, 5vw, 4rem); border-top: 1px solid var(--line); scroll-margin-top: 90px; }
    .layout { display: grid; grid-template-columns: 300px minmax(0, 1fr); gap: clamp(1.5rem, 4vw, 3.5rem); align-items: start; }
    .summary { display: flex; flex-direction: column; gap: 1.1rem; position: sticky; top: 90px; }
    .avg { display: flex; align-items: center; gap: 0.9rem; }
    .avg-num { font-family: var(--font-display); font-size: 3rem; line-height: 1; }
    .based { font-size: var(--t-xs); color: var(--ink-soft); margin: 0.3rem 0 0; }
    .bars { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; }
    .bars li { display: grid; grid-template-columns: 2.4rem 1fr 2rem; align-items: center; gap: 0.6rem; font-size: var(--t-xs); color: var(--ink-soft); }
    .bar { height: 7px; border-radius: 99px; background: var(--paper-deep); overflow: hidden; }
    .bar span { display: block; height: 100%; background: #e0a526; border-radius: 99px; }
    .cnt { text-align: right; }

    .form { padding: 1.25rem; margin-bottom: 1.5rem; }
    .form-title { font-weight: 700; margin: 0 0 0.6rem; }
    .pick { display: flex; align-items: center; gap: 0.15rem; margin-bottom: 1rem; }
    .pick button { font-size: 1.7rem; line-height: 1; border: 0; background: none; color: var(--line-strong); cursor: pointer; padding: 0.1rem; }
    .pick button.on { color: #e0a526; }
    .pick-label { margin-left: 0.6rem; font-size: var(--t-sm); color: var(--ink-soft); }
    .actions { display: flex; justify-content: flex-end; gap: 0.5rem; }
    .error { color: var(--poppy, #c0392b); font-size: var(--t-sm); }

    .none { color: var(--ink-soft); }
    .list { list-style: none; padding: 0; margin: 0 0 1rem; }
    .review { padding: 1.1rem 0; border-bottom: 1px solid var(--line); }
    .r-head { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; }
    .r-head strong { font-size: var(--t-sm); }
    .r-body { margin: 0.5rem 0 0; font-size: var(--t-sm); line-height: 1.6; white-space: pre-line; color: var(--ink); }
    .r-meta { margin: 0.5rem 0 0; font-size: var(--t-xs); color: var(--ink-faint); display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .verified { color: var(--vetiver-deep); font-weight: 700; }

    @media (max-width: 760px) {
      .layout { grid-template-columns: 1fr; }
      .summary { position: static; }
    }
  `]
})
export class ProductReviewsComponent implements OnInit {
  @Input({ required: true }) productId!: number;

  readonly auth = inject(AuthService);
  private api = inject(StorefrontService);
  private summaries = inject(ReviewSummaryService);
  private toast = inject(ToastService);

  readonly detail = signal<ReviewDetail | null>(null);
  readonly reviews = signal<Review[]>([]);
  readonly mine = signal<Review | null>(null);
  readonly loading = signal(false);
  readonly last = signal(true);
  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  private page = 0;

  rating = 0;
  hover = 0;
  title = '';
  comment = '';
  readonly ratingWords = ['Choose a rating', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

  ngOnInit() {
    this.refresh();
    if (this.auth.isLoggedIn()) {
      this.api.myReview(this.productId).subscribe({ next: r => this.mine.set(r), error: () => {} });
    }
  }

  pct(d: ReviewDetail, star: number): number {
    return d.reviewCount ? ((d.distribution[star] || 0) / d.reviewCount) * 100 : 0;
  }

  openForm() {
    const m = this.mine();
    this.rating = m?.rating ?? 0;
    this.title = m?.title ?? '';
    this.comment = m?.comment ?? '';
    this.error.set('');
    this.formOpen.set(true);
  }

  submit() {
    if (!this.rating) return;
    this.saving.set(true);
    this.error.set('');
    this.api.submitReview(this.productId, {
      rating: this.rating, title: this.title.trim() || undefined, comment: this.comment.trim() || undefined
    }).subscribe({
      next: r => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.mine.set(r);
        this.toast.success('Thanks — your review is live');
        this.summaries.invalidate(this.productId);
        this.refresh();
      },
      error: e => { this.saving.set(false); this.error.set(e?.error?.message || 'Could not save your review'); }
    });
  }

  loadMore() {
    this.page++;
    this.fetchPage();
  }

  private refresh() {
    this.page = 0;
    this.reviews.set([]);
    this.api.reviewDetail(this.productId).subscribe({ next: d => this.detail.set(d), error: () => {} });
    this.fetchPage();
  }

  private fetchPage() {
    this.loading.set(true);
    this.api.reviews(this.productId, this.page, 10).subscribe({
      next: p => {
        this.reviews.update(list => [...list, ...p.content]);
        this.last.set(p.last);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }
}
