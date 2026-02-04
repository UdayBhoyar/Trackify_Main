import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AdminStats, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getUsers() {
    return this.http.get<User[]>(`${this.baseUrl}/users`);
  }

  getStats() {
    return this.http.get<AdminStats>(`${this.baseUrl}/stats`);
  }
}
