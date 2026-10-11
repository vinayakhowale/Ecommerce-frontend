import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService, InfluencerPayload } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Influencer } from '../../core/models/influencer.model';
import { MediaUrlPipe } from '../../core/pipes/media-url.pipe';

@Component({
  selector: 'app-admin-influencers',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  template: `
  <div class="admin-page">
    <header>
      <div>
        <p class="eyebrow">Referral program</p>
        <h1>Influencers</h1>
      </div>
      <button class="btn btn-accent" (click)="openNew()">+ New Influencer</button>
    </header>

    @if (showForm) {
      <form class="form-card card" (ngSubmit)="save()">
        <h2>{{ isEdit ? 'Edit Influencer' : 'New Influencer' }}</h2>
        <div class="two-col">
          <div class="field">
            <label>Name *</label>
            <input type="text" [(ngModel)]="form.name" name="name" required>
          </div>
          <div class="field">
            <label>Referral Code</label>
            <input type="text" [(ngModel)]="form.code" name="code" placeholder="Auto-generated if left blank">
            <span class="hint">Shared with their audience, e.g. as ?ref=CODE on a product link.</span>
          </div>
        </div>
        <div class="two-col">
          <div class="field">
            <label>Email</label>
            <input type="email" [(ngModel)]="form.email" name="email">
          </div>
          <div class="field">
            <label>Phone</label>
            <input type="text" [(ngModel)]="form.phone" name="phone">
          </div>
        </div>
        <div class="field">
          <label>Profile Image</label>
          <label class="upload-btn">
            <input type="file" accept="image/*" (change)="onImageSelected($event)" hidden>
            {{ form.profileImageUrl ? 'Replace file' : 'Choose file' }}
          </label>
          @if (form.profileImageUrl) { <img class="preview" [src]="form.profileImageUrl | mediaUrl" alt="Preview"> }
        </div>
        @if (error) { <p class="error">{{ error }}</p> }
        <div class="form-actions">
          <button type="button" class="btn btn-outline" (click)="cancelForm()">Cancel</button>
          <button type="submit" class="btn btn-accent" [disabled]="saving">{{ saving ? 'Saving…' : 'Save' }}</button>
        </div>
      </form>
    }

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (influencers.length === 0) {
      <div class="empty-state">
        <span class="emoji">🤝</span>
        <h3>No influencers yet</h3>
        <p>Add one to generate their referral code.</p>
      </div>
    } @else {
      <div class="table card">
        <div class="row head">
          <span>Influencer</span><span>Code</span><span>Contact</span><span>Status</span><span></span>
        </div>
        @for (inf of influencers; track inf.id) {
          <div class="row">
            <div class="inf-cell">
              @if (inf.profileImageUrl) { <img [src]="inf.profileImageUrl | mediaUrl" [alt]="inf.name"> }
              @else { <div class="cell-fallback">{{ inf.name.charAt(0) }}</div> }
              <span>{{ inf.name }}</span>
            </div>
            <span class="code-chip">{{ inf.code }}</span>
            <span class="contact-cell">{{ inf.email || inf.phone || '—' }}</span>
            <span class="status" [class.active]="inf.active" [class.inactive]="!inf.active">{{ inf.active ? 'Active' : 'Inactive' }}</span>
            <div class="row-actions">
              <button class="btn btn-outline btn-sm" (click)="openEdit(inf)">Edit</button>
              @if (inf.active) {
                <button class="btn btn-ghost btn-sm" (click)="deactivate(inf)">Deactivate</button>
              } @else {
                <button class="btn btn-ghost btn-sm" (click)="activate(inf)">Activate</button>
              }
              <button class="btn btn-ghost btn-sm danger" (click)="remove(inf)">Delete</button>
            </div>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 26px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; }
    .form-card { padding: 28px; max-width: 640px; margin-bottom: 24px; }
    .form-card h2 { font-size: 18px; margin-bottom: 18px; }
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .hint { font-size: 12px; color: var(--ink-soft); }
    .upload-btn {
      display: inline-block; padding: 10px 16px; border-radius: 999px; border: 1.5px solid var(--sand);
      font-weight: 700; font-size: 13px; cursor: pointer; width: fit-content;
    }
    .preview { margin-top: 10px; width: 60px; height: 60px; object-fit: cover; border-radius: 50%; display: block; }
    .error { color: var(--poppy); font-size: 13px; margin-bottom: 12px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
    .table-skel { height: 260px; }
    .table { overflow: hidden; }
    .row {
      display: grid; grid-template-columns: 1.6fr 1fr 1.4fr 1fr auto; align-items: center; gap: 12px;
      padding: 15px 20px; border-bottom: 1px solid var(--mist-deep); font-size: 13.5px;
    }
    .row:last-child { border-bottom: none; }
    .row.head { font-weight: 700; color: var(--ink-soft); font-size: 11.5px; text-transform: uppercase; background: var(--mist); }
    .inf-cell { display: flex; align-items: center; gap: 11px; font-weight: 600; }
    .inf-cell img { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; }
    .cell-fallback { width: 38px; height: 38px; border-radius: 50%; background: var(--poppy-wash); color: var(--poppy); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; }
    .code-chip { font-family: var(--font-display); font-weight: 700; letter-spacing: 0.03em; }
    .contact-cell { color: var(--ink-soft); }
    .status { font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 999px; width: fit-content; }
    .status.active { background: var(--jade-wash); color: var(--jade-deep); }
    .status.inactive { background: var(--poppy-wash); color: var(--poppy-deep); }
    .row-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
    .danger { color: var(--poppy); }
    @media (max-width: 880px) {
      .two-col { grid-template-columns: 1fr; }
      .row { grid-template-columns: 1fr; gap: 8px; }
      .row.head { display: none; }
    }
  `]
})
export class AdminInfluencersComponent implements OnInit {
  influencers: Influencer[] = [];
  loading = true;
  showForm = false;
  isEdit = false;
  editId: number | null = null;
  saving = false;
  error = '';

