import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { CartAnalyticsRow } from '../../core/models/cart-analytics.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-cart-analytics',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header>
      <p class="eyebrow">Live carts</p>
      <h1>Cart Analytics</h1>
      <p class="sub">Every product currently sitting in a customer's cart, right now, across all users — sorted oldest-first so the most likely abandoned items surface at the top.</p>
    </header>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (rows.length === 0) {
      <div class="empty-state">
        <span class="emoji">🛒</span>
        <h3>No items in any cart right now</h3>
      </div>
    } @else {
      <div class="summary-row">
        <div class="summary-card">
          <span class="summary-label">Items in carts</span>
          <span class="summary-value num">{{ rows.length }}</span>
        </div>
        <div class="summary-card">
          <span class="summary-label">Distinct customers</span>
          <span class="summary-value num">{{ distinctUsers() }}</span>
        </div>
        <div class="summary-card accent">
          <span class="summary-label">Longest-waiting item</span>
          <span class="summary-value num">{{ rows[0].durationLabel }}</span>
        </div>
      </div>

      <div class="table card">
        <div class="row head">
          <span>Customer</span><span>Product</span><span>Qty</span><span>Added</span><span>Time in cart</span><span>Value</span>
        </div>
        @for (r of rows; track r.cartItemId) {
          <div class="row" [class.stale]="r.minutesInCart > 1440">
            <div class="user-cell">
              <span class="user-name">{{ r.userName }}</span>
              <span class="user-email">{{ r.userEmail }}</span>
            </div>
            <div class="product-cell">
              @if (r.productImageUrl) { <img [src]="r.productImageUrl | mediaUrl" [alt]="r.productName"> }
              @else { <div class="cell-fallback">{{ r.productName.charAt(0) }}</div> }
              <span>{{ r.productName }}</span>
            </div>
            <span class="num">{{ r.quantity }}</span>
            <span class="added-cell">{{ r.addedAt | date:'MMM d, h:mm a' }}</span>
            <span class="duration-chip" [class.warn]="r.minutesInCart > 1440">{{ r.durationLabel }}</span>
            <span class="num">{{ r.currency }} {{ (r.unitPrice * r.quantity) | number:'1.0-2' }}</span>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    header { margin-bottom: 24px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 8px; }
    .sub { color: var(--ink-soft); font-size: 13.5px; max-width: 640px; line-height: 1.6; }
    .table-skel { height: 300px; }
    .summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin: 22px 0; }
    .summary-card { background: var(--surface); border-radius: var(--r-md); padding: 18px 20px; box-shadow: var(--shadow-card); }
    .summary-card.accent { background: var(--ink); }
    .summary-card.accent .summary-label { color: rgba(238,241,239,0.6); }
    .summary-card.accent .summary-value { color: var(--mist); }
    .summary-label { display: block; font-size: 12px; color: var(--ink-soft); font-weight: 700; margin-bottom: 8px; }
    .summary-value { font-size: 24px; }
    .table { overflow: hidden; }
    .row {
      display: grid; grid-template-columns: 1.3fr 1.6fr 0.5fr 1.1fr 1fr 0.9fr; align-items: center; gap: 12px;
      padding: 14px 20px; border-bottom: 1px solid var(--mist-deep); font-size: 13.5px;
    }
    .row:last-child { border-bottom: none; }
    .row.head { font-weight: 700; color: var(--ink-soft); font-size: 11px; text-transform: uppercase; background: var(--mist); }
    .row.stale { background: var(--poppy-wash); }
    .user-cell { display: flex; flex-direction: column; gap: 2px; }
    .user-name { font-weight: 600; }
    .user-email { font-size: 11.5px; color: var(--ink-soft); }
    .product-cell { display: flex; align-items: center; gap: 10px; }
    .product-cell img { width: 34px; height: 34px; border-radius: 8px; object-fit: cover; }
    .cell-fallback { width: 34px; height: 34px; border-radius: 8px; background: var(--poppy-wash); color: var(--poppy); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 13px; }
    .added-cell { color: var(--ink-soft); font-size: 12.5px; }
    .duration-chip { font-weight: 700; padding: 4px 10px; border-radius: 999px; background: var(--jade-wash); color: var(--jade-deep); width: fit-content; font-size: 12px; }
    .duration-chip.warn { background: var(--poppy-wash); color: var(--poppy-deep); }
    @media (max-width: 1000px) {
      .row { grid-template-columns: 1fr; gap: 6px; }
      .row.head { display: none; }
    }
  `]
})
export class AdminCartAnalyticsComponent implements OnInit {
  rows: CartAnalyticsRow[] = [];
  loading = true;

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.loading = true;
    this.adminService.listCartAnalytics(0, 200).subscribe({
      next: (res) => {
        // Longest-waiting first, matching the "likely abandoned" priority described in the header.
        this.rows = [...res.content].sort((a, b) => b.minutesInCart - a.minutesInCart);
        this.loading = false;
      },
      error: () => {
        this.toast.error('Could not load cart analytics');
        this.loading = false;
      }
    });
  }

  distinctUsers(): number {
    return new Set(this.rows.map(r => r.userId)).size;
  }
}
