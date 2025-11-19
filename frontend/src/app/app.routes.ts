import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent)
  },
  {
    path: 'jobs',
    canMatch: [authGuard],
    loadComponent: () => import('./features/jobs/jobs.component').then((m) => m.JobsComponent)
  },
  {
    path: 'menu',
    canMatch: [authGuard],
    loadComponent: () => import('./features/menu/menu.component').then((m) => m.MenuComponent)
  },
  {
    path: 'auth',
    canMatch: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login.component').then((m) => m.LoginComponent)
  },
  {
    path: 'admin',
    canMatch: [authGuard],
    loadComponent: () => import('./features/admin/admin.component').then((m) => m.AdminComponent)
  },
  {
    path: '**',
    redirectTo: 'auth'
  }
];
