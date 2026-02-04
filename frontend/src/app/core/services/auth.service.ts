import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, Role, User } from '../models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenKey = 'trackify.token';
  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();
  private cachedToken: string | null = null;

  constructor(private http: HttpClient) {
    this.cachedToken = this.readToken();
    // Don't auto-refresh on app load - let the guard handle it
  }

  get token(): string | null {
    return this.cachedToken;
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  get role(): Role | null {
    return this.userSubject.value?.role ?? null;
  }

  get isAuthenticated(): boolean {
    return !!this.userSubject.value;
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  register(name: string, email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { name, email, password })
      .pipe(tap((res) => this.persistSession(res)));
  }

  refreshProfile() {
    return this.http.get<User>(`${environment.apiUrl}/auth/me`).pipe(tap((user) => this.userSubject.next(user)));
  }

  updateProfile(name: string, email: string, password?: string) {
    const payload = password ? { name, email, password } : { name, email, password: null };
    return this.http
      .put<User>(`${environment.apiUrl}/auth/profile`, payload)
      .pipe(tap((user) => this.userSubject.next(user)));
  }

  logout() {
    this.cachedToken = null;
    this.userSubject.next(null);
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.tokenKey);
    }
  }

  private persistSession(res: AuthResponse) {
    this.cachedToken = res.token;
    this.userSubject.next(res.user);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.tokenKey, res.token);
    }
  }

  private readToken(): string | null {
    if (typeof localStorage === 'undefined') {
      return null;
    }
    return localStorage.getItem(this.tokenKey);
  }
}
