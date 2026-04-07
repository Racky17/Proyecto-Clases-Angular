import { Component, Input, input} from '@angular/core';
import { IProduct } from '../../product';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-product-list',
  imports: [FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList {
datos = input<IProduct[]>([]);

  imageWidth = 50;
  imageHeight = 50;
  imageMargin = 10;
  showImage = true;

  toggleImage(): void {
    this.showImage = !this.showImage;
  }

  
}
