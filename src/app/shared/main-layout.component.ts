import { Component, ElementRef, HostListener, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';
import { SettingsService } from '../core/services/settings.service';
import { CartService } from '../core/services/cart.service';
import { StorefrontService } from '../core/services/storefront.service';
import { Category } from '../core/models/storefront.model';
import { MediaUrlPipe } from '../core/pipes/media-url.pipe';
import { CartDrawerComponent } from './components/cart-drawer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MediaUrlPipe, CartDrawerComponent],
  template: `
  <div class="shell">
    <!-- Announcement: one line, no marquee. It says something useful or it doesn't appear. -->
    <!-- Announcement: a continuous marquee. The strip is duplicated so the loop has no seam. -->
    <div class="announce" aria-label="Store announcements">
      <div class="marquee">
        <div class="marquee-row">
          @for (pass of [1, 2]; track pass) {
            <span class="marquee-group" [attr.aria-hidden]="pass === 2 ? 'true' : null">
              @for (note of settings.settings().announcements; track note) {
                <span class="marquee-item">{{ note }}</span>
                <span class="dot" aria-hidden="true"></span>
              }
            </span>
          }
        </div>
      </div>
    </div>

    <header class="site-header" [class.condensed]="scrolled()">
      <div class="container header-inner">
        <button class="icon-button menu-button" (click)="toggleMenu()"
                [attr.aria-expanded]="menuOpen()" aria-label="Open menu">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>

        <a routerLink="/" class="wordmark" [attr.aria-label]="settings.storeName() + ' home'">{{ settings.storeName() }}</a>

        <nav class="primary-nav" aria-label="Main">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">Home</a>
          <div class="shop" (mouseenter)="openShop()" (mouseleave)="closeShopSoon()">
            <a routerLink="/categories" routerLinkActive="active" class="shop-trigger"
               [attr.aria-expanded]="shopOpen()" aria-haspopup="true"
               (focus)="openShop()" (keydown.arrowdown)="openShop(); $event.preventDefault()">
              Shop
              <svg class="caret" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          </div>
          <a routerLink="/about" routerLinkActive="active">About us</a>
          <a routerLink="/track-order" routerLinkActive="active">Track my order</a>
        </nav>

        <div class="header-actions">
          <a routerLink="/search" class="icon-button" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.4"/>
              <path d="m20 20-4.6-4.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </a>
          <a routerLink="/profile" class="icon-button account-link" aria-label="Account">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8.4" r="3.4" stroke="currentColor" stroke-width="1.4"/>
              <path d="M5.2 20c1.1-3.6 3.9-5.5 6.8-5.5s5.7 1.9 6.8 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
          </a>
          <button type="button" class="icon-button cart-link" aria-label="Open bag" (click)="cart.openDrawer()">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7.5 8.5h9l-.9 10.2a1.6 1.6 0 0 1-1.6 1.5h-4a1.6 1.6 0 0 1-1.6-1.5L7.5 8.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
              <path d="M9.6 10V7.2a2.4 2.4 0 0 1 4.8 0V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            @if (cart.cart().itemCount > 0) {
              <span class="count">{{ cart.cart().itemCount }}</span>
            }
          </button>
        </div>
      </div>

      <!-- Shop mega-menu: every category with its cover shot, built from what's actually in stock. -->
      <div class="mega" [class.open]="shopOpen()" (mouseenter)="openShop()" (mouseleave)="closeShopSoon()"
           (focusout)="onMegaFocusOut($event)">
        <div class="container mega-inner">
          <div class="mega-list">
            <p class="mega-title">Shop by category</p>
            <a routerLink="/categories" (click)="closeShop()" class="mega-all">Shop all</a>
            <a routerLink="/categories" [queryParams]="{ new: 1 }" (click)="closeShop()">New in</a>
            @for (c of categories(); track c.name) {
              <a routerLink="/categories" [queryParams]="{ category: c.name }" (click)="closeShop()">
                {{ c.name }} <span class="mega-count">{{ c.productCount }}</span>
              </a>
            }
          </div>
          <div class="mega-tiles">
            @for (c of categories().slice(0, 8); track c.name) {
              <a class="tile" routerLink="/categories" [queryParams]="{ category: c.name }" (click)="closeShop()">
                <span class="tile-img">
                  @if (c.imageUrl) { <img [src]="c.imageUrl | mediaUrl" [alt]="c.name" loading="lazy"> }
                  @else { <span class="tile-letter">{{ c.name.charAt(0) }}</span> }
                </span>
                <span class="tile-name">{{ c.name }}</span>
              </a>
            } @empty {
              <p class="mega-empty">Categories appear here once products are added.</p>
            }
          </div>
        </div>
      </div>
    </header>
    @if (shopOpen()) { <div class="mega-scrim" (mouseenter)="closeShop()" (click)="closeShop()"></div> }

    <app-cart-drawer />

    <!-- Mobile drawer -->
    @if (menuOpen()) {
      <div class="scrim" (click)="closeMenu()"></div>
    }
    <aside class="drawer" [class.open]="menuOpen()" aria-label="Menu">
      <div class="drawer-top">
        <span class="wordmark">{{ settings.storeName() }}</span>
        <button class="icon-button" (click)="closeMenu()" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <nav class="drawer-nav">
        <a routerLink="/" (click)="closeMenu()">Home</a>
        <button type="button" class="drawer-shop" (click)="mobileShopOpen.set(!mobileShopOpen())" [attr.aria-expanded]="mobileShopOpen()">
          Shop
          <svg class="caret" [class.up]="mobileShopOpen()" viewBox="0 0 16 16" aria-hidden="true"><path d="m4 6 4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
        @if (mobileShopOpen()) {
          <div class="drawer-cats">
            <a routerLink="/categories" (click)="closeMenu()">Shop all</a>
            @for (c of categories(); track c.name) {
              <a routerLink="/categories" [queryParams]="{ category: c.name }" (click)="closeMenu()">
                @if (c.imageUrl) { <img [src]="c.imageUrl | mediaUrl" alt="" loading="lazy"> }
                {{ c.name }}
              </a>
            }
          </div>
        }
        <a routerLink="/about" (click)="closeMenu()">About us</a>
        <a routerLink="/track-order" (click)="closeMenu()">Track my order</a>
        <a routerLink="/search" (click)="closeMenu()">Search</a>
        <a routerLink="/profile" (click)="closeMenu()">Account</a>
      </nav>
      <div class="drawer-foot">
        @if (auth.isLoggedIn()) {
          @if (auth.isAdmin()) {
            <a class="btn btn-outline btn-block" routerLink="/admin" (click)="closeMenu()">Admin dashboard</a>
          }
          <button class="btn btn-ghost" (click)="logout()">Log out</button>
        } @else {
          <a class="btn btn-primary btn-block" routerLink="/auth/login" (click)="closeMenu()">Log in</a>
          <a class="link-quiet" routerLink="/auth/register" (click)="closeMenu()">Create an account</a>
        }
      </div>
    </aside>

    <main class="content">
      <router-outlet></router-outlet>
    </main>

    <footer class="site-footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="wordmark">{{ settings.storeName() }}</span>
            <p>{{ settings.settings().tagline }}</p>
          </div>
          <div class="footer-col">
            <h3>Shop</h3>
            <a routerLink="/">New in</a>
            <a routerLink="/categories">Shop all</a>
            <a routerLink="/about">About us</a>
          </div>
          <div class="footer-col">
            <h3>Account</h3>
            <a routerLink="/profile">Your account</a>
            <a routerLink="/cart">Cart</a>
            @if (auth.isAdmin()) { <a routerLink="/admin">Admin</a> }
          </div>
          <div class="footer-col">
            <h3>Help</h3>
            <a routerLink="/track-order">Track my order</a>
            <a routerLink="/search">Find a product</a>
            @if (settings.settings().supportEmail) {
              <a [href]="'mailto:' + settings.settings().supportEmail">{{ settings.settings().supportEmail }}</a>
            }
            @if (settings.settings().supportPhone) {
              <a [href]="'tel:' + settings.settings().supportPhone">{{ settings.settings().supportPhone }}</a>
            }
            @if (settings.settings().supportHours) {
              <span class="muted">{{ settings.settings().supportHours }}</span>
            }
          </div>
        </div>
        <div class="footer-base">
          <span>© {{ year }} {{ settings.storeName() }}</span>
          <span>Made in India</span>
        </div>
      </div>
    </footer>

    <!-- Mobile bottom bar: thumb-reachable, five fixed destinations -->
    <nav class="bottom-nav" aria-label="Primary">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3.5 11 12 4.2 20.5 11M6 9.6V19a1 1 0 0 0 1 1h3.2v-5.1h3.6V20H17a1 1 0 0 0 1-1V9.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
        <span>Home</span>
      </a>
      <a routerLink="/search" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.4"/><path d="m20 20-4.6-4.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        <span>Search</span>
      </a>
      <a routerLink="/cart" routerLinkActive="active">
        <span class="icon-wrap">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7.5 8.5h9l-.9 10.2a1.6 1.6 0 0 1-1.6 1.5h-4a1.6 1.6 0 0 1-1.6-1.5L7.5 8.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9.6 10V7.2a2.4 2.4 0 0 1 4.8 0V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          @if (cart.cart().itemCount > 0) { <span class="count">{{ cart.cart().itemCount }}</span> }
        </span>
        <span>Cart</span>
      </a>
      <a routerLink="/profile" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8.4" r="3.4" stroke="currentColor" stroke-width="1.4"/><path d="M5.2 20c1.1-3.6 3.9-5.5 6.8-5.5s5.7 1.9 6.8 5.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
        <span>Account</span>
      </a>
    </nav>
  </div>
  `,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  readonly year = new Date().getFullYear();

  /** Shown in the scrolling bar at the top of every storefront page. */
  readonly announcements = [
    'Free shipping on orders over ₹999',
    'Easy 7-day returns',
    'Secure payments with Razorpay',
    'Dispatched within 2 working days'
  ];
  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);
  readonly shopOpen = signal(false);
  readonly mobileShopOpen = signal(false);
  readonly categories = signal<Category[]>([]);
  private shopTimer: ReturnType<typeof setTimeout> | null = null;
  private host = inject(ElementRef<HTMLElement>);

  constructor(
    public auth: AuthService,
    public cart: CartService,
    public settings: SettingsService,
    private router: Router,
    storefront: StorefrontService
  ) {
    storefront.categories().subscribe({ next: c => this.categories.set(c), error: () => {} });
    if (auth.isLoggedIn()) {
      cart.refresh().subscribe({ error: () => {} });
    }
    // Any navigation closes the drawer, including browser back.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
      this.closeMenu();
      this.closeShop();
      this.cart.closeDrawer();
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu();
    this.closeShop();
  }

  openShop() {
    if (this.shopTimer) { clearTimeout(this.shopTimer); this.shopTimer = null; }
    this.shopOpen.set(true);
  }

  /** A short grace period so moving the pointer from "Shop" down into the panel doesn't close it. */
  closeShopSoon() {
    if (this.shopTimer) clearTimeout(this.shopTimer);
    this.shopTimer = setTimeout(() => this.closeShop(), 160);
  }

  closeShop() {
    if (this.shopTimer) { clearTimeout(this.shopTimer); this.shopTimer = null; }
    this.shopOpen.set(false);
  }

  onMegaFocusOut(e: FocusEvent) {
    const next = e.relatedTarget as Node | null;
    const header = (this.host.nativeElement as HTMLElement).querySelector('.site-header');
    if (!next || !header?.contains(next)) this.closeShop();
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
    this.lockBodyScroll(this.menuOpen());
  }

  closeMenu() {
    this.mobileShopOpen.set(false);
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    this.lockBodyScroll(false);
  }

  /** Stops the page scrolling behind the open drawer on touch devices. */
  private lockBodyScroll(locked: boolean) {
    document.body.style.overflow = locked ? 'hidden' : '';
  }

  logout() {
    this.auth.logout();
    this.cart.cart.set({ items: [], total: 0, itemCount: 0 });
    this.closeMenu();
    this.router.navigate(['/']);
  }
}
