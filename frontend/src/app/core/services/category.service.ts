import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly baseUrl = `${environment.apiUrl}/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  createCategory(payload: { name: string; icon: string }) {
    return this.http.post<Category>(this.baseUrl, payload);
  }

  updateCategory(id: string, payload: { name: string; icon: string }) {
    return this.http.put<void>(`${this.baseUrl}/${id}`, payload);
  }

  deleteCategory(id: string) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