  form: InfluencerPayload = { name: '', code: '', profileImageUrl: '', email: '', phone: '', active: true };

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.adminService.listInfluencers(0, 100).subscribe({
      next: (res) => { this.influencers = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  openNew() {
    this.isEdit = false;
    this.editId = null;
    this.form = { name: '', code: '', profileImageUrl: '', email: '', phone: '', active: true };
    this.error = '';
    this.showForm = true;
  }

  openEdit(inf: Influencer) {
    this.isEdit = true;
    this.editId = inf.id;
    this.form = { name: inf.name, code: inf.code, profileImageUrl: inf.profileImageUrl, email: inf.email, phone: inf.phone, active: inf.active };
    this.error = '';
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
  }

  onImageSelected(evt: Event) {
    const file = (evt.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.adminService.uploadInfluencerImage(file).subscribe({
      next: (res) => this.form.profileImageUrl = res.url,
      error: () => this.toast.error('Image upload failed')
    });
  }

  save() {
    if (!this.form.name) return;
    this.saving = true;
    this.error = '';
    const request$ = this.isEdit && this.editId
      ? this.adminService.updateInfluencer(this.editId, this.form)
      : this.adminService.createInfluencer(this.form);

    request$.subscribe({
      next: (inf) => {
        this.toast.success(this.isEdit ? 'Influencer updated' : `Influencer created — code: ${inf.code}`);
        this.showForm = false;
        this.saving = false;
        this.load();
      },
      error: (err) => {
        this.error = err?.error?.message || 'Could not save influencer';
        this.saving = false;
      }
    });
  }

  activate(inf: Influencer) {
    this.adminService.activateInfluencer(inf.id).subscribe({
      next: () => { inf.active = true; this.toast.success('Influencer activated'); },
      error: () => this.toast.error('Could not activate influencer')
    });
  }

  deactivate(inf: Influencer) {
    this.adminService.deactivateInfluencer(inf.id).subscribe({
      next: () => { inf.active = false; this.toast.success('Influencer deactivated'); },
      error: () => this.toast.error('Could not deactivate influencer')
    });
  }

  remove(inf: Influencer) {
    if (!confirm(`Delete "${inf.name}"? This cannot be undone.`)) return;
    this.adminService.deleteInfluencer(inf.id).subscribe({
      next: () => {
        this.influencers = this.influencers.filter(x => x.id !== inf.id);
        this.toast.success('Influencer deleted');
      },
      error: (err) => this.toast.error(err?.error?.message || 'Could not delete influencer')
    });
  }
}
