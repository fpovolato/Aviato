import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Flight } from '../models/flights.model';
import { environment } from '../../environments/environment';

export interface CartItem {
  flight: Flight;
  passengers: number;
  luggageQuantity: number;
  seatSelection: boolean;
  selectedSeat?: {
    row: string;
    number: number;
    seatClass: 'first' | 'economy';
  };
  ticketClass: 'first' | 'economy';
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cart = signal<CartItem[]>([]);
  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient) {
    this.loadCartFromBackend();
  }

  private loadCartFromBackend() {
    this.http.get<any>(this.apiUrl, { withCredentials: true }).subscribe({
      next: (backendCart) => {
        if (backendCart.items && backendCart.items.length > 0) {
          // Convert backend cart items to local cart items
          const localCartItems: CartItem[] = backendCart.items.map(
            (item: any) => {
              const flightData = item.flight;
              return {
                flight: {
                  id: parseInt(flightData._id || '0'),
                  mongoId: flightData._id,
                  number: flightData.flightNumber || 'Unknown',
                  airline: flightData.airline || 'Unknown',
                  from: flightData.from || 'Unknown',
                  to: flightData.to || 'Unknown',
                  departure:
                    flightData.departure ||
                    flightData.departureDate ||
                    'Unknown',
                  departureDate: flightData.departureDate || 'Unknown',
                  arrival:
                    flightData.arrival || flightData.arrivalDate || 'Unknown',
                  arrivalDate: flightData.arrivalDate || 'Unknown',
                  price: flightData.price || 0,
                  firstClassPrice:
                    flightData.firstClassPrice || (flightData.price || 0) * 1.5,
                  seats: flightData.seats || 100,
                  additionalLuggagePrice:
                    flightData.additionalLuggagePrice || 30,
                } as Flight,
                passengers: item.quantity,
                luggageQuantity: 0,
                seatSelection: false,
                ticketClass: 'economy',
              };
            }
          );
          this.cart.set(localCartItems);
        }
      },
      error: (error) => {
        console.error('Error loading cart from backend:', error);
      },
    });
  }

  addToCart(flight: Flight) {
    // Add to local cart first for immediate UI update
    const cartItem: CartItem = {
      flight,
      passengers: 1,
      luggageQuantity: 0,
      seatSelection: false,
      selectedSeat: undefined,
      ticketClass: 'economy',
    };
    this.cart.set([...this.cart(), cartItem]);

    // Then sync with backend
    this.http
      .post<any>(
        `${this.apiUrl}/items`,
        {
          flightId: flight.mongoId,
          quantity: 1,
        },
        { withCredentials: true }
      )
      .subscribe({
        next: () => {
          console.log('Cart item added to backend successfully');
        },
        error: (error) => {
          console.error('Error adding to cart backend:', error);
          // If backend fails, remove from local cart
          this.cart.set(
            this.cart().filter((item) => item.flight.id !== flight.id)
          );
        },
      });
  }

  removeFromCart(id: number) {
    // Remove from local cart first
    this.cart.set(this.cart().filter((item) => item.flight.id !== id));

    // Clear entire backend cart and reload (simplified approach)
    this.http.delete(this.apiUrl, { withCredentials: true }).subscribe({
      next: () => {
        // Reload cart from backend
        this.loadCartFromBackend();
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      },
    });
  }

  updateCartItem(id: number, updates: Partial<CartItem>) {
    this.cart.set(
      this.cart().map((item) =>
        item.flight.id === id ? { ...item, ...updates } : item
      )
    );
  }

  clearCart() {
    // Clear local cart first
    this.cart.set([]);

    // Clear from backend
    this.http.delete(this.apiUrl, { withCredentials: true }).subscribe({
      next: () => {
        console.log('Cart cleared from backend successfully');
      },
      error: (error) => {
        console.error('Error clearing cart:', error);
      },
    });
  }

  getCartTotal(): number {
    return this.cart().reduce((total, item) => {
      let itemTotal;

      if (item.ticketClass === 'first') {
        itemTotal = item.flight.firstClassPrice * item.passengers;
      } else {
        itemTotal = item.flight.price * item.passengers;
      }

      // Add luggage cost if selected (using flight's additionalLuggagePrice or default 30€)
      if (item.luggageQuantity > 0) {
        const luggagePrice = item.flight.additionalLuggagePrice || 30;
        itemTotal += luggagePrice * item.luggageQuantity;
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
}
