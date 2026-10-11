import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../core/services/admin.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="admin-page">
    <header>
      <div>
        <p class="eyebrow">Accounts</p>
        <h1>Users</h1>
      </div>
      <button type="button" class="btn btn-outline" (click)="exportCsv()" [disabled]="users.length === 0">
        Export to CSV
      </button>
    </header>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else {
      <div class="table card">
        <div class="row head">
          <span>Name</span><span>Email</span><span>Phone</span><span>Role</span><span>Status</span><span></span>
        </div>
        @for (u of users; track u.id) {
          <div class="row">
            <span>{{ u.name }}</span>
            <span class="email-cell">{{ u.email }}</span>
            <span class="email-cell">{{ u.phone || '—' }}</span>
            <span>
              @if (isSuperAdmin) {
                <select [ngModel]="u.role" (ngModelChange)="changeRole(u, $event)" name="role-{{u.id}}">
                  <option value="USER">USER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                </select>
              } @else {
                {{ u.role }}
              }
            </span>
            <span class="status" [class.active]="u.active" [class.inactive]="!u.active">{{ u.active ? 'Active' : 'Inactive' }}</span>
            <div class="row-actions">
              @if (u.active) {
                <button class="btn btn-ghost btn-sm" (click)="deactivate(u)">Deactivate</button>
              } @else {
                <button class="btn btn-ghost btn-sm" (click)="activate(u)">Activate</button>
              }
            </div>
          </div>
        }
      </div>
    }
  </div>
  `,
  styles: [`
    header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 26px; }
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; }
    .table-skel { height: 300px; }
    .table { overflow: hidden; }
    .row {
      display: grid; grid-template-columns: 1.2fr 1.6fr 1.1fr 1fr 0.9fr auto; align-items: center; gap: 12px;
      padding: 15px 20px; border-bottom: 1px solid var(--mist-deep); font-size: 13.5px;
    }
    .row:last-child { border-bottom: none; }
    .row.head { font-weight: 700; color: var(--ink-soft); font-size: 11.5px; text-transform: uppercase; background: var(--mist); }
    .email-cell { color: var(--ink-soft); }
    select { padding: 7px 9px; border-radius: 8px; border: 1.5px solid var(--sand); font-size: 12.5px; }
    .status { font-size: 11.5px; font-weight: 700; padding: 4px 11px; border-radius: 999px; width: fit-content; }
    .status.active { background: var(--jade-wash); color: var(--jade-deep); }
    .status.inactive { background: var(--poppy-wash); color: var(--poppy-deep); }
    @media (max-width: 880px) {
      .row { grid-template-columns: 1fr; gap: 6px; }
      .row.head { display: none; }
    }
  `]
})
export class AdminUsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  isSuperAdmin = false;

  constructor(private adminService: AdminService, private auth: AuthService, private toast: ToastService) {}

  ngOnInit() {
    this.isSuperAdmin = this.auth.currentUser()?.role === 'SUPER_ADMIN';
    this.adminService.listUsers(0, 100).subscribe({
      next: (res) => { this.users = res.content; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  activate(u: User) {
    this.adminService.activateUser(u.id).subscribe({
      next: () => { u.active = true; this.toast.success('User activated'); },
      error: () => this.toast.error('Could not activate user')
    });
  }

  deactivate(u: User) {
    this.adminService.deactivateUser(u.id).subscribe({
      next: () => { u.active = false; this.toast.success('User deactivated'); },
      error: () => this.toast.error('Could not deactivate user')
    });
  }

  /**
   * Builds the CSV in the browser from the rows already loaded and triggers a download,
   * so no new backend endpoint is needed.
   */
  exportCsv() {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Registered On'];
    const rows = this.users.map(u => [
      u.id,
      u.name,
      u.email,
      u.phone || '',
      u.role,
      u.active ? 'Active' : 'Inactive',
      u.createdAt ? new Date(u.createdAt).toLocaleString() : ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => this.escapeCsv(cell)).join(','))
      .join('\r\n');

    // BOM keeps accented names and the rupee sign readable when opened in Excel.
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `users-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    this.toast.success('Users exported');
  }

  /** Quotes a value and escapes embedded quotes so commas/newlines can't break the columns. */
  private escapeCsv(value: unknown): string {
    const text = value === null || value === undefined ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }

  changeRole(u: User, role: string) {
    this.adminService.assignRole(u.id, role).subscribe({
      next: () => { u.role = role as User['role']; this.toast.success('Role updated'); },
      error: () => this.toast.error('Could not update role')
    });
  }
}
