import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, DiscountPayload } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Discount, DiscountScope, DiscountType } from '../../core/models/discount.model';
import { Product } from '../../core/models/product.model';

const CATEGORY_OPTIONS = ['Fashion', 'Beauty', 'Fragrance', 'Healthcare', 'Electronics', 'Home', 'Fitness', 'Accessories', 'Kids'];

@Component({
  selector: 'app-admin-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="admin-page">
    <header>
      <div>
        <p class="eyebrow">Promotions</p>
        <h1>Discounts</h1>
        <p class="sub">Create a festival, campaign, or brand-wide offer. It applies automatically on the storefront while active and within its date window.</p>
      </div>
      <button class="btn btn-accent" (click)="openNew()">+ New Discount</button>
    </header>

    @if (showForm) {
      <form class="form-card card" (ngSubmit)="save()">
        <h2>{{ isEdit ? 'Edit Discount' : 'New Discount' }}</h2>

        <div class="field">
          <label>Offer Name *</label>
          <input type="text" [(ngModel)]="form.name" name="name" required placeholder="e.g. Diwali Offer, Friendship Day Sale">
        </div>

        <div class="two-col">
          <div class="field">
            <label>Discount Type *</label>
            <div class="toggle-group">
              <button type="button" [class.active]="form.type === 'PERCENTAGE'" (click)="form.type = 'PERCENTAGE'">Percentage</button>
              <button type="button" [class.active]="form.type === 'FIXED'" (click)="form.type = 'FIXED'">Fixed Amount</button>
            </div>
          </div>
          <div class="field">
            <label>{{ form.type === 'PERCENTAGE' ? 'Percentage Off *' : 'Amount Off *' }}</label>
            <input type="number" min="0" [max]="form.type === 'PERCENTAGE' ? 100 : null" step="0.5" [(ngModel)]="form.value" name="value">
          </div>
        </div>

        <div class="field">
          <label>Applies To *</label>
          <div class="toggle-group">
            <button type="button" [class.active]="form.scope === 'PRODUCT'" (click)="form.scope = 'PRODUCT'">One Product</button>
            <button type="button" [class.active]="form.scope === 'CATEGORY'" (click)="form.scope = 'CATEGORY'">Whole Category / Brand Line</button>
          </div>
        </div>

        @if (form.scope === 'PRODUCT') {
          <div class="field">
            <label>Product *</label>
            <select [(ngModel)]="form.productId" name="productId">
              <option [ngValue]="null">Select a product…</option>
              @for (p of products; track p.id) {
                <option [ngValue]="p.id">{{ p.name }} ({{ p.currency }} {{ p.price }})</option>
              }
            </select>
          </div>
        } @else {
          <div class="field">
            <label>Category *</label>
            <input type="text" [(ngModel)]="form.category" name="category" list="category-list" placeholder="e.g. Fragrance">
            <datalist id="category-list">
              @for (c of categoryOptions; track c) { <option [value]="c"></option> }
            </datalist>
            <span class="hint">Applies to every active product in this category. Must match the product's category field exactly (not case-sensitive).</span>
          </div>
        }

        <div class="two-col">
          <div class="field">
            <label>Starts *</label>
            <input type="datetime-local" [(ngModel)]="form.startAt" name="startAt">
          </div>
          <div class="field">
            <label>Ends *</label>
            <input type="datetime-local" [(ngModel)]="form.endAt" name="endAt">
          </div>
        </div>

        <div class="field">
          <label>Conditions (optional)</label>
          <textarea [(ngModel)]="form.conditions" name="conditions" placeholder="e.g. Min order value ₹999, while stocks last"></textarea>
        </div>

        <label class="checkbox-field">
          <input type="checkbox" [(ngModel)]="form.active" name="active">
          <span class="checkbox-box"></span>
          Active
        </label>

        @if (error) { <p class="error">{{ error }}</p> }

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="cancelForm()">Cancel</button>
          <button type="submit" class="btn btn-accent" [disabled]="saving">{{ saving ? 'Saving…' : 'Save Discount' }}</button>
        </div>
      </form>
    }

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (discounts.length === 0) {
      <div class="empty-state">
        <span class="emoji">🎉</span>
        <h3>No discounts yet</h3>
        <p>Create your first festival or campaign offer.</p>
      </div>
    } @else {
      <div class="table card">
        <div class="row head">
          <span>Offer</span><span>Applies To</span><span>Discount</span><span>Window</span><span>Status</span><span></span>
        </div>
        @for (d of discounts; track d.id) {
          <div class="row">
            <span class="name-cell">{{ d.name }}</span>
            <span>{{ d.scope === 'PRODUCT' ? (d.productName || '—') : d.category }}</span>
            <span class="discount-value num">{{ d.type === 'PERCENTAGE' ? d.value + '%' : d.value }}</span>
            <span class="window-cell">{{ d.startAt | date:'MMM d' }} – {{ d.endAt | date:'MMM d, y' }}</span>
            <span class="status" [class.live]="d.currentlyLive" [class.scheduled]="d.active && !d.currentlyLive" [class.inactive]="!d.active">
              {{ d.active ? (d.currentlyLive ? 'Live now' : 'Scheduled') : 'Inactive' }}
            </span>
            <div class="row-actions">
              <button class="btn btn-outline btn-sm" (click)="edit(d)">Edit</button>
              @if (d.active) {
                <button class="btn btn-ghost btn-sm" (click)="deactivate(d)">Deactivate</button>
              } @else {
                <button class="btn btn-ghost btn-sm" (click)="activate(d)">Activate</button>
              }
              <button class="btn btn-ghost btn-sm danger" (click)="remove(d)">Delete</button>
            </div>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; margin-bottom: 26px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 8px; }
    .sub { color: var(--ink-soft); font-size: 13.5px; max-width: 560px; line-height: 1.6; }
    .form-card { padding: 28px; max-width: 680px; margin-bottom: 28px; }
    .form-card h2 { font-size: 18px; margin-bottom: 18px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .toggle-group { display: flex; gap: 8px; }
    .toggle-group button {
      flex: 1; padding: 11px; border-radius: var(--r-sm); border: 1.5px solid var(--sand); background: var(--surface); font-weight: 700; font-size: 13.5px;
      transition: all 140ms;
    }
    .toggle-group button.active { background: var(--ink); color: var(--mist); border-color: var(--ink); }
    .field select { padding: 12px 15px; border-radius: var(--r-sm); border: 1.5px solid var(--sand); font-size: 14.5px; background: var(--surface); width: 100%; }
    .hint { font-size: 12px; color: var(--ink-soft); }
    .checkbox-field { display: flex; align-items: center; gap: 10px; font-weight: 600; color: var(--ink); font-size: 14px; margin-bottom: 20px; cursor: pointer; }
    .checkbox-field input { position: absolute; opacity: 0; }
    .checkbox-box {
      width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid var(--sand); flex-shrink: 0;
      position: relative; transition: background 140ms, border-color 140ms;
    }
    .checkbox-field input:checked ~ .checkbox-box { background: var(--poppy); border-color: var(--poppy); }
    .checkbox-field input:checked ~ .checkbox-box::after {
      content: ''; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px;
      border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
    }
    .error { color: var(--poppy); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .table-skel { height: 260px; }
    .table { overflow: hidden; }
    .row {
      display: grid; grid-template-columns: 1.3fr 1.1fr 0.8fr 1.3fr 0.9fr auto; align-items: center; gap: 12px;
      padding: 15px 20px; border-bottom: 1px solid var(--mist-deep); font-size: 13.5px;
    }
    .row:last-child { border-bottom: none; }
    .row.head { font-weight: 700; color: var(--ink-soft); font-size: 11px; text-transform: uppercase; background: var(--mist); }
    .name-cell { font-weight: 600; }
    .discount-value { font-size: 15px; color: var(--jade-deep); }
    .window-cell { color: var(--ink-soft); font-size: 12.5px; }
    .status { font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 999px; width: fit-content; }
    .status.live { background: var(--jade-wash); color: var(--jade-deep); }
    .status.scheduled { background: #fff3d6; color: #8a6100; }
    .status.inactive { background: var(--poppy-wash); color: var(--poppy-deep); }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
    .danger { color: var(--poppy); }
    @media (max-width: 980px) {
      .two-col { grid-template-columns: 1fr; }
      .row { grid-template-columns: 1fr; gap: 6px; }
      .row.head { display: none; }
    }
  `]
})
export class AdminDiscountsComponent implements OnInit {
  discounts: Discount[] = [];
  products: Product[] = [];
  categoryOptions = CATEGORY_OPTIONS;
  loading = true;
  showForm = false;
  isEdit = false;
  editId: number | null = null;
  saving = false;
  error = '';

  form: DiscountPayload = this.emptyForm();

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.adminService.listProducts(0, 300).subscribe({
      next: (res) => this.products = res.content,
      error: () => this.toast.error('Could not load products list')
    });
    this.load();
  }

  emptyForm(): DiscountPayload {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return {
      name: '', type: 'PERCENTAGE', value: 10, scope: 'PRODUCT', productId: null, category: '',
      startAt: this.toLocalInput(now), endAt: this.toLocalInput(in7Days), conditions: '', active: true
    };
  }

  toLocalInput(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  load() {
    this.loading = true;
    this.adminService.listDiscounts(0, 100).subscribe({
      next: (res) => { this.discounts = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.isEdit = false;
    this.editId = null;
    this.form = this.emptyForm();
    this.error = '';
    this.showForm = true;
  }

  edit(d: Discount) {
    this.isEdit = true;
    this.editId = d.id;
    this.form = {
      name: d.name, type: d.type, value: d.value, scope: d.scope,
      productId: d.productId ?? null, category: d.category || '',
      startAt: d.startAt.slice(0, 16), endAt: d.endAt.slice(0, 16),
      conditions: d.conditions || '', active: d.active
    };
    this.error = '';
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
  }

  save() {
    if (!this.form.name) { this.error = 'Please enter an offer name.'; return; }
    if (this.form.scope === 'PRODUCT' && !this.form.productId) { this.error = 'Please select a product.'; return; }
    if (this.form.scope === 'CATEGORY' && !this.form.category) { this.error = 'Please enter a category.'; return; }
    if (new Date(this.form.endAt) <= new Date(this.form.startAt)) { this.error = 'End date must be after the start date.'; return; }

    this.saving = true;
    this.error = '';
    const payload: DiscountPayload = {
      ...this.form,
      startAt: new Date(this.form.startAt).toISOString(),
      endAt: new Date(this.form.endAt).toISOString(),
    };

    const request$ = this.isEdit && this.editId
      ? this.adminService.updateDiscount(this.editId, payload)
      : this.adminService.createDiscount(payload);

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Discount updated' : 'Discount created');
        this.showForm = false;
        this.saving = false;
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not save discount';
        this.saving = false;
      }
    });
  }

  activate(d: Discount) {
    this.adminService.activateDiscount(d.id).subscribe({
      next: () => { d.active = true; this.toast.success('Discount activated'); this.load(); },
      error: () => this.toast.error('Could not activate discount')
    });
  }

  deactivate(d: Discount) {
    this.adminService.deactivateDiscount(d.id).subscribe({
      next: () => { d.active = false; this.toast.success('Discount deactivated'); this.load(); },
      error: () => this.toast.error('Could not deactivate discount')
    });
  }

  remove(d: Discount) {
    if (!confirm(`Delete "${d.name}"? This cannot be undone.`)) return;
    this.adminService.deleteDiscount(d.id).subscribe({
      next: () => {
        this.discounts = this.discounts.filter(x => x.id !== d.id);
        this.toast.success('Discount deleted');
      },
      error: () => this.toast.error('Could not delete discount')
    });
  }
}
