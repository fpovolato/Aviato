// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { AuthGuard } from './auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee'] },
  },
  {
    path: 'user',
    loadComponent: () =>
      import('./components/user-page/user-page.component').then(
        (m) => m.UserPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee'] },
  },
  {
    path: 'flights',
    loadComponent: () =>
      import('./components/flights-page/flights-page.component').then(
        (m) => m.FlightsPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee'] },
  },
  {
    path: 'flights/create',
    loadComponent: () =>
      import('./components/flights-page/flights-create.component').then(
        (m) => m.FlightsCreateComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee'] },
  },
  {
    path: 'routes',
    loadComponent: () =>
      import('./components/routes-page/routes-page.component').then(
        (m) => m.RoutesPageComponent
      ),
  },
  {
    path: 'routes/create',
    loadComponent: () =>
      import('./components/routes-page/routes-create.component').then(
        (m) => m.RoutesCreateComponent
      ),
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/users-page/users-page.component').then(
        (m) => m.UsersPageComponent
      ),
  },
  {
    path: 'users/create',
    loadComponent: () =>
      import('./components/users-page/users-create.component').then(
        (m) => m.UsersCreateComponent
      ),
  },
  {
    path: 'airlines',
    loadComponent: () =>
      import('./components/airlines-page/airlines-page.component').then(
        (m) => m.AirlinesPageComponent
      ),
  },
  {
    path: 'planes',
    loadComponent: () =>
      import('./components/planes-page/planes-page.component').then(
        (m) => m.PlanesPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'planes/:id/seats',
    loadComponent: () =>
      import('./components/planes-page/plane-seats.component').then(
        (m) => m.PlaneSeatsComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  { path: '**', redirectTo: '' },
];
