import { Component, HostListener, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
  <div class="shell">
    <!-- Announcement: one line, no marquee. It says something useful or it doesn't appear. -->
    <div class="announce">
      <div class="container announce-inner">
        <span>Free shipping on orders over ₹999</span>
        <span class="dot" aria-hidden="true"></span>
        <span>Easy 7-day returns</span>
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

        <a routerLink="/" class="wordmark" aria-label="Trendly home">Trendly</a>

        <nav class="primary-nav">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">New in</a>
          <a routerLink="/explore" routerLinkActive="active">Edit</a>
          <a routerLink="/categories" routerLinkActive="active">Collections</a>
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
          <a routerLink="/cart" class="icon-button cart-link" aria-label="Cart">
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M7.5 8.5h9l-.9 10.2a1.6 1.6 0 0 1-1.6 1.5h-4a1.6 1.6 0 0 1-1.6-1.5L7.5 8.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
              <path d="M9.6 10V7.2a2.4 2.4 0 0 1 4.8 0V10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
            </svg>
            @if (cart.cart().itemCount > 0) {
              <span class="count">{{ cart.cart().itemCount }}</span>
            }
          </a>
        </div>
      </div>
    </header>

    <!-- Mobile drawer -->
    @if (menuOpen()) {
      <div class="scrim" (click)="closeMenu()"></div>
    }
    <aside class="drawer" [class.open]="menuOpen()" aria-label="Menu">
      <div class="drawer-top">
        <span class="wordmark">Trendly</span>
        <button class="icon-button" (click)="closeMenu()" aria-label="Close menu">
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
      <nav class="drawer-nav">
        <a routerLink="/" (click)="closeMenu()">New in</a>
        <a routerLink="/explore" (click)="closeMenu()">The edit</a>
        <a routerLink="/categories" (click)="closeMenu()">Collections</a>
        <a routerLink="/search" (click)="closeMenu()">Search</a>
        <a routerLink="/cart" (click)="closeMenu()">Cart</a>
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
            <span class="wordmark">Trendly</span>
            <p>Products worn and recommended by the creators you already follow.</p>
          </div>
          <div class="footer-col">
            <h3>Shop</h3>
            <a routerLink="/">New in</a>
            <a routerLink="/explore">The edit</a>
            <a routerLink="/categories">Collections</a>
          </div>
          <div class="footer-col">
            <h3>Account</h3>
            <a routerLink="/profile">Your account</a>
            <a routerLink="/cart">Cart</a>
            @if (auth.isAdmin()) { <a routerLink="/admin">Admin</a> }
          </div>
          <div class="footer-col">
            <h3>Help</h3>
            <a routerLink="/search">Find a product</a>
            <span class="muted">Support: 10am–7pm, Mon–Fri</span>
          </div>
        </div>
        <div class="footer-base">
          <span>© {{ year }} Trendly</span>
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
      <a routerLink="/explore" routerLinkActive="active">
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.4" stroke="currentColor" stroke-width="1.4"/><path d="m15.2 8.8-2 5.4-5.4 2 2-5.4 5.4-2Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>
        <span>Edit</span>
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
  readonly menuOpen = signal(false);
  readonly scrolled = signal(false);

  constructor(public auth: AuthService, public cart: CartService, private router: Router) {
    if (auth.isLoggedIn()) {
      cart.refresh().subscribe({ error: () => {} });
    }
    // Any navigation closes the drawer, including browser back.
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.closeMenu());
  }

  @HostListener('window:scroll')
  onScroll() {
    this.scrolled.set(window.scrollY > 8);
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenu();
  }

  toggleMenu() {
    this.menuOpen.update(v => !v);
    this.lockBodyScroll(this.menuOpen());
  }

  closeMenu() {
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
