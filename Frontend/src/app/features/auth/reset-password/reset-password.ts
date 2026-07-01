import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../auth';

// Validador a nivel de grupo: password y confirmación deben coincidir.
function passwordsIguales(group: AbstractControl): ValidationErrors | null {
  const password = group.get('password')?.value;
  const confirmar = group.get('confirmar')?.value;
  return password === confirmar ? null : { noCoincide: true };
}

@Component({
  selector: 'app-reset-password',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css',
})
export class ResetPassword {
  private fb = inject(FormBuilder);
  private auth = inject(Auth);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Token temporal recibido en la URL (?token=...).
  private token = this.route.snapshot.queryParamMap.get('token') ?? '';
  tokenPresente = !!this.token;

  error = signal<string>('');
  mensaje = signal<string>('');
  loading = signal<boolean>(false);

  form = this.fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmar: ['', [Validators.required]],
    },
    { validators: passwordsIguales },
  );

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set('');
    this.mensaje.set('');
    this.loading.set(true);
    const { password } = this.form.getRawValue();

    this.auth.resetearPassword(this.token, password!).subscribe({
      next: (resp) => {
        this.loading.set(false);
        this.mensaje.set(resp.mensaje + ' Redirigiendo al inicio de sesión...');
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.mensaje ?? 'No se pudo restablecer la contraseña.');
      },
    });
  }
}
