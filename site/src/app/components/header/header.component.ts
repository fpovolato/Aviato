import {Component, computed, inject} from '@angular/core';
import {PrimaryButtonComponent} from '../primary-button/primary-button.component';
import {RouterLink} from '@angular/router';
import {CartService} from '../../services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    PrimaryButtonComponent,
    RouterLink
  ],
  template: `
    <div class="bg-slate-100 px-4 py-3 shadow-md flex justify-between items-center">
      <button class="text-xl" routerLink="/"> Aviato</button>
      <div class="ml-auto flex gap-3 items-center">
        <app-primary-button label="Log In" routerLink="#"/>
        <app-primary-button label="{{ cartLabel() }}" routerLink="/cart"/>
      </div>
    </div>
  `,
  styles: ``
})
export class HeaderComponent {
  cartService = inject(CartService);

  cartLabel = computed(() => `Cart (${this.cartService.cart().length})`);
}
