import {Component, inject, input} from '@angular/core';
import { Flight } from '../../../models/flights.model';
import {ButtonComponent} from '../../../components/button/button.component';
import {CartService} from '../../../services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div
      class="flex justify-between items-center bg-white shadow-md border rounded p-6 relative w-full max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-[90%]">
      <!-- Airline Info -->
      <div class="flex flex-col items-start w-1/5">
        <!--<img src="/assets/airline-logo.svg" alt="Airline Logo" class="w-6 h-6 mb-1">-->
        <span class="text-sm text-gray-600">Operated by</span>
        <span class="text-sm font-medium"> {{ item().airline }} </span>
      </div>

      <!-- Departure and Arrival -->
      <div class="flex-1 text-center">
        <div class="flex items-center justify-center gap-4">
          <div class="text-xl font-semibold">{{ item().departure }}</div>
          <div class="text-sm text-gray-500">{{ item().number }}</div>
          <div class="text-xl font-semibold">{{ item().arrival }}</div>
        </div>
        <div class="text-sm text-gray-500 mt-1">
          {{ item().from }} → {{ item().to }}
        </div>
        <div class="text-sm text-gray-500">duration</div>
      </div>

      <!-- Price and Button -->
      <div class="text-right w-1/4">
        <span class="text-sm font-bold" [class]="item().seats ? 'text-black' : 'text-red-500'">
          @if (item().seats === 0) {
            No seats left
          } @else if (item().seats <= 10) {
            Only {{ item().seats }} seats left!
          } @else {
            {{ item().seats }} seats left
          }
        </span>
        <div class="text-lg font-bold text-blue-800">{{ item().price + '€' }}</div>
        <app-button label="Remove" (btnClicked)="cartService.removeFromCart(item().id)"/>
      </div>
    </div>
  `,
  styles: ``
})
export class CartItemComponent {
  item = input.required<Flight>();

  cartService = inject(CartService);
}

