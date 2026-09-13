import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-register',
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
        <p class="eyebrow">Join in</p>
        <h1>Shop what<br>creators<br>actually use.</h1>
      </div>
      <p class="statement-sub">Create an account to save favorites and check out faster.</p>
    </div>

    <div class="form-panel">
      <div class="form-wrap">
        <h2>Create your account</h2>
        <p class="sub">It only takes a minute.</p>

        <form (ngSubmit)="submit()">
          <div class="field">
            <label>Full name</label>
            <input type="text" name="name" [(ngModel)]="name" required autocomplete="name">
          </div>
          <div class="field">
            <label>Email</label>
            <input type="email" name="email" [(ngModel)]="email" required autocomplete="email">
          </div>
          <div class="field">
            <label>Password</label>
            <input type="password" name="password" [(ngModel)]="password" required minlength="8" autocomplete="new-password">
            <span class="hint">At least 8 characters.</span>
          </div>
          @if (error) { <p class="error">{{ error }}</p> }
          <button type="submit" class="btn btn-accent btn-block" [disabled]="loading">
            {{ loading ? 'Creating account…' : 'Sign up' }}
          </button>
        </form>

        <p class="switch">Already have an account? <a routerLink="/auth/login">Log in</a></p>
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
    .sub { color: var(--ink-soft); font-size: 13.5px; margin-bottom: 26px; }
    .hint { font-size: 12px; color: var(--ink-soft); }
    .error { color: var(--poppy); font-size: 13px; margin: -8px 0 14px; }
    .switch { margin-top: 22px; font-size: 13.5px; color: var(--ink-soft); text-align: center; }
    .switch a { color: var(--poppy-deep); font-weight: 700; }
    @media (max-width: 860px) {
      .auth-page { grid-template-columns: 1fr; }
      .brand-panel { padding: 28px; }
      .statement h1 { font-size: 30px; }
    }
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  loading = false;
  error = '';

  constructor(private auth: AuthService, private router: Router, private toast: ToastService) {}

  submit() {
    if (!this.name || !this.email || this.password.length < 8) return;
    this.loading = true;
    this.error = '';
    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => { this.toast.success('Account created!'); this.router.navigate(['/']); },
      error: (err) => { this.error = err?.error?.message || 'Could not create account'; this.loading = false; }
    });
  }
}
