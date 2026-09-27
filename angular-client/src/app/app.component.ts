import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'SkyHigh Air - Airline Reservation System';
  currentBgClass = 'bg-home';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.updateBg(this.router.url);
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateBg(event.urlAfterRedirects || event.url);
    });
  }

  private updateBg(url: string): void {
    if (!url || url === '/' || url.startsWith('/?')) {
      this.currentBgClass = 'bg-home';
    } else if (url.startsWith('/flights')) {
      this.currentBgClass = 'bg-flights';
    } else if (url.startsWith('/book')) {
      this.currentBgClass = 'bg-book';
    } else if (url.startsWith('/checkin')) {
      this.currentBgClass = 'bg-checkin';
    } else {
      this.currentBgClass = 'bg-lounge';
    }
  }
}
