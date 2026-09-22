import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../core/services/auth.service';
import { CartService } from '../core/services/cart.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
  <div class="shell">
    <aside class="sidebar">
      <a routerLink="/" class="brand">
        <span class="brand-mark">T</span>
        <span class="brand-name">Trendly</span>
      </a>

      <nav class="side-nav">
        <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </span>
          <span>Home</span>
        </a>
        <a routerLink="/explore" routerLinkActive="active">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m15 9-2 6-6 2 2-6 6-2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
          </span>
          <span>Explore</span>
        </a>
        <a routerLink="/categories" routerLinkActive="active">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/></svg>
          </span>
          <span>Categories</span>
        </a>
        <a routerLink="/search" routerLinkActive="active">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.7"/><path d="m20 20-4.5-4.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </span>
          <span>Search</span>
        </a>
        <a routerLink="/cart" routerLinkActive="active">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><path d="M4 4h2l1.2 12.4a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L21 8H6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="17.5" cy="21" r="1.4" fill="currentColor"/></svg>
          </span>
          <span>Cart</span>
          @if (cart.cart().itemCount > 0) { <span class="badge">{{ cart.cart().itemCount }}</span> }
        </a>
        <a routerLink="/profile" routerLinkActive="active">
          <span class="nav-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.2" r="3.4" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c1.1-3.6 4-5.4 7-5.4s5.9 1.8 7 5.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          </span>
          <span>Profile</span>
        </a>
      </nav>

      <div class="side-footer">
        @if (auth.isLoggedIn()) {
          @if (auth.isAdmin()) {
            <a class="admin-pill" routerLink="/admin">
              <span>Admin dashboard</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </a>
          }
          <button class="ghost-btn" (click)="logout()">Log out</button>
        } @else {
          <a class="cta-btn" routerLink="/auth/login">Log in</a>
        }
      </div>
    </aside>

    <main class="content">
      <router-outlet></router-outlet>
    </main>

    <nav class="bottom-nav">
      <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M3 11.5 12 4l9 7.5M5.5 10v9a1 1 0 0 0 1 1H10v-5.5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1V20h3.5a1 1 0 0 0 1-1v-9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </span>
      </a>
      <a routerLink="/explore" routerLinkActive="active">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7"/><path d="m15 9-2 6-6 2 2-6 6-2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg>
        </span>
      </a>
      <a routerLink="/search" class="search-fab" routerLinkActive="active">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m20 20-4.5-4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
        </span>
      </a>
      <a routerLink="/cart" routerLinkActive="active">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 4h2l1.2 12.4a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L21 8H6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.4" fill="currentColor"/><circle cx="17.5" cy="21" r="1.4" fill="currentColor"/></svg>
        </span>
        @if (cart.cart().itemCount > 0) { <span class="badge badge-bottom">{{ cart.cart().itemCount }}</span> }
      </a>
      <a routerLink="/profile" routerLinkActive="active">
        <span class="nav-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8.2" r="3.4" stroke="currentColor" stroke-width="1.7"/><path d="M5 20c1.1-3.6 4-5.4 7-5.4s5.9 1.8 7 5.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
        </span>
      </a>
    </nav>
  </div>
  `,
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {
  constructor(public auth: AuthService, public cart: CartService, private router: Router) {
    if (auth.isLoggedIn()) {
      cart.refresh().subscribe({ error: () => {} });
    }
  }

  logout() {
    this.auth.logout();
    this.cart.cart.set({ items: [], total: 0, itemCount: 0 });
    this.router.navigate(['/']);
  }
}
