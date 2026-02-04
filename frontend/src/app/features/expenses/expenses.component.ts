import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Category, Expense, PagedResult } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';
import { ExpenseService } from '../../core/services/expense.service';

@Component({
  standalone: true,
  selector: 'app-expenses',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <section class="header">
      <div>
        <p class="label">Expenses</p>
        <h2>Track and filter</h2>
      </div>
      <div class="actions">
        <button class="ghost" type="button" (click)="exportCsv()" [disabled]="!result?.items?.length">Export CSV</button>
      </div>
    </section>

    <p class="success" *ngIf="successMsg">{{ successMsg }}</p>
    <p class="error" *ngIf="errorMsg">{{ errorMsg }}</p>
    <p class="warning" *ngIf="categories.length === 0 && !loading">
      ⚠️ No categories found. Please create categories first in the <a routerLink="/categories">Categories</a> page to add expenses.
    </p>

    <section class="filters">
      <form [formGroup]="filterForm" (ngSubmit)="loadExpenses()">
        <div class="row">
          <label>From<input type="date" formControlName="from" /></label>
          <label>To<input type="date" formControlName="to" /></label>
          <label>Category
            <select formControlName="categoryId">
              <option value="">All</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.name }}</option>
            </select>
          </label>
          <label>Min<input type="number" formControlName="min" placeholder="0" /></label>
          <label>Max<input type="number" formControlName="max" placeholder="10000" /></label>
          <label>Sort
            <select formControlName="sort">
              <option value="spentAt_desc">Newest</option>
              <option value="spentAt_asc">Oldest</option>
              <option value="amount_desc">Amount high → low</option>
              <option value="amount_asc">Amount low → high</option>
            </select>
          </label>
          <button type="submit" [disabled]="loading">{{ loading ? 'Loading...' : 'Apply' }}</button>
        </div>
      </form>
    </section>

    <section class="grid">
      <div class="panel">
        <header>
          <div><p class="label">Log expense</p><h3>{{ editingId ? 'Update expense' : 'Add new' }}</h3></div>
          <button class="ghost" type="button" *ngIf="editingId" (click)="resetForm()">Cancel edit</button>
        </header>
        <form [formGroup]="expenseForm" (ngSubmit)="saveExpense()" class="form-grid">
          <label>Category *
            <select formControlName="categoryId" required>
              <option value="" disabled>{{ categories.length === 0 ? 'Loading categories...' : 'Select category' }}</option>
              <option *ngFor="let c of categories" [value]="c.id">{{ c.icon }} {{ c.name }}</option>
            </select>
          </label>
          <label>Amount *<input type="number" formControlName="amount" min="0" step="0.01" required placeholder="0.00" /></label>
          <label>Payment Mode<input type="text" formControlName="paymentMode" placeholder="UPI / Card / Cash" /></label>
          <label>Note<input type="text" formControlName="note" placeholder="Optional note" /></label>
          <label>Receipt URL (Optional)<input type="url" formControlName="receiptUrl" placeholder="https://example.com/receipt.jpg" /></label>
          <label>Date *<input type="date" formControlName="spentAt" required /></label>
          <button type="submit" [disabled]="loading || categories.length === 0">
            {{ loading ? 'Saving...' : (categories.length === 0 ? 'Loading categories...' : (editingId ? 'Update' : 'Add expense')) }}
          </button>
        </form>
      </div>

      <div class="panel">
        <header>
          <div><p class="label">Entries</p><h3>{{ result?.totalCount || 0 }} total</h3></div>
          <div class="pager">
            <button type="button" class="ghost" (click)="previousPage()" [disabled]="filterForm.value.page === 1 || loading">Prev</button>
            <span>Page {{ filterForm.value.page }}</span>
            <button type="button" class="ghost" (click)="nextPage()" [disabled]="((result?.page || 1) * (result?.pageSize || 10)) >= (result?.totalCount || 0) || loading">Next</button>
          </div>
        </header>

        <div class="table" *ngIf="result?.items?.length; else empty">
          <div class="row header">
            <span>Note</span>
            <span>Amount</span>
            <span>Category</span>
            <span>Date</span>
            <span></span>
          </div>
          <div class="row" *ngFor="let e of result?.items">
            <span>{{ e.note || e.paymentMode }}</span>
            <span>₹{{ e.amount | number:'1.2-2' }}</span>
            <span>{{ e.categoryName }}</span>
            <span>{{ e.spentAt | date:'mediumDate' }}</span>
            <span class="actions">
              <button class="ghost" (click)="editExpense(e)" [disabled]="loading">Edit</button>
              <button class="ghost danger" (click)="deleteExpense(e)" [disabled]="loading">Delete</button>
            </span>
          </div>
        </div>
        <ng-template #empty>
          <p class="muted">{{ loading ? 'Loading expenses...' : 'No expenses yet. Add your first expense above!' }}</p>
        </ng-template>
      </div>
    </section>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; color: #e5e7eb; margin-bottom: 1rem; }
    .actions { display: flex; gap: 0.5rem; }
    .success { color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 0.75rem 1rem; border-radius: 0.5rem; margin: 0.5rem 0; font-weight: 600; }
    .error { color: #ef4444; background: rgba(239, 68, 68, 0.1); padding: 0.75rem 1rem; border-radius: 0.5rem; margin: 0.5rem 0; font-weight: 600; }
    .warning { color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 0.75rem 1rem; border-radius: 0.5rem; margin: 0.5rem 0; font-weight: 600; }
    .warning a { color: #fbbf24; text-decoration: underline; }
    .filters { margin: 1rem 0; }
    form .row { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; }
    label { display: grid; gap: 0.25rem; color: #cbd5e1; font-size: 0.875rem; }
    input, select { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.7rem; padding: 0.6rem 0.75rem; color: #e5e7eb; }
    input:focus, select:focus { outline: none; border-color: #22d3ee; background: rgba(255,255,255,0.06); }
    button { padding: 0.7rem 0.9rem; border-radius: 0.8rem; border: none; background: linear-gradient(135deg, #22d3ee, #6366f1); color: #0b1224; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3); }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .ghost { background: rgba(255,255,255,0.05); color: #e5e7eb; border: 1px solid rgba(255,255,255,0.1); }
    .ghost:hover:not(:disabled) { background: rgba(255,255,255,0.08); }
    .ghost.danger { border-color: rgba(248,113,113,0.6); color: #fecdd3; }
    .ghost.danger:hover:not(:disabled) { background: rgba(248,113,113,0.1); }
    .grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 1rem; align-items: start; }
    .panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); padding: 1rem; border-radius: 1rem; color: #e5e7eb; }
    header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
    .table { display: grid; gap: 0.4rem; }
    .row { display: grid; grid-template-columns: 1.2fr 0.6fr 0.9fr 0.8fr 0.8fr; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 0.75rem; padding: 0.65rem; align-items: center; }
    .row.header { font-weight: 600; color: #cbd5e1; background: transparent; border: none; }
    .label { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: #94a3b8; margin: 0; }
    .muted { color: #94a3b8; text-align: center; padding: 2rem; }
    .pager { display: flex; align-items: center; gap: 0.5rem; }
    @media (max-width: 1100px) { .grid { grid-template-columns: 1fr; } .row { grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); } }
  `]
})
export class ExpensesComponent implements OnInit {
  categories: Category[] = [];
  result: PagedResult<Expense> | null = null;
  editingId: string | null = null;
  loading = false;
  errorMsg = '';
  successMsg = '';

  filterForm = this.fb.group({
    page: 1,
    pageSize: 10,
    from: '',
    to: '',
    categoryId: '',
    min: '',
    max: '',
    sort: 'spentAt_desc'
  });

  expenseForm = this.fb.group({
    categoryId: '',
    amount: 0,
    paymentMode: 'UPI',
    note: '',
    receiptUrl: '',
    spentAt: new Date().toISOString().slice(0, 10)
  });

  constructor(
    private fb: FormBuilder,
    private categoriesService: CategoryService,
    private expenseService: ExpenseService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadExpenses();
  }

  loadCategories() {
    console.log('Loading categories...');
    this.categoriesService.getCategories().subscribe({
      next: (cats) => {
        console.log('Categories loaded:', cats);
        this.categories = cats;
        // Set first category as default if available and form is empty
        if (cats.length > 0 && !this.expenseForm.value.categoryId) {
          this.expenseForm.patchValue({ categoryId: cats[0].id });
          console.log('Default category set:', cats[0].id);
        }
      },
      error: (err) => {
        this.errorMsg = 'Failed to load categories. Please try again.';
        console.error('Load categories error:', err);
        setTimeout(() => this.errorMsg = '', 5000);
      }
    });
  }

  loadExpenses() {
    this.loading = true;
    this.errorMsg = '';
    const raw = this.filterForm.value;
    const filters = {
      page: Number(raw.page) || 1,
      pageSize: Number(raw.pageSize) || 10,
      from: raw.from || undefined,
      to: raw.to || undefined,
      categoryId: raw.categoryId || undefined,
      min: raw.min ? Number(raw.min) : undefined,
      max: raw.max ? Number(raw.max) : undefined,
      sort: raw.sort || 'spentAt_desc'
    };
    this.expenseService.list(filters).subscribe({
      next: (res) => {
        this.result = res;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Failed to load expenses. Please try again.';
        console.error('Load expenses error:', err);
      }
    });
  }

  saveExpense() {
    const { categoryId, amount, paymentMode, note, receiptUrl, spentAt } = this.expenseForm.value;
    
    // Validation
    if (!categoryId) {
      this.errorMsg = 'Please select a category.';
      setTimeout(() => this.errorMsg = '', 3000);
      return;
    }
    
    if (!amount || Number(amount) <= 0) {
      this.errorMsg = 'Please enter a valid amount greater than 0.';
      setTimeout(() => this.errorMsg = '', 3000);
      return;
    }
    
    this.loading = true;
    this.errorMsg = '';
    this.successMsg = '';
    
    const payload = {
      categoryId: categoryId!,
      amount: Number(amount),
      paymentMode: paymentMode || 'UPI',
      note: note || null,
      receiptUrl: receiptUrl || null,
      spentAt: spentAt || new Date().toISOString().slice(0, 10)
    };
    
    const operation = this.editingId 
      ? this.expenseService.update(this.editingId, payload)
      : this.expenseService.create(payload);
    
    operation.subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = this.editingId ? 'Expense updated successfully!' : 'Expense added successfully!';
        setTimeout(() => this.successMsg = '', 3000);
        this.resetForm();
        this.loadExpenses();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.message || err.error || 'Failed to save expense. Please try again.';
        console.error('Save expense error:', err);
        setTimeout(() => this.errorMsg = '', 5000);
      }
    });
  }

  editExpense(expense: Expense) {
    this.editingId = expense.id;
    this.expenseForm.patchValue({
      categoryId: expense.categoryId,
      amount: expense.amount,
      paymentMode: expense.paymentMode,
      note: expense.note ?? '',
      receiptUrl: expense.receiptUrl ?? '',
      spentAt: expense.spentAt.slice(0, 10)
    });
  }

  deleteExpense(expense: Expense) {
    if (!confirm(`Delete expense: ${expense.note || expense.paymentMode} - ₹${expense.amount}?`)) return;
    this.loading = true;
    this.errorMsg = '';
    this.expenseService.delete(expense.id).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = 'Expense deleted successfully!';
        setTimeout(() => this.successMsg = '', 3000);
        this.loadExpenses();
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = 'Failed to delete expense. Please try again.';
        console.error('Delete expense error:', err);
        setTimeout(() => this.errorMsg = '', 5000);
      }
    });
  }

  resetForm() {
    this.editingId = null;
    this.expenseForm.reset({
      categoryId: this.categories[0]?.id ?? '',
      amount: 0,
      paymentMode: 'UPI',
      note: '',
      receiptUrl: '',
      spentAt: new Date().toISOString().slice(0, 10)
    });
  }

  previousPage() {
    const page = Math.max(1, (this.filterForm.value.page ?? 1) - 1);
    this.filterForm.patchValue({ page });
    this.loadExpenses();
  }

  nextPage() {
    const page = (this.filterForm.value.page ?? 1) + 1;
    this.filterForm.patchValue({ page });
    this.loadExpenses();
  }

  exportCsv() {
    if (!this.result?.items?.length) return;
    const rows = [
      ['Note', 'Amount', 'Category', 'Payment', 'Date'],
      ...this.result.items.map((e) => [e.note || '', e.amount, e.categoryName, e.paymentMode, e.spentAt])
    ];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  }
}
