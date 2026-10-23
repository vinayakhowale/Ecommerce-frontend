import { Injectable, Signal, computed, inject, signal } from '@angular/core';
import { StorefrontService } from './storefront.service';
import { ReviewSummary } from '../models/storefront.model';

/**
 * Star ratings for product cards. Each card asks for its own product, but the requests made in the
 * same tick are batched into one API call, so a grid of 40 cards costs a single request.
 */
@Injectable({ providedIn: 'root' })
export class ReviewSummaryService {
  private api = inject(StorefrontService);
  private readonly cache = signal<Record<number, ReviewSummary>>({});
  private readonly requested = new Set<number>();
  private queue = new Set<number>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  summary(productId: number): Signal<ReviewSummary | undefined> {
    this.request(productId);
    return computed(() => this.cache()[productId]);
  }

  /** Forget a product's cached rating, e.g. after the user posts a review. */
  invalidate(productId: number) {
    this.requested.delete(productId);
    this.request(productId);
  }

  private request(id: number) {
    if (this.requested.has(id)) return;
    this.requested.add(id);
    this.queue.add(id);
    if (!this.timer) this.timer = setTimeout(() => this.flush(), 30);
  }

  private flush() {
    this.timer = null;
    const ids = [...this.queue];
    this.queue.clear();
    for (let i = 0; i < ids.length; i += 100) {
      const chunk = ids.slice(i, i + 100);
      this.api.reviewSummaries(chunk).subscribe({
        next: list => this.cache.update(c => {
          const next = { ...c };
          for (const s of list) next[s.productId] = s;
          return next;
        }),
        // Let a later card try again rather than caching the failure.
        error: () => chunk.forEach(id => this.requested.delete(id))
      });
    }
  }
}
