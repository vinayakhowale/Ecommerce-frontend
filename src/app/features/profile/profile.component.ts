import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, MediaUrlPipe],
  template: `
  <div class="container profile-page">
    @if (auth.currentUser(); as user) {
      <div class="profile-card card">
        <div class="avatar">
          @if (user.profileImageUrl) {
            <img [src]="user.profileImageUrl | mediaUrl" [alt]="user.name">
          } @else {
            <span>{{ user.name.charAt(0) }}</span>
          }
        </div>
        <h1>{{ user.name }}</h1>
        <p class="email">{{ user.email }}</p>
        @if (user.role !== 'USER') { <span class="chip chip-jade">{{ user.role }}</span> }

        <div class="menu">
          <a routerLink="/cart">
            <span class="menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 4h2l1.2 12.4a2 2 0 0 0 2 1.8h8.6a2 2 0 0 0 2-1.7L21 8H6.5" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/><circle cx="10" cy="21" r="1.3" fill="currentColor"/><circle cx="17.5" cy="21" r="1.3" fill="currentColor"/></svg>
            </span>
            Your bag
          </a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin">
              <span class="menu-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/></svg>
              </span>
              Admin dashboard
            </a>
          }
          <button (click)="logout()">
            <span class="menu-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </span>
            Log out
          </button>
        </div>
      </div>
    } @else {
      <div class="empty-state">
        <h3>You're not logged in</h3>
        <p>Log in to see your account, bag and order details.</p>
        <a class="btn btn-primary" routerLink="/auth/login">Log in</a>
      </div>
    }
  </div>
  `,
  styles: [`
    .profile-page { max-width: 520px; padding-block: clamp(2rem, 5vw, 3.5rem) var(--section); }
    .profile-card { padding: clamp(1.75rem, 4vw, 2.5rem); text-align: center; }
    .avatar {
      width: 84px; height: 84px; border-radius: 50%; margin: 0 auto 1.1rem;
      background: var(--ink); color: var(--surface);
      display: grid; place-items: center; overflow: hidden;
      font-family: var(--font-display); font-size: 1.9rem;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    .profile-card h1 { font-size: var(--t-h2); }
    .email { color: var(--ink-soft); font-size: var(--t-sm); margin: 0.35rem 0 0.9rem; }

    .menu { display: flex; flex-direction: column; margin-top: 1.75rem; text-align: left; }
    .menu a, .menu button {
      display: flex; align-items: center; gap: 0.85rem;
      min-height: 54px; padding: 0.85rem 0.25rem;
      border: none; border-top: 1px solid var(--line); background: transparent;
      font-size: var(--t-sm); font-weight: 600; color: var(--ink); width: 100%; text-align: left;
    }
    .menu > :last-child { border-bottom: 1px solid var(--line); }
    .menu a:hover, .menu button:hover { color: var(--vetiver); }
    .menu-icon { display: inline-flex; color: var(--ink-faint); }
`]
})
export class ProfileComponent implements OnInit {
  constructor(public auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.fetchMe().subscribe({ error: () => {} });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
