import { Component, input, signal, computed, inject } from '@angular/core';
import { CartItem } from '../../../services/cart.service';
import { ButtonComponent } from '../../../components/button/button.component';
import { CartService } from '../../../services/cart.service';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <div
      class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
    >
      <!-- Flight Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-4">
            <div
              class="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold">{{ item().flight.airline }}</h3>
              <p class="text-blue-100 text-sm">
                Flight {{ item().flight.number }}
              </p>
            </div>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold">{{ totalPrice() }}€</div>
            <div class="text-blue-100 text-sm">
              @if (item().passengers > 1) { {{ item().passengers }} passengers }
              @else { 1 passenger }
            </div>
          </div>
        </div>
      </div>

      <!-- Flight Details -->
      <div class="p-6">
        <!-- Route and Times -->
        <div class="flex items-center justify-between mb-6">
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">
                  {{ formatTime(item().flight.departureDate) }}
                </div>
                <div class="text-sm text-gray-600">
                  {{ item().flight.from }}
                </div>
              </div>

              <div class="flex-1 mx-4">
                <div class="flex items-center justify-center">
                  <div class="flex-1 h-0.5 bg-gray-300"></div>
                  <div class="mx-4">
                    <svg
                      class="w-6 h-6 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
                    </svg>
                  </div>
                  <div class="flex-1 h-0.5 bg-gray-300"></div>
                </div>
                <div class="text-center text-xs text-gray-500 mt-1">
                  {{ formatDate(item().flight.departureDate) }}
                </div>
              </div>

              <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">
                  {{ formatTime(item().flight.arrivalDate) }}
                </div>
                <div class="text-sm text-gray-600">{{ item().flight.to }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Seats Availability -->
        <div class="mb-6">
          <div
            class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <span class="text-sm font-medium text-gray-700"
              >Available Seats</span
            >
            <span
              class="text-sm font-bold px-3 py-1 rounded-full"
              [class]="
                item().flight.seats === 0
                  ? 'bg-red-100 text-red-800'
                  : item().flight.seats <= 10
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              "
            >
              @if (item().flight.seats === 0) { No seats left } @else if
              (item().flight.seats <= 10) { Only {{ item().flight.seats }} left!
              } @else { {{ item().flight.seats }} available }
            </span>
          </div>
        </div>

        <!-- Options -->
        <div class="space-y-4 mb-6">
          <!-- Passengers -->
          <div
            class="flex items-center justify-between p-4 bg-blue-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
                />
              </svg>
              <span class="font-medium text-gray-700">Passengers</span>
            </div>
            <select
              (change)="onPassengerChange($event)"
              class="border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              @for (n of [1,2,3,4,5]; track n) {
              <option [value]="n" [selected]="n === item().passengers">
                {{ n }}
              </option>
              }
            </select>
          </div>

          <!-- Luggage -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <svg
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                ></path>
              </svg>
              <div>
                <span class="font-medium text-gray-700">Checked Luggage</span>
                <p class="text-sm text-gray-500">
                  +{{ getLuggagePrice() }}€ per piece per passenger
                </p>
              </div>
            </div>
            <div class="flex items-center space-x-2">
              <button
                (click)="decreaseLuggage()"
                [disabled]="item().luggageQuantity === 0"
                class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M20 12H4"
                  ></path>
                </svg>
              </button>
              <span class="w-8 text-center font-medium">{{
                item().luggageQuantity
              }}</span>
              <button
                (click)="increaseLuggage()"
                [disabled]="item().luggageQuantity >= 5"
                class="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <svg
                  class="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          <!-- Seat Selection -->
          <div
            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
          >
            <div class="flex items-center space-x-3">
              <svg
                class="w-5 h-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                ></path>
              </svg>
              <div>
                <span class="font-medium text-gray-700">Seat Selection</span>
                <p class="text-sm text-gray-500">+15€ per passenger</p>
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                [checked]="item().seatSelection"
                (change)="onSeatChange($event)"
                class="sr-only peer"
              />
              <div
                class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
              ></div>
            </label>
          </div>
        </div>

        <!-- Price Breakdown -->
        <div class="bg-gray-50 rounded-lg p-4 mb-6">
          <h4 class="font-medium text-gray-700 mb-3">Price Breakdown</h4>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span
                >Base fare ({{ item().passengers }} ×
                {{ item().flight.price }}€)</span
              >
              <span>{{ item().flight.price * item().passengers }}€</span>
            </div>
            @if (item().luggageQuantity > 0) {
            <div class="flex justify-between text-blue-600">
              <span
                >Luggage ({{ item().passengers }} ×
                {{ item().luggageQuantity }} × {{ getLuggagePrice() }}€)</span
              >
              <span>+{{ getLuggagePrice() * item().luggageQuantity }}€</span>
            </div>
            } @if (item().seatSelection) {
            <div class="flex justify-between text-blue-600">
              <span>Seat selection ({{ item().passengers }} × 15€)</span>
              <span>+{{ 15 * item().passengers }}€</span>
            </div>
            }
            <div class="border-t pt-2 flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>{{ totalPrice() }}€</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex justify-end rounded-b-xl">
          <app-button
            label="Remove from cart"
            (btnClicked)="cartService.removeFromCart(item().flight.id)"
            class="bg-red-600 hover:bg-red-700 text-white"
          />
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class CartItemComponent {
  item = input.required<CartItem>();
  cartService = inject(CartService);

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB');
  }

  formatTime(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  onPassengerChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      this.cartService.updateCartItem(this.item().flight.id, {
        passengers: +target.value,
      });
    }
  }

  increaseLuggage() {
    if (this.item().luggageQuantity < 5) {
      this.cartService.updateCartItem(this.item().flight.id, {
        luggageQuantity: this.item().luggageQuantity + 1,
      });
    }
  }

  decreaseLuggage() {
    if (this.item().luggageQuantity > 0) {
      this.cartService.updateCartItem(this.item().flight.id, {
        luggageQuantity: this.item().luggageQuantity - 1,
      });
    }
  }

  onSeatChange(event: Event) {
    const target = event.target as HTMLInputElement | null;
    if (target) {
      this.cartService.updateCartItem(this.item().flight.id, {
        seatSelection: target.checked,
      });
    }
  }

  getLuggagePrice(): number {
    return this.item().flight.additionalLuggagePrice || 30;
  }

  totalPrice = computed(() => {
    let total = this.item().flight.price * this.item().passengers;

    if (this.item().luggageQuantity > 0) {
      const luggagePrice = this.item().flight.additionalLuggagePrice || 30;
      total += luggagePrice * this.item().luggageQuantity;
    }

    if (this.item().seatSelection) {
      total += 15 * this.item().passengers;
    }

    return total;
  });
}
