import { Component, computed, inject } from '@angular/core';
import { CartService } from '../../../services/cart.service';
import { PrimaryButtonComponent } from '../../../components/primary-button/primary-button.component';

@Component({
  selector: 'app-order-summary',
  imports: [PrimaryButtonComponent],
  template: `
    <div
      class="bg-white rounded-xl shadow-lg border border-gray-200 sticky top-8"
    >
      <!-- Header -->
      <div
        class="bg-gradient-to-r from-green-600 to-emerald-600 text-white p-6 rounded-t-xl"
      >
        <h2 class="text-2xl font-bold">Order Summary</h2>
        <p class="text-green-100 text-sm">
          {{ cartService.getCartCount() }} item(s) in cart
        </p>
      </div>

      <!-- Content -->
      <div class="p-6">
        @if (cartService.cart().length === 0) {
        <div class="text-center py-8">
          <div class="text-gray-400 mb-4">
            <svg
              class="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
          </div>
          <p class="text-gray-600">Your cart is empty</p>
        </div>
        } @else {
        <!-- Items Summary -->
        <div class="space-y-4 mb-6">
          @for (item of cartService.cart(); track item.flight.id) {
          <div
            class="flex justify-between items-start p-3 bg-gray-50 rounded-lg"
          >
            <div class="flex-1">
              <div class="font-medium text-gray-900">
                {{ item.flight.from }} → {{ item.flight.to }}
              </div>
              <div class="text-sm text-gray-600">
                {{ item.flight.airline }} • {{ item.passengers }} passenger(s)
              </div>
              @if (item.luggageQuantity > 0 || item.seatSelection) {
              <div class="text-xs text-blue-600 mt-1">
                @if (item.luggageQuantity > 0) {
                {{ item.luggageQuantity }} luggage } @if (item.luggageQuantity >
                0 && item.seatSelection) { + } @if (item.seatSelection) { Seat
                selection }
              </div>
              }
            </div>
            <div class="text-right">
              <div class="font-bold text-gray-900">
                {{ getItemTotal(item) }}€
              </div>
            </div>
          </div>
          }
        </div>

        <!-- Price Breakdown -->
        <div class="border-t pt-4 mb-6">
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-600">Base fare</span>
              <span>{{ getBaseFareTotal() }}€</span>
            </div>
            @if (getLuggageTotal() > 0) {
            <div class="flex justify-between text-blue-600">
              <span>Luggage fees</span>
              <span>+{{ getLuggageTotal() }}€</span>
            </div>
            } @if (getSeatSelectionTotal() > 0) {
            <div class="flex justify-between text-blue-600">
              <span>Seat selection</span>
              <span>+{{ getSeatSelectionTotal() }}€</span>
            </div>
            }
          </div>
        </div>

        <!-- Total -->
        <div class="border-t pt-4 mb-6">
          <div class="flex justify-between items-center">
            <span class="text-xl font-bold text-gray-900">Total</span>
            <span class="text-2xl font-bold text-green-600"
              >{{ total() }}€</span
            >
          </div>
        </div>

        <!-- Actions -->
        <div class="space-y-3">
          <app-primary-button label="Proceed to checkout" class="w-full" />
          <button
            class="w-full py-3 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            (click)="cartService.clearCart()"
          >
            Clear cart
          </button>
        </div>
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class OrderSummaryComponent {
  cartService = inject(CartService);

  total = computed(() => this.cartService.getCartTotal());

  getItemTotal(item: any): number {
    let total = item.flight.price * item.passengers;
    if (item.luggageQuantity > 0) {
      const luggagePrice = item.flight.additionalLuggagePrice || 30;
      total += luggagePrice * item.luggageQuantity * item.passengers;
    }
    if (item.seatSelection) total += 15 * item.passengers;
    return total;
  }

  getBaseFareTotal(): number {
    return this.cartService
      .cart()
      .reduce((total, item) => total + item.flight.price * item.passengers, 0);
  }

  getLuggageTotal(): number {
    return this.cartService.cart().reduce((total, item) => {
      if (item.luggageQuantity > 0) {
        const luggagePrice = item.flight.additionalLuggagePrice || 30;
        return total + luggagePrice * item.luggageQuantity * item.passengers;
      }
      return total;
    }, 0);
  }

  getSeatSelectionTotal(): number {
    return this.cartService
      .cart()
      .reduce(
        (total, item) =>
          total + (item.seatSelection ? 15 * item.passengers : 0),
        0
      );
  }
}
