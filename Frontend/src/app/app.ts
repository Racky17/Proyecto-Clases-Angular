import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from './features/auth/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('COMPAÑIA ACME');
  // Estado de autenticación: controla la visibilidad del menú.
  protected readonly auth = inject(Auth);

  logout(): void {
    this.auth.logout();
  }
}
