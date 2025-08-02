import { Component, inject } from '@angular/core';
import { CartService } from '../../services/cart.service';
import { CartItemComponent } from './cart-item/cart-item.component';
import { OrderSummaryComponent } from './order-summary/order-summary.component';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart',
  imports: [CartItemComponent, OrderSummaryComponent, RouterLink],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p class="text-gray-600">
            Review your flight selections and customize your options
          </p>
        </div>

        <!-- Cart Content -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Cart Items -->
          <div class="lg:col-span-2">
            @if (cartService.cart().length === 0) {
            <div class="bg-white rounded-xl shadow-lg p-8 text-center">
              <div class="text-gray-400 mb-4">
                <svg
                  class="w-16 h-16 mx-auto"
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
              <h3 class="text-xl font-semibold text-gray-900 mb-2">
                Your cart is empty
              </h3>
              <p class="text-gray-600 mb-6">Add some flights to get started!</p>
              <button
                routerLink="/"
                class="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Flights
              </button>
            </div>
            } @else {
            <div class="space-y-6">
              @for (item of cartService.cart(); track item.flight.id) {
              <app-cart-item [item]="item" />
              }
            </div>
            }
          </div>

          <!-- Order Summary -->
          <div class="lg:col-span-1">
            <app-order-summary />
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class CartComponent {
  cartService = inject(CartService);
}
