import { Injectable, signal } from '@angular/core';
import { Flight } from '../models/flights.model';

export interface CartItem {
  flight: Flight;
  passengers: number;
  luggageQuantity: number;
  seatSelection: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cart = signal<CartItem[]>([]);

  addToCart(flight: Flight) {
    // Add new flight to cart with default options
    const cartItem: CartItem = {
      flight,
      passengers: 1,
      luggageQuantity: 0,
      seatSelection: false,
    };
    this.cart.set([...this.cart(), cartItem]);
  }

  removeFromCart(id: number) {
    this.cart.set(this.cart().filter((item) => item.flight.id !== id));
  }

  updateCartItem(id: number, updates: Partial<CartItem>) {
    this.cart.set(
      this.cart().map((item) =>
        item.flight.id === id ? { ...item, ...updates } : item
      )
    );
  }

  clearCart() {
    this.cart.set([]);
  }

  getCartTotal(): number {
    return this.cart().reduce((total, item) => {
      let itemTotal = item.flight.price * item.passengers;

      // Add luggage cost if selected (using flight's additionalLuggagePrice or default 30€)
      if (item.luggageQuantity > 0) {
        const luggagePrice = item.flight.additionalLuggagePrice || 30;
        itemTotal += luggagePrice * item.luggageQuantity * item.passengers;
      }

      // Add seat selection cost if selected (assuming 15€ per passenger)
      if (item.seatSelection) {
        itemTotal += 15 * item.passengers;
      }

      return total + itemTotal;
    }, 0);
  }

  getCartCount(): number {
    return this.cart().length;
  }

  constructor() {}
}
