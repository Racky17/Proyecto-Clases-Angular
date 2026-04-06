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

}
