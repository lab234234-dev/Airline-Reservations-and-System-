import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { BoardingPassComponent } from '../boarding-pass/boarding-pass.component';

@Component({
  selector: 'app-checkin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, BoardingPassComponent],
  template: `
    <div class="checkin-container animate-fade-in">
      <div class="checkin-header text-center">
        <span class="badge">FAST-TRACK TRAVEL & BOARDING</span>
        <h1>Online <span class="gradient-text">Web Check-In</span></h1>
        <p class="subtitle">Complete check-in online to issue your digital boarding pass and clear your flight for boarding & takeoff.</p>
      </div>

      <!-- Step 1: PNR Lookup Form -->
      <div *ngIf="!selectedBooking" class="glass-card search-card">
        <h2>Enter Booking Details</h2>
        <p class="form-desc">Retrieve your reservation using your 6-character PNR reference code.</p>

        <form (ngSubmit)="searchPnr()" class="lookup-form">
          <div class="form-row">
            <div class="form-group">
              <label>PNR NUMBER / BOOKING REFERENCE</label>
              <input
                type="text"
                [(ngModel)]="pnrInput"
                name="pnr"
                placeholder="e.g. SH-8A2F1D"
                required
                style="text-transform: uppercase;"
              />
            </div>
            <div class="form-group">
              <label>PASSENGER LAST NAME / EMAIL</label>
              <input
                type="text"
                [(ngModel)]="passengerInput"
                name="passenger"
                placeholder="e.g. Patel or email"
              />
            </div>
          </div>

          <div *ngIf="errorMessage" class="error-msg">
            {{ errorMessage }}
          </div>

          <button type="submit" [disabled]="loading" class="btn-primary submit-btn">
            {{ loading ? 'Locating Reservation...' : 'Find My Booking ➔' }}
          </button>
        </form>

        <!-- Quick Select from logged-in user's bookings if available -->
        <div *ngIf="userBookings.length > 0" class="recent-bookings">
          <h3>Or Select From Your Recent Bookings:</h3>
          <div class="booking-chips">
            <button
              *ngFor="let b of userBookings"
              (click)="selectQuickBooking(b)"
              class="chip-btn"
            >
              <span>✈️ {{ b.origin || b.flight?.from || b.flight?.origin }} ➔ {{ b.destination || b.flight?.to || b.flight?.destination }}</span>
              <strong class="pnr-tag">PNR: {{ b.pnr }}</strong>
              <span class="chip-status" [class.status-done]="b.checkInStatus === 'completed'">
                {{ b.checkInStatus === 'completed' ? '✓ Checked In' : '⚠️ Pending Check-in' }}
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Step 2: Check-In Details & Boarding Confirmation -->
      <div *ngIf="selectedBooking && !checkinDone" class="glass-card checkin-flow animate-fade-in">
        <div class="flow-header">
          <div>
            <span class="badge">RESERVATION RETRIEVED</span>
            <h2>Flight {{ selectedBooking.flightNumber || selectedBooking.flight?.flightNumber }}</h2>
            <p class="route-txt">{{ getOriginCity() }} ➔ {{ getDestCity() }}</p>
          </div>
          <button (click)="resetSearch()" class="btn-secondary change-btn">Change PNR</button>
        </div>

        <!-- Flying Status Notice -->
        <div class="flying-status-notice">
          <span class="alert-ico">ℹ️</span>
          <div>
            <strong>Current Flight Status: {{ selectedBooking.flightFlyingStatus || (selectedBooking.checkInStatus === 'completed' ? 'In Flight ✈️ (Flying)' : 'Check-In Required (On Ground)') }}</strong>
            <p class="flight-notice-sub">
              {{ selectedBooking.checkInStatus === 'completed' 
                ? 'Your boarding pass is already issued and flight is active in the air.' 
                : 'Aircraft is awaiting passenger check-in. Confirming "YES" below will issue your Boarding Pass and clear you to fly.' }}
            </p>
          </div>
        </div>

        <div class="flight-summary-grid">
          <div class="summary-cell">
            <label>FLIGHT DATE</label>
            <div>{{ selectedBooking.flight?.departureTime | date:'dd MMM yyyy' }}</div>
          </div>
          <div class="summary-cell">
            <label>CONFIRMED SEAT(S)</label>
            <div class="seat-badge">{{ getSeatNames(selectedBooking) }}</div>
          </div>
          <div class="summary-cell">
            <label>CABIN CLASS</label>
            <div>{{ selectedBooking.flight?.class || 'Economy Class' }}</div>
          </div>
          <div class="summary-cell">
            <label>ASSIGNED GATE</label>
            <div class="highlight-val">{{ selectedBooking.gate || 'B4' }} (Terminal {{ selectedBooking.terminal || 'T2' }})</div>
          </div>
        </div>

        <!-- Baggage & Declaration -->
        <div class="baggage-section">
          <h3>🧳 Baggage & Security Clearance</h3>
          <div class="baggage-cards">
            <div class="bag-card">
              <span class="bag-icon">🎒</span>
              <div>
                <strong>1 Cabin Handbag (7 kg)</strong>
                <p>Fits in overhead compartment or under seat</p>
              </div>
              <span class="status-tick">✓ Included</span>
            </div>
            <div class="bag-card">
              <span class="bag-icon">🧳</span>
              <div>
                <strong>1 Check-In Baggage (15 kg)</strong>
                <p>Automated airport luggage conveyor tag</p>
              </div>
              <span class="status-tick">✓ Included</span>
            </div>
          </div>

          <label class="declare-checkbox">
            <input type="checkbox" [(ngModel)]="safetyDeclared" />
            <span>I confirm that I am not carrying any prohibited items, lithium batteries exceeding 100Wh, flammable liquids, or dangerous goods.</span>
          </label>
        </div>

        <!-- EXPLICIT BOARDING CONFIRMATION QUESTION -->
        <div class="boarding-yes-confirmation-box">
          <div class="q-head">
            <span class="flight-radar-pulse">✈️</span>
            <h4>Do you confirm Web Check-In to issue Boarding Pass and board this flight?</h4>
          </div>
          <p class="q-sub">
            Once you confirm <strong>YES</strong>, your digital Boarding Pass will be generated with barcode, seat reservation, and the flight status will transition to <strong>In Flight ✈️ (Flying)</strong>.
          </p>

          <button
            (click)="confirmCheckin()"
            [disabled]="!safetyDeclared || completing"
            class="btn-primary finish-checkin-btn"
          >
            {{ completing ? 'Issuing Digital Boarding Pass...' : '✅ YES, Confirm Check-In & Board Flight' }}
          </button>
        </div>
      </div>

      <!-- Step 3: Success Screen with Live Flying Radar & Digital Boarding Pass CTA -->
      <div *ngIf="checkinDone" class="glass-card success-card animate-fade-in text-center">
        <div class="success-icon">🎉</div>
        <h2>Web Check-In Confirmed & Boarding Pass Issued!</h2>
        <p class="success-msg">
          Passenger confirmed on flight <strong>{{ selectedBooking.flightNumber || selectedBooking.flight?.flightNumber }}</strong> 
          ({{ getOriginCity() }} ➔ {{ getDestCity() }}). Seat <strong>{{ getSeatNames(selectedBooking) }}</strong> is locked.
        </p>

        <!-- LIVE FLYING STATUS RADAR STRIP -->
        <div class="live-flying-tracker">
          <div class="tracker-header">
            <span class="radar-dot-live">● LIVE</span>
            <span class="tracker-title">AIRCRAFT RADAR: IN FLIGHT ✈️ (FLYING)</span>
            <span class="alt-speed">Alt: 35,000 ft • Speed: 840 km/h</span>
          </div>

          <div class="flying-route-bar">
            <div class="route-city">
              <span class="code">{{ getOriginCode() }}</span>
              <span class="c-name">{{ getOriginCity() }}</span>
            </div>

            <div class="flying-path-animated">
              <span class="track-line"></span>
              <span class="flying-plane-icon">✈️</span>
            </div>

            <div class="route-city text-right">
              <span class="code">{{ getDestCode() }}</span>
              <span class="c-name">{{ getDestCity() }}</span>
            </div>
          </div>
        </div>

        <div class="success-actions">
          <button (click)="openPassModal = true" class="btn-primary pass-btn">
            🎫 View & Print Digital Boarding Pass
          </button>
          <a routerLink="/dashboard" class="btn-secondary">
            📋 Go to My Trips & Dashboard
          </a>
        </div>
      </div>

      <!-- Digital Boarding Pass Modal -->
      <app-boarding-pass
        *ngIf="openPassModal"
        [booking]="selectedBooking"
        [onClose]="closePassModal"
      ></app-boarding-pass>
    </div>
  `,
  styles: [`
    .checkin-container {
        max-width: 860px;
        margin: 2rem auto;
        padding: 2rem 1.5rem;
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
        background: transparent !important;
        border: none !important;
        box-shadow: none !important;
      }
    .text-center {
      text-align: center;
    }
    .checkin-header h1 {
      font-size: 2.4rem;
      margin: 0.5rem 0;
      color: #f8fafc;
    }
    .gradient-text {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .subtitle {
      color: #94a3b8;
      max-width: 600px;
      margin: 0 auto 2rem;
    }
    .badge {
      display: inline-block;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: #38bdf8;
      background: rgba(56, 189, 248, 0.15);
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .search-card {
      padding: 2.5rem;
      border-radius: 16px;
    }
    .form-desc {
      color: #94a3b8;
      margin-bottom: 1.75rem;
      font-size: 0.95rem;
    }
    .lookup-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 700;
    }
    .form-group input {
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f8fafc;
      font-size: 0.95rem;
      outline: none;
    }
    .form-group input:focus {
      border-color: #38bdf8;
    }
    .error-msg {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.85rem;
    }
    .submit-btn {
      padding: 0.85rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      cursor: pointer;
    }

    .recent-bookings {
      margin-top: 2rem;
      padding-top: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .recent-bookings h3 {
      font-size: 0.95rem;
      color: #cbd5e1;
      margin: 0 0 1rem;
    }
    .booking-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    .chip-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      padding: 8px 12px;
      border-radius: 8px;
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .chip-btn:hover {
      background: rgba(56, 189, 248, 0.2);
      border-color: #38bdf8;
    }
    .pnr-tag {
      color: #38bdf8;
      font-family: monospace;
    }
    .chip-status {
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(234, 179, 8, 0.2);
      color: #fbbf24;
    }
    .status-done {
      background: rgba(34, 197, 94, 0.2) !important;
      color: #34d399 !important;
    }

    /* Step 2 */
    .checkin-flow {
      padding: 2rem;
      border-radius: 16px;
    }
    .flow-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .flow-header h2 {
      margin: 0.35rem 0 0.15rem;
      color: #f8fafc;
    }
    .route-txt {
      color: #38bdf8;
      font-weight: 700;
      margin: 0;
    }
    .change-btn {
      padding: 6px 12px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cbd5e1;
      font-size: 0.8rem;
      cursor: pointer;
    }

    .flying-status-notice {
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 10px;
      padding: 1rem;
      display: flex;
      gap: 12px;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .alert-ico {
      font-size: 1.5rem;
    }
    .flight-notice-sub {
      color: #94a3b8;
      font-size: 0.85rem;
      margin: 2px 0 0;
    }

    .flight-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      background: rgba(30, 41, 59, 0.5);
      padding: 1rem;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 1.5rem;
    }
    .summary-cell label {
      display: block;
      font-size: 0.7rem;
      color: #94a3b8;
      margin-bottom: 4px;
      font-weight: 700;
    }
    .summary-cell div {
      font-weight: 600;
      color: #f8fafc;
      font-size: 0.85rem;
    }
    .seat-badge {
      color: #38bdf8 !important;
      font-weight: 800 !important;
    }
    .highlight-val {
      color: #34d399 !important;
    }

    .baggage-section {
      margin-bottom: 1.75rem;
    }
    .baggage-section h3 {
      font-size: 1rem;
      color: #cbd5e1;
      margin: 0 0 1rem;
    }
    .baggage-cards {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .bag-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 0.85rem;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .bag-icon {
      font-size: 1.5rem;
    }
    .bag-card strong {
      display: block;
      font-size: 0.85rem;
      color: #f1f5f9;
    }
    .bag-card p {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 0;
    }
    .status-tick {
      margin-left: auto;
      font-size: 0.75rem;
      font-weight: 800;
      color: #34d399;
    }

    .declare-checkbox {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      font-size: 0.8rem;
      color: #94a3b8;
      cursor: pointer;
      line-height: 1.4;
    }
    .declare-checkbox input {
      margin-top: 3px;
      accent-color: #0284c7;
    }

    /* YES Confirmation Box */
    .boarding-yes-confirmation-box {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.35);
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
      margin-top: 1.5rem;
    }
    .q-head {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 0.5rem;
    }
    .flight-radar-pulse {
      font-size: 1.8rem;
      animation: pulsePlane 1.5s infinite;
    }
    @keyframes pulsePlane {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }
    .q-head h4 {
      margin: 0;
      font-size: 1.15rem;
      color: #34d399;
    }
    .q-sub {
      color: #cbd5e1;
      font-size: 0.85rem;
      max-width: 600px;
      margin: 0 auto 1.25rem;
    }
    .finish-checkin-btn {
      padding: 0.95rem 2rem;
      font-size: 1.05rem;
      font-weight: 800;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.4);
      transition: all 0.2s;
    }
    .finish-checkin-btn:hover {
      transform: translateY(-2px);
    }
    .finish-checkin-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }

    /* Step 3 Success */
    .success-card {
      padding: 3rem 1.5rem;
      border-radius: 16px;
    }
    .success-icon {
      font-size: 3.5rem;
      margin-bottom: 1rem;
    }
    .success-card h2 {
      font-size: 1.8rem;
      color: #f8fafc;
      margin: 0 0 0.5rem;
    }
    .success-msg {
      color: #94a3b8;
      font-size: 0.95rem;
      max-width: 580px;
      margin: 0 auto 1.5rem;
    }

    /* Live Flying Tracker */
    .live-flying-tracker {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      max-width: 600px;
      margin: 0 auto 2rem;
      box-shadow: 0 8px 30px rgba(2, 132, 199, 0.25);
    }
    .tracker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .radar-dot-live {
      color: #ef4444;
      font-weight: 800;
      animation: blinkLive 1.2s infinite;
    }
    @keyframes blinkLive {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.2; }
    }
    .tracker-title {
      color: #34d399;
      font-weight: 800;
      letter-spacing: 0.5px;
    }
    .alt-speed {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .flying-route-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .route-city {
      display: flex;
      flex-direction: column;
    }
    .route-city .code {
      font-size: 1.35rem;
      font-weight: 800;
      color: #f8fafc;
    }
    .route-city .c-name {
      font-size: 0.8rem;
      color: #94a3b8;
    }
    .text-right {
      text-align: right;
    }

    .flying-path-animated {
      flex: 1;
      position: relative;
      height: 4px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 2px;
      margin: 0 16px;
    }
    .track-line {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 60%;
      background: linear-gradient(90deg, #0284c7, #38bdf8);
      border-radius: 2px;
    }
    .flying-plane-icon {
      position: absolute;
      top: 50%;
      left: 60%;
      transform: translate(-50%, -50%) rotate(45deg);
      font-size: 1.2rem;
      animation: flightFloat 2s ease-in-out infinite alternate;
    }
    @keyframes flightFloat {
      from { transform: translate(-50%, -60%) rotate(45deg); }
      to { transform: translate(-50%, -40%) rotate(45deg); }
    }

    .success-actions {
      display: flex;
      justify-content: center;
      gap: 14px;
      flex-wrap: wrap;
    }
    .pass-btn {
      padding: 0.9rem 1.75rem;
      font-size: 1rem;
      font-weight: 800;
      border-radius: 10px;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      cursor: pointer;
    }
    .btn-secondary {
      background: rgba(51, 65, 85, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      padding: 0.9rem 1.75rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      text-decoration: none;
      display: inline-block;
    }

    @media (max-width: 640px) {
      .form-row, .flight-summary-grid, .baggage-cards {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckinComponent implements OnInit {
  pnrInput: string = '';
  passengerInput: string = '';
  loading: boolean = false;
  completing: boolean = false;
  errorMessage: string = '';
  safetyDeclared: boolean = false;
  checkinDone: boolean = false;

  userBookings: any[] = [];
  selectedBooking: any = null;
  openPassModal: boolean = false;

  constructor(
    private api: ApiService, 
    private auth: AuthService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.auth.currentUser) {
      this.api.getMyBookings().subscribe({
        next: (bookings) => {
          this.userBookings = bookings || [];
          
          // Check queryParams for automatic PNR lookup
          const queryPnr = this.route.snapshot.queryParams['pnr'];
          if (queryPnr) {
            this.pnrInput = queryPnr;
            this.searchPnr();
          }
        },
        error: () => {}
      });
    } else {
      const queryPnr = this.route.snapshot.queryParams['pnr'];
      if (queryPnr) {
        this.pnrInput = queryPnr;
        this.searchPnr();
      }
    }
  }

  searchPnr(): void {
    if (!this.pnrInput) return;
    this.loading = true;
    this.errorMessage = '';

    const cleanPnr = this.pnrInput.trim().toUpperCase();

    this.api.getMyBookings().subscribe({
      next: (bookings) => {
        this.loading = false;
        const match = bookings.find((b: any) => b.pnr?.toUpperCase() === cleanPnr);
        if (match) {
          this.selectedBooking = match;
          this.checkinDone = match.checkInStatus === 'completed';
        } else {
          // Fallback search in userBookings or direct object
          const direct = this.userBookings.find((b: any) => b.pnr?.toUpperCase() === cleanPnr);
          if (direct) {
            this.selectedBooking = direct;
            this.checkinDone = direct.checkInStatus === 'completed';
          } else {
            this.errorMessage = `No booking found matching PNR "${cleanPnr}". Please check and try again.`;
          }
        }
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Unable to fetch booking at this moment. Please check your internet connection.';
      }
    });
  }

  selectQuickBooking(b: any): void {
    this.selectedBooking = b;
    this.pnrInput = b.pnr;
    this.checkinDone = b.checkInStatus === 'completed';
  }

  resetSearch(): void {
    this.selectedBooking = null;
    this.safetyDeclared = false;
    this.checkinDone = false;
  }

  confirmCheckin(): void {
    if (!this.safetyDeclared) return;
    this.completing = true;

    const pnr = this.selectedBooking?.pnr;
    const bookingId = this.selectedBooking?._id;

    if (bookingId) {
      this.api.completeCheckIn(bookingId).subscribe({
        next: (res) => {
          this.completing = false;
          this.checkinDone = true;
          if (res.booking) {
            this.selectedBooking = res.booking;
          } else {
            this.selectedBooking.checkInStatus = 'completed';
            this.selectedBooking.boardingPassIssued = true;
            this.selectedBooking.flightFlyingStatus = 'In Flight ✈️ (Flying)';
          }
        },
        error: () => {
          // Fallback local update if network drops
          this.completing = false;
          this.checkinDone = true;
          this.selectedBooking.checkInStatus = 'completed';
          this.selectedBooking.boardingPassIssued = true;
          this.selectedBooking.flightFlyingStatus = 'In Flight ✈️ (Flying)';
        }
      });
    } else {
      setTimeout(() => {
        this.completing = false;
        this.checkinDone = true;
      }, 700);
    }
  }

  getOriginCity(): string {
    return this.selectedBooking?.origin || 
           this.selectedBooking?.flight?.origin || 
           this.selectedBooking?.flight?.from || 
           'Surat';
  }

  getDestCity(): string {
    return this.selectedBooking?.destination || 
           this.selectedBooking?.flight?.destination || 
           this.selectedBooking?.flight?.to || 
           'Delhi';
  }

  getOriginCode(): string {
    const c = this.getOriginCity().toLowerCase();
    const codes: any = { surat: 'STV', mumbai: 'BOM', delhi: 'DEL', ahmedabad: 'AMD', goa: 'GOI', bengaluru: 'BLR', dubai: 'DXB', london: 'LHR' };
    for (const k in codes) {
      if (c.includes(k)) return codes[k];
    }
    return this.getOriginCity().substring(0, 3).toUpperCase();
  }

  getDestCode(): string {
    const c = this.getDestCity().toLowerCase();
    const codes: any = { surat: 'STV', mumbai: 'BOM', delhi: 'DEL', ahmedabad: 'AMD', goa: 'GOI', bengaluru: 'BLR', dubai: 'DXB', london: 'LHR', singapore: 'SIN' };
    for (const k in codes) {
      if (c.includes(k)) return codes[k];
    }
    return this.getDestCity().substring(0, 3).toUpperCase();
  }

  getSeatNames(booking: any): string {
    if (booking?.seatNumber) return booking.seatNumber;
    if (booking?.passengers && booking.passengers.length > 0) {
      return booking.passengers.map((p: any) => p.seatNumber).join(', ');
    }
    return '12A';
  }

  closePassModal = (): void => {
    this.openPassModal = false;
  };
}
