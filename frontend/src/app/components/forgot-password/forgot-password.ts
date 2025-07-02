import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ForgotPasswordComponent {
  email = '';
  code = '';
  password = '';
  step: 'email' | 'code' | 'reset' | 'done' = 'email';
  token = '';
  message = '';
  loading = false;

  constructor(private auth: AuthService) {}

  sendCode() {
    this.loading = true;
    this.auth.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.step = 'code';
        this.message = 'A reset code has been sent to your email.';
        this.loading = false;
      },
      error: () => {
        this.message = 'Error sending reset code. Try again.';
        this.loading = false;
      }
    });
  }

  verifyCode() {
    this.token = this.code;
    this.step = 'reset';
    this.message = '';
  }

  resetPassword() {
    this.loading = true;
    this.auth.resetPassword(this.token, this.password).subscribe({
      next: () => {
        this.message = 'Password reset! You can now log in.';
        this.step = 'done';
        this.loading = false;
      },
      error: () => {
        this.message = 'Invalid or expired code. Try again.';
        this.loading = false;
      }
    });
  }
} 