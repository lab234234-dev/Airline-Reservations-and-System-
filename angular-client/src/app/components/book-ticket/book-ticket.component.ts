import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { CurrencyService } from '../../services/currency.service';

interface Seat {
  id: string;
  row: number;
  col: string;
  status: 'available' | 'selected' | 'booked' | 'held' | 'premium' | 'unavailable';
  price: number;
  class: 'Economy' | 'Business' | 'First Class';
}

@Component({
  selector: 'app-book-ticket',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="book-container">
      <div *ngIf="loadingFlight" class="loading-state">
        <div class="spinner"></div>
        <p>Loading flight and dynamic seat layout...</p>
      </div>

      <div *ngIf="!loadingFlight && flight" class="booking-layout">
        <!-- Step 1: Airplane Seat Chart -->
        <div class="seat-map-column">
          <div class="glass-card seat-card">
            <div class="seat-card-header">
              <div>
                <h2>Select Your <span class="gradient-text">Seat</span></h2>
                <p class="flight-sub">{{ flight.airline }} • Flight {{ flight.flightNumber }}</p>
              </div>
              <span class="flight-tag">{{ flight.origin }} ➔ {{ flight.destination }}</span>
            </div>

            <!-- Seat Legend (6 specified colors) -->
            <div class="legend-box">
              <div class="legend-item"><span class="color-dot dot-selected"></span> Selected (🟩)</div>
              <div class="legend-item"><span class="color-dot dot-available"></span> Available (⬜)</div>
              <div class="legend-item"><span class="color-dot dot-booked"></span> Booked (🟥)</div>
              <div class="legend-item"><span class="color-dot dot-held"></span> Held (🟨)</div>
              <div class="legend-item"><span class="color-dot dot-premium"></span> Premium (🟦)</div>
              <div class="legend-item"><span class="color-dot dot-unavailable"></span> Unavailable (⬛)</div>
            </div>

            <!-- Airplane Fuselage Layout -->
            <div class="airplane-fuselage">
              <div class="cockpit-nose">
                <span>▲ COCKPIT</span>
              </div>

              <div class="wings-zone">
                <div class="seat-grid">
                  <div *ngFor="let row of rows" class="seat-row">
                    <span class="row-num">{{ row }}</span>

                    <!-- Left side seats (A, B, C) -->
                    <div class="seat-group">
                      <button
                        *ngFor="let col of ['A', 'B', 'C']"
                        [ngClass]="getSeatClass(row + col)"
                        (click)="toggleSeat(row + col)"
                        [title]="getSeatTitle(row + col)"
                      >
                        {{ col }}
                      </button>
                    </div>

                    <!-- Aisle -->
                    <div class="aisle-spacer">
                      <span>{{ row }}</span>
                    </div>

                    <!-- Right side seats (D, E, F) -->
                    <div class="seat-group">
                      <button
                        *ngFor="let col of ['D', 'E', 'F']"
                        [ngClass]="getSeatClass(row + col)"
                        (click)="toggleSeat(row + col)"
                        [title]="getSeatTitle(row + col)"
                      >
                        {{ col }}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Passenger Details & Summary -->
        <div class="passenger-column">
          <div class="glass-card summary-card">
            <h3>Booking Summary</h3>
            <div class="summary-details">
              <div class="sum-row">
                <span>Flight:</span>
                <strong>{{ flight.airline }} ({{ flight.flightNumber }})</strong>
              </div>
              <div class="sum-row">
                <span>Route:</span>
                <strong>{{ flight.origin }} ➔ {{ flight.destination }}</strong>
              </div>
              <div class="sum-row">
                <span>Selected Seats:</span>
                <strong style="color: var(--primary, #38bdf8);">
                  {{ selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None' }}
                </strong>
              </div>
              <div class="sum-row">
                <span>Base Fare per Seat:</span>
                <span>{{ currencyService.format(flight.price) }}</span>
              </div>
              <div class="sum-row total-row">
                <span>Total Amount:</span>
                <h2>{{ currencyService.format(calculateTotal()) }}</h2>
              </div>
            </div>

            <!-- Passenger Inputs -->
            <div *ngIf="selectedSeats.length > 0" class="passengers-form">
              <h4>Passenger Information</h4>
              <div *ngFor="let seat of selectedSeats; let i = index" class="p-input-card">
                <span class="seat-badge">Seat {{ seat }}</span>
                <div class="input-fields">
                  <input
                    type="text"
                    placeholder="Full Name"
                    [(ngModel)]="passengers[i].name"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    min="1"
                    max="100"
                    [(ngModel)]="passengers[i].age"
                    required
                  />
                  <select [(ngModel)]="passengers[i].gender">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div *ngIf="errorMessage" class="error-banner">
                {{ errorMessage }}
              </div>

              <button
                (click)="openPaymentModal()"
                [disabled]="isBooking || selectedSeats.length === 0"
                class="btn-primary confirm-btn"
              >
                Proceed to Secure Payment ➔
              </button>
            </div>

            <div *ngIf="selectedSeats.length === 0" class="select-prompt">
              <p>👉 Click any available seat on the airplane map to continue.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- ================= INTERACTIVE PAYMENT GATEWAY MODAL ================= -->
      <div *ngIf="showPaymentModal" class="payment-modal-backdrop animate-fade-in" (click)="closePaymentModal()">
        <div class="payment-modal-box glass-card" (click)="$event.stopPropagation()">
          
          <!-- Normal Checkout View -->
          <div *ngIf="!isProcessingPayment && !confirmedBooking">
            <div class="modal-header">
              <div class="modal-title">
                <span class="lock-icon">🔒</span>
                <div>
                  <h3>Secure Payment Gateway</h3>
                  <p class="sec-text">256-Bit SSL Encrypted • RBI & PCI-DSS Certified</p>
                </div>
              </div>
              <button (click)="closePaymentModal()" class="close-x-btn">✕</button>
            </div>

            <!-- Modal Content Grid -->
            <div class="payment-modal-grid">
              <!-- Left: Payment Methods -->
              <div class="payment-methods-column">
                <div class="payment-tabs">
                  <button 
                    [class.active-ptab]="selectedPaymentMethod === 'card'" 
                    (click)="selectedPaymentMethod = 'card'"
                    class="ptab-btn">
                    💳 Credit / Debit Card
                  </button>
                  <button 
                    [class.active-ptab]="selectedPaymentMethod === 'upi'" 
                    (click)="selectedPaymentMethod = 'upi'"
                    class="ptab-btn">
                    📱 UPI / QR Code
                  </button>
                  <button 
                    [class.active-ptab]="selectedPaymentMethod === 'netbanking'" 
                    (click)="selectedPaymentMethod = 'netbanking'"
                    class="ptab-btn">
                    🏦 Net Banking
                  </button>
                  <button 
                    [class.active-ptab]="selectedPaymentMethod === 'skymiles'" 
                    (click)="selectedPaymentMethod = 'skymiles'"
                    class="ptab-btn">
                    🌟 SkyMiles Loyalty
                  </button>
                </div>

                <!-- CARD FORM -->
                <div *ngIf="selectedPaymentMethod === 'card'" class="method-body animate-fade-in">
                  <!-- Visual Credit Card Preview -->
                  <div class="card-visual">
                    <div class="cv-top">
                      <span class="chip-icon">🔲 CHIP</span>
                      <span class="card-brand">{{ getCardBrand() }}</span>
                    </div>
                    <div class="cv-num">{{ cardNumber ? formatCardNum(cardNumber) : '•••• •••• •••• 8821' }}</div>
                    <div class="cv-bottom">
                      <div>
                        <span class="cv-lbl">CARD HOLDER</span>
                        <div class="cv-val">{{ cardHolderName || (passengers[0].name || 'PASSENGER NAME') }}</div>
                      </div>
                      <div>
                        <span class="cv-lbl">EXPIRES</span>
                        <div class="cv-val">{{ cardExpiry || '12/28' }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="quick-autofill-row">
                    <button type="button" (click)="autofillTestCard()" class="autofill-btn">
                      ⚡ Autofill Test Card (1-Click)
                    </button>
                  </div>

                  <div class="form-inputs-group">
                    <div class="input-field">
                      <label>CARD NUMBER</label>
                      <input 
                        type="text" 
                        [(ngModel)]="cardNumber" 
                        maxlength="19" 
                        placeholder="4532 8920 1823 8821" 
                      />
                    </div>
                    <div class="input-field">
                      <label>CARDHOLDER NAME</label>
                      <input 
                        type="text" 
                        [(ngModel)]="cardHolderName" 
                        placeholder="Name on card" 
                      />
                    </div>
                    <div class="input-row-2">
                      <div class="input-field">
                        <label>EXPIRY (MM/YY)</label>
                        <input 
                          type="text" 
                          [(ngModel)]="cardExpiry" 
                          maxlength="5" 
                          placeholder="08/29" 
                        />
                      </div>
                      <div class="input-field">
                        <label>CVV / CVC</label>
                        <input 
                          type="password" 
                          [(ngModel)]="cardCvv" 
                          maxlength="4" 
                          placeholder="•••" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- UPI & QR CODE -->
                <div *ngIf="selectedPaymentMethod === 'upi'" class="method-body animate-fade-in">
                  <div class="upi-box">
                    <div class="qr-placeholder">
                      <div class="qr-mock">
                        <span class="qr-plane-ico">✈️</span>
                        <p class="qr-label">SkyHigh Airlines Instant UPI QR</p>
                      </div>
                      <span class="qr-scan-sub">Scan with Google Pay, PhonePe, Paytm or BHIM UPI</span>
                    </div>

                    <div class="upi-sep"><span>OR ENTER VPA / UPI ID</span></div>

                    <div class="input-field">
                      <label>VIRTUAL PAYMENT ADDRESS (UPI ID)</label>
                      <div class="upi-input-wrap">
                        <input 
                          type="text" 
                          [(ngModel)]="upiId" 
                          placeholder="e.g. yourname@okhdfcbank" 
                        />
                        <button (click)="upiId = 'traveler@okhdfcbank'" class="upi-quick-btn">Use Demo UPI</button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- NET BANKING -->
                <div *ngIf="selectedPaymentMethod === 'netbanking'" class="method-body animate-fade-in">
                  <label class="section-lbl">Select Your Bank:</label>
                  <div class="banks-grid">
                    <button 
                      *ngFor="let b of banks" 
                      [class.bank-active]="selectedBank === b.id"
                      (click)="selectedBank = b.id"
                      class="bank-btn">
                      <span class="bank-ico">{{ b.icon }}</span>
                      <span class="bank-name">{{ b.name }}</span>
                    </button>
                  </div>
                </div>

                <!-- SKYMILES LOYALTY -->
                <div *ngIf="selectedPaymentMethod === 'skymiles'" class="method-body animate-fade-in">
                  <div class="miles-card">
                    <div class="miles-top">
                      <span class="star-ico">🌟</span>
                      <div>
                        <h4>Your SkyMiles Balance</h4>
                        <div class="miles-balance">{{ userRewardPoints }} SkyMiles</div>
                      </div>
                    </div>
                    <p class="miles-desc">
                      Redeem loyalty SkyMiles earned from your previous flights for instant 1:1 fare reduction.
                    </p>
                    <label class="miles-check">
                      <input type="checkbox" [(ngModel)]="redeemMiles" />
                      <span>Redeem {{ userRewardPoints }} SkyMiles for instant discount of {{ currencyService.format(userRewardPoints) }}</span>
                    </label>
                  </div>
                </div>
              </div>

              <!-- Right: Order & Fare Breakdown -->
              <div class="payment-summary-column">
                <div class="order-summary-box">
                  <h4>Fare Breakdown</h4>
                  
                  <div class="order-line">
                    <span>Flight Fare ({{ selectedSeats.length }} seat{{ selectedSeats.length > 1 ? 's' : '' }}):</span>
                    <span>{{ currencyService.format(calculateTotal()) }}</span>
                  </div>
                  
                  <div class="order-line">
                    <span>Aviation Taxes & Fees (5% GST):</span>
                    <span>{{ currencyService.format(calculateTaxes()) }}</span>
                  </div>

                  <div class="order-line discount-line" *ngIf="redeemMiles && userRewardPoints > 0">
                    <span>🌟 SkyMiles Discount:</span>
                    <span>-{{ currencyService.format(getMilesDiscount()) }}</span>
                  </div>

                  <div class="order-divider"></div>

                  <div class="order-total-row">
                    <span>Net Amount:</span>
                    <span class="total-big">{{ currencyService.format(getFinalPayableAmount()) }}</span>
                  </div>

                  <div class="rewards-earned-banner">
                    <span>🌟 You will earn +{{ Math.floor(getFinalPayableAmount() * 0.1) }} SkyMiles on this trip!</span>
                  </div>

                  <button 
                    (click)="processPayment()" 
                    [disabled]="isBooking" 
                    class="btn-primary pay-now-btn">
                    🔒 Pay {{ currencyService.format(getFinalPayableAmount()) }} & Confirm Flight
                  </button>

                  <div class="trust-strip">
                    <span>🛡️ Bank Verified</span>
                    <span>•</span>
                    <span>⚡ Instant PNR</span>
                    <span>•</span>
                    <span>🎫 Check-in Ready</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Processing Animation View -->
          <div *ngIf="isProcessingPayment" class="processing-view animate-fade-in">
            <div class="processing-spinner"></div>
            <h3>Connecting to Secure Bank Gateway...</h3>
            <p class="process-sub">Please do not refresh or close this window.</p>
            <div class="steps-progress">
              <div class="step-line" [class.step-done]="processingStep >= 1">1. Verifying Payment Details...</div>
              <div class="step-line" [class.step-done]="processingStep >= 2">2. Authorizing Transaction with Bank...</div>
              <div class="step-line" [class.step-done]="processingStep >= 3">3. Generating PNR & E-Ticket...</div>
            </div>
          </div>

          <!-- Payment Success & Flight Lifecycle Notice View -->
          <div *ngIf="confirmedBooking" class="success-payment-view animate-fade-in">
            <div class="check-circle-icon">✓</div>
            <h2>Payment Successful!</h2>
            <p class="success-tagline">Your reservation has been confirmed and paid in full.</p>

            <div class="booking-receipt-card">
              <div class="receipt-row">
                <span class="rc-label">BOOKING PNR:</span>
                <span class="rc-val pnr-highlight">{{ confirmedBooking.pnr }}</span>
              </div>
              <div class="receipt-row">
                <span class="rc-label">TRANSACTION REF:</span>
                <span class="rc-val">{{ confirmedBooking.transactionId }}</span>
              </div>
              <div class="receipt-row">
                <span class="rc-label">FLIGHT:</span>
                <span class="rc-val">{{ confirmedBooking.airline }} ({{ confirmedBooking.flightNumber }})</span>
              </div>
              <div class="receipt-row">
                <span class="rc-label">ROUTE:</span>
                <span class="rc-val">{{ confirmedBooking.origin }} ➔ {{ confirmedBooking.destination }}</span>
              </div>
              <div class="receipt-row">
                <span class="rc-label">CONFIRMED SEATS:</span>
                <span class="rc-val">{{ confirmedBooking.seatNumber }}</span>
              </div>
              <div class="receipt-row">
                <span class="rc-label">PAYMENT METHOD:</span>
                <span class="rc-val">{{ confirmedBooking.paymentMethod }}</span>
              </div>
              <div class="receipt-row">
                <span class="rc-label">TOTAL PAID:</span>
                <span class="rc-val">{{ currencyService.format(confirmedBooking.totalAmount) }}</span>
              </div>
            </div>

            <!-- MANDATORY BOARDING LIFECYCLE BANNER -->
            <div class="boarding-notice-box">
              <div class="notice-head">
                <span class="warn-ico">⚠️</span>
                <strong>WEB CHECK-IN REQUIRED PRIOR TO FLIGHT DEPARTURE</strong>
              </div>
              <p class="notice-body">
                Your flight ticket is booked, but <strong>the aircraft will not board or fly until you confirm Web Check-In & issue your Boarding Pass</strong>! Please complete your check-in now to select baggage and activate your boarding pass.
              </p>
            </div>

            <!-- Action Buttons -->
            <div class="success-actions-row">
              <button (click)="goToWebCheckIn()" class="btn-primary checkin-cta-btn">
                🎫 Confirm Web Check-In & Issue Boarding Pass (YES) ➔
              </button>
              <button (click)="goToDashboard()" class="btn-secondary">
                📋 Go to My Trips & Dashboard
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    .book-container {
      max-width: 1250px;
      margin: 0 auto;
      padding: 2.5rem 1.5rem;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }
    .loading-state {
      text-align: center;
      padding: 5rem;
      color: #94a3b8;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 4px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .booking-layout {
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 2rem;
    }
    .seat-card {
      padding: 2rem;
      border-radius: 16px;
    }
    .seat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .flight-sub {
      color: #94a3b8;
      font-size: 0.9rem;
      margin: 4px 0 0;
    }
    .flight-tag {
      background: rgba(56, 189, 248, 0.15);
      color: #38bdf8;
      padding: 0.4rem 0.9rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.85rem;
      border: 1px solid rgba(56, 189, 248, 0.3);
    }
    .gradient-text {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .legend-box {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 10px;
      margin-bottom: 2rem;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: #cbd5e1;
    }
    .color-dot {
      width: 14px;
      height: 14px;
      border-radius: 4px;
    }
    .dot-selected { background: #22c55e; box-shadow: 0 0 6px #22c55e; }
    .dot-available { background: #ffffff; border: 1px solid #94a3b8; }
    .dot-booked { background: #ef4444; }
    .dot-held { background: #eab308; }
    .dot-premium { background: #3b82f6; }
    .dot-unavailable { background: #1e293b; border: 1px solid #475569; }

    .airplane-fuselage {
      background: rgba(15, 23, 42, 0.6);
      border: 2px solid rgba(56, 189, 248, 0.2);
      border-radius: 80px 80px 30px 30px;
      padding: 2.5rem 1.5rem 2rem;
      max-width: 520px;
      margin: 0 auto;
      box-shadow: inset 0 0 30px rgba(0, 0, 0, 0.5);
    }
    .cockpit-nose {
      text-align: center;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 2px;
      margin-bottom: 2rem;
    }
    .seat-grid {
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .seat-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    .row-num {
      width: 20px;
      font-size: 0.75rem;
      color: #64748b;
      text-align: right;
    }
    .seat-group {
      display: flex;
      gap: 0.45rem;
    }
    .aisle-spacer {
      width: 32px;
      text-align: center;
      font-size: 0.7rem;
      color: #475569;
      font-weight: 700;
    }

    .seat-btn {
      width: 34px;
      height: 34px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .seat-available {
      background: #ffffff;
      color: #0f172a;
      border: 1px solid #cbd5e1;
    }
    .seat-available:hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(56, 189, 248, 0.6);
      border-color: #38bdf8;
    }
    .seat-selected {
      background: #22c55e !important;
      color: #ffffff !important;
      border: 1px solid #16a34a !important;
      box-shadow: 0 0 12px rgba(34, 197, 94, 0.6);
      transform: scale(1.08);
    }
    .seat-booked {
      background: #ef4444;
      color: #ffffff;
      border: 1px solid #dc2626;
      cursor: not-allowed;
      opacity: 0.8;
    }
    .seat-held {
      background: #eab308;
      color: #0f172a;
      border: 1px solid #ca8a04;
      cursor: not-allowed;
      opacity: 0.85;
    }
    .seat-premium {
      background: #3b82f6;
      color: #ffffff;
      border: 1px solid #2563eb;
    }
    .seat-premium:hover {
      transform: scale(1.1);
      box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
    }
    .seat-unavailable {
      background: #1e293b;
      color: #475569;
      border: 1px solid #334155;
      cursor: not-allowed;
    }

    /* Summary Card */
    .summary-card {
      padding: 1.75rem;
      border-radius: 16px;
    }
    .summary-card h3 {
      font-size: 1.25rem;
      margin: 0 0 1.25rem;
      color: #f8fafc;
    }
    .summary-details {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      padding-bottom: 1.25rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 1.25rem;
    }
    .sum-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.9rem;
      color: #94a3b8;
    }
    .sum-row strong {
      color: #f1f5f9;
    }
    .total-row {
      margin-top: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px dashed rgba(255, 255, 255, 0.1);
      color: #f8fafc;
    }
    .total-row h2 {
      margin: 0;
      color: #38bdf8;
      font-size: 1.6rem;
    }

    .passengers-form h4 {
      font-size: 1rem;
      color: #e2e8f0;
      margin: 0 0 1rem;
    }
    .p-input-card {
      background: rgba(30, 41, 59, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 0.85rem;
    }
    .seat-badge {
      display: inline-block;
      background: #0284c7;
      color: #ffffff;
      padding: 0.2rem 0.6rem;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-bottom: 0.75rem;
    }
    .input-fields {
      display: grid;
      grid-template-columns: 2fr 1fr 1.2fr;
      gap: 0.6rem;
    }
    .input-fields input, .input-fields select {
      padding: 0.6rem 0.8rem;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f8fafc;
      font-size: 0.85rem;
      outline: none;
    }
    .input-fields input:focus, .input-fields select:focus {
      border-color: #38bdf8;
    }

    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
      padding: 0.75rem 1rem;
      border-radius: 8px;
      margin: 1rem 0;
      font-size: 0.85rem;
    }

    .confirm-btn {
      width: 100%;
      padding: 0.85rem;
      font-size: 1rem;
      font-weight: 700;
      border-radius: 10px;
      cursor: pointer;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      transition: all 0.2s;
    }
    .confirm-btn:hover {
      box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);
    }

    .select-prompt {
      text-align: center;
      padding: 1.5rem;
      color: #94a3b8;
      font-size: 0.95rem;
    }

    /* ================= PAYMENT MODAL STYLES ================= */
    .payment-modal-backdrop {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    }
    .payment-modal-box {
      width: 100%;
      max-width: 900px;
      max-height: 90vh;
      overflow-y: auto;
      background: #0f172a;
      border: 1px solid rgba(56, 189, 248, 0.3);
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8);
      color: #f8fafc;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .modal-title {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .lock-icon {
      font-size: 1.8rem;
      background: rgba(34, 197, 94, 0.15);
      padding: 6px 10px;
      border-radius: 10px;
      color: #22c55e;
    }
    .modal-title h3 {
      font-size: 1.35rem;
      margin: 0;
      color: #f8fafc;
    }
    .sec-text {
      font-size: 0.75rem;
      color: #94a3b8;
      margin: 2px 0 0;
    }
    .close-x-btn {
      background: rgba(255, 255, 255, 0.08);
      border: none;
      color: #cbd5e1;
      font-size: 1.2rem;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .close-x-btn:hover {
      background: #ef4444;
      color: #ffffff;
    }

    .payment-modal-grid {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.75rem;
    }

    /* Tabs */
    .payment-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 1rem;
    }
    .ptab-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ptab-btn:hover {
      background: rgba(51, 65, 85, 0.8);
      color: #fff;
    }
    .active-ptab {
      background: #0284c7 !important;
      color: #ffffff !important;
      border-color: #38bdf8 !important;
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.35);
    }

    /* Credit Card Visual */
    .card-visual {
      background: linear-gradient(135deg, #1e3a8a, #0369a1);
      border-radius: 14px;
      padding: 1.25rem 1.5rem;
      color: #ffffff;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
      margin-bottom: 1rem;
    }
    .cv-top {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      margin-bottom: 1.5rem;
      font-weight: 700;
    }
    .cv-num {
      font-size: 1.25rem;
      letter-spacing: 2px;
      font-family: monospace;
      margin-bottom: 1.5rem;
    }
    .cv-bottom {
      display: flex;
      justify-content: space-between;
    }
    .cv-lbl {
      font-size: 0.65rem;
      color: #93c5fd;
      display: block;
    }
    .cv-val {
      font-size: 0.85rem;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .quick-autofill-row {
      margin-bottom: 1rem;
    }
    .autofill-btn {
      background: rgba(16, 185, 129, 0.15);
      border: 1px solid rgba(16, 185, 129, 0.4);
      color: #34d399;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }
    .autofill-btn:hover {
      background: #10b981;
      color: #fff;
    }

    .form-inputs-group {
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .input-field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .input-field label {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 700;
    }
    .input-field input {
      padding: 0.65rem 0.85rem;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #f8fafc;
      font-size: 0.9rem;
      outline: none;
    }
    .input-field input:focus {
      border-color: #38bdf8;
    }
    .input-row-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.85rem;
    }

    /* UPI Box */
    .upi-box {
      text-align: center;
      padding: 1rem 0;
    }
    .qr-mock {
      width: 160px;
      height: 160px;
      background: #ffffff;
      border-radius: 12px;
      margin: 0 auto 0.75rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #0f172a;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    .qr-plane-ico {
      font-size: 2.5rem;
    }
    .qr-label {
      font-size: 0.65rem;
      font-weight: 700;
      margin: 6px 0 0;
      color: #0369a1;
      text-align: center;
      padding: 0 10px;
    }
    .qr-scan-sub {
      font-size: 0.8rem;
      color: #94a3b8;
      display: block;
      margin-bottom: 1.25rem;
    }
    .upi-sep {
      display: flex;
      align-items: center;
      text-align: center;
      margin: 1rem 0;
      color: #64748b;
      font-size: 0.75rem;
      font-weight: 700;
    }
    .upi-sep::before, .upi-sep::after {
      content: '';
      flex: 1;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    .upi-sep span {
      padding: 0 10px;
    }
    .upi-input-wrap {
      display: flex;
      gap: 8px;
    }
    .upi-input-wrap input {
      flex: 1;
    }
    .upi-quick-btn {
      background: rgba(56, 189, 248, 0.15);
      border: 1px solid #38bdf8;
      color: #38bdf8;
      padding: 0 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      cursor: pointer;
    }

    /* Netbanking Grid */
    .section-lbl {
      display: block;
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 0.75rem;
      font-weight: 700;
    }
    .banks-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .bank-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: #e2e8f0;
      padding: 10px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 600;
      transition: all 0.2s;
    }
    .bank-btn:hover {
      background: rgba(51, 65, 85, 0.8);
      border-color: #38bdf8;
    }
    .bank-active {
      background: #0284c7 !important;
      color: #ffffff !important;
      border-color: #38bdf8 !important;
    }

    /* SkyMiles card */
    .miles-card {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .miles-top {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 0.75rem;
    }
    .star-ico {
      font-size: 2rem;
    }
    .miles-top h4 {
      margin: 0;
      font-size: 0.95rem;
      color: #fbbf24;
    }
    .miles-balance {
      font-size: 1.4rem;
      font-weight: 800;
      color: #f8fafc;
    }
    .miles-desc {
      font-size: 0.8rem;
      color: #cbd5e1;
      margin: 0 0 1rem;
    }
    .miles-check {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
      color: #f8fafc;
      font-weight: 600;
      cursor: pointer;
    }
    .miles-check input {
      width: 18px;
      height: 18px;
      accent-color: #f59e0b;
    }

    /* Order Summary Box */
    .order-summary-box {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .order-summary-box h4 {
      margin: 0;
      font-size: 1.1rem;
      color: #f8fafc;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      padding-bottom: 0.75rem;
    }
    .order-line {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .discount-line {
      color: #34d399;
      font-weight: 700;
    }
    .order-divider {
      border-bottom: 1px dashed rgba(255, 255, 255, 0.12);
    }
    .order-total-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      color: #f8fafc;
      font-weight: 700;
    }
    .total-big {
      font-size: 1.5rem;
      color: #38bdf8;
      font-weight: 800;
    }
    .rewards-earned-banner {
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #fbbf24;
      padding: 8px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 700;
      text-align: center;
    }
    .pay-now-btn {
      width: 100%;
      padding: 0.9rem;
      font-size: 1rem;
      font-weight: 800;
      border-radius: 10px;
      cursor: pointer;
      background: linear-gradient(135deg, #10b981, #059669);
      color: #ffffff;
      border: none;
      transition: all 0.2s;
    }
    .pay-now-btn:hover {
      box-shadow: 0 4px 16px rgba(16, 185, 129, 0.4);
      transform: translateY(-1px);
    }
    .trust-strip {
      display: flex;
      justify-content: center;
      gap: 8px;
      font-size: 0.7rem;
      color: #64748b;
      font-weight: 600;
    }

    /* Processing View */
    .processing-view {
      text-align: center;
      padding: 4rem 1rem;
    }
    .processing-spinner {
      width: 60px;
      height: 60px;
      border: 5px solid rgba(56, 189, 248, 0.2);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 1.5rem;
    }
    .process-sub {
      color: #94a3b8;
      font-size: 0.9rem;
      margin-bottom: 2rem;
    }
    .steps-progress {
      display: flex;
      flex-direction: column;
      gap: 10px;
      max-width: 320px;
      margin: 0 auto;
      text-align: left;
    }
    .step-line {
      font-size: 0.85rem;
      color: #475569;
      font-weight: 600;
    }
    .step-done {
      color: #34d399;
      font-weight: 700;
    }

    /* Success Payment View */
    .success-payment-view {
      text-align: center;
      padding: 1.5rem 0.5rem;
    }
    .check-circle-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: #10b981;
      color: #ffffff;
      font-size: 2.2rem;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
      box-shadow: 0 0 24px rgba(16, 185, 129, 0.5);
    }
    .success-tagline {
      color: #94a3b8;
      font-size: 0.95rem;
      margin-bottom: 1.5rem;
    }

    .booking-receipt-card {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.25rem;
      max-width: 520px;
      margin: 0 auto 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 8px;
      text-align: left;
    }
    .receipt-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.85rem;
    }
    .rc-label {
      color: #94a3b8;
    }
    .rc-val {
      font-weight: 700;
      color: #f1f5f9;
    }
    .pnr-highlight {
      color: #38bdf8;
      font-size: 1.1rem;
      font-family: monospace;
    }

    .boarding-notice-box {
      background: rgba(234, 179, 8, 0.15);
      border: 1px solid #eab308;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      max-width: 650px;
      margin: 0 auto 1.75rem;
      text-align: left;
    }
    .notice-head {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #fbbf24;
      font-size: 0.9rem;
      margin-bottom: 6px;
    }
    .notice-body {
      color: #fef08a;
      font-size: 0.85rem;
      margin: 0;
      line-height: 1.4;
    }

    .success-actions-row {
      display: flex;
      justify-content: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .checkin-cta-btn {
      padding: 0.9rem 1.5rem;
      font-size: 0.95rem;
      font-weight: 800;
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      box-shadow: 0 4px 16px rgba(2, 132, 199, 0.4);
    }
    .checkin-cta-btn:hover {
      transform: translateY(-2px);
    }
    .btn-secondary {
      background: rgba(51, 65, 85, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      padding: 0.9rem 1.5rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
    }

    @media (max-width: 860px) {
      .booking-layout {
        grid-template-columns: 1fr;
      }
      .payment-modal-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BookTicketComponent implements OnInit {
  flight: any = null;
  loadingFlight = true;
  rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  seats: { [key: string]: Seat } = {};
  selectedSeats: string[] = [];
  passengers: Array<{ name: string; age: number | ''; gender: string }> = [];
  isBooking = false;
  errorMessage = '';

  // Payment Modal State
  showPaymentModal = false;
  selectedPaymentMethod: 'card' | 'upi' | 'netbanking' | 'skymiles' = 'card';
  isProcessingPayment = false;
  processingStep = 1;
  confirmedBooking: any = null;

  // Card details
  cardNumber = '';
  cardHolderName = '';
  cardExpiry = '';
  cardCvv = '';

  // UPI details
  upiId = '';

  // Net banking details
  selectedBank = 'hdfc';
  readonly banks = [
    { id: 'hdfc', name: 'HDFC Bank', icon: '🏦' },
    { id: 'sbi', name: 'State Bank of India', icon: '🏛️' },
    { id: 'icici', name: 'ICICI Bank', icon: '🏦' },
    { id: 'axis', name: 'Axis Bank', icon: '🏛️' },
    { id: 'kotak', name: 'Kotak Mahindra', icon: '🏦' },
    { id: 'pnb', name: 'Punjab National Bank', icon: '🏛️' }
  ];

  // Loyalty Miles
  userRewardPoints = 250;
  redeemMiles = false;

  readonly Math = Math;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    public auth: AuthService,
    public currencyService: CurrencyService
  ) {}

  ngOnInit(): void {
    const flightId = this.route.snapshot.paramMap.get('id');
    if (flightId) {
      this.loadFlight(flightId);
    }
    if (this.auth.currentUser) {
      this.userRewardPoints = this.auth.currentUser.rewardPoints || 250;
      this.cardHolderName = this.auth.currentUser.name || '';
    }
  }

  loadFlight(id: string): void {
    this.loadingFlight = true;
    this.api.getFlightById(id).subscribe({
      next: (f) => {
        this.flight = f;
        this.generateSeatLayout(f);
        this.loadingFlight = false;
      },
      error: () => {
        this.loadingFlight = false;
      }
    });
  }

  generateSeatLayout(flight: any): void {
    const flightKey = (flight._id || flight.flightNumber || 'FLIGHT').toString();
    const seed = flightKey.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
    const bookedSet = new Set(flight.bookedSeats || []);

    this.rows.forEach(r => {
      ['A', 'B', 'C', 'D', 'E', 'F'].forEach((c, idx) => {
        const id = `${r}${c}`;
        let status: 'available' | 'selected' | 'booked' | 'held' | 'premium' | 'unavailable' = 'available';

        if (bookedSet.has(id)) {
          status = 'booked';
        } else if (r <= 2) {
          const randPremium = (seed * 5 + r * 11 + idx * 7) % 100;
          status = randPremium < 45 ? 'booked' : (randPremium < 65 ? 'held' : 'premium');
        } else {
          const pseudoRand = (seed * 13 + r * 19 + idx * 11) % 100;
          if (pseudoRand < 36) {
            status = 'booked';
          } else if (pseudoRand < 50) {
            status = 'held';
          } else if (r === 10 && (c === 'A' || c === 'F')) {
            status = 'unavailable';
          } else {
            status = 'available';
          }
        }

        this.seats[id] = {
          id,
          row: r,
          col: c,
          status,
          price: r <= 2 ? Math.round(flight.price * 1.5) : flight.price,
          class: r <= 2 ? 'Business' : 'Economy'
        };
      });
    });
  }

  getSeatClass(id: string): string {
    const s = this.seats[id];
    if (!s) return 'seat-btn seat-available';
    return `seat-btn seat-${s.status}`;
  }

  getSeatTitle(id: string): string {
    const s = this.seats[id];
    if (!s) return id;
    return `Seat ${id} (${s.class}) - ₹${s.price} [${s.status}]`;
  }

  toggleSeat(id: string): void {
    const s = this.seats[id];
    if (!s || s.status === 'booked' || s.status === 'held' || s.status === 'unavailable') {
      return;
    }

    if (s.status === 'selected') {
      s.status = s.row <= 2 ? 'premium' : 'available';
      this.selectedSeats = this.selectedSeats.filter(item => item !== id);
      this.passengers.pop();
    } else {
      s.status = 'selected';
      this.selectedSeats.push(id);
      this.passengers.push({
        name: this.auth.currentUser?.name || '',
        age: 28,
        gender: 'Male'
      });
    }
  }

  calculateTotal(): number {
    return this.selectedSeats.reduce((acc, id) => {
      const s = this.seats[id];
      return acc + (s ? s.price : (this.flight?.price || 0));
    }, 0);
  }

  calculateTaxes(): number {
    return Math.round(this.calculateTotal() * 0.05);
  }

  getMilesDiscount(): number {
    if (!this.redeemMiles) return 0;
    return Math.min(this.userRewardPoints, this.calculateTotal());
  }

  getFinalPayableAmount(): number {
    const base = this.calculateTotal();
    const taxes = this.calculateTaxes();
    const discount = this.getMilesDiscount();
    return Math.max(0, base + taxes - discount);
  }

  openPaymentModal(): void {
    if (!this.auth.currentUser) {
      this.router.navigate(['/login']);
      return;
    }

    for (let i = 0; i < this.passengers.length; i++) {
      if (!this.passengers[i].name || !this.passengers[i].age) {
        this.errorMessage = `Please enter name and age for Passenger ${i + 1}`;
        return;
      }
    }

    this.errorMessage = '';
    this.confirmedBooking = null;
    this.isProcessingPayment = false;
    this.showPaymentModal = true;
  }

  closePaymentModal(): void {
    if (!this.isProcessingPayment) {
      this.showPaymentModal = false;
    }
  }

  autofillTestCard(): void {
    this.cardNumber = '4532 8920 1823 8821';
    this.cardHolderName = this.passengers[0]?.name || this.auth.currentUser?.name || 'John Doe';
    this.cardExpiry = '08/29';
    this.cardCvv = '731';
  }

  getCardBrand(): string {
    if (this.cardNumber.startsWith('4')) return 'VISA';
    if (this.cardNumber.startsWith('5')) return 'MASTERCARD';
    if (this.cardNumber.startsWith('6')) return 'RUPAY';
    return 'VISA';
  }

  formatCardNum(num: string): string {
    return num.replace(/\s+/g, '').replace(/(\d{4})/g, '$1 ').trim();
  }

  processPayment(): void {
    this.isProcessingPayment = true;
    this.processingStep = 1;

    setTimeout(() => {
      this.processingStep = 2;
    }, 700);

    setTimeout(() => {
      this.processingStep = 3;
    }, 1400);

    setTimeout(() => {
      this.finalizeBooking();
    }, 2000);
  }

  finalizeBooking(): void {
    let method = 'Credit/Debit Card';
    if (this.selectedPaymentMethod === 'upi') method = 'UPI / QR Code (' + (this.upiId || 'Direct UPI') + ')';
    if (this.selectedPaymentMethod === 'netbanking') method = 'Net Banking (' + this.selectedBank.toUpperCase() + ')';
    if (this.selectedPaymentMethod === 'skymiles') method = 'SkyMiles Loyalty Points';

    const transactionId = 'TXN-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const payload = {
      flightId: this.flight._id,
      passengers: this.passengers.map((p, idx) => ({
        name: p.name,
        age: Number(p.age),
        gender: p.gender,
        seatNumber: this.selectedSeats[idx]
      })),
      totalAmount: this.getFinalPayableAmount(),
      paymentStatus: 'paid',
      paymentMethod: method,
      transactionId: transactionId
    };

    this.api.bookTicket(payload).subscribe({
      next: (res) => {
        this.isProcessingPayment = false;
        this.confirmedBooking = res.booking || {
          pnr: 'SH-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          transactionId: transactionId,
          airline: this.flight.airline,
          flightNumber: this.flight.flightNumber,
          origin: this.flight.origin,
          destination: this.flight.destination,
          seatNumber: this.selectedSeats.join(', '),
          totalAmount: this.getFinalPayableAmount(),
          paymentMethod: method
        };

        // Update local user reward points
        if (this.auth.currentUser) {
          const earned = Math.floor(this.getFinalPayableAmount() * 0.1);
          const deduction = this.redeemMiles ? this.getMilesDiscount() : 0;
          this.auth.currentUser.rewardPoints = Math.max(0, (this.auth.currentUser.rewardPoints || 250) - deduction + earned);
        }
      },
      error: (err) => {
        this.isProcessingPayment = false;
        this.showPaymentModal = false;
        this.errorMessage = err.error?.message || 'Payment processing failed. Please try again.';
      }
    });
  }

  goToWebCheckIn(): void {
    this.showPaymentModal = false;
    this.router.navigate(['/checkin'], { 
      queryParams: { pnr: this.confirmedBooking?.pnr } 
    });
  }

  goToDashboard(): void {
    this.showPaymentModal = false;
    this.router.navigate(['/dashboard']);
  }
}
