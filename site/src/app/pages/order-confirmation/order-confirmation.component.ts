import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import {
  OrderService,
  Order,
  OrderItem,
  FlightInfo,
} from '../../services/order.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-4 sm:py-8"
    >
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="text-center mb-6 sm:mb-8">
          <div class="mb-4">
            <svg
              class="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
          </div>
          <h1 class="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
            Ordine Confermato!
          </h1>
          <p class="text-gray-600 text-sm sm:text-base">
            Grazie per aver scelto Aviato. La tua prenotazione è stata
            completata con successo.
          </p>
        </div>

        <!-- Loading State -->
        @if (isLoading) {
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="flex items-center justify-center py-8">
            <div
              class="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"
            ></div>
            <span class="ml-3 text-gray-600"
              >Caricamento dettagli ordine...</span
            >
          </div>
        </div>
        }

        <!-- Error State -->
        @else if (hasError) {
        <div class="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div class="text-center py-8">
            <svg
              class="w-12 h-12 text-red-500 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">
              Errore nel caricamento
            </h3>
            <p class="text-gray-600 mb-4">
              Non è possibile recuperare i dettagli dell'ordine.
            </p>
            <button
              (click)="retryLoad()"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Riprova
            </button>
          </div>
        </div>
        }

        <!-- Success State -->
        @else if (order && order.items) {

        <!-- Order Summary Card -->
        <div class="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div class="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
            <h2 class="text-xl font-bold text-white">Riepilogo Ordine</h2>
          </div>

          <div class="p-6">
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <!-- Order Info -->
              <div class="lg:col-span-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h3
                      class="font-semibold text-gray-900 mb-3 flex items-center"
                    >
                      <svg
                        class="w-5 h-5 mr-2 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      Dettagli Ordine
                    </h3>
                    <div class="space-y-3 text-sm">
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Numero Ordine:</span>
                        <span
                          class="font-mono text-xs bg-gray-100 px-2 py-1 rounded"
                          >{{ getShortOrderId() }}</span
                        >
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Stato:</span>
                        <span
                          class="px-2 py-1 rounded-full text-xs font-medium"
                          [class]="getStatusClass()"
                        >
                          {{ getStatusText() }}
                        </span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Data Ordine:</span>
                        <span class="font-medium">{{
                          order.purchasedAt | date : 'short'
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3
                      class="font-semibold text-gray-900 mb-3 flex items-center"
                    >
                      <svg
                        class="w-5 h-5 mr-2 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                        ></path>
                      </svg>
                      Pagamento
                    </h3>
                    <div class="space-y-3 text-sm">
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Metodo:</span>
                        <span class="font-medium">{{
                          order.paymentMethod
                        }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Numero Voli:</span>
                        <span class="font-medium">{{
                          order.items.length
                        }}</span>
                      </div>
                      <div class="flex justify-between items-center">
                        <span class="text-gray-600">Passeggeri:</span>
                        <span class="font-medium">{{
                          getTotalPassengers()
                        }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Total -->
              <div class="lg:col-span-1">
                <div
                  class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 text-center"
                >
                  <h3 class="font-semibold text-gray-900 mb-2">
                    Totale Pagato
                  </h3>
                  <div class="text-3xl font-bold text-green-600 mb-1">
                    {{ order.total | currency : 'EUR' }}
                  </div>
                  <p class="text-xs text-gray-600">IVA inclusa</p>
                  @if (hasDiscrepancy()) {
                  <p class="text-xs text-orange-600 mt-1">
                    *Calcolato: {{ getCalculatedTotal() | currency : 'EUR' }}
                  </p>
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Flight Details -->
        <div class="bg-white rounded-xl shadow-lg mb-6 overflow-hidden">
          <div class="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
            <h2 class="text-xl font-bold text-white">Dettagli Voli</h2>
          </div>

          <div class="p-6">
            <div class="space-y-6">
              @for (item of order.items; track getItemId(item)) {
              <div
                class="border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-md transition-shadow"
              >
                @if (isFlightObject(item.flight)) {
                <div
                  class="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div class="flex-1">
                    <!-- Flight Route -->
                    <div class="flex items-center gap-4 mb-3">
                      <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">
                          {{ getFlightFromItem(item) }}
                        </div>
                        <div class="text-xs text-gray-500">Partenza</div>
                      </div>
                      <div class="flex-1 flex items-center">
                        <div class="h-0.5 bg-blue-300 flex-1"></div>
                        <svg
                          class="w-5 h-5 text-blue-500 mx-2"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"
                          />
                        </svg>
                        <div class="h-0.5 bg-blue-300 flex-1"></div>
                      </div>
                      <div class="text-center">
                        <div class="text-lg font-bold text-gray-900">
                          {{ getFlightToItem(item) }}
                        </div>
                        <div class="text-xs text-gray-500">Arrivo</div>
                      </div>
                    </div>

                    <!-- Flight Details -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span class="text-gray-600">Compagnia:</span>
                        <span class="font-medium ml-1">{{
                          getFlightAirlineItem(item)
                        }}</span>
                      </div>
                      <div>
                        <span class="text-gray-600">Volo:</span>
                        <span class="font-medium ml-1">{{
                          getFlightNumberItem(item)
                        }}</span>
                      </div>
                      <div>
                        <span class="text-gray-600">Passeggeri:</span>
                        <span class="font-medium ml-1">{{
                          item.quantity
                        }}</span>
                      </div>
                    </div>

                    <!-- Additional Services -->
                    @if (hasAdditionalServices(item)) {
                    <div class="mt-3 flex flex-wrap gap-2">
                      @if (item.seatClass === 'first') {
                      <span
                        class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                      >
                        Prima Classe
                      </span>
                      } @if (item.additionalLuggage && item.additionalLuggage >
                      0) {
                      <span
                        class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                      >
                        {{ item.additionalLuggage }} Bagaglio Extra ({{
                          getLuggagePrice(item)
                        }}€ cad.)
                      </span>
                      } @if (item.selectedSeats && item.selectedSeats.length >
                      0) {
                      <span
                        class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                      >
                        {{ item.selectedSeats.length }} Posti Selezionati
                      </span>
                      }
                    </div>
                    }
                  </div>

                  <!-- Price -->
                  <div class="text-right">
                    <div class="text-xs text-gray-600 mb-1">
                      {{ getItemBasePriceDisplay(item) }}
                    </div>
                    <div class="text-xl font-bold text-gray-900">
                      {{ getItemTotalPrice(item) | currency : 'EUR' }}
                    </div>
                  </div>
                </div>
                } @else {
                <!-- Fallback for flight ID only -->
                <div class="flex justify-between items-center">
                  <div>
                    <h3 class="font-semibold text-gray-800">
                      @if (item.flightInfo?.flightNumber) { Volo
                      {{ item.flightInfo?.flightNumber }} } @else { Volo
                      {{ item.flight }}
                      }
                    </h3>
                    <p class="text-sm text-gray-600">
                      @if (item.flightInfo?.from && item.flightInfo?.to) {
                      {{ item.flightInfo?.from }} → {{ item.flightInfo?.to }} •
                      } {{ item.quantity }} passeggero(i) •
                      {{ getItemBasePriceDisplay(item) }}
                    </p>
                    @if (hasAdditionalServices(item)) {
                    <div class="mt-2 flex flex-wrap gap-2">
                      @if (item.seatClass === 'first') {
                      <span
                        class="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium"
                      >
                        Prima Classe
                      </span>
                      } @if (item.additionalLuggage && item.additionalLuggage >
                      0) {
                      <span
                        class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium"
                      >
                        {{ item.additionalLuggage }} Bagaglio Extra
                      </span>
                      } @if (item.selectedSeats && item.selectedSeats.length >
                      0) {
                      <span
                        class="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-medium"
                      >
                        {{ item.selectedSeats.length }} Posti Selezionati
                      </span>
                      }
                    </div>
                    }
                  </div>
                  <div class="text-right">
                    <div class="text-xl font-bold text-gray-900">
                      {{ getItemTotalPrice(item) | currency : 'EUR' }}
                    </div>
                  </div>
                </div>
                }
              </div>
              }
            </div>
          </div>
        </div>
        }

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <button
            (click)="printOrder()"
            class="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center"
          >
            <svg
              class="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
              ></path>
            </svg>
            Stampa
          </button>
          <button
            (click)="goHome()"
            class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
          >
            Torna alla Home
          </button>
          <button
            (click)="viewOrders()"
            class="px-6 py-3 border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-colors"
          >
            I Miei Ordini
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class OrderConfirmationComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private orderService = inject(OrderService);
  private notificationService = inject(NotificationService);

  order: Order | null = null;
  isLoading = true;
  hasError = false;
  private orderId: string | null = null;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.orderId = params['orderId'];
      if (this.orderId) {
        this.loadOrder();
      } else {
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  private loadOrder() {
    if (!this.orderId) return;

    this.isLoading = true;
    this.hasError = false;

    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Errore nel recupero dell'ordine:", error);
        this.hasError = true;
        this.isLoading = false;
        this.notificationService.error(
          'Errore di Caricamento',
          "Non è stato possibile recuperare i dettagli dell'ordine."
        );
      },
    });
  }

  retryLoad() {
    this.loadOrder();
  }

  getShortOrderId(): string {
    if (!this.order?._id) return '';
    return this.order._id.slice(-8).toUpperCase();
  }

  getStatusClass(): string {
    if (!this.order) return '';

    switch (this.order.status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  getStatusText(): string {
    if (!this.order) return '';

    switch (this.order.status) {
      case 'Completed':
        return 'Confermato';
      case 'Pending':
        return 'In Attesa';
      case 'Cancelled':
        return 'Cancellato';
      case 'Refunded':
        return 'Rimborsato';
      default:
        return this.order.status;
    }
  }

  getTotalPassengers(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );
  }

  getCalculatedTotal(): number {
    if (!this.order?.items) return 0;
    return this.order.items.reduce(
      (total, item) => total + this.getItemTotalPrice(item),
      0
    );
  }

  hasDiscrepancy(): boolean {
    if (!this.order) return false;
    const calculatedTotal = this.getCalculatedTotal();
    return Math.abs(this.order.total - calculatedTotal) > 0.01;
  }

  isFlightObject(flight: string | FlightInfo): flight is FlightInfo {
    return typeof flight === 'object' && flight !== null;
  }

  getItemId(item: OrderItem): string {
    if (this.isFlightObject(item.flight)) {
      return (
        item.flight._id || item.flight.flightNumber || Math.random().toString()
      );
    }
    return item.flight || Math.random().toString();
  }

  hasAdditionalServices(item: OrderItem): boolean {
    return !!(
      item.seatClass === 'first' ||
      (item.additionalLuggage &&
        item.additionalLuggage > 0 &&
        this.getLuggagePrice(item) > 0) ||
      (item.selectedSeats && item.selectedSeats.length > 0)
    );
  }

  getLuggagePrice(item: OrderItem): number {
    // Priorità 1: prezzo salvato nell'ordine
    if (item.additionalLuggagePrice && item.additionalLuggagePrice > 0) {
      return item.additionalLuggagePrice;
    }

    // Priorità 2: prezzo salvato nel flightInfo
    if (
      item.flightInfo?.additionalLuggagePrice &&
      item.flightInfo.additionalLuggagePrice > 0
    ) {
      return item.flightInfo.additionalLuggagePrice;
    }

    // Priorità 3: prezzo del volo popolato
    if (
      this.isFlightObject(item.flight) &&
      item.flight.additionalLuggagePrice
    ) {
      return item.flight.additionalLuggagePrice;
    }

    // Fallback: prezzo di default (dovrebbe essere raramente usato)
    return 45;
  }

  getItemTotalPrice(item: OrderItem): number {
    let basePrice = item.priceAtPurchase;
    let total = basePrice * item.quantity;

    // Add luggage costs - FIXED: luggage is per booking, not per passenger
    if (
      item.additionalLuggage &&
      item.additionalLuggage > 0 &&
      this.getLuggagePrice(item) > 0
    ) {
      const luggagePrice = this.getLuggagePrice(item);
      total += luggagePrice * item.additionalLuggage;
    }

    // Add seat selection costs - this IS per passenger
    if (item.selectedSeats && item.selectedSeats.length > 0) {
      const seatTotal = item.selectedSeats.reduce(
        (sum, seat) => sum + seat.price,
        0
      );
      total += seatTotal;
    }

    return total;
  }

  getItemBasePriceDisplay(item: OrderItem): string {
    const basePrice = item.priceAtPurchase;
    const quantity = item.quantity;

    // Show breakdown if there are additional services
    if (this.hasAdditionalServices(item)) {
      let breakdown = `${basePrice}€ × ${quantity}`;

      // FIXED: luggage is per booking, not per passenger
      if (
        item.additionalLuggage &&
        item.additionalLuggage > 0 &&
        this.getLuggagePrice(item) > 0
      ) {
        const luggagePrice = this.getLuggagePrice(item);
        breakdown += ` + ${luggagePrice}€ × ${item.additionalLuggage} bagagli`;
      }

      if (item.selectedSeats && item.selectedSeats.length > 0) {
        const seatTotal = item.selectedSeats.reduce(
          (sum, seat) => sum + seat.price,
          0
        );
        breakdown += ` + ${seatTotal}€ posti selezionati`;
      }

      return breakdown;
    }

    return `${basePrice}€ × ${quantity}`;
  }

  getFlightFrom(flight: string | FlightInfo): string {
    if (this.isFlightObject(flight)) {
      return flight.from || 'N/D';
    }
    return 'N/D';
  }

  getFlightFromItem(item: OrderItem): string {
    // Priorità 1: informazioni salvate durante il checkout
    if (item.flightInfo?.from) {
      return item.flightInfo.from;
    }

    // Priorità 2: informazioni dal volo popolato
    if (this.isFlightObject(item.flight)) {
      return item.flight.from || 'N/D';
    }

    return 'N/D';
  }

  getFlightTo(flight: string | FlightInfo): string {
    if (this.isFlightObject(flight)) {
      return flight.to || 'N/D';
    }
    return 'N/D';
  }

  getFlightToItem(item: OrderItem): string {
    // Priorità 1: informazioni salvate durante il checkout
    if (item.flightInfo?.to) {
      return item.flightInfo.to;
    }

    // Priorità 2: informazioni dal volo popolato
    if (this.isFlightObject(item.flight)) {
      return item.flight.to || 'N/D';
    }

    return 'N/D';
  }

  getFlightAirline(flight: string | FlightInfo): string {
    if (this.isFlightObject(flight)) {
      if (typeof flight.airline === 'string') {
        return flight.airline;
      }
      if (typeof flight.airline === 'object' && flight.airline?.name) {
        return flight.airline.name;
      }
    }
    return 'N/D';
  }

  getFlightAirlineItem(item: OrderItem): string {
    // Priorità 1: informazioni salvate durante il checkout
    if (item.flightInfo?.airline?.name) {
      return item.flightInfo.airline.name;
    }

    // Priorità 2: informazioni dal volo popolato
    if (this.isFlightObject(item.flight)) {
      if (typeof item.flight.airline === 'string') {
        return item.flight.airline;
      }
      if (
        typeof item.flight.airline === 'object' &&
        item.flight.airline?.name
      ) {
        return item.flight.airline.name;
      }
    }

    return 'N/D';
  }

  getFlightNumber(flight: string | FlightInfo): string {
    if (this.isFlightObject(flight)) {
      return flight.flightNumber || 'N/D';
    }
    return 'N/D';
  }

  getFlightNumberItem(item: OrderItem): string {
    // Priorità 1: informazioni salvate durante il checkout
    if (item.flightInfo?.flightNumber) {
      return item.flightInfo.flightNumber;
    }

    // Priorità 2: informazioni dal volo popolato
    if (this.isFlightObject(item.flight)) {
      return item.flight.flightNumber || 'N/D';
    }

    return 'N/D';
  }

  printOrder() {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }

  viewOrders() {
    this.router.navigate(['/user']);
  }
}
