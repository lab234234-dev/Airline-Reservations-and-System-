import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="reg-wrapper">
      <div class="glass-card reg-card animate-fade-in">
        <div class="header-box">
          <h2>Create Account</h2>
          <p class="subtitle">Join SkyHigh Air today</p>
        </div>

        <!-- User Profile Pic Upload Circle -->
        <div class="avatar-upload-section">
          <div class="circle-container" (click)="fileInput.click()" title="Click to upload profile photo">
            <img *ngIf="profilePic" [src]="profilePic" alt="Profile Preview" class="preview-img" />
            <div *ngIf="!profilePic" class="placeholder-icon">
              <span class="cam-icon">📷</span>
              <span class="cam-label">Photo</span>
            </div>
            <button type="button" class="cam-btn" (click)="fileInput.click(); $event.stopPropagation()">
              📷
            </button>
          </div>

          <input #fileInput type="file" (change)="onFileChange($event)" accept="image/*" style="display: none" />
          <span class="upload-hint">Upload Profile Photo (Optional)</span>

          <!-- Quick Avatar Presets -->
          <div class="presets-row">
            <span class="preset-label">✨ Presets:</span>
            <img
              *ngFor="let url of avatarPresets"
              [src]="url"
              [class.active-preset]="profilePic === url"
              (click)="selectPreset(url)"
              class="preset-thumb"
              alt="Preset avatar"
            />
          </div>
        </div>

        <form (ngSubmit)="onSubmit()" class="reg-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" [(ngModel)]="name" name="name" placeholder="John Doe" required />
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="john@example.com" required />
          </div>

          <div class="form-group">
            <label>Password (Min 8 chars, 1 uppercase, 1 lowercase, 1 number)</label>
            <input type="password" [(ngModel)]="password" name="password" placeholder="••••••••" required />
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary submit-btn">
            {{ loading ? 'Creating Account...' : 'Register Now ➔' }}
          </button>
        </form>

        <p class="switch-link">
          Already have an account? <a routerLink="/login">Login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .reg-wrapper {
      min-height: 85vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2.5rem 1rem;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
    .reg-card {
      padding: 2.5rem;
      width: 100%;
      max-width: 480px;
    }
    .header-box {
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .header-box h2 {
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }
    .subtitle {
      color: var(--text-muted);
    }
    .avatar-upload-section {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: 1.75rem;
    }
    .circle-container {
      position: relative;
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px solid var(--primary);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.05);
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.2);
    }
    .preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .placeholder-icon {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cam-icon {
      font-size: 1.6rem;
    }
    .cam-label {
      font-size: 0.7rem;
      color: var(--text-muted);
    }
    .cam-btn {
      position: absolute;
      bottom: 0;
      right: 0;
      background: var(--primary);
      color: #000;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .upload-hint {
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 0.4rem;
    }
    .presets-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.6rem;
    }
    .preset-label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .preset-thumb {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      object-fit: cover;
      border: 1px solid var(--border);
      transition: transform 0.2s;
    }
    .preset-thumb:hover {
      transform: scale(1.15);
    }
    .active-preset {
      border: 2px solid var(--primary);
      transform: scale(1.15);
    }
    .reg-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
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
      margin-top: 1.75rem;
      text-align: center;
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
  `]
})
export class RegisterComponent {
  name = '';
  email = '';
  password = '';
  profilePic = '';
  loading = false;
  errorMessage = '';

  avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

  constructor(private auth: AuthService, private router: Router) {}

  onFileChange(e: any): void {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'Image size must be less than 2MB';
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        this.profilePic = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  selectPreset(url: string): void {
    this.profilePic = url;
  }

  onSubmit(): void {
    if (!this.name || !this.email || !this.password) return;
    this.loading = true;
    this.errorMessage = '';

    const payload = {
      name: this.name,
      email: this.email,
      password: this.password,
      profilePic: this.profilePic
    };

    this.auth.register(payload).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}
