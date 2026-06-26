import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'token';

interface LoginResponse {
  ok: boolean;
  token: string;
  usuario?: { id: number; email: string; nombre: string };
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Fuente de verdad del estado de autenticación (señal).
  isAutenticated = signal<boolean>(this.hasToken());

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/login`, { email, password })
      .pipe(tap((resp) => this.persistSession(resp)));
  }

  // Inicia sesión con la credencial (ID token) que devuelve Google Identity.
  // El backend la verifica y responde con nuestro propio JWT.
  loginWithGoogle(credential: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/google`, { credential })
      .pipe(tap((resp) => this.persistSession(resp)));
  }

  // Guarda el token y marca la sesión como activa.
  private persistSession(resp: LoginResponse): void {
    if (resp.ok && resp.token) {
      localStorage.setItem(TOKEN_KEY, resp.token);
      this.isAutenticated.set(true);
      this.router.navigate(['/home']);
    }
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.isAutenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  private hasToken(): boolean {
    return !!localStorage.getItem(TOKEN_KEY);
  }
}
