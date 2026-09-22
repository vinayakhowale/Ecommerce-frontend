import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-reset-password',
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
        <p class="eyebrow">Almost there</p>
        <h1>Choose a<br>new<br>password.</h1>
      </div>
      <p class="statement-sub">Make it something you haven't used here before.</p>
    </div>

    <div class="form-panel">
      <div class="form-wrap">
        @if (!token) {
          <div class="sent-state">
            <span class="emoji">⚠️</span>
            <h2>Invalid reset link</h2>
            <p class="sub">This link is missing its reset token. Please request a new one.</p>
            <a class="btn btn-accent btn-block" routerLink="/auth/forgot-password">Request a new link</a>
          </div>
        } @else if (!done) {
          <h2>Set a new password</h2>
          <p class="sub">Must be at least 8 characters.</p>

          <form (ngSubmit)="submit()">
            <div class="field">
              <label>New password</label>
              <input type="password" name="newPassword" [(ngModel)]="newPassword" required minlength="8" autocomplete="new-password" autofocus>
            </div>
            <div class="field">
              <label>Confirm password</label>
              <input type="password" name="confirmPassword" [(ngModel)]="confirmPassword" required autocomplete="new-password">
            </div>
            @if (error) { <p class="error">{{ error }}</p> }
            <button type="submit" class="btn btn-accent btn-block" [disabled]="loading">
              {{ loading ? 'Saving…' : 'Reset password' }}
            </button>
          </form>
        } @else {
          <div class="sent-state">
            <span class="emoji">✅</span>
            <h2>Password reset</h2>
            <p class="sub">Your password has been updated. You can log in with your new password now.</p>
            <a class="btn btn-accent btn-block" routerLink="/auth/login">Go to login</a>
          </div>
        }
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
    .sent-state { text-align: center; padding: 8px 0 4px; }
    .sent-state .emoji { font-size: 40px; display: block; margin-bottom: 14px; }
    .sent-state h2 { font-size: 22px; margin-bottom: 10px; }
    .sent-state .btn { margin-top: 8px; }
    @media (max-width: 860px) {
      .auth-page { grid-template-columns: 1fr; }
      .brand-panel { padding: 28px; }
      .statement h1 { font-size: 30px; }
    }
  `]
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  loading = false;
  done = false;
  error = '';

  constructor(private route: ActivatedRoute, private auth: AuthService, private toast: ToastService) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParamMap.get('token');
  }

  submit() {
    if (!this.token) return;
    if (this.newPassword.length < 8) {
      this.error = 'Password must be at least 8 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.auth.resetPassword(this.token, this.newPassword).subscribe({
      next: () => { this.loading = false; this.done = true; this.toast.success('Password reset successfully'); },
      error: (err) => {
        this.error = err?.error?.message || 'This reset link is invalid or has expired. Please request a new one.';
        this.loading = false;
      }
    });
  }
}
