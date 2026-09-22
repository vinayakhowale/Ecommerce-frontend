import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { ToastService } from '../../core/services/toast.service';
import { Influencer } from '../../core/models/influencer.model';

@Component({
  selector: 'app-admin-influencer-sales',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="admin-page">
    <header>
      <p class="eyebrow">Manually confirmed</p>
      <h1>Influencer Sales Management</h1>
      <p class="sub">
        Since purchases complete on the seller's own site, this platform can't automatically confirm them.
        The number below is the official sales count for each influencer — update it whenever you receive confirmation of new sales.
      </p>
    </header>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else if (influencers.length === 0) {
      <div class="empty-state">
        <span class="emoji">🤝</span>
        <h3>No influencers yet</h3>
        <p>Add influencers first from the Influencers page.</p>
      </div>
    } @else {
      <div class="table card">
        <div class="row head">
          <span>Influencer</span><span>Code</span><span>Current Sales</span><span>Update to</span><span></span>
        </div>
        @for (inf of influencers; track inf.id) {
          <div class="row">
            <span class="name-cell">{{ inf.name }}</span>
            <span class="code-chip">{{ inf.code }}</span>
            <span class="current-count num">{{ inf.salesCount }}</span>
            <input type="number" min="0" class="count-input" [(ngModel)]="editValues[inf.id]" [placeholder]="inf.salesCount.toString()">
            <div class="row-actions">
              <button class="btn btn-accent btn-sm" [disabled]="savingId === inf.id" (click)="update(inf)">
                {{ savingId === inf.id ? 'Saving…' : 'Update' }}
              </button>
            </div>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    header { margin-bottom: 26px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 10px; }
    .sub { color: var(--ink-soft); font-size: 13.5px; max-width: 680px; line-height: 1.65; }
    .table-skel { height: 260px; }
    .table { overflow: hidden; }
    .row {
      display: grid; grid-template-columns: 1.4fr 0.9fr 1fr 1fr auto; align-items: center; gap: 12px;
      padding: 15px 20px; border-bottom: 1px solid var(--mist-deep); font-size: 13.5px;
    }
    .row:last-child { border-bottom: none; }
    .row.head { font-weight: 700; color: var(--ink-soft); font-size: 11px; text-transform: uppercase; background: var(--mist); }
    .name-cell { font-weight: 600; }
    .code-chip { font-family: var(--font-display); font-weight: 700; letter-spacing: 0.03em; }
    .current-count { font-size: 18px; color: var(--jade-deep); }
    .count-input {
      padding: 9px 12px; border-radius: var(--r-sm); border: 1.5px solid var(--sand); font-size: 14px;
      width: 100%; max-width: 120px;
    }
    .count-input:focus { border-color: var(--poppy); outline: none; box-shadow: 0 0 0 3px var(--poppy-wash); }
    .row-actions { display: flex; justify-content: flex-end; }
    @media (max-width: 880px) {
      .row { grid-template-columns: 1fr; gap: 8px; }
      .row.head { display: none; }
    }
  `]
})
export class AdminInfluencerSalesComponent implements OnInit {
  influencers: Influencer[] = [];
  loading = true;
  savingId: number | null = null;
  editValues: Record<number, number | null> = {};

  constructor(private adminService: AdminService, private toast: ToastService) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.adminService.listInfluencers(0, 200).subscribe({
      next: (res) => {
        this.influencers = res.content;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  update(inf: Influencer) {
    const newValue = this.editValues[inf.id];
    if (newValue === null || newValue === undefined || newValue < 0) {
      this.toast.error('Enter a valid sales count (0 or more)');
      return;
    }
    this.savingId = inf.id;
    this.adminService.updateInfluencerSalesCount(inf.id, newValue).subscribe({
      next: (updated) => {
        inf.salesCount = updated.salesCount;
        this.editValues[inf.id] = null;
        this.savingId = null;
        this.toast.success(`${inf.name}'s sales count updated to ${updated.salesCount}`);
      },
      error: (err) => {
        this.savingId = null;
        this.toast.error(err?.error?.message || 'Could not update sales count');
      }
    });
  }
}
