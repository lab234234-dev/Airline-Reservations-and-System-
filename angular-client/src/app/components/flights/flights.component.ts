import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { CurrencyService } from '../../services/currency.service';
import { WeatherService } from '../../services/weather.service';
import * as L from 'leaflet';

export interface AirportLocation {
  name: string;
  code: string;
  airport: string;
  lat: number;
  lng: number;
  country: string;
  state?: string;
  isDomestic: boolean;
}

@Component({
  selector: 'app-flights',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="flights-page">
      <!-- Live Header -->
      <div class="header-section">
        <div class="live-pill">
          <span class="live-blink">●</span>
          <span>LIVE AIRPORT RADAR & DEPARTURES</span>
          <span class="timer-badge">Auto-refresh in {{ countdown }}s</span>
          <button (click)="forceRotate()" class="refresh-btn" title="Refresh flights now">🔄 Rotate Now</button>
        </div>
        <h1>Available <span class="gradient-text">Flights</span></h1>
        <p>Live synchronized departures across Indian States & Global International Destinations</p>
      </div>

      <!-- Category Filter Tabs & Map Toggle -->
      <div class="category-tabs">
        <button [class.active-cat]="selectedCategory === 'all'" (click)="setCategory('all')" class="cat-btn">
          🌍 All Routes ({{ flights.length }})
        </button>
        <button [class.active-cat]="selectedCategory === 'domestic'" (click)="setCategory('domestic')" class="cat-btn">
          🇮🇳 Domestic India ({{ getDomesticCount() }})
        </button>
        <button [class.active-cat]="selectedCategory === 'international'" (click)="setCategory('international')" class="cat-btn">
          ✈️ International ({{ getInternationalCount() }})
        </button>
        <button (click)="toggleMap()" class="map-toggle-btn" [class.map-active]="showMap">
          {{ showMap ? '🗺️ Hide Live Route Map' : '🗺️ View Live Route Map' }}
        </button>
      </div>

      <!-- Real Earth Interactive Leaflet Map -->
      <div *ngIf="showMap" class="glass-card map-card animate-fade-in">
        <!-- Top Toolbar -->
        <div class="map-toolbar">
          <div class="map-title-box">
            <span class="radar-ico">🌍</span>
            <div>
              <strong>Interactive Earth Flight Radar & Route Planner</strong>
              <p class="map-sub">Tap any airport on the Earth to select FROM & TO points, or zoom into Country / States</p>
            </div>
          </div>

          <!-- Earth Layer Switcher -->
          <div class="layer-switchers">
            <span class="ctrl-label">Earth Style:</span>
            <button (click)="setMapLayer('satellite')" class="layer-btn" [class.active-layer]="currentLayer === 'satellite'">
              🛰️ Satellite Earth
            </button>
            <button (click)="setMapLayer('radar')" class="layer-btn" [class.active-layer]="currentLayer === 'radar'">
              📡 Dark Radar
            </button>
            <button (click)="setMapLayer('streets')" class="layer-btn" [class.active-layer]="currentLayer === 'streets'">
              🗺️ Terrain Map
            </button>
          </div>
        </div>

        <!-- Zoom Level Controls: Country & State Presets -->
        <div class="zoom-toolbar">
          <span class="zoom-title">📍 Country & State Zoom:</span>
          <div class="zoom-btn-group">
            <button (click)="zoomTo('world')" class="zoom-btn" [class.active-zoom]="currentZoomPreset === 'world'">
              🌏 World
            </button>
            <button (click)="zoomTo('india')" class="zoom-btn" [class.active-zoom]="currentZoomPreset === 'india'">
              🇮🇳 India (Country)
            </button>
            <button (click)="zoomTo('gujarat')" class="zoom-btn" [class.active-zoom]="currentZoomPreset === 'gujarat'">
              📍 Gujarat (Surat/Ahmedabad)
            </button>
            <button (click)="zoomTo('maharashtra')" class="zoom-btn" [class.active-zoom]="currentZoomPreset === 'maharashtra'">
              📍 Maharashtra (Mumbai/Pune)
            </button>
            <button (click)="zoomTo('north')" class="zoom-btn" [class.active-zoom]="currentZoomPreset === 'north'">
              📍 North (Delhi/Jaipur/Srinagar)
            </button>
            <button (click)="zoomTo('south')" class="zoom-btn" [class.active-zoom]="currentZoomPreset === 'south'">
              📍 South (Bengaluru/Goa/Kochi)
            </button>
            <button (click)="zoomTo('east')" class="zoom-btn" [class.active-zoom]="currentZoomPreset === 'east'">
              📍 East (Kolkata)
            </button>
            <button (click)="zoomTo('intl')" class="zoom-btn" [class.active-zoom]="currentZoomPreset === 'intl'">
              🌍 Middle East & Europe
            </button>
          </div>
        </div>

        <!-- Selected Route Active Tag Bar -->
        <div class="route-status-bar" *ngIf="originFilter || destFilter">
          <div class="route-tags">
            <span class="tag-from" *ngIf="originFilter">
              🛫 FROM: <strong>{{ originFilter }}</strong>
            </span>
            <span class="arrow-sep" *ngIf="originFilter && destFilter">➔</span>
            <span class="tag-to" *ngIf="destFilter">
              🛬 TO: <strong>{{ destFilter }}</strong>
            </span>
          </div>
          <div class="route-actions">
            <button (click)="swapFromTo()" *ngIf="originFilter && destFilter" class="action-btn swap-btn" title="Swap Origin and Destination">
              ⇄ Swap
            </button>
            <button (click)="resetRouteSelection()" class="action-btn clear-btn">
              ✕ Clear Route Selection
            </button>
          </div>
        </div>

        <!-- Instructions Helper -->
        <div class="map-helper-tip">
          <span>💡 <strong>Tip:</strong> Tap any airport pin on the Earth map to choose it as <strong>Departure (FROM)</strong> or <strong>Destination (TO)</strong>. The flight route will be drawn live!</span>
        </div>

        <!-- The Leaflet Map Element -->
        <div id="real-flight-map" class="real-map-box"></div>
      </div>

      <!-- Quick Filter Bar -->
      <div class="glass-card filter-bar">
        <div class="filter-input-wrap">
          <span class="input-icon">🛫</span>
          <input type="text" [(ngModel)]="originFilter" placeholder="Filter Origin (e.g. Surat, Mumbai, London)" (input)="filterFlights()" />
        </div>
        <div class="filter-input-wrap">
          <span class="input-icon">🛬</span>
          <input type="text" [(ngModel)]="destFilter" placeholder="Filter Destination (e.g. Delhi, Dubai, Singapore)" (input)="filterFlights()" />
        </div>
        <button (click)="resetFilters()" class="btn-secondary">Reset Filters</button>
      </div>

      <!-- Loading State -->
      <div *ngIf="loading" class="state-container">
        <div class="spinner"></div>
        <p>Fetching real-time flights & airport departures...</p>
      </div>

      <!-- Error State -->
      <div *ngIf="error" class="error-banner">
        <span>⚠️ {{ error }}</span>
        <button (click)="loadFlights()" class="btn-sm">Retry</button>
      </div>

      <!-- Empty State -->
      <div *ngIf="!loading && !error && filteredFlights.length === 0" class="empty-state glass-card">
        <div class="empty-icon">✈️</div>
        <h3>No Flights Found</h3>
        <p>No departures found matching your route criteria.</p>
        <button (click)="resetFilters()" class="btn-primary">View All Available Flights</button>
      </div>

      <!-- Flights List Grid -->
      <div *ngIf="!loading && filteredFlights.length > 0" class="flights-grid">
        <div *ngFor="let flight of filteredFlights" class="flight-card glass-card">
          <!-- Card Header -->
          <div class="card-header">
            <div class="airline-info">
              <span class="flight-icon">✈️</span>
              <div>
                <h4>{{ flight.airline }}</h4>
                <span class="flight-no">{{ flight.flightNumber }}</span>
              </div>
            </div>
            <div class="badge-group">
              <span class="type-badge" [class.badge-intl]="isInternational(flight)">
                {{ isInternational(flight) ? '🌍 International' : '🇮🇳 Domestic' }}
              </span>
              <span class="status-badge" [ngClass]="getStatusClass(flight.status)">
                {{ flight.status }}
              </span>
            </div>
          </div>

          <!-- Route & Schedule Display -->
          <div class="route-display">
            <!-- Origin -->
            <div class="endpoint">
              <div class="time">{{ formatTimeOnly(flight.departureTime) }}</div>
              <div class="city">{{ flight.origin }}</div>
              <div class="date-sub">{{ formatDateOnly(flight.departureTime) }}</div>
            </div>

            <!-- Path Timeline -->
            <div class="flight-path">
              <span class="duration">{{ getDuration(flight) }}</span>
              <div class="path-line">
                <span class="dot origin-dot"></span>
                <span class="plane-line">✈</span>
                <span class="dot dest-dot"></span>
              </div>
              <span class="stop-info">Non-Stop Direct</span>
            </div>

            <!-- Destination -->
            <div class="endpoint text-right">
              <div class="time">{{ formatTimeOnly(flight.arrivalTime) }}</div>
              <div class="city">{{ flight.destination }}</div>
              <div class="date-sub">{{ formatDateOnly(flight.arrivalTime) }}</div>
            </div>
          </div>

          <!-- Live Weather Strip -->
          <div class="weather-strip" *ngIf="originWeather[flight.origin] || destWeather[flight.destination]">
            <span *ngIf="originWeather[flight.origin]" class="weather-item">
              {{ originWeather[flight.origin].icon }} {{ flight.origin }}: {{ originWeather[flight.origin].temp }}°C ({{ originWeather[flight.origin].condition }})
            </span>
            <span class="weather-sep" *ngIf="originWeather[flight.origin] && destWeather[flight.destination]">•</span>
            <span *ngIf="destWeather[flight.destination]" class="weather-item">
              {{ destWeather[flight.destination].icon }} {{ flight.destination }}: {{ destWeather[flight.destination].temp }}°C ({{ destWeather[flight.destination].condition }})
            </span>
          </div>

          <!-- Footer & Action -->
          <div class="card-footer">
            <div class="price-section">
              <span class="price-label">Starting from</span>
              <span class="price-amount">{{ currencyService.format(flight.price) }}</span>
              <span class="seats-left">{{ flight.availableSeats }} seats remaining</span>
            </div>
            <button (click)="bookFlight(flight._id)" class="btn-book">
              Select Seats & Book ➔
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .flights-page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 16px 80px;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
      background: transparent !important;
      border: none !important;
      box-shadow: none !important;
    }

    .header-section {
      text-align: center;
      margin-bottom: 24px;
    }

    .live-pill {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: rgba(14, 165, 233, 0.15);
      border: 1px solid rgba(14, 165, 233, 0.4);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 700;
      color: #38bdf8;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }

    .live-blink {
      color: #ef4444;
      font-size: 0.9rem;
      animation: pulseBlink 1.2s infinite;
    }

    @keyframes pulseBlink {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.3; transform: scale(0.85); }
    }

    .timer-badge {
      background: rgba(0, 0, 0, 0.3);
      padding: 2px 8px;
      border-radius: 6px;
      color: #f1f5f9;
    }

    .refresh-btn {
      background: transparent;
      border: 1px solid rgba(56, 189, 248, 0.5);
      color: #38bdf8;
      border-radius: 4px;
      padding: 2px 8px;
      cursor: pointer;
      font-size: 0.75rem;
      transition: all 0.2s;
    }
    .refresh-btn:hover {
      background: rgba(56, 189, 248, 0.2);
    }

    h1 {
      font-size: 2.4rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 0 0 8px;
    }

    .gradient-text {
      background: linear-gradient(135deg, #38bdf8, #818cf8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    p {
      color: #94a3b8;
      font-size: 1rem;
      margin: 0;
    }

    .category-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: center;
      margin-bottom: 20px;
    }

    .cat-btn {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #94a3b8;
      padding: 10px 18px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .cat-btn:hover {
      background: rgba(30, 41, 59, 0.9);
      color: #f8fafc;
      border-color: rgba(56, 189, 248, 0.4);
    }
    .active-cat {
      background: linear-gradient(135deg, #0284c7, #2563eb) !important;
      color: #ffffff !important;
      border-color: #38bdf8 !important;
      box-shadow: 0 4px 14px rgba(2, 132, 199, 0.35);
    }

    .map-toggle-btn {
      background: rgba(99, 102, 241, 0.2);
      border: 1px solid rgba(129, 140, 248, 0.5);
      color: #a5b4fc;
      padding: 10px 20px;
      border-radius: 12px;
      font-weight: 700;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .map-toggle-btn:hover, .map-active {
      background: linear-gradient(135deg, #4f46e5, #7c3aed) !important;
      color: #fff !important;
      box-shadow: 0 4px 14px rgba(79, 70, 229, 0.4);
    }

    /* Map Card */
    .map-card {
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(56, 189, 248, 0.25);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
    }

    .map-toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      margin-bottom: 12px;
    }

    .map-title-box {
      display: flex;
      align-items: center;
      gap: 10px;
      color: #f8fafc;
    }
    .radar-ico {
      font-size: 1.8rem;
    }
    .map-title-box strong {
      font-size: 1rem;
      display: block;
      color: #e2e8f0;
    }
    .map-sub {
      font-size: 0.8rem;
      color: #94a3b8;
      margin: 0;
    }

    .layer-switchers {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }
    .ctrl-label {
      font-size: 0.75rem;
      color: #94a3b8;
      font-weight: 600;
      margin-right: 4px;
    }
    .layer-btn {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .layer-btn:hover {
      background: rgba(51, 65, 85, 0.8);
      color: #fff;
    }
    .active-layer {
      background: #0284c7 !important;
      color: #fff !important;
      border-color: #38bdf8 !important;
    }

    /* Zoom Toolbar */
    .zoom-toolbar {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-bottom: 12px;
      background: rgba(15, 23, 42, 0.6);
      padding: 8px 12px;
      border-radius: 10px;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .zoom-title {
      font-size: 0.8rem;
      font-weight: 700;
      color: #38bdf8;
      white-space: nowrap;
    }
    .zoom-btn-group {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .zoom-btn {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .zoom-btn:hover {
      background: rgba(56, 189, 248, 0.2);
      color: #38bdf8;
      border-color: rgba(56, 189, 248, 0.4);
    }
    .active-zoom {
      background: #4f46e5 !important;
      color: #fff !important;
      border-color: #818cf8 !important;
    }

    /* Route Active Status Bar */
    .route-status-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: rgba(2, 132, 199, 0.15);
      border: 1px solid rgba(56, 189, 248, 0.4);
      padding: 8px 14px;
      border-radius: 10px;
      margin-bottom: 10px;
      flex-wrap: wrap;
      gap: 8px;
    }
    .route-tags {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 0.85rem;
    }
    .tag-from {
      color: #34d399;
      font-weight: 600;
    }
    .tag-to {
      color: #f43f5e;
      font-weight: 600;
    }
    .arrow-sep {
      color: #38bdf8;
      font-weight: bold;
    }
    .route-actions {
      display: flex;
      gap: 8px;
    }
    .action-btn {
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .swap-btn {
      background: rgba(56, 189, 248, 0.2);
      border: 1px solid #38bdf8;
      color: #38bdf8;
    }
    .swap-btn:hover {
      background: #0284c7;
      color: #fff;
    }
    .clear-btn {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
    }
    .clear-btn:hover {
      background: #ef4444;
      color: #fff;
    }

    .map-helper-tip {
      font-size: 0.8rem;
      color: #94a3b8;
      margin-bottom: 10px;
      padding: 4px 6px;
    }
    .map-helper-tip strong {
      color: #38bdf8;
    }

    /* Map Box Container */
    .real-map-box {
      width: 100%;
      height: 520px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.5);
      background: #0b1120;
    }

    /* Filter Bar */
    .filter-bar {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      padding: 16px;
      margin-bottom: 24px;
      border-radius: 12px;
      background: rgba(15, 23, 42, 0.65);
    }
    .filter-input-wrap {
      flex: 1;
      min-width: 220px;
      position: relative;
      display: flex;
      align-items: center;
    }
    .input-icon {
      position: absolute;
      left: 12px;
      font-size: 1rem;
      pointer-events: none;
    }
    .filter-input-wrap input {
      width: 100%;
      padding: 10px 12px 10px 38px;
      border-radius: 8px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(30, 41, 59, 0.6);
      color: #f8fafc;
      font-size: 0.9rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .filter-input-wrap input:focus {
      border-color: #38bdf8;
    }

    .btn-secondary {
      background: rgba(51, 65, 85, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #e2e8f0;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-secondary:hover {
      background: #475569;
    }

    /* State feedback */
    .state-container {
      text-align: center;
      padding: 60px 20px;
      color: #94a3b8;
    }
    .spinner {
      width: 44px;
      height: 44px;
      border: 4px solid rgba(56, 189, 248, 0.15);
      border-top-color: #38bdf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      margin: 0 auto 16px;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-banner {
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid #ef4444;
      color: #fca5a5;
      padding: 14px 20px;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .btn-sm {
      background: #ef4444;
      color: #fff;
      border: none;
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
    }

    .empty-state {
      text-align: center;
      padding: 50px 20px;
      border-radius: 16px;
      background: rgba(15, 23, 42, 0.6);
    }
    .empty-icon {
      font-size: 3rem;
      margin-bottom: 12px;
      opacity: 0.5;
    }
    .empty-state h3 {
      font-size: 1.4rem;
      color: #f1f5f9;
      margin: 0 0 8px;
    }
    .btn-primary {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #fff;
      border: none;
      padding: 10px 22px;
      border-radius: 10px;
      font-weight: 600;
      margin-top: 14px;
      cursor: pointer;
    }

    /* Flights Grid */
    .flights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }

    .flight-card {
      border-radius: 16px;
      padding: 20px;
      background: rgba(15, 23, 42, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
      transition: transform 0.25s, border-color 0.25s, box-shadow 0.25s;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .flight-card:hover {
      transform: translateY(-3px);
      border-color: rgba(56, 189, 248, 0.4);
      box-shadow: 0 8px 30px rgba(2, 132, 199, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 18px;
    }
    .airline-info {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .flight-icon {
      font-size: 1.6rem;
      background: rgba(56, 189, 248, 0.15);
      padding: 8px;
      border-radius: 10px;
    }
    .airline-info h4 {
      font-size: 1.05rem;
      color: #f8fafc;
      margin: 0;
      font-weight: 700;
    }
    .flight-no {
      font-size: 0.8rem;
      color: #38bdf8;
      font-family: monospace;
      font-weight: 600;
    }

    .badge-group {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 4px;
    }
    .type-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 700;
      background: rgba(16, 185, 129, 0.15);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .badge-intl {
      background: rgba(245, 158, 11, 0.15);
      color: #fbbf24;
      border-color: rgba(245, 158, 11, 0.3);
    }
    .status-badge {
      font-size: 0.7rem;
      padding: 2px 8px;
      border-radius: 6px;
      font-weight: 700;
    }
    .status-ontime {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }
    .status-boarding {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }
    .status-gateopen {
      background: rgba(245, 158, 11, 0.2);
      color: #fbbf24;
    }
    .status-scheduled {
      background: rgba(99, 102, 241, 0.2);
      color: #a5b4fc;
    }

    /* Route Display */
    .route-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      margin-bottom: 14px;
    }
    .endpoint {
      flex: 1;
    }
    .endpoint .time {
      font-size: 1.25rem;
      font-weight: 800;
      color: #f8fafc;
    }
    .endpoint .city {
      font-size: 0.95rem;
      font-weight: 600;
      color: #94a3b8;
    }
    .endpoint .date-sub {
      font-size: 0.75rem;
      color: #64748b;
    }
    .text-right {
      text-align: right;
    }

    .flight-path {
      flex: 1.4;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 0 8px;
    }
    .duration {
      font-size: 0.75rem;
      font-weight: 600;
      color: #cbd5e1;
      margin-bottom: 4px;
    }
    .path-line {
      position: relative;
      width: 100%;
      height: 2px;
      background: rgba(255, 255, 255, 0.15);
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin: 4px 0;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #38bdf8;
    }
    .plane-line {
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) rotate(45deg);
      font-size: 0.8rem;
      color: #38bdf8;
    }
    .stop-info {
      font-size: 0.7rem;
      color: #10b981;
      margin-top: 4px;
    }

    /* Weather Strip */
    .weather-strip {
      background: rgba(15, 23, 42, 0.5);
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 0.75rem;
      color: #94a3b8;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 14px;
    }
    .weather-sep {
      color: #475569;
    }

    /* Card Footer */
    .card-footer {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .price-section {
      display: flex;
      flex-direction: column;
    }
    .price-label {
      font-size: 0.75rem;
      color: #64748b;
    }
    .price-amount {
      font-size: 1.35rem;
      font-weight: 800;
      color: #38bdf8;
    }
    .seats-left {
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .btn-book {
      background: linear-gradient(135deg, #0284c7, #2563eb);
      color: #ffffff;
      border: none;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-book:hover {
      background: linear-gradient(135deg, #0369a1, #1d4ed8);
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(2, 132, 199, 0.4);
    }

    @media (max-width: 768px) {
      .flights-grid {
        grid-template-columns: 1fr;
      }
      .real-map-box {
        height: 380px;
      }
      .map-toolbar {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class FlightsComponent implements OnInit, OnDestroy, AfterViewInit {
  flights: any[] = [];
  filteredFlights: any[] = [];
  originFilter: string = '';
  destFilter: string = '';
  selectedCategory: 'all' | 'domestic' | 'international' = 'all';

  loading: boolean = true;
  error: string | null = null;

  showMap: boolean = true;
  currentLayer: 'satellite' | 'radar' | 'streets' = 'satellite';
  currentZoomPreset: string = 'india';

  // Live Auto-rotation timer
  countdown: number = 60;
  private timerInterval: any = null;

  // Weather Caches
  originWeather: { [city: string]: any } = {};
  destWeather: { [city: string]: any } = {};

  // Leaflet Map objects
  private map: L.Map | null = null;
  private tileLayer: L.TileLayer | null = null;
  private airportMarkers: L.Marker[] = [];
  private routeLine: L.Polyline | null = null;
  private routeGlowLine: L.Polyline | null = null;

  // Airport Locations with Real Coordinates & State/Country details
  readonly airports: AirportLocation[] = [
    // Domestic - Gujarat
    { name: 'Surat', code: 'STV', airport: 'Surat International Airport', lat: 21.1140, lng: 72.7418, country: 'India', state: 'Gujarat', isDomestic: true },
    { name: 'Ahmedabad', code: 'AMD', airport: 'Sardar Vallabhbhai Patel Intl', lat: 23.0734, lng: 72.6347, country: 'India', state: 'Gujarat', isDomestic: true },
    // Domestic - Maharashtra
    { name: 'Mumbai', code: 'BOM', airport: 'Chhatrapati Shivaji Maharaj Intl', lat: 19.0896, lng: 72.8656, country: 'India', state: 'Maharashtra', isDomestic: true },
    { name: 'Pune', code: 'PNQ', airport: 'Pune International Airport', lat: 18.5822, lng: 73.9197, country: 'India', state: 'Maharashtra', isDomestic: true },
    // Domestic - North
    { name: 'Delhi', code: 'DEL', airport: 'Indira Gandhi International Airport', lat: 28.5562, lng: 77.1000, country: 'India', state: 'Delhi NCR', isDomestic: true },
    { name: 'Jaipur', code: 'JAI', airport: 'Jaipur International Airport', lat: 26.8242, lng: 75.8122, country: 'India', state: 'Rajasthan', isDomestic: true },
    { name: 'Srinagar', code: 'SXR', airport: 'Sheikh ul-Alam International Airport', lat: 33.9871, lng: 74.7741, country: 'India', state: 'Jammu & Kashmir', isDomestic: true },
    { name: 'Amritsar', code: 'ATQ', airport: 'Sri Guru Ram Dass Jee Intl', lat: 31.7096, lng: 74.7973, country: 'India', state: 'Punjab', isDomestic: true },
    // Domestic - South
    { name: 'Bengaluru', code: 'BLR', airport: 'Kempegowda International Airport', lat: 13.1986, lng: 77.7066, country: 'India', state: 'Karnataka', isDomestic: true },
    { name: 'Chennai', code: 'MAA', airport: 'Chennai International Airport', lat: 12.9941, lng: 80.1709, country: 'India', state: 'Tamil Nadu', isDomestic: true },
    { name: 'Kochi', code: 'COK', airport: 'Cochin International Airport', lat: 10.1518, lng: 76.3930, country: 'India', state: 'Kerala', isDomestic: true },
    { name: 'Goa', code: 'GOI', airport: 'Dabolim International Airport', lat: 15.3808, lng: 73.8314, country: 'India', state: 'Goa', isDomestic: true },
    { name: 'Hyderabad', code: 'HYD', airport: 'Rajiv Gandhi International Airport', lat: 17.2403, lng: 78.4294, country: 'India', state: 'Telangana', isDomestic: true },
    // Domestic - East
    { name: 'Kolkata', code: 'CCU', airport: 'Netaji Subhash Chandra Bose Intl', lat: 22.6547, lng: 88.4467, country: 'India', state: 'West Bengal', isDomestic: true },
    // International
    { name: 'Dubai', code: 'DXB', airport: 'Dubai International Airport', lat: 25.2532, lng: 55.3657, country: 'UAE', isDomestic: false },
    { name: 'London', code: 'LHR', airport: 'London Heathrow Airport', lat: 51.4700, lng: -0.4543, country: 'United Kingdom', isDomestic: false },
    { name: 'Singapore', code: 'SIN', airport: 'Singapore Changi Airport', lat: 1.3644, lng: 103.9915, country: 'Singapore', isDomestic: false },
    { name: 'Bangkok', code: 'BKK', airport: 'Suvarnabhumi Airport', lat: 13.6900, lng: 100.7501, country: 'Thailand', isDomestic: false },
    { name: 'Paris', code: 'CDG', airport: 'Paris Charles de Gaulle Airport', lat: 49.0097, lng: 2.5479, country: 'France', isDomestic: false },
    { name: 'New York', code: 'JFK', airport: 'John F. Kennedy International', lat: 40.6413, lng: -73.7781, country: 'United States', isDomestic: false },
    { name: 'Tokyo', code: 'HND', airport: 'Tokyo Haneda International', lat: 35.5494, lng: 139.7798, country: 'Japan', isDomestic: false }
  ];

  constructor(
    private apiService: ApiService,
    public currencyService: CurrencyService,
    private weatherService: WeatherService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Expose component instance for Leaflet popup HTML onclick events
    (window as any).__flightMapComponent = this;

    this.route.queryParams.subscribe(params => {
      if (params['origin']) this.originFilter = params['origin'];
      if (params['destination']) this.destFilter = params['destination'];
      if (params['category']) this.selectedCategory = params['category'];
    });

    this.loadFlights();
    this.startLiveTimer();
  }

  ngAfterViewInit(): void {
    if (this.showMap) {
      setTimeout(() => this.initMap(), 250);
    }
  }

  ngOnDestroy(): void {
    this.stopLiveTimer();
    if (this.map) {
      this.map.remove();
      this.map = null;
    }
    delete (window as any).__flightMapComponent;
  }

  /* ----------------- MAP INITIALIZATION & CONTROLS ----------------- */

  initMap(): void {
    const mapElement = document.getElementById('real-flight-map');
    if (!mapElement) return;

    if (this.map) {
      this.map.invalidateSize();
      return;
    }

    // Initialize Leaflet Map centered on India & Global Flight routes
    this.map = L.map('real-flight-map', {
      center: [21.5, 78.5],
      zoom: 5,
      minZoom: 2,
      maxZoom: 18,
      zoomControl: true,
      attributionControl: true
    });

    this.applyTileLayer();
    this.renderAirportMarkers();
    this.renderFlightRoutesOnMap();

    setTimeout(() => {
      if (this.map) this.map.invalidateSize();
    }, 200);
  }

  applyTileLayer(): void {
    if (!this.map) return;

    if (this.tileLayer) {
      this.map.removeLayer(this.tileLayer);
    }

    if (this.currentLayer === 'satellite') {
      // High-resolution real Earth Satellite photo imagery
      this.tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 18,
        attribution: 'Tiles &copy; Esri &mdash; Earth Satellite View'
      });
    } else if (this.currentLayer === 'radar') {
      // Sleek Dark Flight Radar theme
      this.tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
      });
    } else {
      // OpenStreetMap Terrain & Streets
      this.tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      });
    }

    this.tileLayer.addTo(this.map);
  }

  setMapLayer(layer: 'satellite' | 'radar' | 'streets'): void {
    this.currentLayer = layer;
    this.applyTileLayer();
  }

  toggleMap(): void {
    this.showMap = !this.showMap;
    if (this.showMap) {
      setTimeout(() => this.initMap(), 200);
    }
  }

  /* ----------------- COUNTRY & STATE ZOOM LEVELS ----------------- */

  zoomTo(preset: string): void {
    this.currentZoomPreset = preset;
    if (!this.map) return;

    switch (preset) {
      case 'world':
        this.map.flyTo([25.0, 55.0], 3, { duration: 1.2 });
        break;
      case 'india':
        this.map.flyTo([21.5, 78.5], 5, { duration: 1.2 });
        break;
      case 'gujarat':
        // Zoom into Gujarat state (Surat, Ahmedabad)
        this.map.flyTo([22.1, 72.0], 7.5, { duration: 1.2 });
        break;
      case 'maharashtra':
        // Zoom into Maharashtra state (Mumbai, Pune)
        this.map.flyTo([18.9, 73.5], 7.5, { duration: 1.2 });
        break;
      case 'north':
        // Zoom into Northern States (Delhi, Jaipur, Srinagar, Punjab)
        this.map.flyTo([28.8, 76.5], 6.5, { duration: 1.2 });
        break;
      case 'south':
        // Zoom into Southern States (Bengaluru, Chennai, Kochi, Goa)
        this.map.flyTo([13.5, 77.5], 6.5, { duration: 1.2 });
        break;
      case 'east':
        // Zoom into Eastern States (West Bengal, Kolkata)
        this.map.flyTo([22.65, 88.44], 7.5, { duration: 1.2 });
        break;
      case 'intl':
        // Zoom into Middle East & Europe international corridor
        this.map.flyTo([35.0, 45.0], 4, { duration: 1.2 });
        break;
      default:
        this.map.flyTo([21.5, 78.5], 5, { duration: 1 });
    }
  }

  zoomToAirport(airportName: string): void {
    const apt = this.airports.find(a => a.name.toLowerCase() === airportName.toLowerCase());
    if (apt && this.map) {
      this.map.flyTo([apt.lat, apt.lng], 9, { duration: 1 });
    }
  }

  /* ----------------- AIRPORT MARKERS & INTERACTIVE TAPPING ----------------- */

  renderAirportMarkers(): void {
    if (!this.map) return;

    // Clear old markers
    this.airportMarkers.forEach(m => m.remove());
    this.airportMarkers = [];

    const normOrigin = (this.originFilter || '').toLowerCase().trim();
    const normDest = (this.destFilter || '').toLowerCase().trim();

    this.airports.forEach(apt => {
      const isFrom = normOrigin && apt.name.toLowerCase().includes(normOrigin);
      const isTo = normDest && apt.name.toLowerCase().includes(normDest);

      let pinColor = apt.isDomestic ? '#00e5ff' : '#ffb800'; // Cyan for India, Amber for Intl
      let badgeLabel = apt.code;
      let pulseClass = 'apt-pin';

      if (isFrom) {
        pinColor = '#10b981'; // Green for FROM
        badgeLabel = 'FROM';
        pulseClass = 'apt-pin apt-pin-from';
      } else if (isTo) {
        pinColor = '#f43f5e'; // Red/Pink for TO
        badgeLabel = 'TO';
        pulseClass = 'apt-pin apt-pin-to';
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div class="${pulseClass}" style="--pin-color: ${pinColor};">
            <span class="apt-pulse"></span>
            <div class="apt-badge" style="background: ${pinColor};">
              <span class="apt-code">${badgeLabel}</span>
            </div>
            <span class="apt-city-label">${apt.name}</span>
          </div>
        `,
        iconSize: [60, 40],
        iconAnchor: [30, 20],
        popupAnchor: [0, -22]
      });

      const marker = L.marker([apt.lat, apt.lng], { icon: customIcon });

      // Interactive popup with One-Tap FROM / TO setters
      const popupHtml = `
        <div style="font-family: 'Segoe UI', sans-serif; min-width: 200px; padding: 4px; color: #0f172a;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid ${pinColor}; padding-bottom: 6px; margin-bottom: 8px;">
            <div>
              <strong style="font-size: 1.1rem; color: #0f172a;">${apt.name}</strong>
              <div style="font-size: 0.75rem; color: #64748b;">${apt.state ? apt.state + ', ' : ''}${apt.country}</div>
            </div>
            <span style="background: #0284c7; color: #fff; font-weight: bold; font-size: 0.75rem; padding: 2px 6px; border-radius: 4px;">
              ${apt.code}
            </span>
          </div>
          <div style="font-size: 0.8rem; color: #334155; margin-bottom: 10px;">
            🏢 ${apt.airport}
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <button onclick="window.__flightMapComponent.setOrigin('${apt.name}')"
              style="background: #10b981; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem; transition: opacity 0.2s;">
              🛫 Set as Departure (FROM)
            </button>
            <button onclick="window.__flightMapComponent.setDestination('${apt.name}')"
              style="background: #f43f5e; color: white; border: none; padding: 6px 10px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 0.8rem; transition: opacity 0.2s;">
              🛬 Set as Destination (TO)
            </button>
            <button onclick="window.__flightMapComponent.zoomToAirport('${apt.name}')"
              style="background: #0284c7; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 0.75rem;">
              🔍 Zoom Closer
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.addTo(this.map!);
      this.airportMarkers.push(marker);
    });
  }

  /* ----------------- FLIGHT ROUTE LINES ON MAP ----------------- */

  renderFlightRoutesOnMap(): void {
    if (!this.map) return;

    // Clear previous route polylines
    if (this.routeLine) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }
    if (this.routeGlowLine) {
      this.map.removeLayer(this.routeGlowLine);
      this.routeGlowLine = null;
    }

    const normOrigin = (this.originFilter || '').toLowerCase().trim();
    const normDest = (this.destFilter || '').toLowerCase().trim();

    if (!normOrigin || !normDest) {
      return;
    }

    const fromApt = this.airports.find(a => a.name.toLowerCase().includes(normOrigin));
    const toApt = this.airports.find(a => a.name.toLowerCase().includes(normDest));

    if (!fromApt || !toApt) return;

    // Generate an elevated curved geodesic-like waypoint for realistic flight curve
    const midLat = (fromApt.lat + toApt.lat) / 2 + 1.8;
    const midLng = (fromApt.lng + toApt.lng) / 2;

    const latlngs: L.LatLngExpression[] = [
      [fromApt.lat, fromApt.lng],
      [midLat, midLng],
      [toApt.lat, toApt.lng]
    ];

    // Background Glow Line
    this.routeGlowLine = L.polyline(latlngs, {
      color: '#38bdf8',
      weight: 8,
      opacity: 0.35,
      lineCap: 'round'
    }).addTo(this.map);

    // Foreground Pulsing Dashed Flight Path
    this.routeLine = L.polyline(latlngs, {
      color: '#00f0ff',
      weight: 3.5,
      opacity: 0.95,
      dashArray: '8, 10',
      lineCap: 'round'
    }).addTo(this.map);

    // Smoothly pan & fit bounds to the selected route
    const bounds = L.latLngBounds([
      [fromApt.lat, fromApt.lng],
      [toApt.lat, toApt.lng]
    ]);
    this.map.fitBounds(bounds, { padding: [80, 80], maxZoom: 8 });
  }

  /* ----------------- ROUTE SELECTION ACTIONS ----------------- */

  setOrigin(airportName: string): void {
    this.originFilter = airportName;
    this.filterFlights();
    this.renderAirportMarkers();
    this.renderFlightRoutesOnMap();

    // If destination is also set, close popups
    if (this.map) {
      this.map.closePopup();
    }
  }

  setDestination(airportName: string): void {
    this.destFilter = airportName;
    this.filterFlights();
    this.renderAirportMarkers();
    this.renderFlightRoutesOnMap();

    if (this.map) {
      this.map.closePopup();
    }
  }

  swapFromTo(): void {
    const temp = this.originFilter;
    this.originFilter = this.destFilter;
    this.destFilter = temp;
    this.filterFlights();
    this.renderAirportMarkers();
    this.renderFlightRoutesOnMap();
  }

  resetRouteSelection(): void {
    this.originFilter = '';
    this.destFilter = '';
    this.filterFlights();
    this.renderAirportMarkers();
    if (this.routeLine && this.map) {
      this.map.removeLayer(this.routeLine);
      this.routeLine = null;
    }
    if (this.routeGlowLine && this.map) {
      this.map.removeLayer(this.routeGlowLine);
      this.routeGlowLine = null;
    }
    this.zoomTo('india');
  }

  /* ----------------- LIVE ROTATION & DATA HANDLING ----------------- */

  startLiveTimer(): void {
    this.countdown = 60;
    this.timerInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        this.countdown = 60;
        this.rotateFlights();
      }
    }, 1000);
  }

  stopLiveTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  forceRotate(): void {
    this.countdown = 60;
    this.rotateFlights();
  }

  rotateFlights(): void {
    if (this.flights.length > 2) {
      const first = this.flights.shift();
      this.flights.push(first);
      this.filterFlights();
    }
  }

  loadFlights(): void {
    this.loading = true;
    this.error = null;

    this.apiService.getFlights().subscribe({
      next: (data) => {
        this.flights = data || [];
        this.filterFlights();
        this.loading = false;
        this.fetchWeatherData();

        if (this.showMap && this.map) {
          this.renderFlightRoutesOnMap();
        }
      },
      error: (err) => {
        console.error('Failed to load flights:', err);
        this.error = 'Failed to load live flight departures. Please try again.';
        this.loading = false;
      }
    });
  }

  fetchWeatherData(): void {
    const uniqueCities = new Set<string>();
    this.flights.forEach(f => {
      if (f.origin) uniqueCities.add(f.origin);
      if (f.destination) uniqueCities.add(f.destination);
    });

    uniqueCities.forEach(city => {
      const w = this.weatherService.getWeatherForCity(city);
      this.originWeather[city] = w;
      this.destWeather[city] = w;
    });
  }

  setCategory(cat: 'all' | 'domestic' | 'international'): void {
    this.selectedCategory = cat;
    this.filterFlights();
  }

  getDomesticCount(): number {
    return this.flights.filter(f => !this.isInternational(f)).length;
  }

  getInternationalCount(): number {
    return this.flights.filter(f => this.isInternational(f)).length;
  }

  isInternational(flight: any): boolean {
    const intlCities = ['dubai', 'london', 'singapore', 'new york', 'bangkok', 'paris', 'tokyo'];
    const orig = (flight.origin || '').toLowerCase();
    const dest = (flight.destination || '').toLowerCase();
    return intlCities.some(c => orig.includes(c) || dest.includes(c));
  }

  filterFlights(): void {
    this.filteredFlights = this.flights.filter(f => {
      const matchOrigin = !this.originFilter || f.origin.toLowerCase().includes(this.originFilter.toLowerCase());
      const matchDest = !this.destFilter || f.destination.toLowerCase().includes(this.destFilter.toLowerCase());

      let matchCat = true;
      if (this.selectedCategory === 'domestic') {
        matchCat = !this.isInternational(f);
      } else if (this.selectedCategory === 'international') {
        matchCat = this.isInternational(f);
      }

      return matchOrigin && matchDest && matchCat;
    });

    if (this.map) {
      this.renderFlightRoutesOnMap();
    }
  }

  resetFilters(): void {
    this.originFilter = '';
    this.destFilter = '';
    this.selectedCategory = 'all';
    this.filterFlights();
    this.renderAirportMarkers();
    this.renderFlightRoutesOnMap();
    this.zoomTo('india');
  }

  getStatusClass(status: string): string {
    const s = (status || '').toLowerCase();
    if (s.includes('boarding')) return 'status-boarding';
    if (s.includes('gate') || s.includes('final')) return 'status-gateopen';
    if (s.includes('on time')) return 'status-ontime';
    return 'status-scheduled';
  }

  formatTimeOnly(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? dateStr : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDateOnly(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  getDuration(flight: any): string {
    if (flight.departureTime && flight.arrivalTime) {
      const diffMs = new Date(flight.arrivalTime).getTime() - new Date(flight.departureTime).getTime();
      if (diffMs > 0) {
        const hrs = Math.floor(diffMs / 3600000);
        const mins = Math.floor((diffMs % 3600000) / 60000);
        return `${hrs}h ${mins}m`;
      }
    }
    return this.isInternational(flight) ? '6h 30m' : '1h 45m';
  }

  bookFlight(flightId: string): void {
    this.router.navigate(['/book', flightId]);
  }
}
