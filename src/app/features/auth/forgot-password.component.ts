import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="auth-page">
    <div class="brand-panel">
      <a routerLink="/" class="brand">
        <span class="brand-mark">T</span>
        <span class="brand-name">Trendly</span>
      </a>
      <div class="statement">
        <p class="eyebrow">Account recovery</p>
        <h1>Locked out?<br>Let's fix<br>that.</h1>
      </div>
      <p class="statement-sub">We'll email you a secure link to choose a new password.</p>
    </div>

    <div class="form-panel">
      <div class="form-wrap">
        @if (!sent) {
          <h2>Forgot password</h2>
          <p class="sub">Enter the email you signed up with.</p>

          <form (ngSubmit)="submit()">
            <div class="field">
              <label>Email</label>
              <input type="email" name="email" [(ngModel)]="email" required autocomplete="email" autofocus>
            </div>
            @if (error) { <p class="error">{{ error }}</p> }
            <button type="submit" class="btn btn-accent btn-block" [disabled]="loading || !email">
              {{ loading ? 'Sending…' : 'Send reset link' }}
            </button>
          </form>
        } @else {
          <div class="sent-state">
            <span class="emoji">📬</span>
            <h2>Check your email</h2>
            <p class="sub">
              If an account exists for <strong>{{ email }}</strong>, we've sent a link to reset your password.
              It's valid for 30 minutes.
            </p>
          </div>
        }

        <p class="switch">Remembered it? <a routerLink="/auth/login">Log in</a></p>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-page { min-height: 100vh; display: grid; grid-template-columns: 1fr 1fr; }
    .brand-panel {
      background: var(--ink); color: var(--mist);
      padding: 44px; display: flex; flex-direction: column; justify-content: space-between;
    }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-mark { width: 36px; height: 36px; border-radius: 10px; background: var(--poppy); color: white; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; }
    .brand-name { font-family: var(--font-display); font-weight: 600; font-size: 18px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 10px; }
    .statement h1 { font-size: 40px; color: var(--mist); line-height: 1.15; }
    .statement-sub { color: rgba(238,241,239,0.6); font-size: 14px; max-width: 320px; }
    .form-panel { display: flex; align-items: center; justify-content: center; padding: 40px 24px; background: var(--mist); }
    .form-wrap { width: 100%; max-width: 360px; }
    .form-wrap h2 { font-size: 26px; margin-bottom: 6px; }
    .sub { color: var(--ink-soft); font-size: 13.5px; margin-bottom: 26px; line-height: 1.6; }
    .error { color: var(--poppy); font-size: 13px; margin: -8px 0 14px; }
    .switch { margin-top: 22px; font-size: 13.5px; color: var(--ink-soft); text-align: center; }
    .switch a { color: var(--poppy-deep); font-weight: 700; }
    .sent-state { text-align: center; padding: 8px 0 4px; }
    .sent-state .emoji { font-size: 40px; display: block; margin-bottom: 14px; }
    .sent-state h2 { font-size: 22px; margin-bottom: 10px; }
    @media (max-width: 860px) {
      .auth-page { grid-template-columns: 1fr; }
      .brand-panel { padding: 28px; }
      .statement h1 { font-size: 30px; }
    }
  `]
})
export class ForgotPasswordComponent {
  email = '';
  loading = false;
  sent = false;
  error = '';

  constructor(private auth: AuthService) {}

  submit() {
    if (!this.email) return;
    this.loading = true;
    this.error = '';
    this.auth.forgotPassword(this.email).subscribe({
      next: () => { this.loading = false; this.sent = true; },
      error: () => {
        // Even on a network/server error, don't leak account-existence info in the message --
        // just show the same neutral "sent" state, matching the backend's intentionally generic response.
        this.loading = false;
        this.sent = true;
      }
    });
  }
}
