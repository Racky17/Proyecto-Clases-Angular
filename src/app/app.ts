import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { allIcons } from 'ngx-bootstrap-icons';
import { IProduct } from './product';
import { ProductList } from "./product/product-list/product-list";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css',
  imports: [ProductList]
})
export class App {
  protected readonly title = signal('ACME Company Catalog');

  products: IProduct[] = [{
    
    productId: 1,
    productName: "Zapatillas de lona",
    productCode: "PROD001",
    releaseDate: "2023-01-01",
    price: 40000,
    description: "Zapatillas de lona cómodas y duraderas, marca Convers.",
    startRating: 4,
    imageUrl: "zapatilla de lona.png"
  },
  {
    productId: 2,
    productName: "Smartphone Galaxy Z",
    productCode: "TEC-002",
    releaseDate: "2023-05-15",
    price: 850000,
    description: "Pantalla AMOLED de 6.7 pulgadas, 128GB de almacenamiento y cámara pro.",
    startRating: 5,
    imageUrl: "Smartphone Galaxy Z.png"
  },
  {
    productId: 3,
    productName: "Cafetera Express Pro",
    productCode: "HOG-045",
    releaseDate: "2023-11-20",
    price: 120000,
    description: "Cafetera de acero inoxidable con espumador de leche integrado.",
    startRating: 4,
    imageUrl: "Cafetera Express Pro.png"
  },
  {
    productId: 4,
    productName: "Auriculares Noise Cancelling",
    productCode: "AUD-101",
    releaseDate: "2024-01-10",
    price: 250000,
    description: "Cancelación de ruido activa y batería de hasta 40 horas de duración.",
    startRating: 5,
    imageUrl: "Auriculares Noise Cancelling.png"
  },
  {
    productId: 5,
    productName: "Mochila Impermeable",
    productCode: "ACC-088",
    releaseDate: "2023-08-05",
    price: 45000,
    description: "Capacidad de 30L con compartimento acolchado para laptop de 15\".",
    startRating: 3,
    imageUrl: "Mochila Impermeable.png"
  },
  {
    productId: 6,
    productName: "Reloj Inteligente Fit",
    productCode: "TEC-009",
    releaseDate: "2024-02-28",
    price: 95000,
    description: "Monitoreo de ritmo cardíaco, GPS integrado y resistencia al agua 5ATM.",
    startRating: 4,
    imageUrl: "Reloj Inteligente Fit.png"
  }];

}
