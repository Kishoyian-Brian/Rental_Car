import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  
  console.log('AuthInterceptor - Request URL:', req.url); // Debug log
  console.log('AuthInterceptor - Token exists:', !!token); // Debug log
  
  // Don't add auth header for login/register requests
  if (req.url.includes('/auth/login') || req.url.includes('/auth/register')) {
    console.log('AuthInterceptor - Skipping auth for login/register request'); // Debug log
    return next(req);
  }
  
  // Add auth header if token exists
  if (token) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    
    return next(cloned).pipe(
      (source) => new Observable(observer => {
        source.subscribe({
          next: (event) => observer.next(event),
          error: (err) => {
            if (err instanceof HttpErrorResponse && err.status === 401) {
              console.log('AuthInterceptor - 401 error for URL:', req.url); // Debug log
              
              // Only redirect for authenticated requests that fail
              // Don't redirect for login/register requests
              if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
                console.log('AuthInterceptor - Redirecting to login due to 401'); // Debug log
                
                // Clear invalid token
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                
                // Use router navigation instead of window.location
                router.navigate(['/login']);
              }
            }
            observer.error(err);
          },
          complete: () => observer.complete()
        });
      })
    );
  }
  
  // No token, proceed without auth header
  console.log('AuthInterceptor - No token, proceeding without auth header'); // Debug log
  return next(req);
}; 