import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Weather {
  apiKey: string = '0fdc75ec0c0272291d0492e31159b6d4';
  URI: string =
    'https://home.openweathermap.org/data/2.5/weather?appid=${this.apiKey}&units=metric&q=';

  constructor(private http: HttpClient) {}

  getWeather(city: string, country: string) {
    console.log('Obteniendo clima para ${city}, ${country}');
    return this.http.get('${this.URI}${city},${country}');
  }
}
