import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { ApiService } from './api.service';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  profilePic?: string;
  phone?: string;
  dob?: string;
  gender?: string;
  idType?: string;
  idNumber?: string;
  seatPreference?: string;
  mealPreference?: string;
  rewardPoints?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();
  public loading$ = new BehaviorSubject<boolean>(true);

  constructor(private api: ApiService) {
    this.checkSession();
  }

  get currentUser(): User | null {
    return this.userSubject.value;
  }

  checkSession(): void {
    this.loading$.next(true);
    this.api.getMe().subscribe({
      next: (user) => {
        this.userSubject.next(user);
        this.loading$.next(false);
      },
      error: () => {
        this.userSubject.next(null);
        this.loading$.next(false);
      }
    });
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.api.login(credentials).pipe(
      tap((user) => {
        this.userSubject.next(user);
      })
    );
  }

  register(userData: any): Observable<User> {
    return this.api.register(userData).pipe(
      tap((user) => {
        this.userSubject.next(user);
      })
    );
  }

  updateProfile(profileData: any): Observable<User> {
    return this.api.updateProfile(profileData).pipe(
      tap((updated) => {
        this.userSubject.next(updated);
      })
    );
  }

  addRewardPoints(points: number): void {
    const current = this.currentUser;
    if (current) {
      const updatedPoints = (current.rewardPoints || 250) + points;
      const updated = { ...current, rewardPoints: updatedPoints };
      this.userSubject.next(updated);
      this.updateProfile({ rewardPoints: updatedPoints }).subscribe({
        error: () => {
          try {
            const raw = localStorage.getItem('currentUser');
            if (raw) {
              const u = JSON.parse(raw);
              u.rewardPoints = updatedPoints;
              localStorage.setItem('currentUser', JSON.stringify(u));
            }
          } catch (e) {}
        }
      });
    }
  }

  logout(): void {
    this.api.logout().subscribe({
      next: () => {
        this.userSubject.next(null);
      },
      error: () => {
        this.userSubject.next(null);
      }
    });
  }
}
