import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private loginUrl = 'http://localhost:3000/auth/login';
  private registerUrl = 'http://localhost:3000/auth/register';
  private apiUrl = 'http://localhost:3000/auth';
  private profileUrl = 'http://localhost:3000/users/get-profile';

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(this.loginUrl, { email, password }).pipe(
      map(res => res.data)
    );
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post<any>(this.registerUrl, { name, email, password }).pipe(
      map(res => res.data)
    );
  }

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/request-password-reset`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, { token, password });
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(this.profileUrl).pipe(
      map(res => res.data)
    );
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put<any>('http://localhost:3000/users/update-profile', data).pipe(
      map(res => res.data)
    );
  }
}
