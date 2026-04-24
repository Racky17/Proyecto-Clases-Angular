import { Injectable } from '@angular/core';
import { IProduct } from '../product';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class Product {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<IProduct[]> {
    console.log('Fetching products from API...');
    return this.http
      .get<IProduct[]>('http://localhost:3000/productos')
      .pipe(map((resp: any) => resp.productos));
  }

  generateProductCode(): string {
    const randomNum = Math.floor(Math.random() * (100 - 10) + 10);
    return `PROD${randomNum.toString().padStart(3, '0')}`;
  }

  saveProduct(product: IProduct): Observable<IProduct> {
    return this.http.post<IProduct>('http://localhost:3000/productos', product);
  }
}
