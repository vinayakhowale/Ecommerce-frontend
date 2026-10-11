import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../core/services/admin.service';
import { DashboardStats } from '../../core/models/dashboard.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <div class="dashboard">
    <header>
      <p class="eyebrow">Overview</p>
      <h1>Dashboard</h1>
    </header>

    @if (loading) {
      <div class="stat-grid">
        @for (i of [1,2,3,4]; track i) { <div class="skeleton stat-skel"></div> }
      </div>
    } @else if (stats) {
      <!-- Each tile links straight to the section that owns that number. -->
      <div class="stat-grid">
        <a class="stat-card" routerLink="/admin/products">
          <span class="label">Total Products</span>
          <span class="value num">{{ stats.totalProducts }}</span>
          <span class="go">View products →</span>
        </a>
        <a class="stat-card" routerLink="/admin/influencers">
          <span class="label">Total Posts</span>
          <span class="value num">{{ stats.totalPosts }}</span>
          <span class="go">View influencers →</span>
        </a>
        <a class="stat-card" routerLink="/admin/users">
          <span class="label">Total Users</span>
          <span class="value num">{{ stats.totalUsers }}</span>
          <span class="go">View users →</span>
        </a>
        <a class="stat-card accent" routerLink="/admin/cart-analytics">
          <span class="label">Add-to-Cart Events</span>
          <span class="value num">{{ stats.totalAddToCartEvents }}</span>
          <span class="go">View cart analytics →</span>
        </a>
      </div>

      <div class="panels">
        <div class="panel card wide">
          <div class="panel-header">
            <h2>Recent uploads</h2>
            <a routerLink="/admin/posts/new" class="btn btn-accent btn-sm">+ New Post</a>
          </div>
          @if (stats.recentUploads.length === 0) {
            <p class="empty">No posts yet — create your first one.</p>
          } @else {
            <ul>
              @for (p of stats.recentUploads; track p.id) {
                <li><span>{{ p.influencerName }} — {{ p.caption || 'Untitled' }}</span><strong class="status" [class]="p.status.toLowerCase()">{{ p.status }}</strong></li>
              }
            </ul>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 26px; }
    .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 14px; margin-bottom: 28px; }
    .stat-skel { height: 92px; }
    .stat-card {
      display: block; background: var(--surface); border-radius: var(--r-md); padding: 20px;
      box-shadow: var(--shadow-card); color: inherit; transition: transform var(--dur-fast), box-shadow var(--dur-fast);
    }
    .stat-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover, var(--shadow-card)); }
    .go { display: block; margin-top: 10px; font-size: 12px; font-weight: 700; color: var(--poppy); }
    .stat-card.accent .go { color: var(--mist); opacity: 0.75; }
    .stat-card.accent { background: var(--ink); }
    .stat-card.accent .label { color: rgba(238,241,239,0.6); }
    .stat-card.accent .value { color: var(--mist); }
    .stat-card .label { display: block; font-size: 12px; color: var(--ink-soft); font-weight: 700; margin-bottom: 10px; }
    .stat-card .value { font-size: 30px; }
    .panels { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
    .panel { padding: 22px; }
    .panel.wide { grid-column: 1 / -1; }
    .panel-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
    .panel h2 { font-size: 15px; margin-bottom: 16px; }
    .panel .empty { color: var(--ink-soft); font-size: 13.5px; }
    .panel ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 11px; }
    .panel li { display: flex; justify-content: space-between; gap: 12px; font-size: 13.5px; padding-bottom: 11px; border-bottom: 1px solid var(--mist-deep); }
    .panel li:last-child { border-bottom: none; padding-bottom: 0; }
    .status { font-size: 11px; padding: 3px 10px; border-radius: 999px; background: var(--mist-deep); font-weight: 700; }
    .status.published { background: var(--jade-wash); color: var(--jade-deep); }
    .status.draft { background: #fff3d6; color: #8a6100; }
    @media (max-width: 880px) { .panels { grid-template-columns: 1fr; } }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.dashboard().subscribe({
      next: (res) => { this.stats = res; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }
}
