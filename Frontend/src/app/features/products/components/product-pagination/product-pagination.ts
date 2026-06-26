import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgxPaginationModule } from 'ngx-pagination';
import { IProduct } from '../../../../models/product';
import { Product } from '../../product';
import { ImagePipe } from '../../../../shared/image-pipe';

// Componente de paginación (estructura del material 5.19b).
// A diferencia del ejemplo del PDF (datos faker simulados), aquí los productos
// provienen de la base de datos a través del servicio real.
@Component({
  selector: 'app-product-pagination',
  imports: [DatePipe, NgxPaginationModule, ImagePipe],
  templateUrl: './product-pagination.html',
  styleUrl: './product-pagination.css',
})
export class ProductPagination implements OnInit {
  private productService = inject(Product);

  products = signal<IProduct[]>([]);
  // Variables de paginación: p (página actual) y total (total de registros).
  p = signal(1);
  total = signal(0);
  itemsPerPage = 5;

  ngOnInit(): void {
    this.productService.getProducts().subscribe((data) => {
      this.products.set(data);
      this.total.set(data.length);
    });
  }
}
