import { Component, signal, input } from '@angular/core';

@Component({
  selector: 'app-star',
  imports: [],
  templateUrl: './star.html',
  styleUrl: './star.css',
})
export class Star {
  // rating va de 0 a 200; cada estrella equivale a 40 puntos (5 estrellas máximo).
  rating = input<number>(100);

  stars = signal(0);
  arr: number[] = [];

  ngOnChanges(): void {
    let count = Math.round(this.rating() / 40);
    count = Math.max(0, Math.min(5, count));
    this.stars.set(count);
    this.arr = Array(count).fill(1);
  }
}
