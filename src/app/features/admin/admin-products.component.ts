import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header>
      <div>
        <p class="eyebrow">Catalog</p>
        <h1>Products</h1>
      </div>
      <a routerLink="/admin/products/new" class="btn btn-accent">+ New Product</a>
    </header>

    <!-- Filter bar: narrows the already-loaded list in the browser, so no extra API calls. -->
    <div class="filter-bar card">
      <div class="filter-field">
        <label>Search</label>
        <input type="text" [(ngModel)]="search" name="search" placeholder="Name, brand or category">
      </div>
      <div class="filter-field">
        <label>Status</label>
        <select [(ngModel)]="status" name="status">
          <option value="ALL">All</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>
      <div class="filter-field">
        <label>Added from</label>
        <input type="date" [(ngModel)]="fromDate" name="fromDate">
      </div>
      <div class="filter-field">
        <label>Added to</label>
        <input type="date" [(ngModel)]="toDate" name="toDate">
      </div>
      <div class="filter-field">
        <label>Sort by</label>
        <select [(ngModel)]="sort" name="sort">
          <option value="CREATED_DESC">Newest first</option>
          <option value="CREATED_ASC">Oldest first</option>
          <option value="UPDATED_DESC">Recently updated</option>
          <option value="NAME_ASC">Name (A–Z)</option>
        </select>
      </div>
      <div class="filter-actions">
        <button type="button" class="btn btn-accent btn-sm" (click)="applyFilters()">Apply filter</button>
        <button type="button" class="btn btn-outline btn-sm" (click)="resetFilters()">Reset</button>
      </div>
    </div>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (filtered.length === 0) {
      <div class="empty-state">
        <span class="emoji">🏷️</span>
        <h3>{{ products.length === 0 ? 'No products yet' : 'No products match these filters' }}</h3>
      </div>
    } @else {
      <div class="table card">
        <div class="row head">
          <span>Product</span><span>Price</span><span>Category</span><span>Status</span>
          <span>Date &amp; Time Added</span><span>Updated Date &amp; Time</span><span></span>
        </div>
        @for (p of filtered; track p.id) {
          <div class="row">
            <div class="product-cell">
              @if (p.productImageUrl) { <img [src]="p.productImageUrl | mediaUrl" [alt]="p.name"> } @else { <div class="cell-fallback">{{ p.name.charAt(0) }}</div> }
              <span>{{ p.name }}</span>
            </div>
            <span class="num">{{ p.currency }} {{ p.price | number:'1.0-2' }}</span>
            <span>{{ p.category || '—' }}</span>
            <span class="status" [class.active]="p.active" [class.inactive]="!p.active">{{ p.active ? 'Active' : 'Inactive' }}</span>
            <span class="date-cell">{{ p.createdAt | date:'dd MMM yyyy, h:mm a' }}</span>
            <span class="date-cell">{{ p.updatedAt ? (p.updatedAt | date:'dd MMM yyyy, h:mm a') : '—' }}</span>
            <div class="row-actions">
              <a [routerLink]="['/admin/products', p.id, 'edit']" class="btn btn-outline btn-sm">Edit</a>
              @if (p.active) {
                <button class="btn btn-ghost btn-sm" (click)="deactivate(p)">Deactivate</button>
              } @else {
                <button class="btn btn-ghost btn-sm" (click)="activate(p)">Activate</button>
              }
              <button class="btn btn-ghost btn-sm danger" (click)="remove(p)">Delete</button>
            </div>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 26px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; }
    .table-skel { height: 320px; }
    .table { overflow: hidden; }
    .row {
      display: grid; grid-template-columns: 1.8fr 0.9fr 0.9fr 0.8fr 1.2fr 1.2fr auto; align-items: center; gap: 12px;
      padding: 15px 20px; border-bottom: 1px solid var(--mist-deep); font-size: 13.5px;
    }
    .row:last-child { border-bottom: none; }
    .row.head { font-weight: 700; color: var(--ink-soft); font-size: 11.5px; text-transform: uppercase; letter-spacing: 0.04em; background: var(--mist); }
    .product-cell { display: flex; align-items: center; gap: 11px; font-weight: 600; }
    .product-cell img { width: 38px; height: 38px; border-radius: 9px; object-fit: cover; }
    .cell-fallback { width: 38px; height: 38px; border-radius: 9px; background: var(--poppy-wash); color: var(--poppy); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; }
    .status { font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 999px; width: fit-content; }
    .status.active { background: var(--jade-wash); color: var(--jade-deep); }
    .status.inactive { background: var(--poppy-wash); color: var(--poppy-deep); }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; }
    .danger { color: var(--poppy); }
    .date-cell { color: var(--ink-soft); font-size: 12.5px; }
    .filter-bar {
      display: flex; flex-wrap: wrap; align-items: flex-end; gap: 14px; padding: 16px 18px; margin-bottom: 18px;
    }
    .filter-field { display: flex; flex-direction: column; gap: 5px; min-width: 150px; }
    .filter-field label { font-size: 11.5px; font-weight: 700; color: var(--ink-soft); text-transform: uppercase; letter-spacing: 0.04em; }
    .filter-field input, .filter-field select { padding: 9px 11px; border-radius: 10px; border: 1.5px solid var(--sand); font-size: 13px; }
    .filter-actions { display: flex; gap: 8px; margin-left: auto; }
    @media (max-width: 880px) {
      .row { grid-template-columns: 1fr; gap: 8px; }
      .row.head { display: none; }
      .row-actions { justify-content: flex-start; flex-wrap: wrap; }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filtered: Product[] = [];
  loading = true;

  search = '';
  status: 'ALL' | 'ACTIVE' | 'INACTIVE' = 'ALL';
  fromDate = '';
  toDate = '';
  sort: 'CREATED_DESC' | 'CREATED_ASC' | 'UPDATED_DESC' | 'NAME_ASC' = 'CREATED_DESC';

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.listProducts(0, 100).subscribe({
      next: (res) => { this.products = res.content; this.applyFilters(); this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  applyFilters() {
    const term = this.search.trim().toLowerCase();
    // Dates are inclusive: "to" covers the whole selected day, not just midnight.
    const from = this.fromDate ? new Date(this.fromDate + 'T00:00:00') : null;
    const to = this.toDate ? new Date(this.toDate + 'T23:59:59') : null;

    let rows = this.products.filter(p => {
      if (term && ![p.name, p.brand, p.category].some(v => (v || '').toLowerCase().includes(term))) return false;
      if (this.status === 'ACTIVE' && !p.active) return false;
      if (this.status === 'INACTIVE' && p.active) return false;
      if (from || to) {
        const created = new Date(p.createdAt);
        if (from && created < from) return false;
        if (to && created > to) return false;
      }
      return true;
    });

    const time = (v?: string) => (v ? new Date(v).getTime() : 0);
    rows = rows.sort((a, b) => {
      switch (this.sort) {
        case 'CREATED_ASC': return time(a.createdAt) - time(b.createdAt);
        case 'UPDATED_DESC': return time(b.updatedAt || b.createdAt) - time(a.updatedAt || a.createdAt);
        case 'NAME_ASC': return a.name.localeCompare(b.name);
        default: return time(b.createdAt) - time(a.createdAt);
      }
    });
    this.filtered = rows;
  }

  resetFilters() {
    this.search = '';
    this.status = 'ALL';
    this.fromDate = '';
    this.toDate = '';
    this.sort = 'CREATED_DESC';
    this.applyFilters();
  }

  activate(p: Product) {
    this.adminService.activateProduct(p.id).subscribe({
      next: () => { p.active = true; this.toast.success('Product activated'); },
      error: () => this.toast.error('Could not activate product')
    });
  }

  deactivate(p: Product) {
    this.adminService.deactivateProduct(p.id).subscribe({
      next: () => { p.active = false; this.toast.success('Product deactivated'); },
      error: () => this.toast.error('Could not deactivate product')
    });
  }

  remove(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    this.adminService.deleteProduct(p.id).subscribe({
      next: () => {
        this.products = this.products.filter(x => x.id !== p.id);
        this.applyFilters();
        this.toast.success('Product deleted');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not delete product')
    });
  }
}
