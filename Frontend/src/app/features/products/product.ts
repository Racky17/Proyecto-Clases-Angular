import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IProduct } from '../../models/product';
import { environment } from '../../../environments/environment';

// Estructura del payload que espera el backend al crear/actualizar un producto.
export interface ProductPayload {
  name: string;
  code: string;
  date: string;
  price: number;
  description: string;
  rate: number;
  image: string;
}

@Injectable({
  providedIn: 'root',
})
export class Product {
  private http = inject(HttpClient);

  // El token JWT lo adjunta automáticamente authInterceptor (ver app.config.ts).

  getProducts(): Observable<IProduct[]> {
    return this.http
      .get<{ ok: boolean; productos: IProduct[] }>(`${environment.apiUrl}/productos`)
      .pipe(map((resp) => resp.productos));
  }

  generateProductCode(): string {
    const randomNum = Math.floor(Math.random() * (100 - 10) + 10);
    return `PROD${randomNum.toString().padStart(3, '0')}`;
  }

  saveProduct(product: ProductPayload): Observable<any> {
    return this.http.post(`${environment.apiUrl}/productos`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${environment.apiUrl}/productos/${id}`);
  }
}
