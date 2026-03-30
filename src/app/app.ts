import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { allIcons } from 'ngx-bootstrap-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('ACME Company Catalog');
}
