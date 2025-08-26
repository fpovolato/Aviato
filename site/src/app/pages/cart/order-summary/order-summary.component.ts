import { Component, computed, inject } from '@angular/core';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { SeatReservationService } from '../../../services/seat-reservation.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-summary',
  imports: [],
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
                @if (item.ticketClass === 'first') { • First Class }
              </div>
              @if ((item.luggageQuantity > 0 &&
              item.flight.additionalLuggagePrice &&
              item.flight.additionalLuggagePrice > 0) || (item.selectedSeats &&
              item.selectedSeats.length > 0) || item.ticketClass === 'first') {
              <div class="text-xs text-blue-600 mt-1">
                @if (item.ticketClass === 'first') { First Class } @if
                (item.ticketClass === 'first' && (item.luggageQuantity > 0 ||
                (item.selectedSeats && item.selectedSeats.length > 0))) { + }
                @if (item.luggageQuantity > 0 &&
                item.flight.additionalLuggagePrice &&
                item.flight.additionalLuggagePrice > 0) {
                {{ item.luggageQuantity }} luggage } @if (item.luggageQuantity >
                0 && (item.selectedSeats && item.selectedSeats.length > 0)) { +
                } @if (item.selectedSeats && item.selectedSeats.length > 0) {
                Seat selection }
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
              <span class="text-gray-600">Economy fare</span>
              <span>{{ getEconomyFareTotal() }}€</span>
            </div>
            @if (getFirstClassTotal() > 0) {
            <div class="flex justify-between text-purple-600">
              <span>First class upgrade</span>
              <span>+{{ getFirstClassTotal() }}€</span>
            </div>
            } @if (getLuggageTotal() > 0) {
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
          <button
            (click)="proceedToCheckout()"
            [disabled]="isProcessing"
            class="w-full py-3 px-4 border border-gray-300 rounded-lg text-white bg-blue-500 hover:bg-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            @if (isProcessing) {
            <span class="flex items-center justify-center">
              <svg
                class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Processing...
            </span>
            } @else { Proceed to checkout }
          </button>
          <button
            class="w-full py-3 px-4 border border-gray-300 rounded-lg text-white bg-red-500 hover:bg-red-300 transition-colors"
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
  orderService = inject(OrderService);
  seatReservationService = inject(SeatReservationService);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);
  router = inject(Router);

  total = computed(() => this.cartService.getCartTotal());
  isProcessing = false;

  getItemTotal(item: any): number {
    let total;

    if (item.ticketClass === 'first') {
      total = item.flight.firstClassPrice * item.passengers;
    } else {
      total = item.flight.price * item.passengers;
    }

    if (
      item.luggageQuantity > 0 &&
      item.flight.additionalLuggagePrice &&
      item.flight.additionalLuggagePrice > 0
    ) {
      total += item.flight.additionalLuggagePrice * item.luggageQuantity;
    }
    // Add seat selection cost if seats are selected
    if (item.selectedSeats && item.selectedSeats.length > 0) {
      const seatTotal = item.selectedSeats.reduce(
        (sum: number, seat: { price: number }) => sum + seat.price,
        0
      );
      total += seatTotal;
    }
    return total;
  }

  getEconomyFareTotal(): number {
    return this.cartService.cart().reduce((total, item) => {
      return total + item.flight.price * item.passengers;
    }, 0);
  }

  getLuggageTotal(): number {
    return this.cartService.cart().reduce((total, item) => {
      if (
        item.luggageQuantity > 0 &&
        item.flight.additionalLuggagePrice &&
        item.flight.additionalLuggagePrice > 0
      ) {
        return (
          total + item.flight.additionalLuggagePrice * item.luggageQuantity
        );
      }
      return total;
    }, 0);
  }

  getFirstClassTotal(): number {
    return this.cartService.cart().reduce((total, item) => {
      if (item.ticketClass === 'first') {
        const firstClassUpcharge =
          item.flight.firstClassPrice - item.flight.price;
        return total + firstClassUpcharge * item.passengers;
      }
      return total;
    }, 0);
  }

  getSeatSelectionTotal(): number {
    return this.cartService.cart().reduce((total, item) => {
      if (item.selectedSeats && item.selectedSeats.length > 0) {
        const seatTotal = item.selectedSeats.reduce(
          (sum: number, seat: { price: number }) => sum + seat.price,
          0
        );
        return total + seatTotal;
      }

      // Fallback: check if seats are in flight.selectedSeats
      if (item.flight?.selectedSeats && item.flight.selectedSeats.length > 0) {
        const seatTotal = item.flight.selectedSeats.reduce(
          (sum: number, seat: { price: number }) => sum + seat.price,
          0
        );
        return total + seatTotal;
      }

      return total;
    }, 0);
  }

  async proceedToCheckout() {
    if (this.isProcessing) return;

    this.isProcessing = true;

    try {
      // Verifica che l'utente sia autenticato
      const currentUser = this.authService.currentUser;
      if (!currentUser) {
        this.notificationService.error(
          'Autenticazione Richiesta',
          "Devi essere autenticato per procedere con l'ordine"
        );
        this.router.navigate(['/login']);
        return;
      }

      // Prepara i dati dell'ordine
      const orderItems = this.cartService.cart().map((item) => ({
        flight: item.flight.mongoId as string,
        // Salva le informazioni complete del volo per evitare problemi di visualizzazione
        flightInfo: {
          flightNumber: item.flight.number,
          from: item.flight.from,
          to: item.flight.to,
          departureDate: item.flight.departureDate,
          arrivalDate: item.flight.arrivalDate,
          airline: {
            name: item.flight.airline,
            code: '', // Se disponibile
          },
          price: item.flight.price,
          firstClassPrice: item.flight.firstClassPrice,
          additionalLuggagePrice: item.flight.additionalLuggagePrice,
        },
        quantity: item.passengers,
        priceAtPurchase:
          item.ticketClass === 'first'
            ? item.flight.firstClassPrice
            : item.flight.price,
        additionalLuggage: item.luggageQuantity,
        additionalLuggagePrice:
          item.luggageQuantity > 0
            ? item.flight.additionalLuggagePrice
            : undefined,
        seatClass: item.ticketClass,
        passengers: item.passengers,
        selectedSeats: item.selectedSeats?.map((seat) => ({
          passengerNumber: seat.passengerNumber,
          seatRow: seat.seatRow, // Usa i campi corretti
          seatNumber: seat.seatNumber, // Usa i campi corretti
          seatClass: seat.seatClass,
          price: seat.price,
        })),
      }));

      // Prepara le prenotazioni dei posti
      const seatReservations = this.cartService
        .cart()
        .filter((item) => item.selectedSeats && item.selectedSeats.length > 0)
        .flatMap((item) =>
          item.selectedSeats!.map((seat) => ({
            flight: item.flight.mongoId as string,
            plane: 'default-plane-id', // Assumiamo un ID di default
            seatRow: seat.seatRow,
            seatNumber: seat.seatNumber,
            seatClass: seat.seatClass,
            price: seat.price,
          }))
        );

      const orderData = {
        items: orderItems,
        total: this.total(),
        paymentMethod: 'Credit Card' as const,
        paymentDetails: {
          method: 'Credit Card',
          status: 'paid',
        },
      };

      // Crea l'ordine
      const order = await this.orderService.createOrder(orderData).toPromise();

      if (order) {
        // Svuota il carrello
        this.cartService.clearCart();

        // Reindirizza alla pagina di conferma con l'ID dell'ordine
        this.router.navigate(['/order-confirmation', order._id]);
      }
    } catch (error: any) {
      console.error('Errore durante il checkout:', error);
      this.notificationService.error(
        'Errore durante il Checkout',
        'Si è verificato un errore durante il processo di checkout. Riprova.'
      );
    } finally {
      this.isProcessing = false;
    }
  }
}
