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
  <article class="product-card">
    <a class="frame" [routerLink]="['/product', product.id]" [attr.aria-label]="product.name">
      @if (primaryImage()) {
        <img class="shot" [src]="primaryImage() | mediaUrl" [alt]="product.name" loading="lazy" decoding="async">
        @if (secondImage()) {
          <!-- Second gallery image fades in on hover; hidden from touch devices via CSS. -->
          <img class="shot alt" [src]="secondImage() | mediaUrl" alt="" aria-hidden="true" loading="lazy" decoding="async">
        }
      } @else {
        <span class="frame-empty">{{ product.name.charAt(0) }}</span>
      }

      @if (product.hasDiscount) {
        <span class="flag flag-sale">{{ discountPercentLabel() }}</span>
      } @else if (isNew()) {
        <span class="flag">New</span>
      }
    </a>

    <div class="info">
      @if (product.brand) { <span class="brand">{{ product.brand }}</span> }
      <h3 class="name"><a [routerLink]="['/product', product.id]">{{ product.name }}</a></h3>

      <p class="prices">
        @if (product.hasDiscount) {
          <span class="price num">{{ product.currency }} {{ product.discountedPrice | number:'1.0-2' }}</span>
          <span class="was num">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
        } @else {
          <span class="price num">{{ product.currency }} {{ product.price | number:'1.0-2' }}</span>
        }
      </p>

      <div class="actions">
        <button class="btn btn-outline btn-sm add" (click)="addToCart.emit(product)">Add to bag</button>
        <button class="btn btn-accent btn-sm buy" (click)="buyNow.emit(product)">Buy now</button>
      </div>
    </div>
  </article>
  `,
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;
  @Output() addToCart = new EventEmitter<Product>();
  @Output() buyNow = new EventEmitter<Product>();

  /** Gallery first, falling back to the legacy single image. */
  primaryImage(): string | undefined {
    return this.product.imageUrls?.[0] ?? this.product.productImageUrl;
  }

  /** Only present when the admin uploaded more than one image. */
  secondImage(): string | undefined {
    const gallery = this.product.imageUrls;
    return gallery && gallery.length > 1 ? gallery[1] : undefined;
  }

  discountPercentLabel(): string {
    if (!this.product.hasDiscount || this.product.price <= 0) return '';
    const pct = Math.round((1 - this.product.discountedPrice / this.product.price) * 100);
    return `${pct}% off`;
  }

  isNew(): boolean {
    // Matches the backend's "New Launches" window (app.catalog.new-launch-window-days, default 21)
    // so a product's badge here and its presence in the New Launches rail always agree.
    const created = new Date(this.product.createdAt).getTime();
    const windowMs = 21 * 24 * 60 * 60 * 1000;
    return Date.now() - created < windowMs;
  }
}
