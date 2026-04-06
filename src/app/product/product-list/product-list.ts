import { Component,input } from '@angular/core';
import { IProduct } from '../../product';

@Component({
  selector: 'app-product-list',
  imports: [],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
products() {
throw new Error('Method not implemented.');
}
  product = input<IProduct[]>([], { alias: 'datos' });
  imageWidth = 50;
  imageHeight = 50;
  imageMargin = 10;
  showImage = false;

  toggleImage(): void {
    this.showImage = !this.showImage;
  }
}
