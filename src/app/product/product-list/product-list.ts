import { Component, Input, input } from '@angular/core';
import { IProduct } from '../../product';
import { FormsModule } from '@angular/forms';
import { Star } from './star/star';
import { DatePipe } from '@angular/common';
import { ImagePipe } from '../../shared/image-pipe';

@Component({
  selector: 'app-product-list',
  imports: [FormsModule, Star, DatePipe, ImagePipe],
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

  constructor() {
    console.log('Hijo: constructor');
  }

  ngOnInit(): void {
    console.log('Hijo: ngOnInit');
  }

  ngOnChanges(): void {
    console.log('Hijo: ngOnChanges');
  }

  ngOnDestroy(): void {
    console.log('Hijo: ngOnDestroy');
  }
}
