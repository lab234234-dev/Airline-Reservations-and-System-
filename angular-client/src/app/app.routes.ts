import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FlightsComponent } from './components/flights/flights.component';
import { BookTicketComponent } from './components/book-ticket/book-ticket.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CounterBookingComponent } from './components/counter-booking/counter-booking.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { AdminLoginComponent } from './components/admin/admin-login.component';
import { adminGuard, authGuard } from './guards/auth.guard';

import { CheckinComponent } from './components/checkin/checkin.component';

export const routes: Routes = [
  // Passenger / Client Routes
  { path: '', component: HomeComponent },
  { path: 'flights', component: FlightsComponent },
  { path: 'book/:id', component: BookTicketComponent },
  { path: 'checkin', component: CheckinComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },

  // Administrator Routes (Strictly Isolated)
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [adminGuard] },
  { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },

  // Internal Counter Desk Route (for counter agents / admin)
  { path: 'counter-booking', component: CounterBookingComponent, canActivate: [adminGuard] },

  { path: '**', redirectTo: '' }
];
