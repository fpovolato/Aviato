import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SeatService } from '../../services/seat.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-seat-selection',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-3xl font-bold text-gray-900 mb-2">
                Selezione Posto
              </h1>
              <p class="text-gray-600">
                Scegli il tuo posto per il volo
                {{ flightData?.flight?.flightNumber }}
              </p>
            </div>
            <button
              (click)="goBack()"
              class="px-6 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
            >
              ← Torna al carrello
            </button>
          </div>
        </div>

        <!-- Flight Info -->
        @if (flightData) {
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-xl font-semibold text-gray-800">
                {{ flightData.flight.flightNumber }}
              </h2>
              <p class="text-gray-600">
                {{ flightData.flight.departureDate | date : 'short' }} -
                {{ flightData.flight.arrivalDate | date : 'short' }}
              </p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-blue-600">
                {{ flightData.flight.price | currency : 'EUR' }}
              </div>
              <div class="text-sm text-gray-500">Prezzo base</div>
            </div>
          </div>
        </div>
        }

        <!-- Class Selection -->
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 class="text-lg font-semibold mb-4">Scegli la tua classe</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              (click)="selectedClass = 'economy'"
              [class]="
                selectedClass === 'economy'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              "
              class="border-2 rounded-xl p-6 transition-all"
            >
              <div class="text-center">
                <div class="text-xl font-bold mb-2">Classe Economy</div>
                <div class="text-sm opacity-80">
                  {{ flightData?.flight?.price | currency : 'EUR' }}
                </div>
              </div>
            </button>
            <button
              (click)="selectedClass = 'first'"
              [class]="
                selectedClass === 'first'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              "
              class="border-2 rounded-xl p-6 transition-all"
            >
              <div class="text-center">
                <div class="text-xl font-bold mb-2">Prima Classe</div>
                <div class="text-sm opacity-80">
                  {{ flightData?.flight?.firstClassPrice | currency : 'EUR' }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Seat Map -->
        @if (flightData) {
        <div class="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-lg font-semibold">Mappa dei Posti</h3>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-500 rounded"></div>
                <span>Disponibile</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gray-400 rounded"></div>
                <span>Occupato</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Selezionato</span>
              </div>
            </div>
          </div>

          <!-- Aircraft Layout -->
          <div class="bg-gray-50 rounded-xl p-6">
            <div class="text-center mb-4">
              <div class="text-sm text-gray-600">Prua dell'aereo</div>
            </div>

            <!-- Seat Grid -->
            <div class="space-y-2">
              @for (row of seatRows; track row) {
              <div class="flex items-center justify-center gap-2">
                <span class="w-8 text-center font-semibold text-gray-600">{{
                  row
                }}</span>
                <div class="flex gap-1">
                  @for (seat of getSeatsForRow(row); track seat.number) {
                  <button
                    (click)="selectSeat(seat)"
                    [disabled]="!isSeatAvailable(seat)"
                    [class]="getSeatClass(seat)"
                    class="w-10 h-10 rounded-lg font-semibold text-sm transition-all disabled:cursor-not-allowed"
                  >
                    {{ seat.number }}
                  </button>
                  }
                </div>
              </div>
              }
            </div>

            <div class="text-center mt-4">
              <div class="text-sm text-gray-600">Poppa dell'aereo</div>
            </div>
          </div>
        </div>
        }

        <!-- Selected Seat Info -->
        @if (selectedSeat) {
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 class="font-semibold text-blue-800 mb-4">Posto Selezionato</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span class="font-medium">Posto:</span> {{ selectedSeat.row
              }}{{ selectedSeat.number }}
            </div>
            <div>
              <span class="font-medium">Classe:</span>
              {{ selectedSeat.seatClass | titlecase }}
            </div>
            <div>
              <span class="font-medium">Tipo:</span>
              <span *ngIf="selectedSeat.isWindow">Finestrino</span>
              <span *ngIf="selectedSeat.isAisle">Corridoio</span>
              <span *ngIf="!selectedSeat.isWindow && !selectedSeat.isAisle"
                >Centrale</span
              >
            </div>
            <div>
              <span class="font-medium">Prezzo:</span>
              {{ selectedSeat.price | currency : 'EUR' }}
            </div>
          </div>
        </div>
        }

        <!-- Actions -->
        <div class="flex justify-end gap-4">
          <button
            (click)="goBack()"
            class="px-6 py-3 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
          >
            Annulla
          </button>
          <button
            (click)="confirmSelection()"
            [disabled]="!selectedSeat"
            class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
          >
            Conferma Selezione
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
  private seatService = inject(SeatService);
  private cartService = inject(CartService);

  flightId = '';
  flightData: any = null;
  selectedClass: 'first' | 'economy' = 'economy';
  selectedSeat: any = null;
  seats: Record<string, any[]> = {};
  seatRows: string[] = [];

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.flightId = params['flightId'];
      if (this.flightId) {
        this.loadSeats();
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
        // Torna al carrello in caso di errore
        this.goBack();
      },
    });
  }

  getSeatsForRow(row: string): any[] {
    return this.seats[row] || [];
  }

  isSeatAvailable(seat: any): boolean {
    return seat.seatClass === this.selectedClass && !seat.isReserved;
  }

  getSeatClass(seat: any): string {
    if (seat.isReserved) {
      return 'bg-gray-400 text-white cursor-not-allowed';
    }

    if (seat.seatClass !== this.selectedClass) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    if (
      this.selectedSeat &&
      this.selectedSeat.row === seat.row &&
      this.selectedSeat.number === seat.number
    ) {
      return 'bg-blue-500 text-white hover:bg-blue-600';
    }

    return 'bg-green-500 text-white hover:bg-green-600';
  }

  selectSeat(seat: any) {
    if (this.isSeatAvailable(seat)) {
      this.selectedSeat = seat;
    }
  }

  confirmSelection() {
    if (this.selectedSeat) {
      // Aggiorna il volo nel carrello con le informazioni del posto
      const cartItem = this.cartService
        .cart()
        .find(
          (item) =>
            item.flight.mongoId === this.flightId ||
            item.flight.id.toString() === this.flightId
        );

      if (cartItem) {
        const updatedFlight = {
          ...cartItem.flight,
          selectedSeat: {
            row: this.selectedSeat.row,
            number: this.selectedSeat.number,
            class: this.selectedSeat.seatClass,
            price: this.selectedSeat.price,
          },
        };

        this.cartService.updateCartItem(cartItem.flight.id, {
          flight: updatedFlight,
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
