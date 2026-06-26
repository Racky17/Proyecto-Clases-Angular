import { AfterViewInit, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Auth } from '../auth';
import { environment } from '../../../../environments/environment';

// `google` lo inyecta el script de Google Identity Services (GIS).
declare const google: any;

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  error = signal<string>('');
  loading = signal<boolean>(false);

  // ¿Está configurado el Login con Google?
  hasGoogle = !!environment.googleClientId;
  // Contenedor donde GIS dibuja el botón.
  googleBtn = viewChild<ElementRef<HTMLDivElement>>('googleBtn');

  // Formulario reactivo con el modelo de datos del login: email y password.
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  ngAfterViewInit(): void {
    if (this.hasGoogle) {
      this.initGoogle();
    }
  }

  login(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.loading.set(true);
    const { email, password } = this.form.getRawValue();

    this.auth.login(email!, password!).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set('Credenciales inválidas. Intenta nuevamente.');
      },
    });
  }

  // ---------- Google Identity Services ----------
  private initGoogle(): void {
    this.loadGisScript()
      .then(() => {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: (resp: { credential: string }) => this.handleGoogleCredential(resp.credential),
        });
        const el = this.googleBtn()?.nativeElement;
        if (el) {
          google.accounts.id.renderButton(el, {
            theme: 'outline',
            size: 'large',
            width: 320,
            text: 'signin_with',
            locale: 'es',
          });
        }
      })
      .catch(() => this.error.set('No se pudo cargar el inicio de sesión con Google.'));
  }

  private handleGoogleCredential(credential: string): void {
    this.loading.set(true);
    this.error.set('');
    this.auth.loginWithGoogle(credential).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo iniciar sesión con Google.');
      },
    });
  }

  // Carga el script de GIS una sola vez.
  private loadGisScript(): Promise<void> {
    if (typeof google !== 'undefined' && google.accounts) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }
}
