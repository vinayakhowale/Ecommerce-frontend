import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService, PostPayload, ProductPayload } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Product } from '../../core/models/product.model';
import { MediaType } from '../../core/models/post.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-post-form',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header>
      <p class="eyebrow">{{ isEdit ? 'Editing' : 'New' }}</p>
      <h1>{{ isEdit ? 'Edit Content' : 'Upload New Content' }}</h1>
    </header>

    <div class="layout">
      <form class="form-card card">
        <div class="field">
          <label>Content Type</label>
          <div class="toggle-group">
            <button type="button" [class.active]="form.mediaType === 'VIDEO'" (click)="form.mediaType = 'VIDEO'">Video</button>
            <button type="button" [class.active]="form.mediaType === 'IMAGE'" (click)="form.mediaType = 'IMAGE'">Image</button>
          </div>
        </div>

        <div class="two-col">
          <div class="field">
            <label>Influencer Name *</label>
            <input type="text" [(ngModel)]="form.influencerName" name="influencerName" required>
          </div>
          <div class="field">
            <label>Influencer Profile Image</label>
            <label class="upload-btn">
              <input type="file" accept="image/*" (change)="onInfluencerImageSelected($event)" hidden>
              Choose file
            </label>
          </div>
        </div>

        <div class="field">
          <label>Content ({{ form.mediaType === 'VIDEO' ? 'Video' : 'Image' }}) *</label>
          <label class="upload-btn">
            <input type="file" [accept]="form.mediaType === 'VIDEO' ? 'video/*' : 'image/*'" (change)="onMediaSelected($event)" hidden>
            {{ uploadingMedia ? 'Uploading…' : (form.mediaUrl ? 'Replace file' : 'Choose file') }}
          </label>
        </div>

        <div class="field">
          <label>Caption</label>
          <textarea [(ngModel)]="form.caption" name="caption" placeholder="Write a caption…"></textarea>
        </div>

        <div class="field">
          <label>Hashtags</label>
          <input type="text" [(ngModel)]="form.hashtags" name="hashtags" placeholder="summeroutfit, ootd, style">
          <span class="hint">Comma-separated, without the # symbol.</span>
        </div>

        <div class="field">
          <label>Tagged Products</label>
          <div class="selected-products">
            @for (p of selectedProducts; track p.id) {
              <span class="tag">{{ p.name }} <button type="button" (click)="untagProduct(p)">✕</button></span>
            }
            @if (selectedProducts.length === 0) { <span class="hint">No products tagged yet.</span> }
          </div>

          <div class="product-picker">
            <select (change)="onExistingProductSelected($event)">
              <option value="">Select existing product…</option>
              @for (p of allProducts; track p.id) {
                <option [value]="p.id">{{ p.name }} — {{ p.currency }} {{ p.price }}</option>
              }
            </select>
            <button type="button" class="btn btn-outline btn-sm" (click)="showNewProductForm = !showNewProductForm">
              {{ showNewProductForm ? 'Cancel' : '+ New Product' }}
            </button>
          </div>

          @if (showNewProductForm) {
            <div class="new-product-form">
              <div class="two-col">
                <div class="field"><label>Product Name</label><input type="text" [(ngModel)]="newProduct.name" name="npName"></div>
                <div class="field"><label>Price</label><input type="number" [(ngModel)]="newProduct.price" name="npPrice"></div>
              </div>
              <div class="two-col">
                <div class="field"><label>Brand</label><input type="text" [(ngModel)]="newProduct.brand" name="npBrand"></div>
                <div class="field"><label>Category</label><input type="text" [(ngModel)]="newProduct.category" name="npCategory"></div>
              </div>
              <div class="field"><label>Description</label><textarea [(ngModel)]="newProduct.description" name="npDesc"></textarea></div>
              <div class="field"><label>Seller</label><input type="text" [(ngModel)]="newProduct.seller" name="npSeller"></div>
              <div class="field">
                <label>Product Image</label>
                <label class="upload-btn"><input type="file" accept="image/*" (change)="onNewProductImageSelected($event)" hidden>Choose file</label>
              </div>
              <div class="field"><label>Product URL *</label><input type="url" [(ngModel)]="newProduct.productUrl" name="npUrl" placeholder="https://seller.com/product/xyz"></div>
              <div class="field"><label>Affiliate URL</label><input type="url" [(ngModel)]="newProduct.affiliateUrl" name="npAff"></div>
              <button type="button" class="btn btn-primary btn-sm" (click)="createAndTagProduct()">Create &amp; Tag Product</button>
            </div>
          }
        </div>

        @if (error) { <p class="error">{{ error }}</p> }

        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="cancel()">Cancel</button>
          <button type="button" class="btn btn-outline" (click)="save('DRAFT')" [disabled]="saving">Save Draft</button>
          <button type="button" class="btn btn-accent" (click)="save('PUBLISHED')" [disabled]="saving">
            {{ saving ? 'Saving…' : 'Publish' }}
          </button>
        </div>
      </form>

      <div class="preview-panel">
        <h2>Live preview</h2>
        <div class="phone-mock">
          <div class="media-area">
            @if (form.mediaUrl) {
              @if (form.mediaType === 'IMAGE') {
                <img [src]="form.mediaUrl | mediaUrl" alt="preview">
              } @else {
                <video [src]="form.mediaUrl | mediaUrl" muted controls></video>
              }
            } @else {
              <div class="placeholder">Upload media to preview</div>
            }
            <div class="influencer-chip">
              @if (form.influencerProfileImageUrl) { <img [src]="form.influencerProfileImageUrl | mediaUrl" alt=""> }
              <span>{{ form.influencerName || 'Influencer Name' }}</span>
            </div>
            @if (selectedProducts.length > 0) {
              <div class="preview-sticker">
                <span class="sticker-label">from</span>
                <span class="sticker-price">{{ selectedProducts[0].currency }} {{ minPrice() }}</span>
              </div>
            }
          </div>
          <div class="preview-body">
            <p>{{ form.caption || 'Caption will appear here…' }}</p>
            <div class="preview-products">
              @for (p of selectedProducts; track p.id) {
                <div class="preview-product">
                  <span>{{ p.name }}</span>
                  <strong>{{ p.currency }} {{ p.price }}</strong>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 26px; }
    .layout { display: grid; grid-template-columns: 1fr 300px; gap: 24px; align-items: start; }
    .form-card { padding: 30px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .toggle-group { display: flex; gap: 8px; }
    .toggle-group button {
      flex: 1; padding: 11px; border-radius: 999px; border: 1.5px solid var(--sand); background: var(--surface); font-weight: 700;
      transition: all var(--dur-fast);
    }
    .toggle-group button.active { background: var(--ink); color: var(--mist); border-color: var(--ink); }
    .hint { font-size: 12px; color: var(--ink-soft); }
    .upload-btn {
      display: inline-block; padding: 11px 18px; border-radius: 999px; border: 1.5px solid var(--sand);
      font-weight: 700; font-size: 13px; cursor: pointer; transition: border-color var(--dur-fast); width: fit-content;
    }
    .upload-btn:hover { border-color: var(--ink); }
    .selected-products { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
    .tag { display: inline-flex; align-items: center; gap: 6px; background: var(--poppy-wash); color: var(--poppy-deep); padding: 6px 12px; border-radius: 999px; font-size: 12.5px; font-weight: 700; }
    .tag button { background: none; border: none; color: inherit; font-size: 11px; }
    .product-picker { display: flex; gap: 10px; align-items: center; }
    .product-picker select { flex: 1; padding: 11px; border-radius: var(--r-sm); border: 1.5px solid var(--sand); font-size: 13.5px; }
    .new-product-form { margin-top: 16px; padding: 18px; background: var(--mist); border-radius: var(--r-sm); }
    .error { color: var(--poppy); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 12px; }
    .preview-panel { position: sticky; top: 24px; }
    .preview-panel h2 { font-size: 13px; margin-bottom: 12px; color: var(--ink-soft); }
    .phone-mock { background: var(--ink); border-radius: 26px; overflow: hidden; box-shadow: var(--shadow-lift); }
    .media-area { position: relative; aspect-ratio: 9/14; background: #000; }
    .media-area img, .media-area video { width: 100%; height: 100%; object-fit: cover; }
    .placeholder { display: flex; align-items: center; justify-content: center; height: 100%; color: rgba(255,255,255,0.35); font-size: 13px; }
    .influencer-chip { position: absolute; top: 14px; left: 14px; display: flex; align-items: center; gap: 8px; color: white; font-size: 12px; font-weight: 700; }
    .influencer-chip img { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
    .preview-sticker {
      position: absolute; left: 14px; bottom: 14px; background: var(--poppy); color: white;
      padding: 7px 12px 8px; border-radius: 12px 12px 12px 2px; transform: rotate(-3deg); line-height: 1.1;
    }
    .sticker-label { display: block; font-size: 8px; font-weight: 700; text-transform: uppercase; opacity: 0.85; }
    .sticker-price { display: block; font-family: var(--font-display); font-weight: 700; font-size: 14px; }
    .preview-body { padding: 14px; color: #f3f1f7; }
    .preview-body p { font-size: 12px; margin: 0 0 10px; }
    .preview-products { display: flex; flex-direction: column; gap: 6px; }
    .preview-product { display: flex; justify-content: space-between; background: rgba(255,255,255,0.08); padding: 8px 10px; border-radius: 8px; font-size: 11.5px; }
    @media (max-width: 960px) { .layout { grid-template-columns: 1fr; } .preview-panel { position: static; max-width: 320px; margin: 0 auto; } }
  `]
})
export class AdminPostFormComponent implements OnInit {
  isEdit = false;
  postId?: number;
  saving = false;
  uploadingMedia = false;
  error = '';

  form: PostPayload = {
    influencerName: '', influencerProfileImageUrl: '', mediaType: 'VIDEO', mediaUrl: '',
    thumbnailUrl: '', caption: '', hashtags: '', productIds: [], status: 'DRAFT'
  };

  allProducts: Product[] = [];
  selectedProducts: Product[] = [];

  showNewProductForm = false;
  newProduct: ProductPayload = {
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
    this.adminService.listProducts(0, 200).subscribe({
      next: (res) => this.allProducts = res.content,
      error: () => this.toast.error('Could not load products list')
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEdit = true;
      this.postId = Number(idParam);
      this.adminService.getPost(this.postId).subscribe(p => {
        this.form = {
          influencerName: p.influencerName, influencerProfileImageUrl: p.influencerProfileImageUrl,
          mediaType: p.mediaType, mediaUrl: p.mediaUrl, thumbnailUrl: p.thumbnailUrl,
          caption: p.caption, hashtags: p.hashtags, productIds: p.products.map(pr => pr.id), status: p.status
        };
        this.selectedProducts = [...p.products];
      });
    }
  }

  minPrice(): number {
    return Math.min(...this.selectedProducts.map(p => p.price));
  }

  onInfluencerImageSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.adminService.uploadProductImage(file).subscribe({
      next: (res) => this.form.influencerProfileImageUrl = res.url,
      error: () => this.toast.error('Image upload failed')
    });
  }

  onMediaSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.uploadingMedia = true;
    this.adminService.uploadMedia(file, this.form.mediaType as MediaType).subscribe({
      next: (res) => { this.form.mediaUrl = res.url; this.uploadingMedia = false; },
      error: () => { this.toast.error('Media upload failed'); this.uploadingMedia = false; }
    });
  }

  onNewProductImageSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.adminService.uploadProductImage(file).subscribe({
      next: (res) => this.newProduct.productImageUrl = res.url,
      error: () => this.toast.error('Image upload failed')
    });
  }

  onExistingProductSelected(evt: Event) {
    const id = Number((evt.target as HTMLSelectElement).value);
    if (!id) return;
    const product = this.allProducts.find(p => p.id === id);
    if (product && !this.selectedProducts.some(p => p.id === id)) {
      this.selectedProducts.push(product);
    }
    (evt.target as HTMLSelectElement).value = '';
  }

  untagProduct(p: Product) {
    this.selectedProducts = this.selectedProducts.filter(x => x.id !== p.id);
  }

  createAndTagProduct() {
    if (!this.newProduct.name || !this.newProduct.productUrl) {
      this.toast.error('Product name and URL are required');
      return;
    }
    this.adminService.createProduct(this.newProduct).subscribe({
      next: (product) => {
        this.allProducts.push(product);
        this.selectedProducts.push(product);
        this.showNewProductForm = false;
        this.newProduct = { name: '', description: '', price: 0, currency: 'INR', brand: '', category: '', seller: '', productImageUrl: '', productUrl: '', affiliateUrl: '', active: true };
        this.toast.success('Product created and tagged');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not create product')
    });
  }

  save(status: 'DRAFT' | 'PUBLISHED') {
    if (!this.form.influencerName || !this.form.mediaUrl) {
      this.error = 'Influencer name and content upload are required.';
      return;
    }
    this.saving = true;
    this.error = '';
    this.form.status = status;
    this.form.productIds = this.selectedProducts.map(p => p.id);

    const request$ = this.isEdit && this.postId
      ? this.adminService.updatePost(this.postId, this.form)
      : this.adminService.createPost(this.form);

    request$.subscribe({
      next: () => {
        this.toast.success(status === 'PUBLISHED' ? 'Post published' : 'Draft saved');
        this.router.navigate(['/admin/posts']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not save post';
        this.saving = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/posts']);
  }
}
