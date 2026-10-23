import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StorefrontAdminService } from '../../core/services/storefront.service';
import { ToastService } from '../../core/services/toast.service';
import { FULFILLMENT_STATUSES, FulfillmentStatus, FulfillmentUpdate, OrderTracking } from '../../core/models/storefront.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';
import { ADMIN_LIST_STYLES } from './admin-shared.styles';

/** Paid orders and their delivery status. What's set here is what customers see on Track my order. */
@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header class="page">
      <div>
        <p class="eyebrow">Fulfilment</p>
        <h1>Orders</h1>
      </div>
    </header>

    <div class="filters">
      <button [class.on]="filter === ''" (click)="setFilter('')">All paid</button>
      @for (s of statuses; track s.value) {
        <button [class.on]="filter === s.value" (click)="setFilter(s.value)">{{ s.label }}</button>
      }
    </div>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (orders.length === 0) {
      <div class="empty-state"><h3>No orders here</h3><p>Paid orders appear as soon as Razorpay confirms them.</p></div>
    } @else {
      <div class="table card">
        <div class="row head" [style.grid-template-columns]="cols"><span>Order</span><span>Customer</span><span>Total</span><span>Status</span><span></span></div>
        @for (o of orders; track o.id) {
          <div class="row" [style.grid-template-columns]="cols">
            <div class="o-cell">
              @if (o.productImageUrl) { <img [src]="o.productImageUrl | mediaUrl" alt=""> }
              <div>
                <strong>{{ o.orderNumber }}</strong>
                <div class="muted small">{{ o.productName }} × {{ o.quantity }} · {{ o.placedAt | date:'d MMM y, h:mm a' }}</div>
              </div>
            </div>
            <div class="small">{{ o.customerName || '—' }}<div class="muted">{{ o.customerEmail }}</div></div>
            <span class="num">{{ o.currency }} {{ o.totalAmount | number:'1.0-2' }}</span>
            <span class="status" [class.ok]="o.status === 'DELIVERED'" [class.bad]="o.status === 'CANCELLED' || o.status === 'RETURNED'"
                  [class.warn]="o.status === 'CONFIRMED'">{{ o.statusLabel }}</span>
            <div class="row-actions"><button class="btn btn-outline btn-sm" (click)="edit(o)">Update</button></div>
          </div>

          @if (editing?.id === o.id) {
            <form class="editor" (ngSubmit)="save()">
              <div class="grid">
                <div class="field">
                  <label>Status *</label>
                  <select [(ngModel)]="form.status" name="status">
                    @for (s of statuses; track s.value) { <option [value]="s.value">{{ s.label }}</option> }
                  </select>
                </div>
                <div class="field">
                  <label>Courier</label>
                  <input [(ngModel)]="form.courierName" name="courierName" maxlength="120" placeholder="Delhivery, Blue Dart…">
                </div>
                <div class="field">
                  <label>Tracking number</label>
                  <input [(ngModel)]="form.trackingNumber" name="trackingNumber" maxlength="64">
                </div>
                <div class="field">
                  <label>Expected delivery</label>
                  <input type="date" [(ngModel)]="form.expectedDeliveryDate" name="expectedDeliveryDate">
                </div>
              </div>
              <div class="field">
                <label>Courier tracking link</label>
                <input [(ngModel)]="form.trackingUrl" name="trackingUrl" maxlength="1024" placeholder="https://…">
              </div>
              <div class="field">
                <label>Note for the customer</label>
                <input [(ngModel)]="form.note" name="note" maxlength="512" placeholder="e.g. Delayed by a day due to weather">
              </div>
              @if (error) { <p class="error">{{ error }}</p> }
              <div class="form-actions">
                <button type="button" class="btn btn-outline btn-sm" (click)="editing = null">Cancel</button>
                <button type="submit" class="btn btn-accent btn-sm" [disabled]="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
              </div>
            </form>
          }
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
    .o-cell { display: flex; gap: 10px; align-items: center; min-width: 0; }
    .o-cell img { width: 40px; height: 48px; object-fit: cover; border-radius: 6px; flex-shrink: 0; }
    .editor { padding: 18px 20px; background: var(--paper-deep); border-bottom: 1px solid var(--line); }
    .editor .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
    @media (max-width: 880px) { .editor .grid { grid-template-columns: 1fr 1fr; } }
  `]
})
export class AdminOrdersComponent implements OnInit {
  private api = inject(StorefrontAdminService);
  private toast = inject(ToastService);

  readonly statuses = FULFILLMENT_STATUSES;
  readonly cols = '2fr 1.4fr 0.8fr 0.9fr auto';
  orders: OrderTracking[] = [];
  filter: FulfillmentStatus | '' = '';
  page = 0;
  totalPages = 0;
  loading = true;
  editing: OrderTracking | null = null;
  form: FulfillmentUpdate = { status: 'CONFIRMED' };
  saving = false;
  error = '';

  ngOnInit() { this.load(); }

  setFilter(f: FulfillmentStatus | '') { this.filter = f; this.page = 0; this.load(); }
  go(p: number) { this.page = p; this.load(); }

  load() {
    this.loading = true;
    this.api.orders(this.filter, this.page).subscribe({
      next: res => { this.orders = res.content; this.totalPages = res.totalPages; this.loading = false; },
      error: () => { this.loading = false; this.toast.error('Could not load orders'); }
    });
  }

  edit(o: OrderTracking) {
    this.editing = this.editing?.id === o.id ? null : o;
    this.error = '';
    this.form = {
      status: o.status, courierName: o.courierName ?? '', trackingNumber: o.trackingNumber ?? '',
      trackingUrl: o.trackingUrl ?? '', expectedDeliveryDate: o.expectedDeliveryDate ?? '', note: o.note ?? ''
    };
  }

  save() {
    if (!this.editing) return;
    const clean = (v?: string | null) => (v ?? '').trim() || null;
    this.saving = true;
    this.error = '';
    this.api.updateFulfillment(this.editing.id, {
      status: this.form.status, courierName: clean(this.form.courierName), trackingNumber: clean(this.form.trackingNumber),
      trackingUrl: clean(this.form.trackingUrl), expectedDeliveryDate: clean(this.form.expectedDeliveryDate), note: clean(this.form.note)
    }).subscribe({
      next: updated => {
        this.saving = false;
        this.orders = this.orders.map(x => x.id === updated.id ? updated : x);
        this.editing = null;
        this.toast.success(`${updated.orderNumber} is now “${updated.statusLabel}”`);
      },
      error: err => { this.saving = false; this.error = err?.error?.message || 'Could not update the order'; }
    });
  }
}
