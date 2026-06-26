import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Product } from '../../products/product';

// Servicio de analítica de ventas (estructura del tutorial 5.19e).
// A diferencia del ejemplo del PDF (datos simulados), el Desafío Práctico exige
// obtener la información desde la base de datos: aquí se consume el servicio
// real de productos y se devuelven los 5 de mejor ranking.
@Injectable({
  providedIn: 'root',
})
export class ProductSalesAnalytics {
  private productService = inject(Product);

  getSales(): Observable<{ name: string; value: number }[]> {
    return this.productService.getProducts().pipe(
      map((products) =>
        [...products]
          .sort((a, b) => b.starRating - a.starRating)
          .slice(0, 5)
          .map((p) => ({ name: p.productName, value: p.starRating })),
      ),
    );
  }
}
