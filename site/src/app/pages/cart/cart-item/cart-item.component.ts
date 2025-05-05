import { Component, input, signal, computed, inject } from '@angular/core';
import { Flight } from '../../../models/flights.model';
import { ButtonComponent } from '../../../components/button/button.component';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div
      class="flex flex-col bg-white shadow-md border rounded p-6 gap-4 w-full max-w-screen-md md:max-w-screen-lg lg:max-w-screen-xl xl:max-w-[90%]">

      <!-- Info volo -->
      <div class="flex justify-between items-center">
        <div class="flex flex-col items-start w-1/5">
          <span class="text-sm text-gray-600">Operated by</span>
          <span class="text-sm font-medium"> {{ item().airline }} </span>
        </div>

        <div class="flex-1 text-center">
          <div class="flex items-center justify-center gap-4">
            <div class="text-xl font-semibold">{{ item().departure }}</div>
            <div class="text-sm text-gray-500">{{ item().number }}</div>
            <div class="text-xl font-semibold">{{ item().arrival }}</div>
          </div>
          <div class="text-sm text-gray-500 mt-1">{{ item().from }} → {{ item().to }}</div>
          <div class="text-sm text-gray-500">duration</div>
        </div>

        <div class="text-right w-1/4 flex flex-col items-end gap-1">
          <span class="text-sm font-bold" [class]="item().seats ? 'text-black' : 'text-red-500'">
            @if (item().seats === 0) {
              No seats left
            } @else if (item().seats <= 10) {
              Only {{ item().seats }} seats left!
            } @else {
              {{ item().seats }} seats left
            }
          </span>
          <div class="text-lg font-bold text-blue-800">{{ totalPrice() }}€</div>

          <!-- Numero passeggeri -->
          <label class="text-sm mt-2">
            Passengers:
            <select (change)="onPassengerChange($event)" class="border rounded px-2 py-1 ml-2">
              @for (n of [1,2,3,4,5]; track n) {
                <option [value]="n" [selected]="n === passengers()">{{ n }}</option>
              }
            </select>
          </label>

          <!-- Remove -->
          <app-button class="mt-2" label="Remove" (btnClicked)="cartService.removeFromCart(item().id)" />
        </div>
      </div>

      <!-- Opzioni -->
      <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <label class="text-sm flex items-center gap-2">
          <input type="checkbox" [checked]="checkedBaggage()" (change)="onBaggageChange($event)" />
          Add checked baggage (+30€)
        </label>

        <label class="text-sm flex items-center gap-2">
          <input type="checkbox" [checked]="seatSelection()" (change)="onSeatChange($event)" />
          Seat selection
        </label>
      </div>
    </div>
  `,
  styles: ``
})
export class CartItemComponent {
  item = input.required<Flight>();
  cartService = inject(CartService);

  passengers = signal(1);
  checkedBaggage = signal(false);
  seatSelection = signal(false);

  onPassengerChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      this.passengers.set(+target.value);
    }
  }

  onBaggageChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.checkedBaggage.set(target.checked);
    }
  }

  onSeatChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.seatSelection.set(target.checked);
    }
  }

  totalPrice = computed(() =>
    this.item().price * this.passengers() + (this.checkedBaggage() ? 30 : 0)
  );
}
