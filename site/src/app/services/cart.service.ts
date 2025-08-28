import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Flight } from '../models/flights.model';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

export interface CartItem {
  flight: Flight;
  passengers: number;
  luggageQuantity: number;
  seatSelection: boolean;
  selectedSeats?: {
    passengerNumber: number;
    seatRow: string; // Aggiornato per essere coerente con il backend
    seatNumber: number; // Aggiornato per essere coerente con il backend
    seatClass: 'first' | 'economy';
    price: number;
  }[];
  ticketClass: 'first' | 'economy';
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cart = signal<CartItem[]>([]);
  private pendingCartItem = signal<Flight | null>(null);
  private apiUrl = `${environment.apiUrl}/cart`;

  constructor(private http: HttpClient, private router: Router) {
    this.loadCartFromBackend();
  }

  private loadCartFromBackend() {
    this.http.get<any>(this.apiUrl, { withCredentials: true }).subscribe({
      next: (backendCart) => {
        console.log('Backend cart response:', backendCart);
        if (backendCart.items && backendCart.items.length > 0) {
          // Convert backend cart items to local cart items
          const localCartItems: CartItem[] = backendCart.items.map(
            (item: any) => {
              const flightData = item.flight;
              
              // Handle populated route data for from/to fields
              let from = 'Unknown';
              let to = 'Unknown';
              let airlineName = 'Unknown';
              
              if (flightData.route) {
                if (flightData.route.departureAirport?.iata) {
                  from = flightData.route.departureAirport.iata;
                } else if (flightData.route.departureAirport?.city) {
                  from = flightData.route.departureAirport.city;
                }
                
                if (flightData.route.arrivalAirport?.iata) {
                  to = flightData.route.arrivalAirport.iata;
                } else if (flightData.route.arrivalAirport?.city) {
                  to = flightData.route.arrivalAirport.city;
                }
              }
              
              // Handle populated airline data
              if (flightData.airline?.name) {
                airlineName = flightData.airline.name;
              } else if (typeof flightData.airline === 'string') {
                airlineName = flightData.airline;
              }
              
              return {
                flight: {
                  id: parseInt(flightData._id || '0'),
                  mongoId: flightData._id,
                  number: flightData.flightNumber || 'Unknown',
                  airline: airlineName,
                  from: from,
                  to: to,
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
                  seats: flightData.seatsAvailable || flightData.seats || 100,
                  additionalLuggagePrice:
                    flightData.additionalLuggagePrice || 0,
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
        console.error('Full error details:', error);
        // Clear cart on error to prevent stale data
        this.cart.set([]);
      },
    });
  }

  addToCart(flight: Flight, isAuthenticated: boolean = true) {
    if (!isAuthenticated) {
      // Store the flight for later and redirect to login
      this.setPendingCartItem(flight);
      this.router.navigate(['/login'], { 
        queryParams: { 
          returnUrl: '/', 
          pendingItem: 'true'
        } 
      });
      return;
    }

    // Add to local cart first for immediate UI update
    const cartItem: CartItem = {
      flight,
      passengers: 1,
      luggageQuantity: 0,
      seatSelection: false,
      selectedSeats: undefined,
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
          // Cart item added to backend successfully
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
      this.cart().map((item) => {
        if (item.flight.id === id) {
          return { ...item, ...updates };
        }
        return item;
      })
    );
  }

  clearCart() {
    // Clear local cart first
    this.cart.set([]);

    // Clear from backend
    this.http.delete(this.apiUrl, { withCredentials: true }).subscribe({
      next: () => {
        // Cart cleared from backend successfully
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

      // Add luggage cost if selected (using flight's additionalLuggagePrice)
      if (item.luggageQuantity > 0 && this.isLuggageAvailable(item.flight)) {
        const luggagePrice = item.flight.additionalLuggagePrice || 0;
        itemTotal += luggagePrice * item.luggageQuantity;
      }

      // Add seat selection cost if selected
      if (item.selectedSeats && item.selectedSeats.length > 0) {
        const seatTotal = item.selectedSeats.reduce(
          (sum, seat) => sum + seat.price,
          0
        );
        itemTotal += seatTotal;
      }

      return total + itemTotal;
    }, 0);
  }

  getCartCount(): number {
    return this.cart().length;
  }

  isLuggageAvailable(flight: Flight): boolean {
    return (flight.additionalLuggagePrice || 0) > 0;
  }

  // Methods for handling pending cart items
  setPendingCartItem(flight: Flight): void {
    this.pendingCartItem.set(flight);
    // Store in sessionStorage for persistence across page reloads
    sessionStorage.setItem('pendingCartItem', JSON.stringify(flight));
  }

  getPendingCartItem(): Flight | null {
    let pending = this.pendingCartItem();
    if (!pending) {
      // Try to restore from sessionStorage
      const stored = sessionStorage.getItem('pendingCartItem');
      if (stored) {
        try {
          pending = JSON.parse(stored);
          this.pendingCartItem.set(pending);
        } catch (error) {
          console.error('Error parsing pending cart item from storage:', error);
          sessionStorage.removeItem('pendingCartItem');
        }
      }
    }
    return pending;
  }

  processPendingCartItem(): boolean {
    const pendingItem = this.getPendingCartItem();
    if (pendingItem) {
      this.addToCart(pendingItem, true); // Force add as user is now authenticated
      this.clearPendingCartItem();
      return true;
    }
    return false;
  }

  clearPendingCartItem(): void {
    this.pendingCartItem.set(null);
    sessionStorage.removeItem('pendingCartItem');
  }
}
