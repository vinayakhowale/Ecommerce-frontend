import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../core/services/settings.service';
import { ToastService } from '../../core/services/toast.service';
import { StoreSettings } from '../../core/models/settings.model';

@Component({
  selector: 'app-admin-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="admin-page">
    <header>
      <p class="eyebrow">Store</p>
      <h1>Settings</h1>
    </header>

    @if (loading) {
      <div class="skeleton form-skel"></div>
    } @else {
      <form class="form-card card" (ngSubmit)="save()">
        <div class="field">
          <label>Store name *</label>
          <input type="text" [(ngModel)]="form.storeName" name="storeName" required maxlength="60"
                 placeholder="Trendly">
          <span class="hint">
            Appears in the header, the browser tab, the footer, the sign-in screens and the
            Razorpay payment popup.
          </span>
        </div>

        <div class="field">
          <label>Tagline</label>
          <input type="text" [(ngModel)]="form.tagline" name="tagline" maxlength="160"
                 placeholder="What your store is about, in one line">
          <span class="hint">Used in the footer and on the sign-in screens.</span>
        </div>

        <div class="field">
          <label>Announcement bar</label>
          <span class="hint">Scrolls across the top of every storefront page. Up to 6 messages.</span>
          <div class="notes">
            @for (note of form.announcements; track $index; let i = $index) {
              <div class="note-row">
                <input type="text" [ngModel]="form.announcements[i]"
                       (ngModelChange)="form.announcements[i] = $event"
                       [name]="'note' + i" maxlength="160" placeholder="e.g. Free shipping over ₹999">
                <button type="button" class="remove" (click)="removeNote(i)" aria-label="Remove message">&#10005;</button>
              </div>
            }
          </div>
          @if (form.announcements.length < 6) {
            <button type="button" class="btn btn-outline btn-sm add-note" (click)="addNote()">+ Add message</button>
          }
        </div>

        <div class="three-col">
          <div class="field">
            <label>Support email</label>
            <input type="email" [(ngModel)]="form.supportEmail" name="supportEmail" placeholder="help@yourstore.com">
          </div>
          <div class="field">
            <label>Support phone</label>
            <input type="tel" [(ngModel)]="form.supportPhone" name="supportPhone" placeholder="+91 98765 43210">
          </div>
          <div class="field">
            <label>Support hours</label>
            <input type="text" [(ngModel)]="form.supportHours" name="supportHours" placeholder="10am–7pm, Mon–Fri">
          </div>
        </div>

        @if (error) { <p class="error">{{ error }}</p> }

        <div class="form-actions">
          <button type="submit" class="btn btn-accent" [disabled]="saving || !form.storeName.trim()">
            {{ saving ? 'Saving…' : 'Save settings' }}
          </button>
        </div>
      </form>

      <aside class="preview card">
        <h2>Preview</h2>
        <div class="preview-bar">{{ form.announcements[0] || 'Your first announcement' }}</div>
        <div class="preview-header">{{ form.storeName || 'Store name' }}</div>
        <p class="preview-note">
          The name updates everywhere as soon as you save — no restart, no redeploy.
        </p>
      </aside>
    }
  </div>
  `,
  styles: [`
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 26px; }
    .admin-page { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 20px; align-items: start; max-width: 1100px; }
    header { grid-column: 1 / -1; }
    .form-skel { height: 420px; grid-column: 1 / -1; }
    .form-card { padding: 30px; }
    .three-col { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

    .notes { display: flex; flex-direction: column; gap: 8px; margin-top: 6px; }
    .note-row { display: flex; gap: 8px; align-items: center; }
    .note-row input { flex: 1; }
    .remove {
      width: 36px; height: 36px; flex-shrink: 0;
      border: 1px solid var(--line-strong); background: transparent;
      border-radius: var(--r-sm); color: var(--ink-soft); font-size: 12px; cursor: pointer;
    }
    .remove:hover { border-color: var(--ink); color: var(--ink); }
    .add-note { margin-top: 10px; }

    .error { color: var(--poppy); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: flex-end; margin-top: 8px; }

    .preview { padding: 22px; position: sticky; top: 24px; }
    .preview h2 { font-size: 15px; margin-bottom: 14px; }
    .preview-bar {
      background: var(--ink); color: var(--paper); font-size: 11px;
      padding: 8px 10px; border-radius: var(--r-sm); text-align: center;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .preview-header {
      font-family: var(--font-display); font-size: 22px; text-align: center;
      padding: 18px 0; border-bottom: 1px solid var(--line);
    }
    .preview-note { font-size: 12px; color: var(--ink-faint); margin-top: 14px; line-height: 1.5; }

    @media (max-width: 900px) {
      .admin-page { grid-template-columns: 1fr; }
      .preview { position: static; }
      .three-col { grid-template-columns: 1fr; }
    }
  `]
})
export class AdminSettingsComponent implements OnInit {
  loading = true;
  saving = false;
  error = '';

  form: StoreSettings = {
    storeName: '', tagline: '', announcements: [],
    supportEmail: '', supportPhone: '', supportHours: ''
  };

  constructor(private settingsService: SettingsService, private toast: ToastService) {}

  ngOnInit() {
    this.settingsService.fetchForAdmin().subscribe({
      next: (s) => {
        this.form = {
          storeName: s.storeName ?? '',
          tagline: s.tagline ?? '',
          announcements: [...(s.announcements ?? [])],
          supportEmail: s.supportEmail ?? '',
          supportPhone: s.supportPhone ?? '',
          supportHours: s.supportHours ?? ''
        };
        this.loading = false;
      },
      error: () => {
        this.toast.error('Could not load settings');
        this.loading = false;
      }
    });
  }

  addNote() {
    this.form.announcements.push('');
  }

  removeNote(index: number) {
    this.form.announcements.splice(index, 1);
  }

  save() {
    if (!this.form.storeName.trim()) return;
    this.saving = true;
    this.error = '';

    // Blank rows are dropped rather than saved as empty announcements.
    const payload: StoreSettings = {
      ...this.form,
      storeName: this.form.storeName.trim(),
      announcements: this.form.announcements.map(n => n.trim()).filter(Boolean)
    };

    this.settingsService.save(payload).subscribe({
      next: () => {
        this.toast.success('Settings saved');
        this.saving = false;
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not save settings';
        this.saving = false;
      }
    });
  }
}
