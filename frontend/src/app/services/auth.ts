import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError } from 'rxjs';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface AuthResponse {
  token?: string;
  user?: User;
  message: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:3000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser(): void {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
    }
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthResponse>> {
    return this.http.post<ApiResponse<AuthResponse>>(this.apiUrl + '/login', credentials).pipe(
      tap(response => {
        const user = response.data?.user;
        const token = response.data?.token;
        if (token && user) {
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('token', token);
          this.currentUserSubject.next(user);
          this.redirectBasedOnRole(user.role);
        }
      }),
      catchError((error: any) => {
        throw error;
      })
    );
  }

  signup(userData: { name: string; email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.apiUrl + '/register', userData).pipe(
      catchError((error: any) => {
        throw error;
      })
    );
  }

  logout(): void {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return !!this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private redirectBasedOnRole(role: string): void {
    const normalizedRole = role.toLowerCase();
    switch (normalizedRole) {
      case 'admin':
        this.router.navigate(['/admin-dashboard']).catch(err => console.error('Navigation error:', err));
        break;
      case 'agent':
        this.router.navigate(['/agent-dashboard']).catch(err => console.error('Navigation error:', err));
        break;
      case 'user':
      case 'customer':
      default:
        this.router.navigate(['/user-dashboard']).catch(err => console.error('Navigation error:', err));
    }
  }
} 