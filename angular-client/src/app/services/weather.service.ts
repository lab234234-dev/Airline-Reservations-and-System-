import { Injectable } from '@angular/core';

export interface CityWeather {
  temp: number;
  condition: string;
  icon: string;
  humidity: number;
  windSpeed: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private cityWeatherMap: Record<string, CityWeather> = {
    delhi: { temp: 24, condition: 'Sunny & Clear', icon: '☀️', humidity: 45, windSpeed: '12 km/h' },
    mumbai: { temp: 29, condition: 'Humid & Breezy', icon: '⛅', humidity: 76, windSpeed: '18 km/h' },
    bengaluru: { temp: 22, condition: 'Pleasant & Cool', icon: '🌤️', humidity: 55, windSpeed: '10 km/h' },
    bangalore: { temp: 22, condition: 'Pleasant & Cool', icon: '🌤️', humidity: 55, windSpeed: '10 km/h' },
    goa: { temp: 28, condition: 'Tropical Sunny', icon: '🏖️', humidity: 70, windSpeed: '14 km/h' },
    chennai: { temp: 31, condition: 'Warm Coastal', icon: '☀️', humidity: 78, windSpeed: '15 km/h' },
    kolkata: { temp: 27, condition: 'Hazy Sunshine', icon: '🌤️', humidity: 68, windSpeed: '9 km/h' },
    hyderabad: { temp: 26, condition: 'Partly Cloudy', icon: '⛅', humidity: 50, windSpeed: '11 km/h' },
    ahmedabad: { temp: 29, condition: 'Bright & Warm', icon: '☀️', humidity: 42, windSpeed: '13 km/h' },
    jaipur: { temp: 26, condition: 'Clear Skies', icon: '☀️', humidity: 38, windSpeed: '10 km/h' },
    dubai: { temp: 34, condition: 'Hot & Clear', icon: '🏜️', humidity: 40, windSpeed: '16 km/h' }
  };

  getWeatherForCity(cityName: string): CityWeather {
    if (!cityName) return { temp: 26, condition: 'Clear', icon: '☀️', humidity: 50, windSpeed: '12 km/h' };
    const key = cityName.toLowerCase().trim();
    for (const [cityKey, weather] of Object.entries(this.cityWeatherMap)) {
      if (key.includes(cityKey)) {
        return weather;
      }
    }
    return { temp: 25, condition: 'Mild Skies', icon: '🌤️', humidity: 52, windSpeed: '11 km/h' };
  }
}
