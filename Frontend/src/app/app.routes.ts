import { Routes } from '@angular/router';
import { Number } from './features/numbers/components/number/number';
import { Product } from './product/product';

export const routes: Routes = [
    { path: 'home', component:welcome, canActivate: [loginGuard] },
    { path: 'product', component:Product, canActivate: [loginGuard] },
    { path: 'numbers', component:Number, canActivate: [loginGuard] },
    { path: 'login', component:login, canActivate: [loginGuard] },
];
