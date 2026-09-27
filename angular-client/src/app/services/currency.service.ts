import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  rate: number; // against INR
}

@Injectable({
  providedIn: 'root'
})
export class CurrencyService {
  private readonly currencies: Record<string, CurrencyConfig> = {
    INR: { code: 'INR', symbol: '₹', rate: 1 },
    USD: { code: 'USD', symbol: '$', rate: 0.012 },
    EUR: { code: 'EUR', symbol: '€', rate: 0.011 },
    AED: { code: 'AED', symbol: 'AED ', rate: 0.044 }
  };

  private currentCurrencySubject = new BehaviorSubject<CurrencyConfig>(this.currencies['INR']);
  public currentCurrency$ = this.currentCurrencySubject.asObservable();

  get current(): CurrencyConfig {
    return this.currentCurrencySubject.value;
  }

  get availableCurrencies(): CurrencyConfig[] {
    return Object.values(this.currencies);
  }

  setCurrency(code: string): void {
    if (this.currencies[code]) {
      this.currentCurrencySubject.next(this.currencies[code]);
      localStorage.setItem('skyhigh_currency', code);
    }
  }

  convert(amountInInr: number): number {
    return Math.round(amountInInr * this.current.rate);
  }

  format(amountInInr: number): string {
    const converted = this.convert(amountInInr);
    return `${this.current.symbol}${converted.toLocaleString()}`;
  }

  constructor() {
    const saved = localStorage.getItem('skyhigh_currency');
    if (saved && this.currencies[saved]) {
      this.setCurrency(saved);
    }
  }
}
