import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-login-wrapper">
      <div class="glass-card admin-login-card animate-fade-in">
        <div class="admin-shield-icon">
          <span class="icon">🛡️</span>
        </div>

        <div class="header-text">
          <span class="badge">SECURE CONSOLE</span>
          <h2>Admin <span class="gradient-text">Portal</span></h2>
          <p class="subtitle">Enter administrator credentials to manage airlines, schedules, and operations.</p>
        </div>

        <form (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label>Admin Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              placeholder="admin@skyhigh.com"
              required
            />
          </div>

          <div class="form-group">
            <label>Master Password</label>
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
            {{ loading ? 'Authenticating...' : 'Access Admin Dashboard ➔' }}
          </button>
        </form>

        <div class="footer-links">
          <a routerLink="/" class="back-link">← Return to Passenger Portal</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-login-wrapper {
      min-height: 85vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2rem 1rem;
      background: radial-gradient(circle at top, rgba(245, 158, 11, 0.08) 0%, transparent 60%);
    }
    .admin-login-card {
      padding: 3rem 2.5rem;
      width: 100%;
      max-width: 460px;
      text-align: center;
      border: 1px solid rgba(245, 158, 11, 0.3);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(245, 158, 11, 0.15);
    }
    .admin-shield-icon {
      width: 72px;
      height: 72px;
      margin: 0 auto 1.25rem;
      border-radius: 50%;
      background: rgba(245, 158, 11, 0.15);
      border: 2px solid var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.3);
    }
    .admin-shield-icon .icon {
      font-size: 2rem;
    }
    .badge {
      display: inline-block;
      font-size: 0.72rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--primary);
      background: rgba(245, 158, 11, 0.15);
      padding: 0.25rem 0.65rem;
      border-radius: 999px;
      margin-bottom: 0.5rem;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .header-text h2 {
      font-size: 2rem;
      margin-bottom: 0.4rem;
    }
    .subtitle {
      color: var(--text-muted);
      font-size: 0.9rem;
      margin-bottom: 2rem;
      line-height: 1.4;
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
    .error-msg {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      padding: 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    .footer-links {
      margin-top: 2rem;
      padding-top: 1.25rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .back-link {
      color: var(--text-muted);
      font-size: 0.88rem;
      transition: color 0.2s;
    }
    .back-link:hover {
      color: var(--primary);
    }
  `]
})
export class AdminLoginComponent {
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
          this.auth.logout();
          this.errorMessage = 'Access Denied: This account does not have Administrator privileges.';
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Invalid administrator credentials';
      }
    });
  }
}
