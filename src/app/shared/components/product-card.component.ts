import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../core/models/product.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  <div class="product-card">
    <a class="thumb" [routerLink]="['/product', product.id]">
      @if (product.productImageUrl) {
        <img [src]="product.productImageUrl | mediaUrl" [alt]="product.name" loading="lazy">
      } @else {
        <div class="thumb-fallback">{{ product.name.charAt(0) }}</div>
      }
      @if (product.brand) { <span class="brand-tag">{{ product.brand }}</span> }
      @if (product.hasDiscount) {
        <span class="discount-badge">{{ discountPercentLabel() }}</span>
      } @else if (isNew()) {
        <span class="new-badge">NEW</span>
      }
    </a>
    <div class="body">
      <a class="name" [routerLink]="['/product', product.id]">{{ product.name }}</a>
      @if (product.hasDiscount) {
        <div class="price-row">
          <span class="price num">{{ product.currency }} {{ product.discountedPrice | number:'1.0-2' }}</span>
          <span class="mrp">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
        </div>
      } @else {
        <span class="price num">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
      }
      <div class="actions">
        <button class="icon-btn" (click)="addToCart.emit(product)" aria-label="Add to cart">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 4h2l1.2 12.4a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L21 8H6.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.3" fill="currentColor"/><circle cx="17.5" cy="21" r="1.3" fill="currentColor"/></svg>
        </button>
        <button class="btn btn-accent btn-sm buy-btn" (click)="buyNow.emit(product)">Buy Now</button>
      </div>
    </div>
  </div>
  `,
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<Product>();

  discountPercentLabel(): string {
    if (!this.product.hasDiscount || this.product.price <= 0) return '';
    const pct = Math.round((1 - this.product.discountedPrice / this.product.price) * 100);
    return `${pct}% OFF`;
  }

  isNew(): boolean {
    // Matches the backend's "New Launches" window (app.catalog.new-launch-window-days, default 21)
    // so a product's badge here and its presence in the New Launches strip always agree.
    const created = new Date(this.product.createdAt).getTime();
    const windowMs = 21 * 24 * 60 * 60 * 1000;
    return Date.now() - created < windowMs;
  }
}
