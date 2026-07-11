import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },
  { 
    path: 'purchase-bill', 
    loadComponent: () => import('./features/purchase-bill/purchase-bill').then(m => m.PurchaseBill),
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: '/login' }
];
