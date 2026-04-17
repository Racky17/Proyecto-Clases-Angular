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
    this.products.set(this.productSevice.getProducts());

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
}
