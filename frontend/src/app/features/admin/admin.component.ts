import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../core/services/admin.service';
import { AdminStats, User } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-admin',
  imports: [CommonModule],
  template: `
    <section class="header">
      <div>
        <p class="label">Admin</p>
        <h2>System overview</h2>
      </div>
    </section>

    <section class="grid">
      <div class="card"><p class="label">Users</p><h3>{{ stats?.users ?? 0 }}</h3></div>
      <div class="card"><p class="label">Categories</p><h3>{{ stats?.categories ?? 0 }}</h3></div>
      <div class="card"><p class="label">Expenses</p><h3>{{ stats?.expenses ?? 0 }}</h3></div>
    </section>

    <section class="panel">
      <p class="label">People</p>
      <div class="table" *ngIf="users.length; else empty">
        <div class="row header"><span>Name</span><span>Email</span><span>Role</span></div>
        <div class="row" *ngFor="let u of users">
          <span>{{ u.name }}</span>
          <span>{{ u.email }}</span>
          <span class="pill" [class.admin]="u.role.toLowerCase() === 'admin'">{{ u.role }}</span>
        </div>
      </div>
      <ng-template #empty><p class="muted">No users found.</p></ng-template>
    </section>
  `,
  styles: [`
    .header { color: #e5e7eb; margin-bottom: 1rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
    .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: 1rem; color: #e5e7eb; }
    .panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: 1rem; color: #e5e7eb; }
    .label { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.4rem; }
    .table { display: grid; gap: 0.4rem; }
    .row { display: grid; grid-template-columns: 1fr 1.2fr 0.5fr; align-items: center; padding: 0.7rem; border-radius: 0.8rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); }
    .row.header { font-weight: 600; color: #cbd5e1; background: transparent; border: none; }
    .pill { padding: 0.3rem 0.6rem; border-radius: 999px; background: rgba(34,211,238,0.12); border: 1px solid rgba(34,211,238,0.2); color: #67e8f9; text-align: center; }
    .pill.admin { background: rgba(139,92,246,0.12); border-color: rgba(139,92,246,0.2); color: #c4b5fd; }
    .muted { color: #94a3b8; }
  `]
})
export class AdminComponent implements OnInit {
  stats: AdminStats | null = null;
  users: User[] = [];

  constructor(private admin: AdminService) {}

  ngOnInit(): void {
    this.admin.getStats().subscribe((s) => (this.stats = s));
    this.admin.getUsers().subscribe((u) => (this.users = u));
  }
}
