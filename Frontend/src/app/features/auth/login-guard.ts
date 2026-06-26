import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

// Guard de tipo CanActivate: permite el acceso solo si el usuario está autenticado.
export const loginGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (auth.isAutenticated()) {
    return true;
  }

  // Sin token => redirigimos al login.
  router.navigate(['/login']);
  return false;
};
