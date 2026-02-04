import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Expense, ExpenseFilters, PagedResult } from '../models';

@Injectable({ providedIn: 'root' })
export class ExpenseService {
  private readonly baseUrl = `${environment.apiUrl}/expenses`;

  constructor(private http: HttpClient) {}

  list(filters: ExpenseFilters): Observable<PagedResult<Expense>> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });
    return this.http.get<PagedResult<Expense>>(this.baseUrl, { params });
  }

  create(payload: {
    categoryId: string;
    amount: number;
    paymentMode: string;
    note?: string | null;
    receiptUrl?: string | null;
    spentAt: string;
  }) {
    return this.http.post(this.baseUrl, payload);
  }

  update(id: string, payload: {
    categoryId: string;
    amount: number;
    paymentMode: string;
    note?: string | null;
    receiptUrl?: string | null;
    spentAt: string;
  }) {
    return this.http.put(`${this.baseUrl}/${id}`, payload);
  }

  delete(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
