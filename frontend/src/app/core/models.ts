export type Role = 'User' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  userId: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  paymentMode: string;
  note?: string | null;
  receiptUrl?: string | null;
  spentAt: string;
  createdAt: string;
}

export interface ExpenseFilters {
  page?: number;
  pageSize?: number;
  from?: string;
  to?: string;
  categoryId?: string;
  min?: number;
  max?: number;
  sort?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
}

export interface MonthlyTotal {
  month: number;
  total: number;
}

export interface CategoryTotal {
  categoryId: string;
  categoryName: string;
  total: number;
}

export interface DailyTrend {
  date: string;
  total: number;
}

export interface TopExpense {
  id: string;
  categoryId: string;
  amount: number;
  paymentMode: string;
  note?: string | null;
  receiptUrl?: string | null;
  spentAt: string;
  createdAt: string;
}

export interface AdminStats {
  users: number;
  categories: number;
  expenses: number;
}
