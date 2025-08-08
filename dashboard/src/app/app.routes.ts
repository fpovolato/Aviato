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
    path: 'signup',
    loadComponent: () =>
      import('./auth/signup.component').then((m) => m.SignupComponent),
  },
  {
    path: '',
    loadComponent: () =>
      import('./components/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee', 'manager'] },
  },
  {
    path: 'user',
    loadComponent: () =>
      import('./components/user-page/user-page.component').then(
        (m) => m.UserPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee', 'manager'] },
  },
  {
    path: 'flights',
    loadComponent: () =>
      import('./components/flights-page/flights-page.component').then(
        (m) => m.FlightsPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee', 'manager'] },
  },
  {
    path: 'flights/create',
    loadComponent: () =>
      import('./components/flights-page/flights-create.component').then(
        (m) => m.FlightsCreateComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee', 'manager'] },
  },
  {
    path: 'routes',
    loadComponent: () =>
      import('./components/routes-page/routes-page.component').then(
        (m) => m.RoutesPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee', 'manager'] },
  },
  {
    path: 'routes/create',
    loadComponent: () =>
      import('./components/routes-page/routes-create.component').then(
        (m) => m.RoutesCreateComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'employee', 'manager'] },
  },
  {
    path: 'users',
    loadComponent: () =>
      import('./components/users-page/users-page.component').then(
        (m) => m.UsersPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'manager'] },
  },
  {
    path: 'users/create',
    loadComponent: () =>
      import('./components/users-page/users-create.component').then(
        (m) => m.UsersCreateComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'users/create-employee',
    loadComponent: () =>
      import('./components/users-page/employee-create.component').then(
        (m) => m.EmployeeCreateComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'manager'] },
  },
  {
    path: 'users/create-manager',
    loadComponent: () =>
      import('./components/users-page/manager-create.component').then(
        (m) => m.ManagerCreateComponent
      ),
  },
  {
    path: 'first-login',
    loadComponent: () =>
      import('./auth/first-login.component').then((m) => m.FirstLoginComponent),
    canActivate: [AuthGuard],
  },
  {
    path: 'airlines',
    loadComponent: () =>
      import('./components/airlines-page/airlines-page.component').then(
        (m) => m.AirlinesPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'planes',
    loadComponent: () =>
      import('./components/planes-page/planes-page.component').then(
        (m) => m.PlanesPageComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'manager'] },
  },
  {
    path: 'planes/:id/seats',
    loadComponent: () =>
      import('./components/planes-page/plane-seats.component').then(
        (m) => m.PlaneSeatsComponent
      ),
    canActivate: [AuthGuard],
    data: { roles: ['admin', 'manager'] },
  },
  { path: '**', redirectTo: '' },
];
