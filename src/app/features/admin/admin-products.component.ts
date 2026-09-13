import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header>
      <div>
        <p class="eyebrow">Catalog</p>
        <h1>Products</h1>
      </div>
      <a routerLink="/admin/products/new" class="btn btn-accent">+ New Product</a>
    </header>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (products.length === 0) {
      <div class="empty-state">
        <span class="emoji">🏷️</span>
        <h3>No products yet</h3>
      </div>
    } @else {
      <div class="table card">
        <div class="row head">
          <span>Product</span><span>Price</span><span>Category</span><span>Status</span><span></span>
        </div>
        @for (p of products; track p.id) {
          <div class="row">
            <div class="product-cell">
              @if (p.productImageUrl) { <img [src]="p.productImageUrl | mediaUrl" [alt]="p.name"> } @else { <div class="cell-fallback">{{ p.name.charAt(0) }}</div> }
              <span>{{ p.name }}</span>
            </div>
            <span class="num">{{ p.currency }} {{ p.price | number:'1.0-2' }}</span>
            <span>{{ p.category || '—' }}</span>
            <span class="status" [class.active]="p.active" [class.inactive]="!p.active">{{ p.active ? 'Active' : 'Inactive' }}</span>
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
      display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; align-items: center; gap: 12px;
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
    @media (max-width: 880px) {
      .row { grid-template-columns: 1fr; gap: 8px; }
      .row.head { display: none; }
      .row-actions { justify-content: flex-start; flex-wrap: wrap; }
    }
  `]
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  loading = true;

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.listProducts(0, 100).subscribe({
      next: (res) => { this.products = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
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
        this.toast.success('Product deleted');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not delete product')
    });
  }
}
