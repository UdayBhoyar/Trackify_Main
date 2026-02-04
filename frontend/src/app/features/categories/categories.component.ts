import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Category } from '../../core/models';
import { CategoryService } from '../../core/services/category.service';

@Component({
  standalone: true,
  selector: 'app-categories',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <section class="header">
      <div>
        <p class="label">Categories</p>
        <h2>Organize your spend</h2>
      </div>
    </section>

    <section class="grid">
      <div class="panel">
        <p class="label">Add category</p>
        <form [formGroup]="form" (ngSubmit)="save()" class="form">
          <label>Category Name<input formControlName="name" type="text" placeholder="e.g., Rent, Salary, etc." /></label>
          <button type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Adding...' : 'Add Category' }}</button>
        </form>
      </div>

      <div class="panel">
        <p class="label">Your Categories ({{ categories.length }})</p>
        <div class="list" *ngIf="categories.length; else empty">
          <div class="item" *ngFor="let c of categories">
            <div class="info">
              <span class="icon">{{ c.icon || '📁' }}</span>
              <div>
                <div class="name">{{ c.name }}</div>
                <div class="muted">Created {{ c.createdAt | date:'mediumDate' }}</div>
              </div>
            </div>
            <button class="ghost" (click)="remove(c)" [disabled]="loading">Delete</button>
          </div>
        </div>
        <ng-template #empty><p class="muted">No categories yet. Add your first category above!</p></ng-template>
      </div>
    </section>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; color: #e5e7eb; margin-bottom: 1rem; }
    .grid { display: grid; grid-template-columns: 1fr 1.4fr; gap: 1rem; }
    .panel { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 1rem; padding: 1.25rem; color: #e5e7eb; }
    .label { text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.75rem; display: block; }
    .form { display: grid; gap: 0.75rem; }
    label { display: grid; gap: 0.4rem; color: #cbd5e1; font-size: 0.875rem; font-weight: 500; }
    input { padding: 0.75rem; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 0.8rem; color: #e5e7eb; font-size: 0.95rem; }
    input:focus { outline: none; border-color: #22d3ee; background: rgba(255,255,255,0.06); }
    button { padding: 0.75rem 0.9rem; border-radius: 0.85rem; border: none; background: linear-gradient(135deg, #22d3ee, #6366f1); color: #0b1224; font-weight: 700; cursor: pointer; transition: all 0.2s; }
    button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(34, 211, 238, 0.3); }
    button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .list { display: grid; gap: 0.6rem; max-height: 500px; overflow-y: auto; }
    .item { display: flex; align-items: center; justify-content: space-between; padding: 0.85rem; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); border-radius: 0.85rem; transition: all 0.2s; }
    .item:hover { background: rgba(255,255,255,0.05); border-color: rgba(255,255,255,0.12); }
    .info { display: flex; align-items: center; gap: 0.85rem; }
    .icon { font-size: 1.5rem; }
    .name { font-weight: 600; font-size: 0.95rem; }
    .muted { color: #94a3b8; font-size: 0.8rem; margin-top: 0.15rem; }
    .ghost { background: rgba(255,255,255,0.05); color: #e5e7eb; border: 1px solid rgba(255,255,255,0.1); border-radius: 0.8rem; padding: 0.5rem 0.75rem; cursor: pointer; font-size: 0.875rem; }
    .ghost:hover:not(:disabled) { background: rgba(248,113,113,0.1); border-color: rgba(248,113,113,0.6); color: #fecdd3; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
  `]
})
export class CategoriesComponent implements OnInit {
  categories: Category[] = [];
  loading = false;

  form = this.fb.group({
    name: ['', Validators.required]
  });

  constructor(private fb: FormBuilder, private service: CategoryService) {}

  ngOnInit(): void {
    this.load();
  }

  load() {
    this.loading = true;
    this.service.getCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load categories:', err);
        this.loading = false;
      }
    });
  }

  save() {
    if (this.form.invalid) return;
    this.loading = true;
    const payload = {
      name: this.form.value.name!,
      icon: '📁' // Default icon
    };
    this.service.createCategory(payload).subscribe({
      next: () => {
        this.form.reset();
        this.load();
      },
      error: (err) => {
        console.error('Failed to create category:', err);
        this.loading = false;
      }
    });
  }

  remove(category: Category) {
    if (!confirm(`Delete category "${category.name}"? This will not delete associated expenses.`)) return;
    this.loading = true;
    this.service.deleteCategory(category.id).subscribe({
      next: () => this.load(),
      error: (err) => {
        console.error('Failed to delete category:', err);
        this.loading = false;
      }
    });
  }
}
