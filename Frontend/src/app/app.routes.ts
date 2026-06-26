import { Routes } from '@angular/router';
import { loginGuard } from './features/auth/login-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'home',
    loadComponent: () => import('./features/welcome/welcome').then((m) => m.Welcome),
    canActivate: [loginGuard],
  },
  {
    path: 'products',
    loadComponent: () => import('./features/products/products').then((m) => m.Products),
    canActivate: [loginGuard],
  },
  {
    path: 'numbers',
    loadComponent: () =>
      import('./features/numbers/components/number/number').then((m) => m.Number),
    canActivate: [loginGuard],
  },
  {
    path: 'users',
    loadComponent: () => import('./features/users/components/user/user').then((m) => m.User),
    canActivate: [loginGuard],
  },
  {
    path: 'maps',
    loadComponent: () => import('./features/maps/components/map/map').then((m) => m.Map),
    canActivate: [loginGuard],
  },
  {
    path: 'products-sales',
    loadComponent: () =>
      import('./features/dashboards/components/product-sales/product-sales').then(
        (m) => m.ProductSales,
      ),
    canActivate: [loginGuard],
  },
  {
    path: 'products-pagination',
    loadComponent: () =>
      import('./features/products/components/product-pagination/product-pagination').then(
        (m) => m.ProductPagination,
      ),
    canActivate: [loginGuard],
  },
  { path: '**', redirectTo: 'login' },
];
