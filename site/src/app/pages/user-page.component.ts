import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { OrderService, Order } from '../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 py-12"
    >
      <div
        class="w-full max-w-4xl bg-white/90 rounded-2xl shadow-xl p-8 border border-blue-100"
      >
        <h2
          class="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg
            class="w-7 h-7 text-blue-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          User Details
        </h2>
        <ng-container *ngIf="user() as u; else notLogged">
          <div class="mb-6">
            <div class="font-semibold text-lg">
              {{ u.name }} {{ u.surname }}
            </div>
            <div class="text-sm text-gray-500">{{ u.email }}</div>
            <div class="text-xs text-gray-400 mb-2">
              Roles: {{ u.roles.join(', ') }}
            </div>
          </div>

          <div *ngIf="u.airlines?.length" class="mb-6">
            <h3 class="text-lg font-semibold text-blue-700 mb-2">
              Your Airlines
            </h3>
            <ul class="space-y-2">
              <li
                *ngFor="let airline of u.airlines"
                class="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3 shadow-sm"
              >
                <span class="font-bold text-blue-700">{{ airline.name }}</span>
                <span
                  class="ml-auto text-xs bg-blue-200 text-blue-800 rounded px-2 py-0.5"
                  >{{ airline.code }}</span
                >
              </li>
            </ul>
          </div>

          <!-- Order History Section -->
          <div class="mb-6">
            <h3
              class="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Cronologia Ordini
            </h3>

            <div
              *ngIf="orders().length === 0"
              class="text-gray-500 text-center py-8 bg-gray-50 rounded-lg"
            >
              <svg
                class="w-12 h-12 mx-auto text-gray-300 mb-4"
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
              <p>Nessun ordine trovato.</p>
              <p class="text-sm mt-1">
                I tuoi ordini appariranno qui dopo il primo acquisto.
              </p>
            </div>

            <div *ngIf="orders().length > 0" class="space-y-4">
              <div
                *ngFor="let order of orders()"
                class="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                <!-- Order Header -->
                <div
                  class="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 border-b border-gray-200"
                >
                  <div class="flex justify-between items-center">
                    <div>
                      <div class="font-semibold text-gray-900">
                        Ordine #{{ getShortOrderId(order._id) }}
                      </div>
                      <div class="text-sm text-gray-600">
                        {{ order.purchasedAt | date : 'dd/MM/yyyy HH:mm' }}
                      </div>
                    </div>
                    <div class="flex items-center gap-3">
                      <span
                        [class]="getStatusClass(order.status)"
                        class="px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {{ getStatusText(order.status) }}
                      </span>
                      <div class="text-right">
                        <div class="text-xl font-bold text-blue-600">
                          {{ order.total | currency : 'EUR' }}
                        </div>
                        <!-- Mostra avviso se i prezzi non coincidono -->
                        <div
                          *ngIf="!verifyOrderPriceConsistency(order)"
                          class="text-xs text-red-600 font-medium"
                        >
                          ⚠️ Totale calcolato:
                          {{
                            getCalculatedOrderTotal(order) | currency : 'EUR'
                          }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Order Content -->
                <div class="p-4">
                  <!-- Flight Items -->
                  <div class="space-y-3 mb-4">
                    <div
                      *ngFor="let item of order.items; let i = index"
                      class="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div class="flex-1">
                        <div class="flex items-center gap-3 mb-2">
                          <div class="font-medium text-gray-900">
                            {{ getFlightDisplay(item.flight, item).from }} →
                            {{ getFlightDisplay(item.flight, item).to }}
                          </div>
                          <div class="text-sm text-gray-500">
                            {{
                              getFlightDisplay(item.flight, item).departureDate
                                | date : 'dd/MM'
                            }}
                          </div>
                        </div>

                        <div class="flex flex-col gap-2 text-sm text-gray-600">
                          <div class="flex items-center gap-4">
                            <span>{{ item.quantity }} passeggero(i)</span>
                            <span>{{ getAirlineName(item.flight, item) }}</span>
                          </div>

                          <!-- Flight Number -->
                          <div class="text-xs text-gray-500">
                            Volo:
                            {{
                              getFlightDisplay(item.flight, item).flightNumber
                            }}
                          </div>

                          <!-- Additional Services -->
                          <div
                            *ngIf="hasAdditionalServices(item)"
                            class="flex gap-2"
                          >
                            <!-- Simplified Luggage Display -->
                            <div
                              *ngIf="
                                item.additionalLuggage &&
                                item.additionalLuggage > 0 &&
                                getLuggagePrice(item) > 0;
                                else noLuggageAdded
                              "
                              class="mt-2"
                            >
                              <div class="flex items-center gap-2 mb-2">
                                <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                </svg>
                                <span class="text-sm font-medium text-blue-700">
                                  {{ item.additionalLuggage }} bagaglio/i extra
                                </span>
                                <span class="text-xs text-gray-500">
                                  ({{ getTotalLuggagePrice(item) | currency: 'EUR' }})
                                </span>
                              </div>
                              
                              <!-- Luggage Visual Grid -->
                              <div class="flex flex-wrap gap-1.5">
                                <div
                                  *ngFor="let bag of getLuggageArray(item.additionalLuggage); let i = index"
                                  class="group relative"
                                >
                                  <div class="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-center min-w-[50px] hover:bg-blue-100 transition-colors">
                                    <div class="flex flex-col items-center">
                                      <svg class="w-5 h-5 text-blue-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                                      </svg>
                                      <div class="text-xs font-semibold text-gray-700">
                                        Bag {{ i + 1 }}
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <!-- Tooltip -->
                                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    Bagaglio {{ i + 1 }} - {{ getLuggagePrice(item) | currency: 'EUR' }}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <ng-template #noLuggageAdded>
                              <div class="mt-2 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                <span class="text-sm text-gray-500">Nessun bagaglio extra</span>
                              </div>
                            </ng-template>
                            <!-- Simplified Seat Display -->
                            <div
                              *ngIf="
                                item.selectedSeats &&
                                item.selectedSeats.length > 0;
                                else noSeatsSelected
                              "
                              class="mt-2"
                            >
                              <div class="flex items-center gap-2 mb-2">
                                <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span class="text-sm font-medium text-green-700">
                                  {{ item.selectedSeats.length }} posti prenotati
                                </span>
                                <span class="text-xs text-gray-500">
                                  ({{ getTotalSeatPrice(item.selectedSeats) | currency: 'EUR' }})
                                </span>
                              </div>
                              
                              <!-- Seat Grid -->
                              <div class="flex flex-wrap gap-1.5">
                                <div
                                  *ngFor="let seat of item.selectedSeats; let i = index"
                                  class="group relative"
                                >
                                  <div 
                                    class="px-3 py-1.5 bg-green-50 border border-green-200 rounded-md text-center min-w-[60px] hover:bg-green-100 transition-colors"
                                    [class.border-purple-300]="seat.seatClass === 'first'"
                                    [class.bg-purple-50]="seat.seatClass === 'first'"
                                  >
                                    <div class="text-sm font-mono font-semibold text-gray-800">
                                      {{ seat.seatRow }}{{ seat.seatNumber }}
                                    </div>
                                    <div class="text-xs text-gray-500">
                                      {{ seat.seatClass === 'first' ? 'Prima' : 'Economy' }}
                                    </div>
                                  </div>
                                  
                                  <!-- Tooltip -->
                                  <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                                    Passeggero {{ i + 1 }} - {{ seat.price | currency: 'EUR' }}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <ng-template #noSeatsSelected>
                              <div class="mt-2 flex items-center gap-2">
                                <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                <span class="text-sm text-gray-500">Nessun posto prenotato</span>
                              </div>
                            </ng-template>
                          </div>
                        </div>
                      </div>

                      <div class="text-right">
                        <div class="font-semibold text-gray-900">
                          {{ getItemTotalPrice(item) | currency : 'EUR' }}
                        </div>
                        <div class="text-xs text-gray-500">
                          {{ getItemBreakdown(item) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Order Summary -->
                  <div class="bg-blue-50 rounded-lg p-3">
                    <div
                      class="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center"
                    >
                      <div>
                        <div class="text-lg font-semibold text-blue-900">
                          {{ getTotalPassengers(order.items) }}
                        </div>
                        <div class="text-xs text-blue-600">Passeggeri</div>
                      </div>
                      <div>
                        <div class="text-lg font-semibold text-blue-900">
                          {{ order.items.length }}
                        </div>
                        <div class="text-xs text-blue-600">Voli</div>
                      </div>
                      <div>
                        <div class="text-lg font-semibold text-blue-900">
                          {{ getTotalLuggage(order.items) }}
                        </div>
                        <div class="text-xs text-blue-600">Bagagli Extra</div>
                      </div>
                      <div>
                        <div class="text-lg font-semibold text-blue-900">
                          {{ getTotalReservedSeats(order.items) }}
                        </div>
                        <div class="text-xs text-blue-600">Posti Prenotati</div>
                      </div>
                      <div>
                        <div class="text-lg font-semibold text-blue-900">
                          {{ order.paymentMethod }}
                        </div>
                        <div class="text-xs text-blue-600">Pagamento</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            (click)="logout()"
            class="mt-8 w-full bg-red-500 hover:bg-red-400 text-white px-5 py-2 rounded-lg font-semibold shadow"
          >
            Logout
          </button>
        </ng-container>
        <ng-template #notLogged>
          <div class="text-gray-400 italic text-center">
            You are not logged in.
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: '',
})
export class UserPageComponent implements OnInit {
  auth = inject(AuthService);
  orderService = inject(OrderService);
  router = inject(Router);
  user = computed(() => this.auth.currentUser);
  orders = signal<Order[]>([]);

  ngOnInit() {
    this.loadOrderHistory();
  }

  loadOrderHistory() {
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
      },
      error: (error) => {
        console.error('Error loading order history:', error);
      },
    });
  }

  getFlightDisplay(flight: string | any, item?: any): any {
    // Priorità 1: informazioni salvate durante il checkout
    if (item?.flightInfo?.from && item?.flightInfo?.to) {
      return {
        flightNumber: item.flightInfo.flightNumber || 'Unknown Flight',
        from: item.flightInfo.from,
        to: item.flightInfo.to,
        departure: '00:00',
        arrival: '00:00',
        departureDate: item.flightInfo.departureDate
          ? new Date(item.flightInfo.departureDate)
          : new Date(),
        arrivalDate: item.flightInfo.arrivalDate
          ? new Date(item.flightInfo.arrivalDate)
          : new Date(),
      };
    }

    // Priorità 2: se flight è un ID stringa, non possiamo mostrare i dettagli
    if (typeof flight === 'string') {
      return {
        flightNumber: 'Flight ID: ' + flight.slice(-8),
        from: 'Dati non disponibili',
        to: 'Dati non disponibili',
        departure: '00:00',
        arrival: '00:00',
        departureDate: new Date(),
        arrivalDate: new Date(),
      };
    }

    // Priorità 3: Extract airport information from the nested structure
    const departureAirport = flight?.route?.departureAirport;
    const arrivalAirport = flight?.route?.arrivalAirport;

    if (departureAirport && arrivalAirport) {
      return {
        flightNumber: flight?.flightNumber || 'Unknown Flight',
        from: `${departureAirport.city} (${departureAirport.iata || departureAirport.name
          })`,
        to: `${arrivalAirport.city} (${arrivalAirport.iata || arrivalAirport.name
          })`,
        departure: flight?.departure || '00:00',
        arrival: flight?.arrival || '00:00',
        departureDate: flight?.departureDate
          ? new Date(flight.departureDate)
          : new Date(),
        arrivalDate: flight?.arrivalDate
          ? new Date(flight.arrivalDate)
          : new Date(),
      };
    }

    // Fallback: se non abbiamo informazioni sufficienti
    return {
      flightNumber: flight?.flightNumber || 'Unknown Flight',
      from: 'Dati non disponibili',
      to: 'Dati non disponibili',
      departure: '00:00',
      arrival: '00:00',
      departureDate: flight?.departureDate
        ? new Date(flight.departureDate)
        : new Date(),
      arrivalDate: flight?.arrivalDate
        ? new Date(flight.arrivalDate)
        : new Date(),
    };
  }

  getShortOrderId(orderId: string | undefined): string {
    if (!orderId) return 'N/A';
    return orderId.slice(-8).toUpperCase();
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Completed':
        return 'Confermato';
      case 'Pending':
        return 'In Attesa';
      case 'Cancelled':
        return 'Cancellato';
      case 'Refunded':
        return 'Rimborsato';
      default:
        return status;
    }
  }

  hasAdditionalServices(item: any): boolean {
    return !!(
      item.seatClass === 'first' ||
      (item.additionalLuggage &&
        item.additionalLuggage > 0 &&
        this.getLuggagePrice(item) > 0) ||
      (item.selectedSeats && item.selectedSeats.length > 0)
    );
  }

  getItemTotalPrice(item: any): number {
    let total = item.priceAtPurchase * item.quantity;

    // Add luggage costs - luggage is per booking, not per passenger
    if (
      item.additionalLuggage &&
      item.additionalLuggage > 0 &&
      this.getLuggagePrice(item) > 0
    ) {
      const luggagePrice = this.getLuggagePrice(item);
      total += luggagePrice * item.additionalLuggage; // NOT multiplied by passengers!
    }

    // Add seat selection costs - this IS per passenger
    if (item.selectedSeats && item.selectedSeats.length > 0) {
      const seatTotal = item.selectedSeats.reduce(
        (sum: number, seat: any) => sum + seat.price,
        0
      );
      total += seatTotal;
    }

    return total;
  }

  getItemBreakdown(item: any): string {
    const basePrice = item.priceAtPurchase;
    const quantity = item.quantity;
    let parts = [`${basePrice}€ × ${quantity}`];

    if (
      item.additionalLuggage &&
      item.additionalLuggage > 0 &&
      this.getLuggagePrice(item) > 0
    ) {
      const luggagePrice = this.getLuggagePrice(item);
      parts.push(`+${luggagePrice}€ × ${item.additionalLuggage} bagagli`);
    }

    if (item.selectedSeats && item.selectedSeats.length > 0) {
      const seatTotal = item.selectedSeats.reduce(
        (sum: number, seat: any) => sum + seat.price,
        0
      );
      parts.push(`+${seatTotal}€ posti selezionati`);
    }

    return parts.join(' ');
  }

  getAirlineName(flight: any, item?: any): string {
    // Priorità 1: informazioni salvate durante il checkout
    if (item?.flightInfo?.airline?.name) {
      return item.flightInfo.airline.name;
    }

    // Priorità 2: informazioni dal volo popolato
    if (typeof flight === 'object' && flight) {
      if (typeof flight.airline === 'string') {
        return flight.airline;
      }
      if (typeof flight.airline === 'object' && flight.airline?.name) {
        return flight.airline.name;
      }
    }
    return 'N/D';
  }

  getLuggagePrice(item: any): number {
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
      typeof item.flight === 'object' &&
      item.flight?.additionalLuggagePrice
    ) {
      return item.flight.additionalLuggagePrice;
    }

    // Fallback: prezzo di default (dovrebbe essere raramente usato)
    return 45;
  }

  getTotalPassengers(items: any[]): number {
    return items.reduce((total, item) => {
      return total + (item.passengers || item.quantity || 1);
    }, 0);
  }

  // Verifica la coerenza dei prezzi dell'ordine
  verifyOrderPriceConsistency(order: any): boolean {
    const calculatedTotal = order.items.reduce((sum: number, item: any) => {
      return sum + this.getItemTotalPrice(item);
    }, 0);

    return Math.abs(calculatedTotal - order.total) < 0.01; // Tolleranza per errori di arrotondamento
  }

  // Ottieni il totale calcolato per confronto
  getCalculatedOrderTotal(order: any): number {
    return order.items.reduce((sum: number, item: any) => {
      return sum + this.getItemTotalPrice(item);
    }, 0);
  }

  // FIXED: Luggage count is NOT multiplied by passengers
  getTotalLuggage(items: any[]): number {
    return items.reduce((total, item) => {
      if (
        item.additionalLuggage &&
        item.additionalLuggage > 0 &&
        this.getLuggagePrice(item) > 0
      ) {
        return total + item.additionalLuggage; // No multiplication by passengers!
      }
      return total;
    }, 0);
  }

  // Get total number of reserved seats across all order items
  getTotalReservedSeats(items: any[]): number {
    return items.reduce((total, item) => {
      if (item.selectedSeats && item.selectedSeats.length > 0) {
        return total + item.selectedSeats.length;
      }
      return total;
    }, 0);
  }

  // Get formatted seat information for display
  getSeatInfo(item: any): string {
    if (!item.selectedSeats || item.selectedSeats.length === 0) {
      return 'Nessun posto selezionato';
    }

    const seatDetails = item.selectedSeats.map((seat: any, index: number) => {
      return `${seat.seatRow}${seat.seatNumber} (${seat.seatClass === 'first' ? '1ª' : 'Eco'
        })`;
    });

    return seatDetails.join(', ');
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  // Calculate total price for selected seats
  getTotalSeatPrice(selectedSeats: any[]): number {
    if (!selectedSeats || selectedSeats.length === 0) {
      return 0;
    }
    return selectedSeats.reduce((total, seat) => total + (seat.price || 0), 0);
  }

  // Calculate total price for additional luggage
  getTotalLuggagePrice(item: any): number {
    if (!item.additionalLuggage || item.additionalLuggage <= 0) {
      return 0;
    }
    const pricePerBag = this.getLuggagePrice(item);
    return pricePerBag * item.additionalLuggage;
  }

  // Create array for *ngFor to display luggage icons
  getLuggageArray(count: number): any[] {
    return new Array(count).fill(null);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
