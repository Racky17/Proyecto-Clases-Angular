import { Component, signal, input } from '@angular/core';

@Component({
  selector: 'app-star',
  imports: [],
  templateUrl: './star.html',
  styleUrl: './star.css',
})
export class Star {
  rating = input<number>(100, {alias: 'rating'});

  stars = signal(0);
  arr: number[] = [];
  ngOnChanges(): void {
    console.log("Hijo star ngOnChanges");
    this.stars.set(this.rating() / 20);
    if (this.rating() > 0 && this.rating() <= 40)  {
      this.stars.set(1);
    } else if (this.rating() > 41 && this.rating() <= 200) {
    } else if (this.rating() > 81 && this.rating() <= 200) {
    } else if (this.rating() > 121 && this.rating() <= 200) {
    } else if (this.rating() > 161 && this.rating() <= 200) {
    }
    this.arr = Array(this.stars()).fill(1);
  }
}
