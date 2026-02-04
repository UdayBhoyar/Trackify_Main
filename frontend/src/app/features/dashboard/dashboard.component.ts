import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReportService } from '../../core/services/report.service';
import { AuthService } from '../../core/services/auth.service';
import { CategoryTotal, MonthlyTotal, TopExpense } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, AsyncPipe, FormsModule],
  template: `
    <div class="page">
      <header class="hero">
        <div>
          <p class="welcome">Welcome back, {{ (user$ | async)?.name || 'User' }}</p>
      
        </div>
        <div class="search">
          <input [(ngModel)]="searchTerm" (input)="onSearch()" placeholder="Search transactions..." />
          <div class="avatar">{{ getInitials((user$ | async)?.name) }}</div>
        </div>
      </header>

      <section class="summary-grid">
        <div class="summary-card accent-green">
          <p class="label">Total Balance</p>
          <h2>₹{{ totalBalance | number:'1.0-0' }}</h2>
          <p class="pill positive">▲ Month to date</p>
        </div>
        <div class="summary-card accent-red">
          <p class="label">Monthly Spending</p>
          <h2>₹{{ currentMonthTotal | number:'1.0-0' }}</h2>
          <p class="pill negative">▼ {{ monthName(currentMonth) }}</p>
        </div>
        <div class="summary-card accent-blue">
          <p class="label">Top Category</p>
          <h2>{{ topCategory?.categoryName || '—' }}</h2>
          <p class="pill">₹{{ topCategory?.total || 0 | number:'1.0-0' }}</p>
        </div>
      </section>

      <section class="main-grid">
        <div class="panel chart">
          <header>
            <div>
              <p class="label">Spending Trends</p>
              <h3>{{ currentYear }}</h3>
            </div>
          </header>
          <div class="chart-box" *ngIf="monthlyTotals.length; else noData">
            <svg viewBox="0 0 600 220" preserveAspectRatio="xMidYMid meet" style="background: rgba(16, 185, 129, 0.05); border-radius: 0.5rem;">
              <defs>
                <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style="stop-color:#10b981;stop-opacity:0.4" />
                  <stop offset="100%" style="stop-color:#10b981;stop-opacity:0.01" />
                </linearGradient>
              </defs>
              <!-- Grid lines -->
              <line x1="0" y1="55" x2="600" y2="55" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="0" y1="110" x2="600" y2="110" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="5,5" />
              <line x1="0" y1="165" x2="600" y2="165" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="5,5" />
              <!-- Chart line -->
              <polyline
                [attr.points]="chartPoints(monthlyTotals)"
                fill="url(#chartGradient)"
                stroke="#10b981"
                stroke-width="4"
                stroke-linejoin="round"
                stroke-linecap="round"
              ></polyline>
            </svg>
            <div class="chart-xlabels">
              <span *ngFor="let m of monthlyTotals">{{ shortMonth(m.month) }}</span>
            </div>
          </div>
        </div>

        <div class="panel donut" *ngIf="categoryTotals.length; else noData">
          <header>
            <div>
              <p class="label">Expense Categories</p>
              <h3>Share</h3>
            </div>
          </header>
          <div class="donut-wrap">
            <div class="donut-ring" [style.background]="categoryGradient()">
              <div class="donut-hole">
                <p class="label">Total</p>
                <strong>₹{{ categoryTotalsSum | number:'1.0-0' }}</strong>
              </div>
            </div>
            <div class="legend">
              <div class="legend-row" *ngFor="let c of categoryTotals; let i = index">
                <span class="dot" [style.background]="colorFor(i)"></span>
                <span>{{ c.categoryName || 'Unnamed' }}</span>
                <strong>{{ percent(c.total) }}%</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="panel recent" *ngIf="topExpenses.length; else noData">
        <header>
          <div>
            <p class="label">Recent Transactions</p>
            <h3>Latest spends {{ searchTerm ? '(filtered)' : '' }}</h3>
          </div>
          <a routerLink="/expenses" class="ghost">View all</a>
        </header>
        <div class="table">
          <div class="row header">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Amount</span>
          </div>
          <div class="row" *ngFor="let e of filteredExpenses">
            <span>{{ e.spentAt | date:'yyyy-MM-dd' }}</span>
            <span>{{ e.note || e.paymentMode }}</span>
            <span>{{ getCategoryName(e.categoryId) }}</span>
            <span [class.negative]="e.amount < 0">₹{{ e.amount | number:'1.0-0' }}</span>
          </div>
        </div>
      </section>

      <ng-template #noData>
        <p class="muted">No data yet. Start logging expenses.</p>
      </ng-template>
    </div>
  `,
  styles: [`
    :host {
      --primary: #10b981;
      --secondary: #3b82f6;
      --accent: #8b5cf6;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --bg: #f8fafc;
      --card-bg: #ffffff;
      --text: #1f2937;
      --text-light: #6b7280;
      --border: #e5e7eb;
    }

    .page { 
      display: flex; 
      flex-direction: column; 
      gap: 1.5rem; 
      color: var(--text);
    }

    .hero { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
      color: white; 
      padding: 2rem 2.5rem; 
      border-radius: 1.5rem; 
      box-shadow: 0 20px 60px rgba(16, 185, 129, 0.25);
      animation: slideInUp 0.6s ease-out;
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -20%;
        width: 400px;
        height: 400px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        z-index: 0;
      }
    }

    @keyframes slideInUp {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .hero > * {
      position: relative;
      z-index: 1;
    }

    .welcome { 
      margin: 0; 
      text-transform: uppercase; 
      letter-spacing: 0.12em; 
      font-size: 1.5rem;
      font-weight: 700;
      opacity: 0.95;
    }

    .search { 
      display: flex; 
      align-items: center; 
      gap: 0.75rem; 
      background: rgba(255, 255, 255, 0.15);
      padding: 0.75rem 1.25rem; 
      border-radius: 999px; 
      border: 1px solid rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:focus-within {
        background: rgba(255, 255, 255, 0.25);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      }
    }

    .search input { 
      background: transparent; 
      border: none; 
      color: white;
      outline: none; 
      min-width: 220px; 
      font-size: 0.95rem;
      font-weight: 500;

      &::placeholder {
        color: rgba(255, 255, 255, 0.7);
      }
    }

    .avatar { 
      width: 45px; 
      height: 45px; 
      border-radius: 50%; 
      background: rgba(255, 255, 255, 0.2);
      display: grid; 
      place-items: center; 
      font-weight: 700; 
      color: white;
      font-size: 0.9rem;
      border: 2px solid rgba(255, 255, 255, 0.3);
      animation: float 3s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
    }

    .summary-grid { 
      display: grid; 
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
      gap: 1.5rem;
      animation: fadeInUp 0.7s ease-out 0.1s both;
    }

    @keyframes fadeInUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .summary-card { 
      padding: 1.5rem; 
      border-radius: 1.25rem; 
      background: var(--card-bg); 
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08); 
      border: 1px solid var(--border);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 4px;
        background: linear-gradient(90deg, transparent, #10b981, transparent);
        transition: left 0.8s ease;
      }

      &:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
        border-color: var(--primary);

        &::before {
          left: 100%;
        }
      }

      &.accent-green {
        border-top: 3px solid var(--success);
      }

      &.accent-red {
        border-top: 3px solid var(--danger);
      }

      &.accent-blue {
        border-top: 3px solid var(--secondary);
      }
    }

    .summary-card h2 { 
      margin: 0.5rem 0 0; 
      font-size: 2rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .label { 
      text-transform: uppercase; 
      letter-spacing: 0.08em; 
      font-size: 0.7rem; 
      color: var(--text-light);
      margin: 0;
      font-weight: 600;
    }

    .pill { 
      display: inline-flex; 
      align-items: center; 
      gap: 0.4rem; 
      padding: 0.35rem 0.75rem; 
      border-radius: 999px; 
      font-size: 0.8rem; 
      font-weight: 600;
      background: #f3f4f6; 
      color: var(--text-light);
      margin-top: 0.5rem;
    }

    .pill.positive { 
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.1));
      color: var(--success); 
    }

    .pill.negative { 
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.1));
      color: var(--danger); 
    }

    .main-grid { 
      display: grid; 
      grid-template-columns: 2fr 1.2fr; 
      gap: 1.5rem; 
      align-items: start;
    }

    .panel { 
      background: var(--card-bg); 
      border: 1px solid var(--border); 
      border-radius: 1.25rem; 
      padding: 1.75rem; 
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
      animation: scaleIn 0.6s ease-out;
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 20px 50px rgba(0, 0, 0, 0.12);
        border-color: var(--primary);
      }
    }

    @keyframes scaleIn {
      from { opacity: 0; transform: scale(0.95); }
      to { opacity: 1; transform: scale(1); }
    }

    header { 
      display: flex; 
      justify-content: space-between; 
      align-items: center; 
      margin-bottom: 1.5rem;
    }

    .chart-box { 
      background: linear-gradient(180deg, rgba(16, 185, 129, 0.08), rgba(59, 130, 246, 0.08)); 
      border-radius: 1rem; 
      border: 1px solid var(--border); 
      padding: 1.5rem;
      min-height: 260px;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    svg { 
      width: 100%; 
      height: 220px;
      flex: 1;
    }

    .chart-xlabels { 
      display: grid; 
      grid-template-columns: repeat(12, 1fr); 
      font-size: 0.75rem; 
      color: var(--text-light); 
      margin-top: 0.75rem; 
      text-align: center;
      font-weight: 500;
    }

    .donut-wrap { 
      display: flex; 
      gap: 2rem; 
      align-items: center;
    }

    .donut-ring { 
      width: 200px; 
      height: 200px; 
      border-radius: 50%; 
      background: conic-gradient(#f0f0f0 0deg 360deg); 
      display: grid; 
      place-items: center;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    }

    .donut-hole { 
      width: 110px; 
      height: 110px; 
      border-radius: 50%; 
      background: var(--card-bg); 
      display: grid; 
      place-items: center; 
      text-align: center; 
      box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .donut-hole h3 {
      margin: 0;
      font-size: 1.5rem;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .legend { 
      display: grid; 
      gap: 0.75rem;
      max-height: 200px;
      overflow-y: auto;
    }

    .legend-row { 
      display: grid; 
      grid-template-columns: auto 1fr auto; 
      gap: 0.75rem; 
      align-items: center; 
      font-size: 0.9rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.02);
      transition: all 0.3s ease;

      &:hover {
        background: #f9fafb;
        padding-left: 0.5rem;
      }
    }

    .dot { 
      width: 14px; 
      height: 14px; 
      border-radius: 50%; 
      display: inline-block;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .recent .table { 
      display: grid; 
      gap: 0.75rem;
    }

    .recent .row { 
      display: grid; 
      grid-template-columns: 1fr 1.5fr 1fr 0.8fr; 
      padding: 1rem; 
      border-radius: 0.9rem; 
      border: 1px solid var(--border); 
      background: linear-gradient(135deg, #f8fafc, #ffffff);
      transition: all 0.3s ease;

      &:hover {
        background: linear-gradient(135deg, #f0f9ff, #ffffff);
        border-color: var(--primary);
        transform: translateX(4px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    }

    .recent .row.header { 
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      font-weight: 700;
      border: none;

      &:hover {
        transform: none;
        box-shadow: none;
      }
    }

    .negative { 
      color: var(--danger); 
      font-weight: 600;
    }

    .ghost { 
      color: var(--secondary); 
      text-decoration: none; 
      border: 1px solid var(--border); 
      padding: 0.6rem 1rem; 
      border-radius: 0.8rem;
      font-weight: 600;
      transition: all 0.3s ease;

      &:hover {
        border-color: var(--primary);
        color: var(--primary);
        background: rgba(16, 185, 129, 0.05);
        transform: translateY(-2px);
      }
    }

    .muted { 
      color: var(--text-light);
      text-align: center;
      padding: 2rem;
      font-size: 0.95rem;
    }

    @media (max-width: 960px) { 
      .main-grid { grid-template-columns: 1fr; } 
      .donut-wrap { flex-direction: column; gap: 1rem; } 
      .search input { min-width: 140px; }
      .summary-grid { grid-template-columns: 1fr; }
      .hero { padding: 1.5rem; }
    }

    @media (max-width: 480px) {
      .summary-card h2 { font-size: 1.5rem; }
      .welcome { font-size: 1.2rem; }
      .recent .row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  monthlyTotals: MonthlyTotal[] = [];
  categoryTotals: CategoryTotal[] = [];
  topExpenses: TopExpense[] = [];
  filteredExpenses: TopExpense[] = [];
  searchTerm: string = '';
  currentYear = new Date().getFullYear();
  currentMonth = new Date().getMonth() + 1;

  constructor(private reports: ReportService, private auth: AuthService) {}

  get user$() {
    return this.auth.user$;
  }

  get categoryTotalsSum(): number {
    return this.categoryTotals.reduce((s, c) => s + c.total, 0);
  }

  get totalBalance(): number {
    return this.categoryTotalsSum; // placeholder for balance; using category spend total
  }

  get currentMonthTotal(): number {
    return this.monthlyTotals.find((m) => m.month === this.currentMonth)?.total ?? 0;
  }

  get topCategory(): CategoryTotal | undefined {
    if (!this.categoryTotals.length) return undefined;
    return this.categoryTotals.reduce((max, current) => 
      current.total > max.total ? current : max
    );
  }

  get topExpense(): TopExpense | undefined {
    return this.topExpenses[0];
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.reports.monthly(this.currentYear).subscribe((data) => (this.monthlyTotals = data));
    this.reports.byCategory({}).subscribe((data) => (this.categoryTotals = data));
    this.reports.topExpenses(5).subscribe((data) => {
      this.topExpenses = data;
      this.filteredExpenses = data;
    });
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) {
      this.filteredExpenses = this.topExpenses;
      return;
    }
    
    this.filteredExpenses = this.topExpenses.filter(expense => {
      const note = (expense.note || '').toLowerCase();
      const paymentMode = (expense.paymentMode || '').toLowerCase();
      const amount = expense.amount.toString();
      const date = new Date(expense.spentAt).toLocaleDateString();
      
      return note.includes(term) || 
             paymentMode.includes(term) || 
             amount.includes(term) ||
             date.includes(term);
    });
  }

  shortMonth(month: number): string {
    return new Date(this.currentYear, month - 1, 1).toLocaleString('default', { month: 'short' });
  }

  monthName(month: number): string {
    return new Date(this.currentYear, month - 1, 1).toLocaleString('default', { month: 'long' });
  }

  barHeight(value: number): number {
    const max = Math.max(...this.monthlyTotals.map((m) => m.total), 1);
    return Math.round((value / max) * 100);
  }

  chartPoints(data: MonthlyTotal[]): string {
    if (!data.length) return '';
    const width = 600;
    const height = 180;
    const max = Math.max(...data.map((d) => d.total), 1);
    const step = data.length > 1 ? width / (data.length - 1) : width;
    return data
      .map((d, i) => {
        const x = i * step;
        const y = height - (d.total / max) * height;
        return `${x},${y}`;
      })
      .join(' ');
  }

  categoryGradient(): string {
    if (!this.categoryTotals.length || this.categoryTotalsSum === 0) return 'conic-gradient(#e2e8f0 0deg 360deg)';
    let start = 0;
    const stops: string[] = [];
    this.categoryTotals.forEach((c, i) => {
      const share = (c.total / this.categoryTotalsSum) * 360;
      const end = start + share;
      stops.push(`${this.colorFor(i)} ${start}deg ${end}deg`);
      start = end;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }

  colorFor(i: number): string {
    const palette = ['#0ea5e9', '#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6'];
    return palette[i % palette.length];
  }

  percent(value: number): number {
    if (this.categoryTotalsSum === 0) return 0;
    return Math.round((value / this.categoryTotalsSum) * 100);
  }

  getInitials(name?: string): string {
    if (!name) return 'TP';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getCategoryName(categoryId: string): string {
    const category = this.categoryTotals.find(c => c.categoryId === categoryId);
    return category?.categoryName || '—';
  }
}
