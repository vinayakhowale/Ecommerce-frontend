import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, ProductPayload } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header>
      <p class="eyebrow">{{ isEdit ? 'Editing' : 'New' }}</p>
      <h1>{{ isEdit ? 'Edit Product' : 'New Product' }}</h1>
    </header>

    <form class="form-card card" (ngSubmit)="submit()">
      <div class="two-col">
        <div class="field">
          <label>Product Name *</label>
          <input type="text" [(ngModel)]="form.name" name="name" required>
        </div>
        <div class="field">
          <label>Brand</label>
          <input type="text" [(ngModel)]="form.brand" name="brand">
        </div>
      </div>

      <div class="field">
        <label>Description</label>
        <textarea [(ngModel)]="form.description" name="description"></textarea>
      </div>

      <div class="three-col">
        <div class="field">
          <label>Price *</label>
          <input type="number" min="0" step="0.01" [(ngModel)]="form.price" name="price" required>
        </div>
        <div class="field">
          <label>Currency</label>
          <input type="text" [(ngModel)]="form.currency" name="currency" placeholder="INR">
        </div>
        <div class="field">
          <label>Category</label>
          <input type="text" [(ngModel)]="form.category" name="category" placeholder="Fashion">
        </div>
      </div>

      <div class="field">
        <label>Seller</label>
        <input type="text" [(ngModel)]="form.seller" name="seller">
      </div>

      <div class="field">
        <label>Product Image</label>
        <div class="upload-row">
          <label class="upload-btn">
            <input type="file" accept="image/*" (change)="onImageSelected($event)" hidden>
            Choose file
          </label>
          @if (form.productImageUrl) {
            <img class="preview" [src]="form.productImageUrl | mediaUrl" alt="Preview">
          }
        </div>
      </div>

      <div class="field">
        <label>Product URL *</label>
        <input type="url" [(ngModel)]="form.productUrl" name="productUrl" required placeholder="https://seller.com/product/xyz">
        <span class="hint">This is where "Buy Now" will send users. Must be a valid https:// or http:// link.</span>
      </div>

      <div class="field">
        <label>Affiliate URL (optional)</label>
        <input type="url" [(ngModel)]="form.affiliateUrl" name="affiliateUrl" placeholder="https://affiliate-network.com/track?...">
        <span class="hint">Used instead of the product URL for redirect + tracking, if provided.</span>
      </div>

      <label class="checkbox-field">
        <input type="checkbox" [(ngModel)]="form.active" name="active">
        <span class="checkbox-box"></span>
        Active (visible on the storefront)
      </label>

      @if (error) { <p class="error">{{ error }}</p> }

      <div class="form-actions">
        <button type="button" class="btn btn-outline" (click)="cancel()">Cancel</button>
        <button type="submit" class="btn btn-accent" [disabled]="saving">
          {{ saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Product') }}
        </button>
      </div>
    </form>
  </div>
  `,
  styles: [`
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 26px; }
    .form-card { max-width: 720px; padding: 30px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    .hint { font-size: 12px; color: var(--ink-soft); }
    .upload-row { display: flex; align-items: center; gap: 14px; }
    .upload-btn {
      padding: 11px 18px; border-radius: 999px; border: 1.5px solid var(--sand); font-weight: 700; font-size: 13px;
      cursor: pointer; transition: border-color var(--dur-fast);
    }
    .upload-btn:hover { border-color: var(--ink); }
    .preview { width: 60px; height: 60px; object-fit: cover; border-radius: 10px; }
    .checkbox-field { display: flex; align-items: center; gap: 10px; font-weight: 600; color: var(--ink); font-size: 14px; margin-bottom: 20px; cursor: pointer; }
    .checkbox-field input { position: absolute; opacity: 0; }
    .checkbox-box {
      width: 20px; height: 20px; border-radius: 6px; border: 1.5px solid var(--sand); flex-shrink: 0;
      position: relative; transition: background var(--dur-fast), border-color var(--dur-fast);
    }
    .checkbox-field input:checked ~ .checkbox-box { background: var(--poppy); border-color: var(--poppy); }
    .checkbox-field input:checked ~ .checkbox-box::after {
      content: ''; position: absolute; left: 6px; top: 2px; width: 5px; height: 10px;
      border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
    }
    .error { color: var(--poppy); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    @media (max-width: 640px) { .two-col, .three-col { grid-template-columns: 1fr; } }
  `]
})
export class AdminProductFormComponent implements OnInit {
  isEdit = false;
  productId?: number;
  saving = false;
  error = '';

  form: ProductPayload = {
    name: '', description: '', price: 0, currency: 'INR', brand: '', category: '',
    seller: '', productImageUrl: '', productUrl: '', affiliateUrl: '', active: true
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminService: AdminService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.productId = Number(idParam);
      this.adminService.getProduct(this.productId).subscribe(p => {
        this.form = {
          name: p.name, description: p.description, price: p.price, currency: p.currency,
          brand: p.brand, category: p.category, seller: p.seller, productImageUrl: p.productImageUrl,
          productUrl: p.productUrl, affiliateUrl: p.affiliateUrl, active: p.active
        };
      });
    }
  }

  onImageSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.adminService.uploadProductImage(file).subscribe({
      next: (res) => this.form.productImageUrl = res.url,
      error: () => this.toast.error('Image upload failed')
    });
  }

  submit() {
    if (!this.form.name || !this.form.productUrl || this.form.price < 0) return;
    this.saving = true;
    this.error = '';
    const request$ = this.isEdit && this.productId
      ? this.adminService.updateProduct(this.productId, this.form)
      : this.adminService.createProduct(this.form);

    request$.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Product updated' : 'Product created');
        this.router.navigate(['/admin/products']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not save product';
        this.saving = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/products']);
  }
}
