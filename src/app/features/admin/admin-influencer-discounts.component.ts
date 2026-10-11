import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, InfluencerDiscountPayload } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Influencer, InfluencerDiscount } from '../../core/models/influencer.model';

@Component({
  selector: 'app-admin-influencer-discounts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="admin-page">
    <header>
      <p class="eyebrow">Performance rewards</p>
      <h1>Influencer Discounts</h1>
      <p class="sub">Set a discount percentage for a specific influencer's code — typically based on their sales volume. This is a manual decision, not automatic.</p>
    </header>

    <div class="form-card card">
      <h2>{{ editingId ? 'Update discount' : 'Assign a discount' }}</h2>
      <div class="two-col">
        <div class="field">
          <label>Influencer *</label>
          <select [(ngModel)]="form.influencerId" name="influencerId" [disabled]="!!editingId">
            <option [ngValue]="0">Select an influencer…</option>
            @for (inf of influencers; track inf.id) {
              <option [ngValue]="inf.id">{{ inf.name }} ({{ inf.code }})</option>
            }
          </select>
        </div>
        <div class="field">
          <label>Discount Percentage *</label>
          <input type="number" min="0" max="100" step="0.5" [(ngModel)]="form.discountPercentage" name="discountPercentage">
        </div>
      </div>
      <div class="field">
        <label>Notes</label>
        <textarea [(ngModel)]="form.notes" name="notes" placeholder="e.g. 80 products sold this month — tier upgrade"></textarea>
      </div>
      <label class="checkbox-field">
        <input type="checkbox" [(ngModel)]="form.active" name="active">
        <span class="checkbox-box"></span>
        Active
      </label>
      @if (error) { <p class="error">{{ error }}</p> }
      <div class="form-actions">
        @if (editingId) { <button type="button" class="btn btn-outline" (click)="cancelEdit()">Cancel</button> }
        <button type="button" class="btn btn-accent" (click)="save()" [disabled]="saving">
          {{ saving ? 'Saving…' : (editingId ? 'Update Discount' : 'Assign Discount') }}
        </button>
      </div>
    </div>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (discounts.length === 0) {
      <div class="empty-state">
        <span class="emoji">🏷️</span>
        <h3>No influencer discounts configured yet</h3>
      </div>
    } @else {
      <div class="table card">
        <div class="row head">
          <span>Influencer</span><span>Code</span><span>Discount</span><span>Last 30d sales (units)</span><span>Status</span><span></span>
        </div>
        @for (d of discounts; track d.id) {
          <div class="row">
            <span>{{ d.influencerName }}</span>
            <span class="code-chip">{{ d.influencerCode }}</span>
            <span class="discount-value num">{{ d.discountPercentage }}%</span>
            <span class="num">{{ d.monthlySalesCount }}</span>
            <span class="status" [class.active]="d.active" [class.inactive]="!d.active">{{ d.active ? 'Active' : 'Inactive' }}</span>
            <div class="row-actions">
              <button class="btn btn-outline btn-sm" (click)="edit(d)">Edit</button>
              <button class="btn btn-ghost btn-sm danger" (click)="remove(d)">Remove</button>
            </div>
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
    .sub { color: var(--ink-soft); font-size: 13.5px; max-width: 620px; line-height: 1.6; }
    .form-card { padding: 28px; max-width: 680px; margin-bottom: 28px; }
    .form-card h2 { font-size: 17px; margin-bottom: 18px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .field select { padding: 12px 15px; border-radius: var(--r-sm); border: 1.5px solid var(--sand); font-size: 14.5px; background: var(--surface); width: 100%; }
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
    .table-skel { height: 220px; }
    .table { overflow: hidden; }
    .row {
      display: grid; grid-template-columns: 1.4fr 0.9fr 0.9fr 1.3fr 0.9fr auto; align-items: center; gap: 12px;
      padding: 15px 20px; border-bottom: 1px solid var(--mist-deep); font-size: 13.5px;
    }
    .row:last-child { border-bottom: none; }
    .row.head { font-weight: 700; color: var(--ink-soft); font-size: 11px; text-transform: uppercase; background: var(--mist); }
    .code-chip { font-family: var(--font-display); font-weight: 700; letter-spacing: 0.03em; }
    .discount-value { font-size: 16px; color: var(--jade-deep); }
    .status { font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 999px; width: fit-content; }
    .status.active { background: var(--jade-wash); color: var(--jade-deep); }
    .status.inactive { background: var(--poppy-wash); color: var(--poppy-deep); }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; }
    .danger { color: var(--poppy); }
    @media (max-width: 940px) {
      .two-col { grid-template-columns: 1fr; }
      .row { grid-template-columns: 1fr; gap: 6px; }
      .row.head { display: none; }
    }
  `]
})
export class AdminInfluencerDiscountsComponent implements OnInit {
  influencers: Influencer[] = [];
  discounts: InfluencerDiscount[] = [];
  loading = true;
  saving = false;
  error = '';
  editingId: number | null = null;

  form: InfluencerDiscountPayload = { influencerId: 0, discountPercentage: 0, notes: '', active: true };

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.adminService.listInfluencers(0, 200).subscribe({
      next: (res) => this.influencers = res.content,
      error: () => this.toast.error('Could not load influencers list')
    });
    this.load();
  }

  load() {
    this.loading = true;
    this.adminService.listInfluencerDiscounts().subscribe({
      next: (res) => { this.discounts = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  edit(d: InfluencerDiscount) {
    this.editingId = d.id;
    this.form = { influencerId: d.influencerId, discountPercentage: d.discountPercentage, notes: d.notes, active: d.active };
    this.error = '';
  }

  cancelEdit() {
    this.editingId = null;
    this.form = { influencerId: 0, discountPercentage: 0, notes: '', active: true };
  }

  save() {
    if (!this.form.influencerId) {
      this.error = 'Please select an influencer.';
      return;
    }
    if (this.form.discountPercentage < 0 || this.form.discountPercentage > 100) {
      this.error = 'Discount percentage must be between 0 and 100.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.adminService.upsertInfluencerDiscount(this.form).subscribe({
      next: () => {
        this.toast.success(this.editingId ? 'Discount updated' : 'Discount assigned');
        this.saving = false;
        this.cancelEdit();
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not save discount';
        this.saving = false;
      }
    });
  }

  remove(d: InfluencerDiscount) {
    if (!confirm(`Remove the discount for ${d.influencerName}?`)) return;
    this.adminService.deleteInfluencerDiscount(d.id).subscribe({
      next: () => {
        this.discounts = this.discounts.filter(x => x.id !== d.id);
        this.toast.success('Discount removed');
      },
      error: () => this.toast.error('Could not remove discount')
    });
  }
}
