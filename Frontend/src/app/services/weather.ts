import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class Weather {
  apiKey: string = '0fdc75ec0c0272291d0492e31159b6d4';
  URI: string =
    'api.openweathermap.org/data/2.5/weather?q=London,uk&APPID=99ff91450dfd260800b8bff463919a12';

  constructor(private http: HttpClient) {}

  getWeather(city: string, country: string) {
    console.log('Obteniendo clima para ${city}, ${country}');
    return this.http.get('${this.URI}${city},${country}');
  }
}
