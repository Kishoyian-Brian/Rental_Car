import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login implements OnInit {
  email = '';
  password = '';
  isLoading = false;
  error: string | null = null;
  registrationSuccessMessage: string | null = null;

  isLoginMode = true;
  registerData = {
    name: '',
    email: '',
    password: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    // Check for mode query parameter
    this.route.queryParams.subscribe(params => {
      const mode = params['mode'];
      if (mode === 'register') {
        this.isLoginMode = false;
      } else {
        this.isLoginMode = true;
      }
    });
  }

  onLogin(): void {
    this.isLoading = true;
    this.error = null;
    
    // Clear any existing tokens to ensure fresh authentication
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login response:', response); // Debug log
        
        const user = response.user;
        
        // Store user data and token in localStorage
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        console.log('Stored token:', response.accessToken); // Debug log
        console.log('User role:', user.role); // Debug log
        
        // Redirect based on role (backend returns uppercase roles)
        if (user.role === 'ADMIN') {
          console.log('Redirecting to admin dashboard'); // Debug log
          this.router.navigate(['/admin-dashboard']);
        } else if (user.role === 'AGENT') {
          console.log('Redirecting to agent dashboard'); // Debug log
          this.router.navigate(['/agent-dashboard']);
        } else {
          console.log('Redirecting to user dashboard'); // Debug log
          this.router.navigate(['/user-dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Login error:', err); // Debug log
        this.error = err.error?.message || 'Login failed';
      }
    });
  }

  onRegister(): void {
    this.isLoading = true;
    this.error = null;
    this.registrationSuccessMessage = null;
    this.authService.register(this.registerData.name, this.registerData.email, this.registerData.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        const user = response.user;
        
        // Store user data and token in localStorage
        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect based on role (newly registered users are typically CUSTOMER)
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin-dashboard']);
        } else if (user.role === 'AGENT') {
          this.router.navigate(['/agent-dashboard']);
        } else {
          this.router.navigate(['/user-dashboard']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.error = err.error?.message || 'Registration failed';
      }
    });
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.error = null;
    this.registrationSuccessMessage = null;
  }
}
