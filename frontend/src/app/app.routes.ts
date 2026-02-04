import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
	{ path: 'register', loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent) },
	{ path: 'dashboard', canActivate: [authGuard], loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent) },
	{ path: 'expenses', canActivate: [authGuard], loadComponent: () => import('./features/expenses/expenses.component').then(m => m.ExpensesComponent) },
	{ path: 'categories', canActivate: [authGuard], loadComponent: () => import('./features/categories/categories.component').then(m => m.CategoriesComponent) },
	{ path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then(m => m.ProfileComponent) },
	{ path: 'admin', canActivate: [authGuard, adminGuard], loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent) },
	{ path: '**', redirectTo: 'login' }
];
