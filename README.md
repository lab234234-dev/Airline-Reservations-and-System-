# ✈️ SkyHigh Air: Enterprise Airline Reservation & Fleet Management System

[![Node.js](https://img.shields.io/badge/Node.js-v20.x-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express.js](https://img.shields.io/badge/Express.js-4.18-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com)
[![Angular](https://img.shields.io/badge/Angular-v18_Standalone-DD0031?style=for-the-badge&logo=angular&logoColor=white)](https://angular.dev)
[![MongoDB Atlas](https://img.shields.io/badge/MongoDB_Atlas-Cloud_Cluster-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Leaflet.js](https://img.shields.io/badge/Leaflet.js-Geospatial_Maps-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com)
[![License](https://img.shields.io/badge/License-Academic_Major_Project-blue?style=for-the-badge)](docs/MAJOR_PROJECT_DOCUMENTATION.html)

---

## 📌 1. Project Overview
**SkyHigh Air** is an enterprise-grade commercial airline passenger reservation, web check-in, and fleet intelligence platform engineered to simulate real-world aviation workflows adhering to **IATA** (International Air Transport Association) and **DGCA** standards.

Built on the modern **MEAN Stack (MongoDB Atlas Cloud, Express.js REST API, Angular 18 Standalone, Node.js)**, the system features dynamic 1-minute live flight scheduling, an interactive 4-state cabin seating matrix, Leaflet.js geodesic route mapping, digital boarding pass generation with scannable QR codes, physical airport counter desk ticketing, and an executive administration dashboard.

---

## 👥 Project Team & Group Details (3 Members)
| Member # | Name | Enrollment / Roll No. | Primary Role |
| :---: | :--- | :--- | :--- |
| **01** | **[Student Name 1]** *(Team Lead)* | `[Enrollment No 1]` | Frontend Architecture, Angular 18 UI & Leaflet Map Integration |
| **02** | **[Student Name 2]** | `[Enrollment No 2]` | Backend REST API, Controllers, JWT Security & Payment Gateway |
| **03** | **[Student Name 3]** | `[Enrollment No 3]` | MongoDB Atlas Database Design, Check-in, Boarding Pass & Testing |

- **Project Category:** Academic Major Project (B.Tech / B.E. / MCA / MSc IT)
- **Academic Year:** 2026 – 2027
- **Institution:** Department of Computer Engineering / Information Technology

---

## 🌟 Key Innovative Features

### ✈️ 1. Dynamic 1-Minute Live Flight Scheduling
- Continuous background generator updating flight status (`Scheduled`, `Boarding`, `In-Air`, `Landed`).
- Live countdown timers and domestic (Indian States) vs. international route filtering.

### 🗺️ 2. Interactive Leaflet.js Geospatial Route Map
- Real-time geodesic curved flight trajectories connecting origin and destination airports.
- OpenStreetMap vector tiles with one-click presets for **Zoom India** and **Zoom Global**.

### 💺 3. Interactive 4-State Cabin Seating Matrix
- Realistic narrow-body and wide-body airplane fuselage layouts.
- **Seat States:**
  - ⬜ **Available:** Open for reservation (turns 🟩 **Selected** on click).
  - 🟦 **Premium:** Extra legroom seating.
  - 🟥 **Booked:** Sold seats (strictly locked).
  - 🟨 **Held:** Concurrency protection holding seats during active checkout.

### 🎫 4. Web Check-in & Dynamic Boarding Pass with QR Code
- Instant check-in via 6-character PNR.
- Generates official boarding passes featuring:
  - **Live Flight Progress Indicator:** Visual aircraft bar tracking active flight journey.
  - **Client-Side Canvas QR Code:** Scannable payload containing passenger credentials for airport security gate scanners.

### 🏢 5. Physical Airport Counter Desk (`/counter-booking`)
- Dedicated portal for airline ground ticketing agents to book walk-in passenger tickets on the spot with cash/POS confirmation.

### 💳 6. Multi-Channel Payment Simulation & SkyMiles Rewards
- Simulated multi-mode checkout: Credit/Debit card with 3D interactive preview, UPI QR code, Net Banking.
- **SkyMiles Loyalty Program:** Automatically accrues 10% reward miles on every booking, redeemable at checkout.

### 💱 7. Real-Time Multi-Currency Engine
- Seamlessly converts ticket fares across **INR (₹)**, **USD ($)**, **EUR (€)**, **GBP (£)**, **AED (د.إ)**, and **JPY (¥)**.

### 📊 8. Executive Admin Fleet Intelligence Dashboard (`/admin`)
- Real-time operational metrics: Gross Revenue, Total Bookings, Seat Load Factor, and Flight CRUD Controls.

---

## 🛠️ Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Frontend Framework** | Angular 18 (Standalone) | TypeScript 5, RxJS, HTML5 Canvas QR, Glassmorphic CSS3 |
| **Mapping Engine** | Leaflet.js + OpenStreetMap | Interactive vector mapping with geodesic curved polylines |
| **Backend Framework** | Node.js (v20.x) + Express.js | RESTful JSON API, MVC Architecture |
| **Cloud Database** | MongoDB Atlas (v7.0) | Mongoose ODM, Cloud Replica Set, Atomic Transactions |
| **Security & Auth** | JWT & bcryptjs (10 rounds) | Stateless token verification, Express Rate Limiting, Helmet |
| **Unified Hosting** | Single Port 5000 | Node server hosts both REST API and compiled Angular SPA |

---

## 📁 Repository Directory Structure

```text
Airline Reservation system AWD/
│
├── angular-client/                    # Frontend Application (Angular 18 Standalone)
│   ├── dist/angular-client/browser/   # Production Compiled Bundle (HTML, JS, CSS, Assets)
│   ├── public/assets/images/          # Commercial Aviation Photographic Assets
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/            # Standalone Components (Navbar, Home, Flights, Checkin, etc.)
│   │   │   ├── guards/                # AuthGuard for Route Protection
│   │   │   ├── services/              # ApiService, AuthService, CurrencyService
│   │   │   ├── app.component.ts       # Dynamic Background Switching Logic
│   │   │   └── app.routes.ts          # Angular Client Routing
│   │   └── styles.css                 # Midnight Sapphire Theme & Glassmorphism Tokens
│   ├── angular.json                   # Angular CLI Build Configuration & Budgets
│   └── package.json                   # Client Dependencies & Build Scripts
│
├── server/                            # Backend REST API & SPA Hosting
│   ├── config/db.js                   # MongoDB Atlas Connection with Auto-Reconnect
│   ├── controllers/                   # Controllers (auth, flight, booking, payment, admin)
│   ├── middleware/                    # JWT Auth & Rate Limiter Middleware
│   ├── models/                        # Mongoose Schemas (User, Flight, Booking, CounterBooking)
│   ├── routes/                        # Express API Routes
│   ├── .env                           # Environment Configuration (PORT, MONGO_URI, JWT_SECRET)
│   ├── seed.js                        # Database Seeder (16 Live Domestic & Intl Flights)
│   ├── server.js                      # Main Express Entry Point (Hosts API + Angular SPA)
│   └── package.json                   # Backend Dependencies
│
├── docs/                              # Academic Verification & Presentation Dossier
│   ├── MAJOR_PROJECT_DOCUMENTATION.html   # Complete 23KB Academic Report (Printable PDF)
│   ├── TEAM_ROLE_DIVISION_AND_PRESENTATION_SCRIPT.html # 12-Min Master Presentation Flow
│   ├── MEMBER_1_PRESENTATION_GUIDE.html   # Personal Guide for Team Lead (UI, Map & Concurrency)
│   ├── MEMBER_2_PRESENTATION_GUIDE.html   # Personal Guide for Member 2 (Backend, JWT & Payments)
│   ├── MEMBER_3_PRESENTATION_GUIDE.html   # Personal Guide for Member 3 (DB, QR Pass & Admin)
│   ├── PROJECT_STRUCTURE_AND_WORKFLOW.html # File-by-File Technical Workflows Dossier
│   └── presentation/                  # PowerPoint Presentation Slides (.pptx)
│
├── HOW_TO_RUN.md                      # Quick Run & Testing Guide
└── README.md                          # Project Documentation (This File)
```

---

## 🚀 Quick Start Guide (How to Run Locally)

### Prerequisites
- Node.js (v18.x or v20.x LTS)
- NPM (v10.x)
- Active Internet Connection (for MongoDB Atlas Cloud Database and Leaflet Map tiles)

### 1. Unified Production Run (Recommended - Single Command)
Runs the entire full-stack application (both Frontend + Backend API) on a single port:
```bash
cd "server"
node server.js
```
👉 Open your browser at: **`http://localhost:5000`**

---

### 2. Development Mode (Live Hot-Reload)
If you want to edit Angular files with instant live reloading:

**Terminal 1 (Backend API):**
```bash
cd "server"
node server.js
```
*(Backend active on `http://localhost:5000/api`)*

**Terminal 2 (Angular Dev Client):**
```bash
cd "angular-client"
npm start
```
👉 Open your browser at: **`http://localhost:4200`**

---

## 🔑 Demo & Testing Credentials

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@skyhigh.com` | `admin123` | Full Access: Fleet CRUD, Analytics, Revenue Reports |
| **Passenger User** | `test@example.com` | `password123` | Flight Search, Seat Booking, Check-in, Boarding Pass |
| **New User** | *Register on `/register`* | *Custom* | Instant account creation with 250 welcome SkyMiles |

---

## 🌐 API Reference (REST Endpoints)

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health Check (Server & DB Status) | Public |
| `GET` | `/api/flights` | Retrieve all active domestic & intl flights | Public |
| `GET` | `/api/flights/:id` | Fetch flight details and 4-state seat matrix | Public |
| `POST` | `/api/auth/register` | Register new passenger account | Public |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT token | Public |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & SkyMiles | Authenticated |
| `POST` | `/api/bookings` | Book ticket, hold seats, and issue PNR | Authenticated |
| `GET` | `/api/bookings/my-bookings` | Retrieve user's booking history | Authenticated |
| `POST` | `/api/bookings/checkin-pnr` | Web check-in and issue QR boarding pass | Public |
| `POST` | `/api/airport/book-counter-ticket` | Walk-in counter ticket issuance | Ground Staff |
| `GET` | `/api/admin/stats` | Executive fleet analytics & revenue data | Admin Only |

---

## ☁️ Cloud Deployment Guide (Render / Railway)

Because the project is architected with **Unified Static Hosting**, it is 100% cloud-ready:
1. Connect your repository to **Render.com** or **Railway.app**.
2. **Build Command:**
   ```bash
   cd angular-client && npm install && npm run build && cd ../server && npm install
   ```
3. **Start Command:**
   ```bash
   cd server && node server.js
   ```
4. **Environment Variables:**
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGO_URI`: `mongodb+srv://AWD:AWD234234@cluster0.brveu1r.mongodb.net/airline-reservation?appName=Cluster0`
   - `JWT_SECRET`: `your_super_secure_jwt_secret_key_change_this_in_production_12345`

---

## 📄 Academic Project Verification Dossier
Detailed academic documentation, SRS specifications, DFD diagrams, and viva voce preparation files are located in the `docs/` folder:
- 📖 [Major Project Documentation Report](docs/MAJOR_PROJECT_DOCUMENTATION.html)
- 👥 [Team Role Division & Master Presentation Script](docs/TEAM_ROLE_DIVISION_AND_PRESENTATION_SCRIPT.html)
- 👑 [Member 1 (Team Lead) Presentation Guide](docs/MEMBER_1_PRESENTATION_GUIDE.html)
- ⚙️ [Member 2 (Backend & Security) Presentation Guide](docs/MEMBER_2_PRESENTATION_GUIDE.html)
- 🗄️ [Member 3 (Database & Check-in) Presentation Guide](docs/MEMBER_3_PRESENTATION_GUIDE.html)
- 📂 [Project Structure & Technical Workflows Dossier](docs/PROJECT_STRUCTURE_AND_WORKFLOW.html)

---

## 📜 License & Copyright
Developed as an Academic Major Project for the Academic Year 2026–2027.  
© 2026 SkyHigh Air Engineering Team. All rights reserved.
