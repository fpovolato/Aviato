import {Routes} from '@angular/router';
import {FlightsListComponent} from './pages/flights-list/flights-list.component';
import {CartComponent} from './pages/cart/cart.component';

export const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  component: FlightsListComponent
},
  {
    path: 'cart',
    component: CartComponent,
  },
];
