import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as QRCode from 'qrcode';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-boarding-pass',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="pass-modal-backdrop animate-fade-in" (click)="onClose()">
      <div class="pass-modal-content" (click)="$event.stopPropagation()">
        <!-- Header Actions -->
        <div class="pass-actions no-print">
          <div class="status-summary-tag" [class.tag-flying]="isBoarded()">
            <span class="live-dot-blink" *ngIf="isBoarded()">●</span>
            <span>{{ isBoarded() ? 'AIRCRAFT IN FLIGHT ✈️ (FLYING)' : 'CHECK-IN REQUIRED (AIRCRAFT ON GROUND)' }}</span>
          </div>

          <div class="right-btns">
            <button *ngIf="!isBoarded()" (click)="confirmBoardingNow()" class="btn-confirm-yes">
              ✅ Confirm Boarding (YES)
            </button>
            <button (click)="printPass()" class="btn-primary print-btn">
              🖨️ Print / Download PDF
            </button>
            <button (click)="onClose()" class="btn-close">✕</button>
          </div>
        </div>

        <!-- Live Flying Status Banner -->
        <div class="live-flying-banner" *ngIf="isBoarded()">
          <div class="radar-tag">
            <span class="radar-ico">📡</span>
            <strong>LIVE FLIGHT RADAR: ACTIVE IN THE AIR</strong>
          </div>
          <div class="flight-metrics">
            <span>Alt: <strong>34,500 FT</strong></span>
            <span>•</span>
            <span>Speed: <strong>840 KM/H</strong></span>
            <span>•</span>
            <span>Status: <strong class="flying-green">IN FLIGHT ✈️</strong></span>
          </div>
        </div>

        <!-- The Realistic Boarding Pass Container -->
        <div id="printable-boarding-pass" class="boarding-pass-card">
          <!-- Left / Main Portion -->
          <div class="pass-main">
            <div class="carrier-header">
              <div class="brand">
                <span class="plane-ico">✈️</span>
                <span class="brand-name">SkyHigh Air</span>
                <span class="carrier-tagline">OFFICIAL BOARDING PASS</span>
              </div>
              <div class="class-badge">
                {{ booking?.flight?.class || 'ECONOMY CLASS' }}
              </div>
            </div>

            <div class="passenger-row">
              <div class="info-block">
                <label>PASSENGER NAME</label>
                <div class="val highlight">{{ getPassengerName() }}</div>
              </div>
              <div class="info-block">
                <label>BOOKING REF (PNR)</label>
                <div class="val pnr-code">{{ booking?.pnr }}</div>
              </div>
              <div class="info-block">
                <label>BOARDING STATUS</label>
                <div class="val status-pill" [class.status-pill-green]="isBoarded()">
                  {{ isBoarded() ? '✓ BOARDED & FLYING' : 'PENDING CHECK-IN' }}
                </div>
              </div>
            </div>

            <!-- Route Visualizer -->
            <div class="flight-route-box">
              <div class="route-point">
                <span class="city-code">{{ getAirportCode(getOrigin()) }}</span>
                <span class="city-name">{{ getOrigin() }}</span>
              </div>

              <div class="flight-mid">
                <span class="flight-no">{{ getFlightNumber() }}</span>
                <div class="flight-line-track">
                  <span class="line-dot"></span>
                  <span class="mid-plane-flying">✈️</span>
                  <span class="line-dot"></span>
                </div>
                <span class="flight-time">{{ getDepartureTime() }}</span>
              </div>

              <div class="route-point right">
                <span class="city-code">{{ getAirportCode(getDestination()) }}</span>
                <span class="city-name">{{ getDestination() }}</span>
              </div>
            </div>

            <div class="gate-seat-grid">
              <div class="metric-cell">
                <label>FLIGHT DATE</label>
                <div class="val">{{ formatDate(booking?.flight?.date || booking?.createdAt) }}</div>
              </div>
              <div class="metric-cell">
                <label>BOARDING TIME</label>
                <div class="val highlight">{{ getBoardingTime() }}</div>
              </div>
              <div class="metric-cell">
                <label>GATE</label>
                <div class="val gate-val">{{ getGate() }}</div>
              </div>
              <div class="metric-cell">
                <label>TERMINAL</label>
                <div class="val">{{ getTerminal() }}</div>
              </div>
              <div class="metric-cell seat-cell">
                <label>SEAT NUMBER</label>
                <div class="val seat-no">{{ getSeatNumbers() }}</div>
              </div>
            </div>

            <div class="pass-footer">
              <span class="note">Notice: Gate closes 20 minutes prior to departure. Valid Government Photo ID required at boarding gate.</span>
            </div>
          </div>

          <!-- Perforated Divider -->
          <div class="perforated-divider">
            <div class="notch top"></div>
            <div class="dash-line"></div>
            <div class="notch bottom"></div>
          </div>

          <!-- Right / Boarding Stub -->
          <div class="pass-stub">
            <div class="stub-header">
              <span class="stub-brand">SkyHigh Air</span>
              <span class="stub-tag">PASSENGER STUB</span>
            </div>

            <div class="stub-info">
              <label>PASSENGER</label>
              <div class="stub-val">{{ getPassengerName() }}</div>
            </div>

            <div class="stub-row">
              <div>
                <label>FLIGHT</label>
                <div class="stub-val">{{ getFlightNumber() }}</div>
              </div>
              <div>
                <label>SEAT</label>
                <div class="stub-val highlight">{{ getSeatNumbers() }}</div>
              </div>
            </div>

            <div class="stub-row">
              <div>
                <label>FROM</label>
                <div class="stub-val">{{ getAirportCode(getOrigin()) }}</div>
              </div>
              <div>
                <label>TO</label>
                <div class="stub-val">{{ getAirportCode(getDestination()) }}</div>
              </div>
            </div>

            <div class="qr-container">
              <img *ngIf="qrCodeUrl" [src]="qrCodeUrl" alt="Boarding Barcode" class="qr-image" />
              <div *ngIf="!qrCodeUrl" class="qr-placeholder">Generating Barcode...</div>
              <span class="qr-pnr">{{ booking?.pnr }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pass-modal-backdrop {
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
      padding: 1.5rem;
    }
    .pass-modal-content {
      width: 100%;
      max-width: 960px;
      max-height: 90vh;
      overflow-y: auto;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    }
    .pass-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
      gap: 12px;
      flex-wrap: wrap;
    }
    .status-summary-tag {
      background: rgba(234, 179, 8, 0.2);
      border: 1px solid #eab308;
      color: #fbbf24;
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .tag-flying {
      background: rgba(16, 185, 129, 0.2) !important;
      border-color: #10b981 !important;
      color: #34d399 !important;
    }
    .live-dot-blink {
      color: #ef4444;
      animation: blink 1s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    .right-btns {
      display: flex;
      gap: 10px;
      align-items: center;
    }
    .btn-confirm-yes {
      background: linear-gradient(135deg, #10b981, #059669);
      color: #fff;
      border: none;
      padding: 8px 16px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 0.85rem;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
    }
    .print-btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 700;
      background: #0284c7;
      color: #fff;
      border: none;
      cursor: pointer;
    }
    .btn-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: #cbd5e1;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.1rem;
    }

    .live-flying-banner {
      background: linear-gradient(90deg, rgba(2, 132, 199, 0.25), rgba(16, 185, 129, 0.25));
      border: 1px solid rgba(56, 189, 248, 0.4);
      border-radius: 10px;
      padding: 10px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      font-size: 0.85rem;
      color: #f1f5f9;
      flex-wrap: wrap;
      gap: 8px;
    }
    .radar-tag {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #38bdf8;
    }
    .flight-metrics {
      display: flex;
      gap: 10px;
      align-items: center;
      font-size: 0.8rem;
    }
    .flying-green {
      color: #34d399;
    }

    /* Boarding Pass Layout */
    .boarding-pass-card {
      display: flex;
      background: #ffffff;
      color: #0f172a;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.6);
      min-height: 360px;
    }
    .pass-main {
      flex: 2.6;
      padding: 1.75rem 2rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      background: #ffffff;
    }
    .carrier-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .brand {
      display: flex;
      align-items: baseline;
      gap: 8px;
    }
    .brand-name {
      font-size: 1.35rem;
      font-weight: 900;
      color: #0369a1;
      letter-spacing: -0.5px;
    }
    .carrier-tagline {
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .class-badge {
      background: #0f172a;
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 800;
      letter-spacing: 0.5px;
    }

    .passenger-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .info-block label {
      display: block;
      font-size: 0.65rem;
      font-weight: 800;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 2px;
    }
    .info-block .val {
      font-size: 1.05rem;
      font-weight: 800;
      color: #0f172a;
    }
    .highlight {
      color: #0284c7 !important;
    }
    .pnr-code {
      font-family: monospace;
      color: #0369a1 !important;
      letter-spacing: 1px;
    }
    .status-pill {
      display: inline-block;
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 4px;
      background: #fef08a;
      color: #854d0e;
      font-weight: 800;
    }
    .status-pill-green {
      background: #dcfce7 !important;
      color: #166534 !important;
    }

    /* Route Box */
    .flight-route-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      padding: 1rem 1.5rem;
      margin-bottom: 1.25rem;
    }
    .route-point {
      display: flex;
      flex-direction: column;
    }
    .city-code {
      font-size: 2rem;
      font-weight: 900;
      color: #0369a1;
      line-height: 1;
    }
    .city-name {
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
    }
    .flight-mid {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex: 1;
      padding: 0 1.5rem;
    }
    .flight-no {
      font-size: 0.8rem;
      font-weight: 800;
      color: #0284c7;
      margin-bottom: 4px;
    }
    .flight-line-track {
      position: relative;
      width: 100%;
      height: 2px;
      background: #cbd5e1;
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 4px 0;
    }
    .line-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #0284c7;
    }
    .mid-plane-flying {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      font-size: 1rem;
    }
    .flight-time {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 4px;
    }

    /* Gate / Seat Grid */
    .gate-seat-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 0.85rem;
      background: #f1f5f9;
      padding: 0.85rem 1rem;
      border-radius: 10px;
      margin-bottom: 1rem;
    }
    .metric-cell label {
      display: block;
      font-size: 0.65rem;
      color: #64748b;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .metric-cell .val {
      font-size: 0.95rem;
      font-weight: 800;
      color: #0f172a;
    }
    .gate-val {
      color: #0284c7 !important;
      font-size: 1.15rem !important;
    }
    .seat-no {
      color: #16a34a !important;
      font-size: 1.15rem !important;
    }

    .pass-footer {
      font-size: 0.65rem;
      color: #94a3b8;
      border-top: 1px solid #f1f5f9;
      padding-top: 0.5rem;
    }

    /* Divider */
    .perforated-divider {
      position: relative;
      width: 24px;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
    }
    .notch {
      width: 24px;
      height: 12px;
      background: rgba(0, 0, 0, 0.85);
    }
    .notch.top {
      border-radius: 0 0 12px 12px;
    }
    .notch.bottom {
      border-radius: 12px 12px 0 0;
    }
    .dash-line {
      flex: 1;
      border-left: 2px dashed #cbd5e1;
      margin: 6px 0;
    }

    /* Stub */
    .pass-stub {
      flex: 1;
      padding: 1.5rem;
      background: #f8fafc;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .stub-header {
      display: flex;
      justify-content: space-between;
      border-bottom: 2px solid #0284c7;
      padding-bottom: 0.5rem;
      margin-bottom: 0.85rem;
    }
    .stub-brand {
      font-size: 1rem;
      font-weight: 900;
      color: #0369a1;
    }
    .stub-tag {
      font-size: 0.65rem;
      color: #64748b;
      font-weight: 800;
    }
    .stub-info label, .stub-row label {
      display: block;
      font-size: 0.6rem;
      color: #64748b;
      font-weight: 800;
    }
    .stub-val {
      font-size: 0.85rem;
      font-weight: 800;
      color: #0f172a;
    }
    .stub-row {
      display: flex;
      justify-content: space-between;
      margin-top: 0.65rem;
    }
    .qr-container {
      margin-top: 1rem;
      text-align: center;
    }
    .qr-image {
      width: 100px;
      height: 100px;
      margin: 0 auto;
    }
    .qr-pnr {
      display: block;
      font-size: 0.75rem;
      font-family: monospace;
      font-weight: 800;
      color: #475569;
      margin-top: 4px;
    }

    @media print {
      .pass-actions, .no-print {
        display: none !important;
      }
      .boarding-pass-card {
        box-shadow: none !important;
        border: 1px solid #ccc;
      }
    }
  `]
})
export class BoardingPassComponent implements OnInit, OnChanges {
  @Input() booking: any;
  @Input() onClose: () => void = () => {};

  qrCodeUrl: string = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.generateQr();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['booking']) {
      this.generateQr();
    }
  }

  isBoarded(): boolean {
    return this.booking?.checkInStatus === 'completed' || this.booking?.boardingPassIssued === true;
  }

  confirmBoardingNow(): void {
    if (!this.booking?._id) return;
    this.api.completeCheckIn(this.booking._id).subscribe({
      next: (res) => {
        if (res.booking) {
          this.booking = res.booking;
        } else {
          this.booking.checkInStatus = 'completed';
          this.booking.boardingPassIssued = true;
          this.booking.flightFlyingStatus = 'In Flight ✈️ (Flying)';
        }
      },
      error: () => {
        this.booking.checkInStatus = 'completed';
        this.booking.boardingPassIssued = true;
        this.booking.flightFlyingStatus = 'In Flight ✈️ (Flying)';
      }
    });
  }

  generateQr(): void {
    if (!this.booking?.pnr) return;
    const qrData = JSON.stringify({
      pnr: this.booking.pnr,
      passenger: this.getPassengerName(),
      flight: this.getFlightNumber(),
      seat: this.getSeatNumbers(),
      route: `${this.getOrigin()} -> ${this.getDestination()}`
    });

    QRCode.toDataURL(qrData, { width: 140, margin: 1 }, (err, url) => {
      if (!err && url) {
        this.qrCodeUrl = url;
      }
    });
  }

  getOrigin(): string {
    return this.booking?.origin || this.booking?.flight?.origin || this.booking?.flight?.from || 'Surat';
  }

  getDestination(): string {
    return this.booking?.destination || this.booking?.flight?.destination || this.booking?.flight?.to || 'Delhi';
  }

  getFlightNumber(): string {
    return this.booking?.flightNumber || this.booking?.flight?.flightNumber || 'SH-101';
  }

  getDepartureTime(): string {
    return this.booking?.flight?.departureTime || '10:00 AM';
  }

  getPassengerName(): string {
    if (this.booking?.passengers && this.booking.passengers.length > 0) {
      return this.booking.passengers[0].name.toUpperCase();
    }
    return this.booking?.user?.name?.toUpperCase() || 'PASSENGER';
  }

  getSeatNumbers(): string {
    if (this.booking?.seatNumber) return this.booking.seatNumber;
    if (this.booking?.passengers && this.booking.passengers.length > 0) {
      return this.booking.passengers.map((p: any) => p.seatNumber).join(', ');
    }
    return '14A';
  }

  getGate(): string {
    return this.booking?.gate || 'B4';
  }

  getTerminal(): string {
    return this.booking?.terminal || 'T2';
  }

  getAirportCode(city: string): string {
    if (!city) return 'AIR';
    const c = city.toLowerCase();
    if (c.includes('surat')) return 'STV';
    if (c.includes('mumbai')) return 'BOM';
    if (c.includes('delhi')) return 'DEL';
    if (c.includes('bengaluru') || c.includes('bangalore')) return 'BLR';
    if (c.includes('goa')) return 'GOX';
    if (c.includes('chennai')) return 'MAA';
    if (c.includes('kolkata')) return 'CCU';
    if (c.includes('hyderabad')) return 'HYD';
    if (c.includes('ahmedabad')) return 'AMD';
    if (c.includes('jaipur')) return 'JAI';
    if (c.includes('kochi') || c.includes('cochin')) return 'COK';
    if (c.includes('srinagar')) return 'SXR';
    if (c.includes('pune')) return 'PNQ';
    if (c.includes('dubai')) return 'DXB';
    if (c.includes('london')) return 'LHR';
    if (c.includes('singapore')) return 'SIN';
    if (c.includes('new york')) return 'JFK';
    if (c.includes('bangkok')) return 'BKK';
    if (c.includes('paris')) return 'CDG';
    return city.substring(0, 3).toUpperCase();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'TODAY';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  getBoardingTime(): string {
    return this.booking?.boardingTime || '40m PRIOR';
  }

  printPass(): void {
    window.print();
  }
}
