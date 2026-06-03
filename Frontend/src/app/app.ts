import { Component, computed, signal } from '@angular/core';
import { IProduct } from './product';
import { ProductList } from './product/product-list/product-list';
import { FormsModule } from '@angular/forms';
import { Product } from './product/product';
import { Weather } from './services/weather';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [ProductList, FormsModule],
})
export class App {
  protected readonly title = signal('COMPAÑIA ACME');
  listFilter = signal<string>('');
  products = signal<IProduct[]>([]);
  weatherData = signal<any>(null);

  constructor(
    private productSevice: Product,
    private weatherService: Weather,
  ) {}

  ngOnInit(): void {
    this.productSevice.getProducts().subscribe((products: IProduct[]) => {
      this.products.set(products);
      console.log(this.products());
    });

    this.weatherService.getWeather('Chillan', 'CL').subscribe((data) => {
      console.log(data);
      this.weatherData.set(data);
    });
  }

  filteredProducts = computed(() =>
    this.products().filter((p) =>
      p.productName.toLowerCase().includes(this.listFilter().toLowerCase()),
    ),
  );

  showChildren = signal(true);
  toggleChildren(): void {
    this.showChildren.update((value) => !value);
  }

  crearProducto() {
    let datos: any = {
      name: `Producto Nuevo ${Math.round(Math.random() * (100 - 1) + 1)}`,
      code: this.productSevice.generateProductCode(),
      date: '2024-01-01',
      price: Math.round(Math.random() * (40000 - 10000) + 10000),
      description: 'Descripción del producto nuevo',
      rate: Math.round(Math.random() * (200 - 1) + 1),
      image: 'gamuza_hush.jpg',
    };

    this.crearProducto(datos);
  }
}
