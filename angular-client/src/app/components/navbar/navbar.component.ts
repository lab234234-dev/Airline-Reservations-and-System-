import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="glass-card nav-container">
      <a routerLink="/" class="logo">
        <span class="plane-icon">✈</span>
        <span class="gradient-text logo-text">SkyHigh Air</span>
      </a>

      <div class="nav-links">
        <!-- 1. Search Flights Link -->
        <a routerLink="/flights" class="nav-link" routerLinkActive="active-link">
          Search Flights
        </a>

        <!-- 2. Profile Link (Takes to Dashboard if logged in, Login if guest) -->
        <ng-container *ngIf="auth.user$ | async as user; else guestProfile">
          <a routerLink="/dashboard" class="nav-link profile-badge-link" routerLinkActive="active-link" title="My Profile">
            <img *ngIf="user.profilePic" [src]="user.profilePic" [alt]="user.name" class="avatar-img" />
            <div *ngIf="!user.profilePic" class="avatar-fallback">{{ user.name.charAt(0) }}</div>
            <span>Profile</span>
          </a>
        </ng-container>

        <ng-template #guestProfile>
          <a routerLink="/login" class="nav-link profile-badge-link" routerLinkActive="active-link" title="Login / Profile">
            <div class="avatar-fallback guest-avatar">👤</div>
            <span>Profile</span>
          </a>
        </ng-template>
      </div>
    </nav>
  `,
  styles: [`
    .nav-container {
      margin: 1rem 1.5rem;
      padding: 0.9rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 1rem;
      z-index: 100;
      border-radius: 16px;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      font-size: 1.5rem;
      font-weight: 800;
      text-decoration: none;
      color: #fff;
    }
    .plane-icon {
      font-size: 1.6rem;
      color: var(--primary);
      filter: drop-shadow(0 0 8px rgba(56, 189, 248, 0.5));
    }
    .logo-text {
      font-weight: 800;
      letter-spacing: -0.5px;
    }
    .nav-links {
      display: flex;
      gap: 1.8rem;
      align-items: center;
    }
    .nav-link {
      font-weight: 600;
      font-size: 0.95rem;
      text-decoration: none;
      color: #e2e8f0;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      transition: all 0.25s ease;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .nav-link:hover {
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
    }
    .active-link {
      color: #38bdf8 !important;
      background: rgba(56, 189, 248, 0.15) !important;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .profile-badge-link {
      padding: 0.35rem 0.85rem 0.35rem 0.5rem;
      border-radius: 30px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .avatar-img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--primary);
    }
    .avatar-fallback {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: linear-gradient(135deg, #0284c7, #38bdf8);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
    }
    .guest-avatar {
      background: rgba(255, 255, 255, 0.1);
      font-size: 0.95rem;
    }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}
}
