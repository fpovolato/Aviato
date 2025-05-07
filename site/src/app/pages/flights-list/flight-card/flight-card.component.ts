import { Component, inject, input } from '@angular/core';
import { Flight } from '../../../models/flights.model';
import { PrimaryButtonComponent } from '../../../components/primary-button/primary-button.component';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-flight-card',
  imports: [
    PrimaryButtonComponent,
  ],
  template: `
    <div class="flex justify-between items-center bg-white shadow-md border rounded p-6 relative w-full max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-[90%]">
    <!-- Airline Info -->
      <div class="flex flex-col items-start w-1/5">
        <!--<img src="/assets/airline-logo.svg" alt="Airline Logo" class="w-6 h-6 mb-1">-->
        <span class="text-sm text-gray-600">Operated by</span>
        <span class="text-sm font-medium"> {{ flight().airline }} </span>
      </div>

      <!-- Departure and Arrival -->
      <div class="flex-1 text-center">
        <div class="flex items-center justify-center gap-4">
          <div class="text-xl font-semibold">{{ flight().departure }}</div>
          <div class="text-sm text-gray-500">{{ flight().number }}</div>
          <div class="text-xl font-semibold">{{ flight().arrival }}</div>
        </div>
        <div class="text-sm text-gray-500 mt-1">
          {{ flight().from }} → {{ flight().to }}
        </div>
        <div class="text-sm text-gray-500">duration</div>
      </div>

      <!-- Price and Button -->
      <div class="text-right w-1/4">
        <span class="text-sm font-bold" [class]="flight().seats ? 'text-black' : 'text-red-500'">
          @if (flight().seats === 0) {
            No seats left
          } @else if (flight().seats <= 10) {
            Only {{ flight().seats }} seats left!
          } @else {
            {{ flight().seats }} seats left
          }
        </span>
        <div class="text-lg font-bold text-blue-800">{{ flight().price + '€' }}</div>
        <app-primary-button label="Add to cart" class="mt-3" (btnClicked)="cartService.addToCart(flight())"/>
      </div>
    </div>
  `,
  styles: ``
})
export class FlightCardComponent {
  flight = input.required<Flight>();

  cartService = inject(CartService);
}
