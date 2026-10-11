import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast-host',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="toast-host">
    @for (t of toast.toasts(); track t.id) {
      <div class="toast" [class]="t.type">
        <span class="toast-icon">
          @switch (t.type) {
            @case ('success') {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="m5 13 4 4L19 7" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>
            }
            @case ('error') {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/></svg>
            }
            @default {
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 8v5M12 16h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.8"/></svg>
            }
          }
        </span>
        {{ t.message }}
      </div>
    }
  </div>
  `,
  styles: [`
    .toast-host {
      position: fixed;
      top: 22px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 999;
      width: 100%;
      max-width: 360px;
      padding: 0 16px;
      pointer-events: none;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 13px 18px;
      border-radius: var(--r-pill, 999px);
      font-size: 13.5px;
      font-weight: 600;
      font-family: var(--font-ui, sans-serif);
      color: white;
      box-shadow: 0 12px 28px -8px rgba(21,18,28,0.35);
      animation: slide-in 260ms cubic-bezier(.16,1,.3,1);
    }
    .toast-icon { display: flex; flex-shrink: 0; }
    .toast.success { background: var(--jade, #146356); }
    .toast.error { background: var(--poppy, #ff4b2e); }
    .toast.info { background: var(--ink, #15121c); }
    @keyframes slide-in {
      from { opacity: 0; transform: translateY(-10px) scale(0.96); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ToastHostComponent {
  constructor(public toast: ToastService) {}
}
