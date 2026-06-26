import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IProduct } from '../../models/product';
import { ProductList } from './product-list/product-list';
import { Product } from './product';
import { Weather } from '../weather/weather';

@Component({
  selector: 'app-products',
  imports: [ProductList, FormsModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  private productService = inject(Product);
  private weatherService = inject(Weather);

  listFilter = signal<string>('');
  products = signal<IProduct[]>([]);
  weatherData = signal<any>(null);
  showChildren = signal(true);

  filteredProducts = computed(() =>
    this.products().filter((p) =>
      p.productName.toLowerCase().includes(this.listFilter().toLowerCase()),
    ),
  );

  ngOnInit(): void {
    this.cargarProductos();

    this.weatherService.getWeather('Chillan', 'CL').subscribe({
      next: (data) => this.weatherData.set(data),
      error: () => this.weatherData.set(null),
    });
  }

  cargarProductos(): void {
    this.productService.getProducts().subscribe((products) => this.products.set(products));
  }

  toggleChildren(): void {
    this.showChildren.update((value) => !value);
  }

  crearProducto(): void {
    const datos = {
      name: `Producto Nuevo ${Math.round(Math.random() * (100 - 1) + 1)}`,
      code: this.productService.generateProductCode(),
      date: '2024-01-01',
      price: Math.round(Math.random() * (40000 - 10000) + 10000),
      description: 'Descripción del producto nuevo',
      rate: Math.round(Math.random() * (200 - 1) + 1),
      image: 'sinimage.png',
    };

    this.productService.saveProduct(datos).subscribe(() => this.cargarProductos());
  }
}
