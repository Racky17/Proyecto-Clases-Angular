import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../auth';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);

  error = signal<string>('');
  mensaje = signal<string>('');
  loading = signal<boolean>(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.mensaje.set('');
    this.loading.set(true);
    const { email } = this.form.getRawValue();

    this.auth.solicitarRecuperacion(email!).subscribe({
      next: (resp) => {
        this.loading.set(false);
        this.mensaje.set(resp.mensaje);
        this.form.reset();
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo procesar la solicitud. Intenta nuevamente.');
      },
    });
  }
}
