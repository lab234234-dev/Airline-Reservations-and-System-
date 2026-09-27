import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';

interface PassengerRow {
  name: string;
  age: number | '';
  gender: string;
  category: 'Adult' | 'Child' | 'Infant';
  idType: string;
  idNumber: string;
  seatNumber: string;
  mealPreference: string;
}

@Component({
  selector: 'app-counter-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="counter-page">
      <div class="top-bar">
        <div>
          <span class="badge-terminal">AIRPORT COUNTER DESK • ANGULAR</span>
          <h1>Airport Ticket Counter <span class="gradient-text">& Offline Booking</span></h1>
          <p class="subtitle">Direct walk-in passenger ticketing, seat assignment, ID checks & Cash/POS payments</p>
        </div>
        <button *ngIf="confirmedTicket" (click)="resetBooking()" class="btn-primary">
          + Book Next Passenger
        </button>
      </div>

      <!-- Printable Boarding Pass Result -->
      <div *ngIf="confirmedTicket" class="glass-card boarding-pass animate-fade-in">
        <div class="pass-header">
          <div>
            <span class="airline-brand">SKYHIGH AIRLINES • BOARDING PASS</span>
            <h2>Walk-in Counter Ticket</h2>
            <p>Desk Agent: {{ confirmedTicket.agentName }}</p>
          </div>
          <div class="pnr-box">
            <span class="pnr-lbl">CONFIRMATION PNR</span>
            <h1 class="pnr-val">{{ confirmedTicket.pnr }}</h1>
            <span class="paid-badge">PAID ({{ confirmedTicket.billing?.paymentMethod }})</span>
          </div>
        </div>

        <div class="flight-strip">
          <div>
            <label>Flight</label>
            <h3>{{ confirmedTicket.travelDetails?.flightId?.airline || 'SkyHigh' }}</h3>
            <span class="highlight">{{ confirmedTicket.travelDetails?.flightId?.flightNumber }}</span>
          </div>
          <div>
            <label>Route</label>
            <h3>{{ confirmedTicket.travelDetails?.flightId?.origin }} ➔ {{ confirmedTicket.travelDetails?.flightId?.destination }}</h3>
            <span class="sub">{{ confirmedTicket.travelDetails?.class }} Class</span>
          </div>
          <div>
            <label>Departure</label>
            <h3>{{ formatDate(confirmedTicket.travelDetails?.flightId?.departureTime) }}</h3>
          </div>
          <div>
            <label>Amount Collected</label>
            <h2 class="amount-val">₹{{ confirmedTicket.billing?.totalPaid }}</h2>
          </div>
        </div>

        <h3 class="manifest-title">Passengers & Seat Numbers</h3>
        <div class="passengers-manifest">
          <div *ngFor="let p of confirmedTicket.passengers" class="manifest-row">
            <div>
              <strong>{{ p.name }} ({{ p.category }})</strong>
              <p>{{ p.gender }}, Age: {{ p.age }} | ID: {{ p.idType }} ({{ p.idNumber }})</p>
            </div>
            <div class="seat-badge-box">
              <span>Assigned Seat</span>
              <h2>{{ p.seatNumber }}</h2>
            </div>
          </div>
        </div>

        <div class="pass-actions">
          <button (click)="printTicket()" class="btn-primary print-btn">
            🖨️ Print E-Ticket / Boarding Pass
          </button>
        </div>
      </div>

      <!-- Operational 4-Section Counter Booking Form -->
      <form *ngIf="!confirmedTicket" (ngSubmit)="submitBooking()" class="counter-grid">
        <div class="left-panel">
          <!-- 1. Travel Coordinates -->
          <div class="glass-card section-card">
            <h2>✈️ 1. Travel Coordinates & Flight Selection</h2>
            <div class="field-full">
              <label>Select Scheduled Flight</label>
              <select [(ngModel)]="selectedFlightId" (ngModelChange)="onFlightChange()" name="flightSelect">
                <option *ngFor="let f of flights" [value]="f._id">
                  {{ f.flightNumber }} • {{ f.origin }} ➔ {{ f.destination }} ({{ f.airline }}) — ₹{{ f.price }} (Seats Left: {{ f.seatsAvailable }})
                </option>
              </select>
            </div>

            <div class="fields-2col">
              <div class="field">
                <label>Trip Type</label>
                <select [(ngModel)]="tripType" name="tripType">
                  <option value="One-Way">One-Way</option>
                  <option value="Round-Trip">Round-Trip</option>
                </select>
              </div>
              <div class="field">
                <label>Travel Class</label>
                <select [(ngModel)]="travelClass" name="travelClass">
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy (+40%)</option>
                  <option value="Business">Business Class (+120%)</option>
                  <option value="First Class">First Class (+250%)</option>
                </select>
              </div>
            </div>
          </div>

          <!-- 2. Passenger Profiling -->
          <div class="glass-card section-card">
            <div class="card-head-row">
              <h2>👥 2. Passenger Profiling & ID Verification</h2>
              <button type="button" (click)="addPassenger()" class="btn-secondary add-pax-btn">
                + Add Passenger
              </button>
            </div>

            <div class="pax-list">
              <div *ngFor="let p of passengers; let i = index" class="pax-card">
                <div class="pax-head">
                  <span class="pax-num">Passenger #{{ i + 1 }}</span>
                  <button *ngIf="passengers.length > 1" type="button" (click)="removePassenger(i)" class="remove-btn">
                    🗑️ Remove
                  </button>
                </div>

                <div class="fields-4col">
                  <div class="field col-span-2">
                    <label>Full Name (Govt ID Match)</label>
                    <input type="text" [(ngModel)]="p.name" [name]="'name_' + i" placeholder="e.g. Rahul Sharma" required />
                  </div>
                  <div class="field">
                    <label>Age</label>
                    <input type="number" [(ngModel)]="p.age" [name]="'age_' + i" min="1" max="110" required />
                  </div>
                  <div class="field">
                    <label>Gender</label>
                    <select [(ngModel)]="p.gender" [name]="'gender_' + i">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div class="fields-4col">
                  <div class="field">
                    <label>Category</label>
                    <select [(ngModel)]="p.category" [name]="'category_' + i">
                      <option value="Adult">Adult</option>
                      <option value="Child">Child</option>
                      <option value="Infant">Infant</option>
                    </select>
                  </div>
                  <div class="field">
                    <label>ID Document</label>
                    <select [(ngModel)]="p.idType" [name]="'idType_' + i">
                      <option value="Aadhaar">Aadhaar</option>
                      <option value="Passport">Passport</option>
                      <option value="National ID">National ID</option>
                    </select>
                  </div>
                  <div class="field col-span-2">
                    <label>ID / Document Number</label>
                    <input type="text" [(ngModel)]="p.idNumber" [name]="'idNum_' + i" placeholder="Aadhaar / Passport No." required />
                  </div>
                </div>

                <div class="fields-2col">
                  <div class="field">
                    <label>Seat Number</label>
                    <input type="text" [(ngModel)]="p.seatNumber" [name]="'seat_' + i" placeholder="e.g. 12A" required />
                  </div>
                  <div class="field">
                    <label>Meal Choice</label>
                    <select [(ngModel)]="p.mealPreference" [name]="'meal_' + i">
                      <option value="Vegetarian">Vegetarian 🌱</option>
                      <option value="Non-Vegetarian">Non-Vegetarian 🍗</option>
                      <option value="Jain Meal">Jain Meal</option>
                      <option value="None">None</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Mandatory Contact Tracing -->
          <div class="glass-card section-card">
            <h2>📞 3. Mandatory Contact Tracing</h2>
            <div class="fields-2col">
              <div class="field">
                <label>Mobile Number (For Flight SMS Alerts)</label>
                <input type="tel" [(ngModel)]="contact.phone" name="phone" placeholder="+91 98765 43210" required />
              </div>
              <div class="field">
                <label>Email Address (For E-Ticket Delivery)</label>
                <input type="email" [(ngModel)]="contact.email" name="email" placeholder="passenger@example.com" required />
              </div>
            </div>
          </div>
        </div>

        <!-- Right Panel: Interactive Flight Route Map & Billing -->
        <div class="right-panel">
          <!-- Interactive Route Map -->
          <div class="glass-card map-card">
            <div class="map-header">
              <span>📍 Live Flight Route Map</span>
              <span class="sub">Direct</span>
            </div>

            <div class="svg-map-frame">
              <svg width="100%" height="100%" viewBox="0 0 500 200" preserveAspectRatio="xMidYMid meet">
                <path d="M 80 150 Q 250 40 420 150" fill="none" stroke="rgba(245, 158, 11, 0.4)" stroke-width="3" stroke-dasharray="6 6" />
                <circle cx="80" cy="150" r="8" fill="var(--primary)" />
                <circle cx="80" cy="150" r="14" fill="rgba(245, 158, 11, 0.2)" />
                <text x="80" y="180" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">
                  {{ selectedFlight?.origin || 'FROM' }}
                </text>
                <circle cx="420" cy="150" r="8" fill="#10b981" />
                <circle cx="420" cy="150" r="14" fill="rgba(16, 185, 129, 0.2)" />
                <text x="420" y="180" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">
                  {{ selectedFlight?.destination || 'TO' }}
                </text>
                <!-- Animated Airplane icon -->
                <g transform="translate(240, 75) rotate(5)">
                  <circle cx="10" cy="10" r="16" fill="rgba(245, 158, 11, 0.2)" />
                  <path d="M10 2 L12 8 L18 10 L12 12 L10 18 L8 12 L2 10 L8 8 Z" fill="var(--primary)" />
                </g>
              </svg>
            </div>

            <div class="route-info-bar">
              <span>Seats: {{ selectedFlight?.seatsAvailable }}</span>
              <strong style="color: var(--primary);">{{ selectedFlight?.airline }}</strong>
              <span>{{ selectedFlight?.flightNumber }}</span>
            </div>
          </div>

          <!-- Billing & Payment Mode -->
          <div class="glass-card billing-card">
            <h3>💳 Billing & Payment Collection</h3>
            <label class="baggage-opt">
              <input type="checkbox" [(ngModel)]="addLuggage" name="addLuggage" />
              Add Extra 15kg Baggage (+₹850/pax)
            </label>

            <div class="bill-summary">
              <div class="row">
                <span>Base Fare ({{ passengers.length }} pax):</span>
                <span>₹{{ getBaseTotal() }}</span>
              </div>
              <div class="row">
                <span>Baggage / Add-ons:</span>
                <span>₹{{ getAddOnCharges() }}</span>
              </div>
              <div class="row total-row">
                <span>Total Collected:</span>
                <h2>₹{{ getTotalFare() }}</h2>
              </div>
            </div>

            <div class="payment-modes">
              <label>Offline Payment Method</label>
              <div class="modes-grid">
                <button
                  *ngFor="let m of ['CASH', 'CARD', 'UPI']"
                  type="button"
                  [class.active-mode]="paymentMethod === m"
                  (click)="paymentMethod = m"
                  class="mode-btn"
                >
                  {{ m }}
                </button>
              </div>
            </div>

            <div *ngIf="errorMsg" class="error-box">{{ errorMsg }}</div>

            <button type="submit" [disabled]="submitting" class="btn-primary issue-btn">
              {{ submitting ? 'Processing Ticket...' : 'Confirm & Issue Ticket ➔' }}
            </button>
          </div>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .counter-page {
      max-width: 1300px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
    }
    .top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .badge-terminal {
      background: #3b82f6;
      color: #fff;
      font-size: 0.75rem;
      font-weight: 700;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      display: inline-block;
      margin-bottom: 0.3rem;
    }
    .top-bar h1 {
      font-size: 2.4rem;
      font-weight: 800;
    }
    .subtitle {
      color: var(--text-muted);
    }
    .counter-grid {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    .left-panel {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .section-card {
      padding: 2rem;
    }
    .section-card h2 {
      font-size: 1.35rem;
      margin-bottom: 1.25rem;
    }
    .card-head-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }
    .add-pax-btn {
      padding: 0.4rem 0.8rem;
      font-size: 0.85rem;
    }
    .field-full {
      margin-bottom: 1.25rem;
    }
    .field-full select {
      width: 100%;
    }
    .fields-2col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .fields-4col {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }
    .col-span-2 {
      grid-column: span 2;
    }
    .field label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-bottom: 0.3rem;
    }
    .field input, .field select {
      width: 100%;
    }
    .pax-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    .pax-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 1.25rem;
    }
    .pax-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }
    .pax-num {
      color: var(--primary);
      font-weight: 700;
    }
    .remove-btn {
      background: transparent;
      color: #ef4444;
      font-size: 0.8rem;
    }
    .right-panel {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }
    .map-card {
      padding: 1.5rem;
      text-align: center;
    }
    .map-header {
      display: flex;
      justify-content: space-between;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .svg-map-frame {
      width: 100%;
      height: 180px;
      background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .route-info-bar {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-top: 0.75rem;
    }
    .billing-card {
      padding: 1.75rem;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    .billing-card h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    .baggage-opt {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      cursor: pointer;
      margin-bottom: 1rem;
    }
    .bill-summary {
      border-top: 1px solid var(--border);
      padding: 1rem 0;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      font-size: 0.9rem;
    }
    .row {
      display: flex;
      justify-content: space-between;
    }
    .total-row {
      border-top: 1px dashed var(--border);
      padding-top: 0.5rem;
      align-items: center;
      font-weight: 700;
    }
    .total-row h2 {
      color: var(--primary);
    }
    .payment-modes {
      margin: 1rem 0;
    }
    .payment-modes label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
    }
    .modes-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }
    .mode-btn {
      padding: 0.6rem;
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      border-radius: 6px;
      font-weight: 700;
    }
    .active-mode {
      border: 2px solid var(--primary);
      background: rgba(245, 158, 11, 0.2);
      color: var(--primary);
    }
    .issue-btn {
      width: 100%;
      padding: 0.9rem;
      font-size: 1rem;
    }
    .error-box {
      color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
      padding: 0.6rem;
      border-radius: 6px;
      font-size: 0.85rem;
      margin-bottom: 0.8rem;
    }

    /* Boarding Pass Styles */
    .boarding-pass {
      padding: 3rem;
      max-width: 900px;
      margin: 0 auto;
      border: 2px solid var(--primary);
    }
    .pass-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px dashed var(--border);
      padding-bottom: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .airline-brand {
      color: var(--primary);
      font-weight: 700;
      letter-spacing: 1px;
    }
    .pnr-box {
      text-align: right;
    }
    .pnr-lbl {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .pnr-val {
      font-size: 2.4rem;
      color: var(--primary);
      letter-spacing: 2px;
    }
    .paid-badge {
      background: #10b981;
      color: #000;
      padding: 0.2rem 0.6rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .flight-strip {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
    }
    .flight-strip label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .highlight {
      color: var(--primary);
    }
    .amount-val {
      color: var(--primary);
    }
    .manifest-title {
      margin-bottom: 1rem;
    }
    .passengers-manifest {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 2rem;
    }
    .manifest-row {
      display: flex;
      justify-content: space-between;
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border);
      padding: 1rem 1.5rem;
      border-radius: 8px;
    }
    .seat-badge-box {
      text-align: right;
    }
    .seat-badge-box h2 {
      color: var(--primary);
    }
    .pass-actions {
      display: flex;
      justify-content: flex-end;
    }
    .print-btn {
      padding: 0.85rem 2rem;
      font-size: 1rem;
    }
  `]
})
export class CounterBookingComponent implements OnInit {
  flights: any[] = [];
  selectedFlightId = '';
  selectedFlight: any = null;
  tripType = 'One-Way';
  travelClass = 'Economy';
  addLuggage = false;
  paymentMethod = 'CASH';
  submitting = false;
  errorMsg = '';
  confirmedTicket: any = null;

  contact = { phone: '', email: '' };

  passengers: PassengerRow[] = [
    {
      name: '',
      age: 26,
      gender: 'Male',
      category: 'Adult',
      idType: 'Aadhaar',
      idNumber: '',
      seatNumber: '12A',
      mealPreference: 'Vegetarian'
    }
  ];

  constructor(private api: ApiService, public auth: AuthService) {}

  ngOnInit(): void {
    this.api.getFlights().subscribe((f) => {
      this.flights = f;
      if (f.length > 0) {
        this.selectedFlightId = f[0]._id;
        this.selectedFlight = f[0];
      }
    });
  }

  onFlightChange(): void {
    this.selectedFlight = this.flights.find(f => f._id === this.selectedFlightId) || null;
  }

  addPassenger(): void {
    const nextSeat = `${12 + this.passengers.length}B`;
    this.passengers.push({
      name: '',
      age: 25,
      gender: 'Male',
      category: 'Adult',
      idType: 'Aadhaar',
      idNumber: '',
      seatNumber: nextSeat,
      mealPreference: 'Vegetarian'
    });
  }

  removePassenger(idx: number): void {
    this.passengers.splice(idx, 1);
  }

  getBaseTotal(): number {
    const mult = this.travelClass === 'Business' ? 2.2 : this.travelClass === 'First Class' ? 3.5 : 1.0;
    const base = this.selectedFlight ? Math.round(this.selectedFlight.price * mult) : 0;
    return base * this.passengers.length;
  }

  getAddOnCharges(): number {
    return this.addLuggage ? 850 * this.passengers.length : 0;
  }

  getTotalFare(): number {
    return this.getBaseTotal() + this.getAddOnCharges();
  }

  submitBooking(): void {
    if (!this.selectedFlight) {
      this.errorMsg = 'Please select a scheduled flight';
      return;
    }

    for (let i = 0; i < this.passengers.length; i++) {
      const p = this.passengers[i];
      if (!p.name || !p.age || !p.idNumber || !p.seatNumber) {
        this.errorMsg = `Please fill all required details for Passenger #${i + 1}`;
        return;
      }
    }

    if (!this.contact.phone || !this.contact.email) {
      this.errorMsg = 'Mobile number and email are required for contact tracing';
      return;
    }

    this.submitting = true;
    this.errorMsg = '';

    const payload = {
      travelDetails: {
        flightId: this.selectedFlight._id,
        class: this.travelClass
      },
      passengers: this.passengers,
      contact: this.contact,
      billing: {
        baseFare: this.getBaseTotal(),
        addOnCharges: this.getAddOnCharges(),
        totalPaid: this.getTotalFare(),
        paymentMethod: this.paymentMethod
      }
    };

    this.api.bookCounterTicket(payload).subscribe({
      next: (res) => {
        this.submitting = false;
        this.confirmedTicket = res.booking;
      },
      error: (err) => {
        this.submitting = false;
        this.errorMsg = err.error?.message || 'Counter booking failed';
      }
    });
  }

  resetBooking(): void {
    this.confirmedTicket = null;
    this.passengers = [{
      name: '',
      age: 26,
      gender: 'Male',
      category: 'Adult',
      idType: 'Aadhaar',
      idNumber: '',
      seatNumber: '12A',
      mealPreference: 'Vegetarian'
    }];
  }

  printTicket(): void {
    window.print();
  }

  formatDate(d: string): string {
    if (!d) return '';
    return new Date(d).toLocaleDateString() + ' ' + new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
