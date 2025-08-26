import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatReservationService } from '../../services/seat-reservation.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-50 via-sky-50 to-indigo-100 py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header with enhanced styling -->
        <div class="mb-10">
          <div class="flex items-center justify-between">
            <div class="space-y-3">
              <div class="flex items-center space-x-3">
                <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
                  </svg>
                </div>
                <h1 class="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Selezione Posti
                </h1>
              </div>
              <p class="text-lg text-gray-600 ml-15">
                Scegli i posti per <span class="font-semibold text-blue-600">{{ cartItem?.passengers || 1 }} passeggero(i)</span>
                per il volo <span class="font-semibold text-indigo-600">{{ flightData?.flight?.flightNumber }}</span>
              </p>
            </div>
            <button
              (click)="goBack()"
              class="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-200 hover:bg-white/50 rounded-xl"
            >
              ← Torna al carrello
            </button>
          </div>
        </div>

        <!-- Enhanced Flight Info Card -->
        @if (flightData) {
        <div class="bg-gradient-to-r from-white to-blue-50/50 rounded-2xl shadow-xl border border-blue-100/50 p-8 mb-10 backdrop-blur-sm">
          <div class="flex items-center justify-between">
            <div class="space-y-2">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                  </svg>
                </div>
                <h2 class="text-2xl font-bold text-gray-800">
                  {{ flightData.flight.flightNumber }}
                </h2>
              </div>
              <p class="text-gray-600 flex items-center space-x-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <span>{{ flightData.flight.departureDate | date : 'medium' }}</span>
              </p>
            </div>
            <div class="text-right">
              <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {{ flightData.flight.price | currency : 'EUR' }}
              </div>
              <div class="text-sm text-gray-500 font-medium">Prezzo base per passeggero</div>
            </div>
          </div>
        </div>
        }

        <!-- Current Class Info -->
        @if (cartItem) {
        <div class="bg-gradient-to-r from-white to-blue-50/50 rounded-2xl shadow-lg border border-blue-100/50 p-6 mb-8">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center" [class]="cartItem.ticketClass === 'first' ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-blue-500 to-blue-600'">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" [attr.d]="cartItem.ticketClass === 'first' ? 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' : 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'"/>
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-bold text-gray-800">
                {{ cartItem.ticketClass === 'first' ? 'Prima Classe' : 'Classe Economy' }}
              </h3>
              <p class="text-gray-600 text-sm">Classe selezionata nel carrello</p>
            </div>
            <div class="ml-auto text-right">
              <div class="text-xl font-bold" [class]="cartItem.ticketClass === 'first' ? 'text-amber-600' : 'text-blue-600'">
                {{ cartItem.ticketClass === 'first' ? (flightData?.flight?.firstClassPrice | currency : 'EUR') : (flightData?.flight?.price | currency : 'EUR') }}
              </div>
            </div>
          </div>
        </div>
        }

        <!-- Enhanced Seat Map -->
        @if (flightData) {
        <div class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-10">
          <div class="flex items-center justify-between mb-8">
            <div class="flex items-center space-x-3">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-800">Mappa dei Posti</h3>
            </div>
            <div class="flex items-center gap-6 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-sm"></div>
                <span class="font-medium text-gray-700">Disponibile</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 bg-gradient-to-br from-gray-400 to-gray-500 rounded-lg shadow-sm"></div>
                <span class="font-medium text-gray-700">Occupato</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-5 h-5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm"></div>
                <span class="font-medium text-gray-700">Selezionato</span>
              </div>
            </div>
          </div>

          <!-- Horizontal Aircraft Layout -->
          <div class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
            <div class="flex items-center justify-center space-x-4">
              <!-- Aircraft nose -->
              <div class="flex flex-col items-center">
                <div class="w-8 h-16 bg-gradient-to-r from-slate-300 to-slate-400 rounded-l-full border-2 border-slate-300 relative">
                  <div class="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full"></div>
                </div>
                <div class="text-xs font-semibold text-slate-600 mt-1 rotate-90 whitespace-nowrap">Prua</div>
              </div>

              <!-- Compact Seat Grid -->
              <div class="flex-1 overflow-x-auto">
                <div class="flex items-center space-x-2 min-w-max">
                  @for (row of seatRows; track row) {
                    <div class="flex flex-col items-center space-y-2 bg-white/70 rounded-xl p-3 border border-slate-200">
                      <!-- Row number at top -->
                      <div class="text-xs font-bold text-slate-700 bg-slate-200 rounded-lg px-2 py-1">{{ row }}</div>
                      
                      <!-- Seats in vertical column for each row -->
                      <div class="flex flex-col gap-1">
                        @for (seat of getSeatsForRow(row); track seat.number) {
                          <button
                            (click)="selectSeat(seat)"
                            [disabled]="!isSeatAvailable(seat)"
                            [class]="getSeatClass(seat)"
                            class="w-8 h-8 rounded-lg font-bold text-xs transition-all duration-300 disabled:cursor-not-allowed shadow-sm hover:shadow-md transform hover:scale-110 border"
                            [attr.title]="'Posto ' + row + seat.number + ' - ' + (seat.seatClass | titlecase)"
                          >
                            {{ seat.number }}
                          </button>
                          @if (seat.number === 'C') {
                            <div class="h-1 border-t border-dashed border-slate-300 mx-2"></div>
                          }
                        }
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- Aircraft tail -->
              <div class="flex flex-col items-center">
                <div class="w-6 h-12 bg-gradient-to-l from-slate-300 to-slate-400 rounded-r-full border-2 border-slate-300"></div>
                <div class="text-xs font-semibold text-slate-600 mt-1 rotate-90 whitespace-nowrap">Coda</div>
              </div>
            </div>
          </div>
        </div>
        }

        <!-- Enhanced Selected Seats Info -->
        @if (selectedSeats.length > 0) {
        <div class="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 backdrop-blur-sm border-2 border-blue-200/50 rounded-2xl p-8 mb-10">
          <div class="flex items-center space-x-3 mb-6">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-blue-800">
              Posti Selezionati ({{ selectedSeats.length }}/{{ cartItem?.passengers || 1 }})
            </h3>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (seat of selectedSeats; track seat.id) {
            <div class="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-2">
                  <div class="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg flex items-center justify-center">
                    <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                  </div>
                  <span class="font-bold text-blue-800">
                    Passeggero {{ seat.passengerNumber }}
                  </span>
                </div>
                <button
                  (click)="removeSeat(seat)"
                  class="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-700 rounded-lg transition-all duration-200 flex items-center justify-center"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <div class="space-y-2">
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                  <span class="text-blue-700 font-semibold">Posto: {{ seat.seatRow }}{{ seat.seatNumber }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
                  </svg>
                  <span class="text-blue-600">{{ seat.seatClass | titlecase }}</span>
                </div>
                <div class="flex items-center space-x-2">
                  <svg class="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"/>
                  </svg>
                  <span class="text-green-700 font-bold">{{ seat.price | currency : 'EUR' }}</span>
                </div>
              </div>
            </div>
            }
          </div>
        </div>
        }

        <!-- Enhanced Actions -->
        <div class="flex justify-end gap-6">
          <button
            (click)="goBack()"
            class="px-8 py-4 text-gray-600 hover:text-gray-800 font-semibold transition-all duration-200 hover:bg-white/50 rounded-xl border-2 border-gray-200 hover:border-gray-300"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              <span>Annulla</span>
            </div>
          </button>
          <button
            (click)="confirmSelection()"
            [disabled]="selectedSeats.length !== (cartItem?.passengers || 1)"
            class="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
          >
            <div class="flex items-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span>Conferma Selezione</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class SeatSelectionComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private seatService = inject(SeatReservationService);
  private cartService = inject(CartService);

  flightId = '';
  flightData: any = null;
  selectedSeats: any[] = [];
  seats: Record<string, any[]> = {};
  seatRows: string[] = [];
  cartItem: any = null;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.flightId = params['flightId'];
      if (this.flightId) {
        this.loadSeats();
        this.loadCartItem();
      }
    });
  }

  loadSeats() {
    this.seatService.getFlightSeats(this.flightId).subscribe({
      next: (data) => {
        this.flightData = data;
        this.seats = data.seats || {};
        this.seatRows = Object.keys(this.seats);
      },
      error: (error) => {
        console.error('Errore nel caricamento dei posti:', error);
        this.goBack();
      },
    });
  }

  loadCartItem() {
    this.cartItem = this.cartService
      .cart()
      .find(
        (item) =>
          item.flight.mongoId === this.flightId ||
          item.flight.id.toString() === this.flightId
      );
  }

  getSeatsForRow(row: string): any[] {
    return this.seats[row] || [];
  }

  isSeatAvailable(seat: any): boolean {
    const selectedClass = this.cartItem?.ticketClass || 'economy';
    return seat.seatClass === selectedClass && !seat.isReserved;
  }

  getSeatClass(seat: any): string {
    const selectedClass = this.cartItem?.ticketClass || 'economy';
    
    if (seat.isReserved) {
      return 'bg-gradient-to-br from-gray-400 to-gray-500 text-white cursor-not-allowed border-gray-500';
    }

    if (seat.seatClass !== selectedClass) {
      return 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-500 cursor-not-allowed border-gray-300';
    }

    // Verifica se il posto è già selezionato
    const isSelected = this.selectedSeats.some(
      (s) => s.seatRow === seat.row && s.seatNumber === seat.number
    );

    if (isSelected) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 border-blue-600 ring-2 ring-blue-400 ring-opacity-75';
    }

    // Different colors for different classes
    if (seat.seatClass === 'first') {
      return 'bg-gradient-to-br from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 border-amber-500';
    }

    return 'bg-gradient-to-br from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 border-green-500';
  }

  selectSeat(seat: any) {
    if (this.isSeatAvailable(seat)) {
      // Verifica se abbiamo già raggiunto il numero massimo di posti
      if (this.selectedSeats.length >= (this.cartItem?.passengers || 1)) {
        return;
      }

      // Verifica se il posto è già selezionato
      const isAlreadySelected = this.selectedSeats.some(
        (s) => s.seatRow === seat.row && s.seatNumber === seat.number
      );

      if (!isAlreadySelected) {
        // Calcola il prezzo se non è disponibile dal backend
        let seatPrice = seat.price;
        if (seatPrice === undefined || seatPrice === null) {
          const selectedClass = this.cartItem?.ticketClass || 'economy';
          const basePrice =
            selectedClass === 'first'
              ? this.flightData?.flight?.firstClassPrice
              : this.flightData?.flight?.price;

          if (basePrice) {
            // Il prezzo della selezione del posto è solo il 10% del biglietto base
            seatPrice = Math.round(basePrice * 0.1 * 100) / 100; // Solo il 10%
          }
        }

        const newSeat = {
          id: `${seat.row}-${seat.number}`,
          passengerNumber: this.selectedSeats.length + 1,
          seatRow: seat.row, // Aggiornato per essere coerente con il backend
          seatNumber: seat.number, // Aggiornato per essere coerente con il backend
          seatClass: seat.seatClass,
          price: seatPrice,
        };

        console.log('Created newSeat:', newSeat);
        this.selectedSeats.push(newSeat);
      }
    }
  }

  removeSeat(seat: any) {
    this.selectedSeats = this.selectedSeats.filter((s) => s.id !== seat.id);

    // Riorganizza i numeri dei passeggeri
    this.selectedSeats.forEach((s, index) => {
      s.passengerNumber = index + 1;
    });
  }

  confirmSelection() {
    if (this.selectedSeats.length === (this.cartItem?.passengers || 1)) {
      // Aggiorna il volo nel carrello con le informazioni dei posti
      if (this.cartItem) {
        const updatedFlight = {
          ...this.cartItem.flight,
          selectedSeats: this.selectedSeats,
        };

        this.cartService.updateCartItem(this.cartItem.flight.id, {
          flight: updatedFlight,
          selectedSeats: this.selectedSeats,
        });
      }

      // Torna al carrello
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/cart']);
  }
}
