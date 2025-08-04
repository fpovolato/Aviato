import { Routes } from '@angular/router';
import { CartComponent } from './pages/cart/cart.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login.component';
import { UserPageComponent } from './pages/user-page.component';
import { SeatSelectionComponent } from './pages/seat-selection/seat-selection.component';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'user',
    component: UserPageComponent,
  },
  {
    path: '',
    pathMatch: 'full',
    component: HomeComponent,
  },
  {
    path: 'cart',
    component: CartComponent,
  },
  {
    path: 'seat-selection/:flightId',
    component: SeatSelectionComponent,
  },
];
