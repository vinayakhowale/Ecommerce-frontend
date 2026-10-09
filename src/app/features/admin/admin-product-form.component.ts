import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, ProductPayload } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

/** Maximum words allowed in the product description. */
const DESCRIPTION_WORD_LIMIT = 150;

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

    <form class="form-layout" (ngSubmit)="submit()">
      <!-- LEFT: product details -->
      <div class="form-card card">
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
          <textarea [(ngModel)]="form.description" name="description" rows="5"
                    (ngModelChange)="onDescriptionChange()"
                    [placeholder]="'Up to ' + wordLimit + ' words'"></textarea>
          <div class="counter-row" [class.over]="wordCount > wordLimit">
            <span>{{ wordCount }} / {{ wordLimit }} words</span>
            @if (wordCount > wordLimit) {
              <span class="counter-warn">Remove {{ wordCount - wordLimit }} word(s) to save.</span>
            }
          </div>
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

        <label class="checkbox-field">
          <input type="checkbox" [(ngModel)]="form.active" name="active">
          <span class="checkbox-box"></span>
          Active (visible on the storefront)
        </label>

        @if (error) { <p class="error">{{ error }}</p> }

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="cancel()">Cancel</button>
          <button type="submit" class="btn btn-accent" [disabled]="saving || wordCount > wordLimit">
            {{ saving ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Product') }}
          </button>
        </div>
      </div>

      <!-- RIGHT: image gallery -->
      <aside class="image-card card">
        <h2>Product Images</h2>
        <p class="aside-hint">The first image is used as the main thumbnail across the store.</p>

        <label class="upload-btn">
          <input type="file" accept="image/*" multiple (change)="onImagesSelected($event)" hidden>
          {{ uploading ? 'Uploading…' : '+ Add images' }}
        </label>

        @if (images.length === 0) {
          <div class="no-image">No images yet</div>
        } @else {
          <div class="gallery">
            @for (url of images; track url; let i = $index) {
              <figure class="thumb" [class.primary]="i === 0">
                <img [src]="url | mediaUrl" [alt]="form.name || 'Product image'">
                @if (i === 0) { <figcaption class="badge">Main</figcaption> }
                <div class="thumb-actions">
                  @if (i > 0) {
                    <button type="button" title="Make main image" (click)="makePrimary(i)">&#9733;</button>
                  }
                  <button type="button" title="Remove image" (click)="removeImage(i)">&#10005;</button>
                </div>
              </figure>
            }
          </div>
        }
      </aside>
    </form>
  </div>
  `,
  styles: [`
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 26px; }
    .form-layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; align-items: start; max-width: 1100px; }
    .form-card { padding: 30px; }
    .image-card { padding: 22px; position: sticky; top: 24px; }
    .image-card h2 { font-size: 15px; margin-bottom: 6px; }
    .aside-hint { font-size: 12px; color: var(--ink-soft); margin-bottom: 16px; line-height: 1.5; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .three-col { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
    textarea { width: 100%; }
    .counter-row { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; color: var(--ink-soft); margin-top: 5px; }
    .counter-row.over { color: var(--poppy); font-weight: 700; }
    .counter-warn { font-weight: 700; }
    .upload-btn {
      display: block; text-align: center; padding: 11px 18px; border-radius: 999px; border: 1.5px dashed var(--sand);
      font-weight: 700; font-size: 13px; cursor: pointer; transition: border-color var(--dur-fast); margin-bottom: 16px;
    }
    .upload-btn:hover { border-color: var(--ink); }
    .no-image { font-size: 12.5px; color: var(--ink-soft); text-align: center; padding: 20px 0; }
    .gallery { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .thumb { position: relative; margin: 0; border-radius: 10px; overflow: hidden; border: 1.5px solid var(--mist-deep); }
    .thumb.primary { border-color: var(--poppy); }
    .thumb img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; }
    .badge { position: absolute; left: 6px; bottom: 6px; background: var(--poppy); color: white; font-size: 10px; font-weight: 700; padding: 2px 7px; border-radius: 999px; }
    .thumb-actions { position: absolute; top: 5px; right: 5px; display: flex; gap: 4px; }
    .thumb-actions button {
      width: 22px; height: 22px; border-radius: 50%; border: none; cursor: pointer;
      background: rgba(0,0,0,0.6); color: white; font-size: 11px; line-height: 1;
    }
    .thumb-actions button:hover { background: rgba(0,0,0,0.85); }
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
    @media (max-width: 900px) {
      .form-layout { grid-template-columns: 1fr; }
      .image-card { position: static; order: -1; }
    }
    @media (max-width: 640px) { .two-col, .three-col { grid-template-columns: 1fr; } }
  `]
})
export class AdminProductFormComponent implements OnInit {
  isEdit = false;
  productId?: number;
  saving = false;
  uploading = false;
  error = '';

  readonly wordLimit = DESCRIPTION_WORD_LIMIT;
  wordCount = 0;

  /** Gallery, in display order. Index 0 is the main image mirrored into productImageUrl. */
  images: string[] = [];

  form: ProductPayload = {
    name: '', description: '', price: 0, currency: 'INR', brand: '', category: '',
    productImageUrl: '', imageUrls: [], active: true
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
        // Seller / URLs / Razorpay account were removed from this form. They are preserved by
        // re-sending the stored values untouched, so editing a legacy product never wipes them.
        this.form = {
          name: p.name, description: p.description, price: p.price, currency: p.currency,
          brand: p.brand, category: p.category, seller: p.seller,
          productUrl: p.productUrl, affiliateUrl: p.affiliateUrl, razorpayAccountId: p.razorpayAccountId,
          productImageUrl: p.productImageUrl, imageUrls: p.imageUrls ?? [], active: p.active
        };
        this.images = (p.imageUrls && p.imageUrls.length)
          ? [...p.imageUrls]
          : (p.productImageUrl ? [p.productImageUrl] : []);
        this.onDescriptionChange();
      });
    }
  }

  onDescriptionChange() {
    const text = (this.form.description || '').trim();
    this.wordCount = text ? text.split(/\s+/).length : 0;
  }

  onImagesSelected(evt: Event) {
    const input = evt.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;

    this.uploading = true;
    let pending = files.length;
    const done = () => {
      if (--pending === 0) {
        this.uploading = false;
        input.value = ''; // allow re-selecting the same file later
      }
    };

    files.forEach(file => {
      this.adminService.uploadProductImage(file).subscribe({
        next: (res) => {
          if (!this.images.includes(res.url)) this.images.push(res.url);
          done();
        },
        error: () => {
          this.toast.error(`Could not upload ${file.name}`);
          done();
        }
      });
    });
  }

  makePrimary(index: number) {
    const [picked] = this.images.splice(index, 1);
    this.images.unshift(picked);
  }

  removeImage(index: number) {
    this.images.splice(index, 1);
  }

  submit() {
    if (!this.form.name || this.form.price < 0) return;
    if (this.wordCount > this.wordLimit) {
      this.error = `Description must be ${this.wordLimit} words or fewer.`;
      return;
    }
    this.saving = true;
    this.error = '';

    const payload: ProductPayload = {
      ...this.form,
      imageUrls: this.images,
      productImageUrl: this.images[0] || ''
    };

    const request$ = this.isEdit && this.productId
      ? this.adminService.updateProduct(this.productId, payload)
      : this.adminService.createProduct(payload);

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
