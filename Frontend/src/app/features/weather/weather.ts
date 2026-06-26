import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Weather {
  private http = inject(HttpClient);
  private URI = 'https://api.openweathermap.org/data/2.5/weather';

  getWeather(city: string, country: string): Observable<any> {
    const url = `${this.URI}?q=${city},${country}&units=metric&appid=${environment.weatherApiKey}`;
    return this.http.get(url);
  }
}
