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
      <p class="eyebrow">Accounts</p>
      <h1>Users</h1>
    </header>

    @if (loading) {
      <div class="skeleton table-skel"></div>
    } @else {
      <div class="table card">
        <div class="row head">
          <span>Name</span><span>Email</span><span>Role</span><span>Status</span><span></span>
        </div>
        @for (u of users; track u.id) {
          <div class="row">
            <span>{{ u.name }}</span>
            <span class="email-cell">{{ u.email }}</span>
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
    .eyebrow { font-size: 13px; font-weight: 700; color: var(--poppy); margin: 0 0 6px; }
    header h1 { font-size: 26px; margin-bottom: 26px; }
    .table-skel { height: 300px; }
    .table { overflow: hidden; }
    .row {
      display: grid; grid-template-columns: 1.2fr 1.6fr 1fr 1fr auto; align-items: center; gap: 12px;
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

  changeRole(u: User, role: string) {
    this.adminService.assignRole(u.id, role).subscribe({
      next: () => { u.role = role as User['role']; this.toast.success('Role updated'); },
      error: () => this.toast.error('Could not update role')
    });
  }
}
