import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardComponent } from '../../shared/components/product-card.component';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { PaymentFlowService } from '../../core/services/payment-flow.service';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';
import { Product } from '../../core/models/product.model';
import { Router } from '@angular/router';

const CATEGORIES = ['All', 'Fashion', 'Beauty', 'Fragrance', 'Healthcare', 'Electronics', 'Home', 'Fitness', 'Accessories', 'Kids'];

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ProductCardComponent],
  template: `
  <div class="categories-page">
    <header>
      <p class="eyebrow">Browse</p>
      <h1>Shop by category</h1>
    </header>

    <div class="chips">
      @for (c of categories; track c) {
        <button class="chip-btn" [class.active]="selected === c" (click)="select(c)">{{ c }}</button>
      }
    </div>

    @if (loading) {
      <div class="grid">
        @for (i of [1,2,3,4,5,6,7,8]; track i) { <div class="skeleton skeleton-card"></div> }
      </div>
    } @else if (products.length === 0) {
      <div class="empty-state">
        <span class="emoji">🗂️</span>
        <h3>No products in this category yet</h3>
      </div>
    } @else {
      <div class="grid">
        @for (p of products; track p.id; let i = $index) {
          <div class="stagger-in" [style.animation-delay.ms]="i < 12 ? i * 30 : 0">
            <app-product-card [product]="p" (addToCart)="onAddToCart($event)" (buyNow)="onBuyNow($event)"></app-product-card>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    .categories-page { max-width: 1100px; margin: 0 auto; padding: 40px 20px 60px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 28px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; margin: 22px 0 26px; }
    .chip-btn {
      padding: 9px 18px; border-radius: 999px; border: 1.5px solid var(--sand);
      background: var(--surface); font-weight: 700; font-size: 13px; color: var(--ink-soft);
      transition: all var(--dur-fast);
    }
    .chip-btn:hover { border-color: var(--ink); color: var(--ink); }
    .chip-btn.active { background: var(--ink); color: var(--mist); border-color: var(--ink); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; }
    .skeleton-card { aspect-ratio: 0.72; }
  `]
})
export class CategoriesComponent implements OnInit {
  categories = CATEGORIES;
  selected = 'All';
  products: Product[] = [];
  loading = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private paymentFlowService: PaymentFlowService,
    private toast: ToastService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() { this.load(); }

  select(c: string) {
    this.selected = c;
    this.load();
  }

  load() {
    this.loading = true;
    const category = this.selected === 'All' ? undefined : this.selected;
    this.productService.list(0, 40, category).subscribe({
      next: (res) => { this.products = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  onAddToCart(product: Product) {
    if (!this.auth.isLoggedIn()) { this.router.navigate(['/auth/login']); return; }
    this.cartService.addItem(product.id, 1).subscribe({
      next: () => this.toast.success(`${product.name} added to cart`),
      error: () => this.toast.error('Could not add to cart')
    });
  }

  onBuyNow(product: Product) {
    this.paymentFlowService.buyNow(product);
  }
}
