import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  template: `
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="brand">
        <span class="brand-mark">T</span>
        <div>
          <div class="brand-name">Trendly</div>
          <div class="brand-sub">Admin</div>
        </div>
      </div>
      <nav>
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact:true}">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/></svg>
          Dashboard
        </a>
        <a routerLink="/admin/products" routerLinkActive="active">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M20.5 12.5 12.6 20.4a1.5 1.5 0 0 1-2.1 0l-6.9-6.9a1.5 1.5 0 0 1 0-2.1l7.9-7.9H18a2.5 2.5 0 0 1 2.5 2.5v6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><circle cx="15.5" cy="8.5" r="1.4" fill="currentColor"/></svg>
          Products
        </a>
        <a routerLink="/admin/users" routerLinkActive="active">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.7"/><path d="M3 20c.8-3.4 3.2-5 6-5s5.2 1.6 6 5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><path d="M16 4.2c1.5.5 2.5 1.8 2.5 3.3s-1 2.8-2.5 3.3M18.5 14.6c2 .6 3.4 2 4 4.9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          Users
        </a>
        <a routerLink="/admin/cart-analytics" routerLinkActive="active">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M4 4h2l1.2 12.4a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L21 8H6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.3" fill="currentColor"/><circle cx="17.5" cy="21" r="1.3" fill="currentColor"/><path d="M9 9v4M12 9v4M15 9v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>
          Cart Analytics
        </a>
        <a routerLink="/admin/influencers" routerLinkActive="active">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M12 3 4 7v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V7l-8-4Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="m9 12 2 2 4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
          Influencers
        </a>
        <a routerLink="/admin/discounts" routerLinkActive="active">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none"><path d="M9 3h6l6 6v6l-6 6H9l-6-6V9l6-6Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9.5 9.5h.01M14.5 14.5h.01M15 9l-6 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>
          Offers
        </a>
      </nav>
      <div class="admin-footer">
        <a routerLink="/">← Back to site</a>
        <button (click)="logout()">Log out</button>
      </div>
    </aside>
    <main class="admin-content">
      <router-outlet></router-outlet>
    </main>
  </div>
  `,
  styles: [`
    .admin-shell { display: flex; min-height: 100vh; background: var(--mist); }
    .admin-sidebar {
      width: 232px; flex-shrink: 0; background: var(--ink); color: var(--mist);
      display: flex; flex-direction: column; padding: 26px 18px; position: sticky; top: 0; height: 100vh;
    }
    .brand { display: flex; align-items: center; gap: 11px; margin-bottom: 34px; }
    .brand-mark { width: 34px; height: 34px; border-radius: 10px; background: var(--poppy); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; color: white; }
    .brand-name { font-family: var(--font-display); font-weight: 600; font-size: 15px; }
    .brand-sub { font-size: 11px; opacity: 0.55; }
    nav { display: flex; flex-direction: column; gap: 3px; flex: 1; }
    nav a {
      display: flex; align-items: center; gap: 11px; padding: 11px 13px; border-radius: 12px;
      color: rgba(238,241,239,0.65); font-weight: 600; font-size: 14px; transition: background var(--dur-fast), color var(--dur-fast);
    }
    nav a:hover { background: rgba(255,255,255,0.06); color: var(--mist); }
    nav a.active { background: var(--poppy); color: white; }
    .admin-footer { display: flex; flex-direction: column; gap: 4px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1); }
    .admin-footer a, .admin-footer button {
      background: none; border: none; text-align: left; color: rgba(238,241,239,0.6); font-size: 13px; padding: 9px 13px; font-weight: 600; border-radius: 10px;
    }
    .admin-footer a:hover, .admin-footer button:hover { background: rgba(255,255,255,0.06); color: var(--mist); }
    .admin-content { flex: 1; padding: 34px 38px; min-width: 0; }
    @media (max-width: 900px) {
      .admin-shell { flex-direction: column; }
      .admin-sidebar { width: 100%; height: auto; position: static; flex-direction: row; align-items: center; overflow-x: auto; padding: 14px 16px; }
      .admin-sidebar .brand, .admin-footer { display: none; }
      nav { flex-direction: row; }
      nav a { white-space: nowrap; }
      .admin-content { padding: 20px 16px 80px; }
    }
  `]
})
export class AdminLayoutComponent {
  constructor(private auth: AuthService, private router: Router) {}

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
