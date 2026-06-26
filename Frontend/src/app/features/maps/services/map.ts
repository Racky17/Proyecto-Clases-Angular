import { Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';

// Servicio Map: carga la API de Google Maps de forma dinámica una sola vez
// (patrón singleton), tal como indica el material 5.19c.
@Injectable({
  providedIn: 'root',
})
export class Map {
  private isLoaded = signal(false);
  private googleMapsApiKey = environment.googleMapsApiKey;

  loadApi(): Promise<void> {
    if (this.isLoaded()) return Promise.resolve();

    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      // Cargamos el script base limpio de Google Maps Platform.
      script.src = `https://maps.googleapis.com/maps/api/js?key=${this.googleMapsApiKey}&libraries=marker`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        this.isLoaded.set(true);
        resolve();
      };

      script.onerror = (err) => reject(err);
      document.body.appendChild(script);
    });
  }
}
