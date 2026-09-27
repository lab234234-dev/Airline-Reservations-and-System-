import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-wrapper">
      <div class="glass-card login-card animate-fade-in">
        <!-- Glowing User Avatar Icon in Login -->
        <div class="avatar-header">
          <div class="avatar-circle">
            <span class="avatar-icon">👤</span>
          </div>
        </div>

        <h2>Login</h2>
        <p class="subtitle">Welcome back to SkyHigh Air</p>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label>Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="name@example.com"
              required
            />
          </div>

          <div class="form-group">
            <label>Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary submit-btn">
            {{ loading ? 'Signing In...' : 'Sign In ➔' }}
          </button>
        </form>

        <p class="switch-link">
          Don't have an account? <a routerLink="/register">Register</a>
        </p>

        <div class="admin-entry-link">
          <span>Airline Staff or Manager? </span>
          <a routerLink="/admin/login">Admin Console ➔</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 85vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
    .login-card {
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 440px;
      text-align: center;
    }
    .avatar-header {
      display: flex;
      justify-content: center;
      margin-bottom: 1.25rem;
    }
    .avatar-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      border: 3px solid var(--primary);
      background: rgba(245, 158, 11, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 25px rgba(245, 158, 11, 0.3);
    }
    .avatar-icon {
      font-size: 2.2rem;
    }
    .login-card h2 {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }
    .subtitle {
      color: var(--text-muted);
      margin-bottom: 2rem;
      font-size: 0.95rem;
    }
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
      text-align: left;
    }
    .form-group label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
      font-weight: 500;
    }
    .form-group input {
      width: 100%;
    }
    .submit-btn {
      width: 100%;
      padding: 0.85rem;
      font-size: 1rem;
      margin-top: 0.5rem;
    }
    .switch-link {
      margin-top: 2rem;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .switch-link a {
      color: var(--primary);
      font-weight: bold;
    }
    .error-msg {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      padding: 0.7rem;
      border-radius: 6px;
      font-size: 0.85rem;
    }
    .admin-entry-link {
      margin-top: 1.5rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 0.85rem;
      color: var(--text-muted);
    }
    .admin-entry-link a {
      color: var(--primary);
      font-weight: 600;
      margin-left: 0.25rem;
    }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit(): void {
    if (!this.email || !this.password) return;
    this.loading = true;
    this.errorMessage = '';

    this.auth.login({ email: this.email, password: this.password }).subscribe({
      next: (user: any) => {
        this.loading = false;
        if (user?.role === 'admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid email or password';
      }
    });
  }
}
