import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { ApiService } from '../../services/api.service';
import { CurrencyService } from '../../services/currency.service';
import { BoardingPassComponent } from '../boarding-pass/boarding-pass.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BoardingPassComponent],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-grid">
        <!-- Sidebar Profile Card -->
        <div class="glass-card sidebar-card">
          <div class="profile-header">
            <div class="avatar-box" (click)="fileInput.click()" title="Click to change photo">
              <img *ngIf="user?.profilePic" [src]="user?.profilePic" class="avatar-photo" alt="Profile" />
              <div *ngIf="!user?.profilePic" class="avatar-initial">{{ user?.name?.charAt(0) || 'U' }}</div>
              <button class="cam-badge" (click)="fileInput.click(); $event.stopPropagation()">📷</button>
            </div>

            <h2>{{ user?.name || 'Guest User' }}</h2>
            <p class="user-email">{{ user?.email }}</p>

            <div class="rewards-pill">
              <span>🌟</span> {{ user?.rewardPoints || 250 }} SkyMiles
            </div>
          </div>

          <input #fileInput type="file" (change)="onFileChange($event)" accept="image/*" style="display: none;" />

          <div class="nav-tabs">
            <button
              [class.active-tab]="activeTab === 'bookings'"
              (click)="activeTab = 'bookings'"
              class="tab-btn"
            >
              ✈ My Bookings
            </button>

            <button
              [class.active-tab]="activeTab === 'profile'"
              (click)="activeTab = 'profile'"
              class="tab-btn"
            >
              👤 Profile & Documents
            </button>

            <!-- Web Check-In Link moved to Profile -->
            <a routerLink="/checkin" class="tab-btn checkin-tab-btn" style="color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.4); background: rgba(56, 189, 248, 0.12); font-weight: 600;">
              🎫 Web Check-In & Boarding Pass
            </a>

            <!-- Currency Exchange Selector moved to Profile -->
            <div class="profile-currency-box" style="margin: 0.85rem 0; padding: 0.85rem; border-radius: 12px; background: rgba(30, 41, 59, 0.65); border: 1px solid rgba(255, 255, 255, 0.1);">
              <label style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; text-transform: uppercase; color: #94a3b8; font-weight: 700; margin-bottom: 6px;">
                <span>💱 Currency Exchange</span>
                <span style="color: #38bdf8; font-size: 0.7rem;">Active</span>
              </label>
              <select [ngModel]="currencyService.current.code" (ngModelChange)="currencyService.setCurrency($event)" style="width: 100%; padding: 8px 10px; border-radius: 8px; background: #0f172a; color: #f8fafc; border: 1px solid rgba(56, 189, 248, 0.3); font-weight: 600; font-size: 0.85rem; outline: none; cursor: pointer;">
                <option *ngFor="let c of currencyService.availableCurrencies" [value]="c.code">
                  {{ c.code }} ({{ c.symbol }})
                </option>
              </select>
            </div>

            <a *ngIf="user?.role === 'admin'" routerLink="/admin" class="tab-btn" style="background: rgba(245, 158, 11, 0.15); color: var(--primary); font-weight: bold; border: 1px solid var(--primary);">
              👑 Admin Control Panel
            </a>

            <!-- Logout Button in Profile -->
            <button (click)="logout()" class="tab-btn logout-tab-btn">
              🚪 Logout
            </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="content-area">
          <!-- Bookings Tab -->
          <div *ngIf="activeTab === 'bookings'" class="animate-fade-in">
            <div class="content-header">
              <h1>My <span class="gradient-text">Bookings</span></h1>
              <a routerLink="/flights" class="btn-primary">+ Book New Flight</a>
            </div>

            <div *ngIf="loadingBookings" class="loading-box">
              <p>Loading your trips...</p>
            </div>

            <div *ngIf="!loadingBookings && bookings.length === 0" class="glass-card empty-box">
              <span class="empty-icon">✈️</span>
              <h3>No bookings yet</h3>
              <p>Looks like you haven't booked any flights.</p>
            </div>

            <div *ngIf="!loadingBookings && bookings.length > 0" class="bookings-list">
              <div *ngFor="let b of bookings" class="glass-card booking-item">
                <div class="flight-left">
                  <p class="date-txt">{{ formatDate(b.flight?.departureTime || b.createdAt) }}</p>
                  <h3>{{ b.airline || b.flight?.airline }}</h3>
                  <span class="f-code">{{ b.flightNumber || b.flight?.flightNumber }}</span>
                  <div class="booking-meta-row">
                    <span class="meta-tag-pay">💳 {{ b.paymentMethod || 'Paid (Credit/Debit Card)' }}</span>
                    <span *ngIf="b.transactionId" class="meta-tag-txn">{{ b.transactionId }}</span>
                  </div>
                </div>

                <div class="route-center">
                  <div class="route-box from-box">
                    <span class="route-lbl">FROM</span>
                    <h4 class="city-name">{{ getOrigin(b) }}</h4>
                    <span class="city-code">{{ getAirportCode(getOrigin(b)) }}</span>
                  </div>

                  <div class="route-mid">
                    <span class="plane-sym" [class.plane-flying-pulse]="b.checkInStatus === 'completed'">✈️</span>
                    <div class="route-line" [class.line-flying]="b.checkInStatus === 'completed'"></div>
                    <span class="pnr-badge">PNR: {{ b.pnr || 'SH-' + (b._id?.substring(18) || '2026') }}</span>
                    
                    <!-- Live Flying Status indicator -->
                    <div class="radar-status-badge" [class.radar-status-flying]="b.checkInStatus === 'completed'">
                      <span class="live-dot" *ngIf="b.checkInStatus === 'completed'">●</span>
                      {{ b.checkInStatus === 'completed' ? 'In Flight ✈️ (Flying)' : '⏳ Awaiting Check-In' }}
                    </div>
                  </div>

                  <div class="route-box to-box">
                    <span class="route-lbl">TO</span>
                    <h4 class="city-name">{{ getDestination(b) }}</h4>
                    <span class="city-code">{{ getAirportCode(getDestination(b)) }}</span>
                  </div>
                </div>

                <div class="fare-right">
                  <div class="booking-status-tags">
                    <span class="confirmed-tag">✓ Paid</span>
                    <span class="checkin-tag" [class.checkin-done]="b.checkInStatus === 'completed'">
                      {{ b.checkInStatus === 'completed' ? '✓ Pass Issued' : '⚠️ Check-in Required' }}
                    </span>
                  </div>
                  <h2>{{ currencyService.format(b.totalAmount) }}</h2>
                  <div class="actions-stack">
                    <button *ngIf="b.checkInStatus === 'completed'" (click)="openBoardingPass(b)" class="btn-primary pass-open-btn">
                      🎫 View Boarding Pass
                    </button>
                    <button *ngIf="b.checkInStatus !== 'completed'" (click)="goToCheckIn(b)" class="btn-primary checkin-cta-btn">
                      🎫 Check-In & Board ➔
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Comprehensive Profile & Preferences Tab -->
          <div *ngIf="activeTab === 'profile'" class="glass-card profile-form-card animate-fade-in">
            <div class="profile-card-top">
              <div>
                <h1>Profile <span class="gradient-text">& Travel Preferences</span></h1>
                <p>Synced with MongoDB Cloud Atlas for real-time auto-fill</p>
              </div>
              <span class="shield-badge">🔒 Concurrency Protected</span>
            </div>

            <form (ngSubmit)="saveProfile()" class="edit-form">
              <!-- Avatar Preset Section -->
              <div class="photo-edit-row">
                <div class="photo-preview" (click)="fileInput.click()">
                  <img *ngIf="formData.profilePic" [src]="formData.profilePic" alt="Profile" />
                  <span *ngIf="!formData.profilePic" class="photo-placeholder">📷</span>
                </div>
                <div class="presets-block">
                  <h4>Avatar & Profile Photo</h4>
                  <div class="preset-thumbs">
                    <img
                      *ngFor="let u of avatarPresets"
                      [src]="u"
                      (click)="formData.profilePic = u"
                      [class.selected-preset]="formData.profilePic === u"
                      alt="Preset"
                    />
                  </div>
                </div>
              </div>

              <!-- Personal Information -->
              <h3 class="section-title">👤 Personal Information</h3>
              <div class="form-grid">
                <div class="field">
                  <label>Full Name</label>
                  <input type="text" [(ngModel)]="formData.name" name="name" required />
                </div>
                <div class="field">
                  <label>Email Address</label>
                  <input type="email" [value]="user?.email" disabled class="disabled-inp" />
                </div>
                <div class="field">
                  <label>Mobile Number</label>
                  <input type="tel" [(ngModel)]="formData.phone" name="phone" placeholder="+91 98765 43210" />
                </div>
                <div class="field">
                  <label>Date of Birth</label>
                  <input type="date" [(ngModel)]="formData.dob" name="dob" />
                </div>
                <div class="field">
                  <label>Gender</label>
                  <select [(ngModel)]="formData.gender" name="gender">
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <!-- Government ID -->
              <h3 class="section-title">📄 Government ID Verification</h3>
              <div class="form-grid">
                <div class="field">
                  <label>ID Document Type</label>
                  <select [(ngModel)]="formData.idType" name="idType">
                    <option value="Aadhaar">Aadhaar Card</option>
                    <option value="Passport">Passport</option>
                    <option value="National ID">National ID Card</option>
                  </select>
                </div>
                <div class="field">
                  <label>Document ID Number</label>
                  <input type="text" [(ngModel)]="formData.idNumber" name="idNumber" placeholder="1234-5678-9012" />
                </div>
              </div>

              <h3 class="section-title">In-Flight Travel Preferences</h3>
              <h3 class="section-title">In-Flight Travel Preferences</h3>
              <div class="form-grid">
                <div class="field">
                  <label>Default Seat Preference</label>
                  <select [(ngModel)]="formData.seatPreference" name="seatPreference">
                    <option value="Window">Window Seat</option>
                    <option value="Aisle">Aisle Seat</option>
                    <option value="Extra Legroom">Extra Legroom 💺</option>
                    <option value="Any">Any Seat Available</option>
                  </select>
                </div>
                <div class="field">
                  <label>Meal Preference</label>
                  <select [(ngModel)]="formData.mealPreference" name="mealPreference">
                    <option value="Vegetarian">Vegetarian Meal</option>
                    <option value="Non-Vegetarian">Non-Vegetarian Meal</option>
                    <option value="Jain Meal">Jain Meal</option>
                    <option value="Vegan">Vegan Meal</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div *ngIf="saveMsg" class="success-banner">{{ saveMsg }}</div>

              <div class="btn-group">
                <button type="submit" [disabled]="saving" class="btn-primary">
                  {{ saving ? 'Saving to MongoDB...' : 'Save Profile Changes 💾' }}
                </button>
                <button type="button" (click)="activeTab = 'bookings'" class="btn-secondary">
                  Back to Bookings
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <!-- Digital Boarding Pass Modal -->
      <app-boarding-pass
        *ngIf="selectedPassBooking"
        [booking]="selectedPassBooking"
        [onClose]="closePassModal"
      ></app-boarding-pass>
    </div>
  `,
  styles: [`
    .dashboard-container {
        max-width: 1250px;
        margin: 0 auto;
        padding: 2.5rem 1.5rem;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    .dashboard-grid {
      display: grid;
      grid-template-columns: 1fr 3fr;
      gap: 2rem;
    }
    .sidebar-card {
      padding: 2rem;
      height: fit-content;
    }
    .profile-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    .avatar-box {
      position: relative;
      width: 90px;
      height: 90px;
      margin: 0 auto 1rem;
      border-radius: 50%;
      border: 3px solid var(--primary);
      overflow: hidden;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--primary);
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
    }
    .avatar-photo {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .avatar-initial {
      font-size: 2.2rem;
      color: #000;
      font-weight: bold;
    }
    .cam-badge {
      position: absolute;
      bottom: 0;
      right: 0;
      background: var(--primary);
      color: #000;
      border: 2px solid #000;
      border-radius: 50%;
      width: 26px;
      height: 26px;
      font-size: 0.75rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .profile-header h2 {
      font-size: 1.4rem;
    }
    .user-email {
      color: var(--text-muted);
      font-size: 0.85rem;
      margin-bottom: 0.75rem;
    }
    .rewards-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
      color: var(--primary);
      font-size: 0.85rem;
      font-weight: 700;
    }
    .nav-tabs {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .tab-btn {
      padding: 0.85rem 1rem;
      border-radius: 8px;
      text-align: left;
      font-weight: 600;
      background: transparent;
      color: var(--text);
      border: 1px solid var(--border);
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .tab-btn:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    .active-tab {
      background: var(--primary) !important;
      color: #000 !important;
      border: none !important;
      box-shadow: 0 4px 15px rgba(245, 158, 11, 0.3);
    }
    .counter-desk-btn {
      color: #60a5fa;
      background: rgba(59, 130, 246, 0.1);
      border-color: rgba(59, 130, 246, 0.3);
    }
    .logout-tab-btn {
      color: var(--error);
      border-color: var(--error);
      margin-top: 1rem;
    }
    .content-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .empty-box, .loading-box {
      padding: 4rem;
      text-align: center;
    }
    .empty-icon {
      font-size: 3rem;
      display: block;
      margin-bottom: 1rem;
    }
    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .booking-meta-row {
      display: flex;
      flex-direction: column;
      gap: 3px;
      margin-top: 6px;
      font-size: 0.7rem;
      color: #94a3b8;
    }
    .meta-tag-pay {
      color: #38bdf8;
      font-weight: 600;
    }
    .meta-tag-txn {
      font-family: monospace;
      color: #64748b;
    }
    .radar-status-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 999px;
      background: rgba(234, 179, 8, 0.15);
      color: #fbbf24;
      border: 1px solid rgba(234, 179, 8, 0.3);
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .radar-status-flying {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #34d399 !important;
      border-color: rgba(16, 185, 129, 0.4) !important;
    }
    .plane-flying-pulse {
      animation: planeFly 1.5s infinite alternate;
      color: #38bdf8;
    }
    @keyframes planeFly {
      from { transform: translateY(-2px) scale(1); }
      to { transform: translateY(2px) scale(1.15); }
    }
    .line-flying {
      background: linear-gradient(90deg, #0284c7, #10b981) !important;
      box-shadow: 0 0 8px rgba(16, 185, 129, 0.6);
    }
    .booking-status-tags {
      display: flex;
      gap: 6px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }
    .checkin-tag {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      font-weight: 700;
    }
    .checkin-done {
      background: rgba(16, 185, 129, 0.15) !important;
      color: #34d399 !important;
    }
    .actions-stack {
      display: flex;
      gap: 8px;
      margin-top: 6px;
    }
    .checkin-cta-btn {
      padding: 0.5rem 1rem !important;
      font-size: 0.8rem !important;
      font-weight: 700 !important;
      background: linear-gradient(135deg, #0284c7, #2563eb) !important;
      color: #fff !important;
      border: none !important;
      border-radius: 8px !important;
      cursor: pointer !important;
    }

    .booking-item {
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .date-txt {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .f-code {
      font-size: 0.8rem;
      background: rgba(245, 158, 11, 0.15);
      color: var(--primary);
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
    }
          .route-center {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        flex: 1;
        justify-content: center;
      }
      .route-box {
        display: flex;
        flex-direction: column;
        min-width: 90px;
      }
      .from-box {
        text-align: left;
      }
      .to-box {
        text-align: right;
      }
      .route-lbl {
        font-size: 0.72rem;
        font-weight: 800;
        letter-spacing: 0.1em;
        margin-bottom: 0.2rem;
      }
      .from-box .route-lbl {
        color: #38bdf8;
      }
      .to-box .route-lbl {
        color: #f59e0b;
      }
      .city-name {
        font-size: 1.35rem;
        font-weight: 800;
        color: #fff;
        margin: 0;
      }
      .city-code {
        font-size: 0.8rem;
        font-weight: 700;
        color: #64748b;
        letter-spacing: 0.05em;
      }
      .route-mid {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.3rem;
      }
      .route-line {
        width: 100px;
        height: 2px;
        background: linear-gradient(90deg, #38bdf8, #f59e0b);
        border-radius: 2px;
      }
      .pnr-badge {
        font-size: 0.7rem;
        font-weight: 700;
        color: #38bdf8;
        background: rgba(56, 189, 248, 0.1);
        padding: 0.15rem 0.5rem;
        border-radius: 4px;
      }
      .old-route-center {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }
    .plane-sym {
      color: var(--primary);
    }
    .fare-right {
      text-align: right;
    }
    .confirmed-tag {
      color: #10b981;
      font-size: 0.85rem;
      display: block;
      margin-bottom: 0.2rem;
    }
    .profile-form-card {
      padding: 2.5rem;
    }
    .profile-card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .shield-badge {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.4rem 0.8rem;
      border-radius: 12px;
      font-size: 0.8rem;
    }
    .edit-form {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .photo-edit-row {
      display: flex;
      gap: 1.5rem;
      align-items: center;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid var(--border);
    }
    .photo-preview {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      border: 3px solid var(--primary);
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .photo-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .photo-placeholder {
      font-size: 2rem;
    }
    .preset-thumbs {
      display: flex;
      gap: 0.6rem;
      margin-top: 0.4rem;
    }
    .preset-thumbs img {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      object-fit: cover;
      border: 1px solid var(--border);
    }
    .selected-preset {
      border: 2px solid var(--primary) !important;
      transform: scale(1.15);
    }
    .section-title {
      font-size: 1.15rem;
      margin-top: 0.5rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.25rem;
    }
    .field label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.35rem;
    }
    .field input, .field select {
      width: 100%;
    }
    .disabled-inp {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .btn-group {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
    }
    .success-banner {
      color: #10b981;
      background: rgba(16, 185, 129, 0.1);
      padding: 0.8rem;
      border-radius: 8px;
      font-size: 0.9rem;
    }
    .pass-open-btn {
      padding: 0.35rem 0.8rem;
      font-size: 0.82rem;
      margin-top: 0.4rem;
    }
  `]
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  activeTab: 'bookings' | 'profile' = 'bookings';
  bookings: any[] = [];
  loadingBookings = true;
  saving = false;
  saveMsg = '';
  selectedPassBooking: any = null;

  formData: any = {
    name: '',
    profilePic: '',
    phone: '',
    dob: '',
    gender: '',
    idType: 'Aadhaar',
    idNumber: '',
    seatPreference: 'Window',
    mealPreference: 'Vegetarian'
  };

  avatarPresets = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  ];

  constructor(
    public auth: AuthService,
    private api: ApiService,
    private router: Router,
    public currencyService: CurrencyService
  ) {}

  openBoardingPass(b: any): void {
    this.selectedPassBooking = b;
  }

  closePassModal = (): void => {
    this.selectedPassBooking = null;
  };

  ngOnInit(): void {
    this.auth.user$.subscribe((u) => {
      this.user = u;
      if (u) {
        this.formData = {
          name: u.name || '',
          profilePic: u.profilePic || '',
          phone: u.phone || '',
          dob: u.dob ? u.dob.split('T')[0] : '',
          gender: u.gender || '',
          idType: u.idType || 'Aadhaar',
          idNumber: u.idNumber || '',
          seatPreference: u.seatPreference || 'Window',
          mealPreference: u.mealPreference || 'Vegetarian'
        };
      }
    });

    this.loadBookings();
  }

  loadBookings(): void {
    this.loadingBookings = true;
    this.api.getMyBookings().subscribe({
      next: (b) => {
        this.bookings = b;
        this.loadingBookings = false;
      },
      error: () => {
        this.bookings = [];
        this.loadingBookings = false;
      }
    });
  }

  onFileChange(e: any): void {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.formData.profilePic = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile(): void {
    this.saving = true;
    this.saveMsg = '';
    this.auth.updateProfile(this.formData).subscribe({
      next: () => {
        this.saving = false;
        this.saveMsg = 'Profile & Travel Preferences saved to MongoDB! / àªªà«àª°à«‹àª«àª¾àª‡àª² àª¸à«‡àªµ àª¥àªˆ àª—àªˆ!';
        setTimeout(() => this.saveMsg = '', 4000);
      },
      error: () => {
        this.saving = false;
      }
    });
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString();
  }

  getOrigin(b: any): string {
    return b?.flight?.origin || b?.flight?.from || b?.origin || 'Surat';
  }

  getDestination(b: any): string {
    return b?.flight?.destination || b?.flight?.to || b?.destination || 'Mumbai';
  }

  getAirportCode(city: string): string {
    if (!city) return 'AIR';
    const c = city.toLowerCase();
    if (c.includes('surat')) return 'STV';
    if (c.includes('mumbai')) return 'BOM';
    if (c.includes('delhi')) return 'DEL';
    if (c.includes('bangalore') || c.includes('bengaluru')) return 'BLR';
    if (c.includes('ahmedabad')) return 'AMD';
    if (c.includes('goa')) return 'GOX';
    if (c.includes('jaipur')) return 'JAI';
    if (c.includes('kolkata')) return 'CCU';
    if (c.includes('chennai')) return 'MAA';
    if (c.includes('kochi')) return 'COK';
    if (c.includes('srinagar')) return 'SXR';
    if (c.includes('hyderabad')) return 'HYD';
    if (c.includes('pune')) return 'PNQ';
    if (c.includes('dubai')) return 'DXB';
    if (c.includes('london')) return 'LHR';
    if (c.includes('singapore')) return 'SIN';
    if (c.includes('new york')) return 'JFK';
    if (c.includes('bangkok')) return 'BKK';
    if (c.includes('paris')) return 'CDG';
    return city.substring(0, 3).toUpperCase();
  }

  goToCheckIn(b: any): void {
    this.router.navigate(['/checkin'], { queryParams: { pnr: b.pnr } });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
