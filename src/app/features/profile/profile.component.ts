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
  <div class="profile-page">
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
            My Cart
          </a>
          @if (auth.isAdmin()) {
            <a routerLink="/admin">
              <span class="menu-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="1.7"/></svg>
              </span>
              Admin Dashboard
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
    }
  </div>
  `,
  styles: [`
    .profile-page { max-width: 440px; margin: 0 auto; padding: 48px 20px 60px; }
    .profile-card { padding: 36px 30px; text-align: center; }
    .avatar {
      width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 18px;
      background: var(--ink); color: var(--mist); display: flex; align-items: center; justify-content: center;
      font-family: var(--font-display); font-weight: 700; font-size: 30px; overflow: hidden;
    }
    .avatar img { width: 100%; height: 100%; object-fit: cover; }
    h1 { font-size: 21px; }
    .email { color: var(--ink-soft); font-size: 13.5px; margin: 4px 0 14px; }
    .menu { display: flex; flex-direction: column; gap: 4px; margin-top: 30px; text-align: left; }
    .menu a, .menu button {
      display: flex; align-items: center; gap: 12px; padding: 13px 16px; border-radius: var(--r-pill);
      border: none; background: transparent; text-align: left; font-size: 14px; font-weight: 600; color: var(--ink);
      transition: background var(--dur-fast);
    }
    .menu a:hover, .menu button:hover { background: var(--mist); }
    .menu-icon { display: flex; color: var(--ink-soft); }
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
