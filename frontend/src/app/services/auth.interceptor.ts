import { HttpInterceptorFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  console.log('🔐 AuthInterceptor - Token found:', !!token);
  console.log('🔗 Request URL:', req.url);
  
  if (token) {
    console.log('✅ Adding Authorization header with token');
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(cloned);
  } else {
    console.log('❌ No token found in localStorage');
  }
  return next(req);
}; 