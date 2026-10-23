import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StorefrontService } from '../../core/services/storefront.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderTracking } from '../../core/models/storefront.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { BreadcrumbsComponent } from '../../shared/components/breadcrumbs.component';

/** Anyone can look up an order with its ID and the email used to buy; signed-in users also see their orders. */
@Component({
  selector: 'app-track-order',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MediaUrlPipe, BreadcrumbsComponent],
  template: `
  <div class="container track-page">
    <app-breadcrumbs [items]="[{ label: 'Home', link: '/' }, { label: 'Track my order' }]" />

    <header class="page-head">
      <h1>Track your order</h1>
      <p>Enter the order ID from your confirmation and the email you used at checkout.</p>
    </header>

    <div class="layout">
      <form class="card lookup" (ngSubmit)="lookup()" #f="ngForm">
        <div class="field">
          <label for="t-order">Order ID</label>
          <input id="t-order" name="orderNumber" [(ngModel)]="orderNumber" required placeholder="e.g. TRD-000042"
                 autocomplete="off" autocapitalize="characters">
        </div>
        <div class="field">
          <label for="t-email">Email address</label>
          <input id="t-email" name="email" type="email" [(ngModel)]="email" required placeholder="you@example.com" autocomplete="email">
        </div>
        @if (error()) { <p class="error" role="alert">{{ error() }}</p> }
        <button class="btn btn-primary btn-block btn-lg" type="submit" [disabled]="loading() || !orderNumber.trim() || !email.trim()">
          {{ loading() ? 'Looking it up…' : 'Track order' }}
        </button>
        <p class="hint">Can't find your order ID? It's in the payment confirmation and under “Your orders” when you're signed in.</p>
      </form>

      <div class="result">
        @if (result(); as o) {
          <article class="card order" aria-live="polite">
            <div class="o-head">
              <div class="o-thumb">
                @if (o.productImageUrl) { <img [src]="o.productImageUrl | mediaUrl" [alt]="o.productName"> }
              </div>
              <div class="o-info">
                <p class="o-num">Order {{ o.orderNumber }}</p>
                <h2>{{ o.productName }}</h2>
                <p class="o-meta">Qty {{ o.quantity }} · {{ o.currency }} {{ o.totalAmount | number:'1.0-2' }} · Placed {{ o.placedAt | date:'d MMM y' }}</p>
              </div>
              <span class="status" [class.bad]="o.status === 'CANCELLED' || o.status === 'RETURNED'" [class.good]="o.status === 'DELIVERED'">{{ o.statusLabel }}</span>
            </div>

            @if (o.expectedDeliveryDate && o.status !== 'DELIVERED' && o.status !== 'CANCELLED' && o.status !== 'RETURNED') {
              <p class="eta">Expected by <strong>{{ o.expectedDeliveryDate | date:'EEEE, d MMMM' }}</strong></p>
            }

            <ol class="timeline">
              @for (s of o.steps; track s.key) {
                <li [class.done]="s.done" [class.current]="s.current">
                  <span class="dot" aria-hidden="true"></span>
                  <div>
                    <p class="s-label">{{ s.label }}</p>
                    @if (s.at) { <p class="s-at">{{ s.at | date:'d MMM, h:mm a' }}</p> }
                  </div>
                </li>
              }
            </ol>

            @if (o.courierName || o.trackingNumber) {
              <div class="courier">
                @if (o.courierName) { <p><span>Courier</span> {{ o.courierName }}</p> }
                @if (o.trackingNumber) { <p><span>Tracking no.</span> <span class="num">{{ o.trackingNumber }}</span></p> }
                @if (o.trackingUrl) { <a class="btn btn-outline btn-sm" [href]="o.trackingUrl" target="_blank" rel="noopener">Track with courier ↗</a> }
              </div>
            }
            @if (o.note) { <p class="note">{{ o.note }}</p> }
          </article>
        } @else if (auth.isLoggedIn()) {
          <section class="mine">
            <h2>Your orders</h2>
            @if (mineLoading()) {
              <div class="skeleton" style="height: 88px"></div>
            } @else if (mine().length === 0) {
              <p class="muted">No paid orders yet. <a routerLink="/categories">Start shopping</a></p>
            } @else {
              <ul>
                @for (o of mine(); track o.id) {
                  <li>
                    <button type="button" class="mine-row" (click)="result.set(o)">
                      <span class="o-thumb sm">@if (o.productImageUrl) { <img [src]="o.productImageUrl | mediaUrl" alt=""> }</span>
                      <span class="mine-info">
                        <strong>{{ o.productName }}</strong>
                        <span>{{ o.orderNumber }} · {{ o.placedAt | date:'d MMM y' }}</span>
                      </span>
                      <span class="status" [class.good]="o.status === 'DELIVERED'" [class.bad]="o.status === 'CANCELLED' || o.status === 'RETURNED'">{{ o.statusLabel }}</span>
                    </button>
                  </li>
                }
              </ul>
            }
          </section>
        } @else {
          <div class="card placeholder">
            <p>Signed-in customers can see all their orders here. <a routerLink="/auth/login">Log in</a></p>
          </div>
        }
        @if (result() && auth.isLoggedIn() && mine().length > 1) {
          <button class="btn btn-ghost" (click)="result.set(null)">← All your orders</button>
        }
      </div>
    </div>
  </div>
  `,
  styles: [`
    .track-page { padding-bottom: var(--section); }
    .page-head h1 { font-size: var(--t-h1); }
    .page-head p { margin-top: 0.6rem; color: var(--ink-soft); font-size: var(--t-sm); }
    .layout { display: grid; grid-template-columns: minmax(0, 380px) minmax(0, 1fr); gap: clamp(1.25rem, 4vw, 3rem); margin-top: clamp(1.25rem, 3vw, 2rem); align-items: start; }
    .lookup { padding: 1.5rem; }
    .hint { font-size: var(--t-xs); color: var(--ink-faint); margin: 0.9rem 0 0; }
    .error { color: var(--poppy, #c0392b); font-size: var(--t-sm); margin: 0 0 0.8rem; }

    .order { padding: clamp(1.1rem, 3vw, 1.75rem); }
    .o-head { display: grid; grid-template-columns: 72px 1fr auto; gap: 1rem; align-items: center; }
    .o-thumb { width: 72px; aspect-ratio: 4/5; border-radius: var(--r-sm); overflow: hidden; background: var(--paper-deep); display: block; }
    .o-thumb.sm { width: 46px; }
    .o-thumb img { width: 100%; height: 100%; object-fit: cover; }
    .o-num { font-size: var(--t-xs); font-weight: 700; color: var(--ink-faint); margin: 0; letter-spacing: 0.04em; }
    .o-info h2 { font-size: 1.15rem; margin: 0.2rem 0; }
    .o-meta { font-size: var(--t-xs); color: var(--ink-soft); margin: 0; }
    .status { font-size: var(--t-xs); font-weight: 700; padding: 0.35rem 0.7rem; border-radius: var(--r-pill); background: var(--paper-deep); color: var(--ink); white-space: nowrap; }
    .status.good { background: var(--vetiver-wash); color: var(--vetiver-deep); }
    .status.bad { background: var(--brass-wash); color: var(--brass); }
    .eta { margin: 1.1rem 0 0; font-size: var(--t-sm); }

    .timeline { list-style: none; margin: 1.5rem 0 0; padding: 0; }
    .timeline li { position: relative; display: grid; grid-template-columns: 22px 1fr; gap: 0.8rem; padding-bottom: 1.2rem; }
    .timeline li:not(:last-child)::before { content: ''; position: absolute; left: 10px; top: 20px; bottom: -2px; width: 2px; background: var(--line); }
    .timeline li.done:not(:last-child)::before { background: var(--vetiver); }
    .dot { width: 22px; height: 22px; border-radius: 50%; border: 2px solid var(--line-strong); background: var(--surface); box-sizing: border-box; }
    .done .dot { background: var(--vetiver); border-color: var(--vetiver); }
    .current .dot { box-shadow: 0 0 0 5px var(--vetiver-wash); }
    .s-label { margin: 0; font-weight: 600; font-size: var(--t-sm); color: var(--ink-faint); }
    .done .s-label { color: var(--ink); }
    .s-at { margin: 0.15rem 0 0; font-size: var(--t-xs); color: var(--ink-soft); }

    .courier { display: flex; flex-wrap: wrap; align-items: center; gap: 0.6rem 1.5rem; padding-top: 1rem; border-top: 1px solid var(--line); font-size: var(--t-sm); }
    .courier p { margin: 0; }
    .courier p span:first-child { color: var(--ink-faint); margin-right: 0.35rem; }
    .note { margin: 1rem 0 0; font-size: var(--t-sm); color: var(--ink-soft); background: var(--paper-deep); padding: 0.75rem 0.9rem; border-radius: var(--r-sm); }

    .mine h2 { font-size: 1.2rem; margin-bottom: 0.8rem; }
    .mine ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.5rem; }
    .mine-row { width: 100%; display: grid; grid-template-columns: 46px 1fr auto; gap: 0.8rem; align-items: center; text-align: left; padding: 0.6rem; border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); cursor: pointer; }
    .mine-row:hover { border-color: var(--ink); }
    .mine-info { display: flex; flex-direction: column; min-width: 0; font-size: var(--t-xs); color: var(--ink-soft); }
    .mine-info strong { font-size: var(--t-sm); color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .placeholder { padding: 1.5rem; color: var(--ink-soft); font-size: var(--t-sm); }
    .muted { color: var(--ink-soft); }
    a:not(.btn) { text-decoration: underline; text-underline-offset: 3px; }

    @media (max-width: 760px) {
      .layout { grid-template-columns: 1fr; }
      .o-head { grid-template-columns: 56px 1fr; }
      .o-thumb { width: 56px; }
      .o-head .status { grid-column: 1 / -1; justify-self: start; }
    }
  `]
})
export class TrackOrderComponent implements OnInit {
  readonly auth = inject(AuthService);
  private api = inject(StorefrontService);
  private route = inject(ActivatedRoute);

  orderNumber = '';
  email = '';
  readonly loading = signal(false);
  readonly error = signal('');
  readonly result = signal<OrderTracking | null>(null);
  readonly mine = signal<OrderTracking[]>([]);
  readonly mineLoading = signal(false);

  ngOnInit() {
    const q = this.route.snapshot.queryParamMap;
    this.orderNumber = q.get('order') ?? '';
    this.email = q.get('email') ?? this.auth.currentUser()?.email ?? '';
    if (this.auth.isLoggedIn()) {
      this.mineLoading.set(true);
      this.api.myOrders().subscribe({
        next: list => { this.mine.set(list); this.mineLoading.set(false); },
        error: () => this.mineLoading.set(false)
      });
    }
    if (this.orderNumber && this.email) this.lookup();
  }

  lookup() {
    if (!this.orderNumber.trim() || !this.email.trim()) return;
    this.loading.set(true);
    this.error.set('');
    this.api.trackOrder(this.orderNumber.trim(), this.email.trim()).subscribe({
      next: o => { this.result.set(o); this.loading.set(false); },
      error: e => {
        this.loading.set(false);
        this.result.set(null);
        this.error.set(e?.error?.message || 'We couldn’t find that order. Check the order ID and email and try again.');
      }
    });
  }
}
