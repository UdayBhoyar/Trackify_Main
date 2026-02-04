import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CategoryTotal, DailyTrend, MonthlyTotal, TopExpense } from '../models';

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly baseUrl = `${environment.apiUrl}/reports`;

  constructor(private http: HttpClient) {}

  monthly(year: number): Observable<MonthlyTotal[]> {
    return this.http.get<MonthlyTotal[]>(`${this.baseUrl}/monthly`, { params: { year } });
  }

  byCategory(params: { from?: string; to?: string }): Observable<CategoryTotal[]> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) httpParams = httpParams.set(key, value);
    });
    return this.http.get<CategoryTotal[]>(`${this.baseUrl}/by-category`, { params: httpParams });
  }

  dailyTrend(params: { from?: string; to?: string }): Observable<DailyTrend[]> {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) httpParams = httpParams.set(key, value);
    });
    return this.http.get<DailyTrend[]>(`${this.baseUrl}/daily-trend`, { params: httpParams });
  }

  topExpenses(limit = 5): Observable<TopExpense[]> {
    return this.http.get<TopExpense[]>(`${this.baseUrl}/top-expenses`, { params: { limit } });
  }
}
