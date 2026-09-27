import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="home-container">
      <!-- Hero Banner -->
      <div class="hero-section">
        <h1 class="hero-title">
          Fly Smarter with <span class="gradient-text">SkyHigh Air</span>
        </h1>
        <p class="hero-subtitle">
          Book seamless flights, choose real-time dynamic airplane seats, and experience next-gen travel
        </p>

        <!-- Quick Flight Search Widget -->
        <div class="glass-card search-card">
          <div class="search-grid">
            <div class="field-box">
              <label>From</label>
              <input type="text" [(ngModel)]="origin" placeholder="e.g. Mumbai (BOM)" />
            </div>

            <div class="field-box">
              <label>To</label>
              <input type="text" [(ngModel)]="destination" placeholder="e.g. Delhi (DEL)" />
            </div>

            <div class="field-box">
              <label>Departure Date</label>
              <input type="date" [(ngModel)]="date" />
            </div>

            <div class="field-box">
              <label>Travel Class</label>
              <select [(ngModel)]="travelClass">
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business Class</option>
                <option value="First Class">First Class</option>
              </select>
            </div>
          </div>

          <button (click)="searchFlights()" class="btn-primary search-btn">
            ✈️ Search Scheduled Flights
          </button>
        </div>
      </div>

      <!-- Feature Highlights -->
      <div class="features-grid">
        <div class="glass-card feature-box">
          <span class="feat-icon">💺</span>
          <h3>Dynamic Seat Chart</h3>
          <p>Live interactive seat map with 6 distinct color codes for reserved, held, and premium seats.</p>
        </div>

        <div class="glass-card feature-box">
          <span class="feat-icon">🎫</span>
          <h3>Instant Web Check-In</h3>
          <p>Skip airport queues! Check in online with your PNR, declare baggage, and download your QR-enabled boarding pass.</p>
        </div>

        <div class="glass-card feature-box">
          <span class="feat-icon">💱</span>
          <h3>Multi-Currency & Weather</h3>
          <p>Seamlessly convert fares across INR (₹), USD ($), EUR (€), AED and preview live destination weather forecasts.</p>
        </div>

        <div class="glass-card feature-box">
          <span class="feat-icon">🌟</span>
          <h3>SkyMiles Rewards</h3>
          <p>Earn reward points with every trip, save preferred meal & seat preferences in your profile.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 3rem 1.5rem;
    }
    .hero-section {
      text-align: center;
      margin-bottom: 4rem;
      background: transparent;
      padding: 4.5rem 2rem 3.5rem;
      border-radius: 24px;
      
      
    }
    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      line-height: 1.15;
      margin-bottom: 1rem;
    }
    .hero-subtitle {
      font-size: 1.25rem;
      color: var(--text-muted);
      max-width: 700px;
      margin: 0 auto 2.5rem;
    }
    .search-card {
      padding: 2.25rem;
      text-align: left;
      max-width: 1000px;
      margin: 0 auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    }
    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .field-box label {
      display: block;
      font-size: 0.85rem;
      color: var(--text-muted);
      margin-bottom: 0.4rem;
      font-weight: 600;
    }
    .field-box input, .field-box select {
      width: 100%;
    }
    .search-btn {
      width: 100%;
      padding: 1rem;
      font-size: 1.1rem;
    }
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1.5rem;
    }
    .feature-box {
      padding: 2.25rem;
      text-align: center;
    }
    .feat-icon {
      font-size: 2.5rem;
      display: inline-block;
      margin-bottom: 1rem;
    }
    .feature-box h3 {
      font-size: 1.3rem;
      margin-bottom: 0.5rem;
    }
    .feature-box p {
      color: var(--text-muted);
      font-size: 0.95rem;
    }
  `]
})
export class HomeComponent implements OnInit {
  origin = '';
  destination = '';
  date = '';
  travelClass = 'Economy';

  constructor(private router: Router) {}

  ngOnInit(): void {}

  searchFlights(): void {
    this.router.navigate(['/flights'], {
      queryParams: {
        origin: this.origin,
        destination: this.destination,
        date: this.date
      }
    });
  }
}
