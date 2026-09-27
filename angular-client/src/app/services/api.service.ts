import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = (typeof window !== 'undefined' && window.location.port === '4200') ? 'http://localhost:5000/api' : '/api';

  constructor(private http: HttpClient) {}

  // Auth endpoints
  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData, { withCredentials: true });
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials, { withCredentials: true });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/logout`, {}, { withCredentials: true });
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, { withCredentials: true });
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/auth/profile`, profileData, { withCredentials: true });
  }

  // Flight endpoints
  getFlights(): Observable<any> {
    return this.http.get(`${this.baseUrl}/flights`);
  }

  getFlightById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/flights/${id}`);
  }

  searchFlights(params: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/flights`, { params });
  }

  // Booking endpoints
  bookTicket(bookingData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/bookings`, bookingData, { withCredentials: true });
  }

  getMyBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bookings/my-bookings`, { withCredentials: true });
  }

  completeCheckIn(bookingId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/bookings/${bookingId}/checkin`, {}, { withCredentials: true });
  }

  completeCheckInByPnr(pnr: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/bookings/checkin-pnr`, { pnr }, { withCredentials: true });
  }

  // Airport Counter Module
  bookCounterTicket(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/airport/book-counter-ticket`, payload, { withCredentials: true });
  }

  getCounterBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/airport/counter-bookings`, { withCredentials: true });
  }

  // Admin Endpoints
  getAdminStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/admin/stats`, { withCredentials: true });
  }

  addFlight(flightData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/flights`, flightData, { withCredentials: true });
  }

  updateFlight(id: string, flightData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/flights/${id}`, flightData, { withCredentials: true });
  }

  deleteFlight(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/flights/${id}`, { withCredentials: true });
  }

  getAllBookings(): Observable<any> {
    return this.http.get(`${this.baseUrl}/bookings`, { withCredentials: true });
  }
}
