import { Component, OnInit, inject, signal } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { ProductSalesAnalytics } from '../../services/product-sales-analytics';

@Component({
  selector: 'app-product-sales',
  imports: [NgxChartsModule],
  templateUrl: './product-sales.html',
  styleUrl: './product-sales.css',
})
export class ProductSales implements OnInit {
  private productSalesAnalytics = inject(ProductSalesAnalytics);

  // Datos del gráfico: 5 productos de mejor ranking (desde la base de datos).
  saleData = signal<{ name: string; value: number }[]>([]);

  // Paleta de colores del gráfico (atributo scheme).
  colorScheme: any = {
    domain: ['#1565C0', '#03A9F4', '#FFA726', '#FFCC80', '#FFA07A'],
  };

  ngOnInit(): void {
    this.productSalesAnalytics.getSales().subscribe((data) => this.saleData.set(data));
  }
}
