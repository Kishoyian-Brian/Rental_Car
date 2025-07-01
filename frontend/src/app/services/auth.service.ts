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
}
