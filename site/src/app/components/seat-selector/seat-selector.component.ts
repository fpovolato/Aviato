import {
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeatReservationService } from '../../services/seat-reservation.service';

@Component({
  selector: 'app-seat-selector',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        class="bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto w-full max-w-4xl"
      >
        <!-- Header -->
        <div
          class="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl"
        >
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-2xl font-bold text-gray-800">Select Your Seat</h3>
              <p class="text-gray-600 mt-1">
                Flight {{ flightData()?.flight?.flightNumber }} -
                {{ flightData()?.flight?.departureDate | date : 'short' }}
              </p>
            </div>
            <button
              (click)="close()"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                class="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Class Selection -->
        <div class="p-6 border-b border-gray-200">
          <h4 class="text-lg font-semibold mb-4">Choose Your Class</h4>
          <div class="flex gap-4">
            <button
              (click)="selectedClass.set('economy')"
              [class]="
                selectedClass() === 'economy'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all"
            >
              <div class="text-center">
                <div class="font-bold">Economy Class</div>
                <div class="text-sm opacity-80">
                  {{ flightData()?.flight?.price | currency : 'EUR' }}
                </div>
              </div>
            </button>
            <button
              (click)="selectedClass.set('first')"
              [class]="
                selectedClass() === 'first'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              "
              class="flex-1 py-3 px-6 rounded-xl font-semibold transition-all"
            >
              <div class="text-center">
                <div class="font-bold">First Class</div>
                <div class="text-sm opacity-80">
                  {{ flightData()?.flight?.firstClassPrice | currency : 'EUR' }}
                </div>
              </div>
            </button>
          </div>
        </div>

        <!-- Seat Map -->
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h4 class="text-lg font-semibold">Seat Map</h4>
            <div class="flex items-center gap-4 text-sm">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-green-500 rounded"></div>
                <span>Available</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-gray-400 rounded"></div>
                <span>Occupied</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 bg-blue-500 rounded"></div>
                <span>Selected</span>
              </div>
            </div>
          </div>

          <!-- Aircraft Layout -->
          <div class="bg-gray-50 rounded-xl p-6 mb-6">
            <div class="text-center mb-4">
              <div class="text-sm text-gray-600">Front of Aircraft</div>
            </div>

            <!-- Seat Grid -->
            <div class="space-y-2">
              @for (row of seatRows(); track row) {
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
              <div class="text-sm text-gray-600">Back of Aircraft</div>
            </div>
          </div>

          <!-- Selected Seat Info -->
          @if (selectedSeat()) {
          <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h5 class="font-semibold text-blue-800 mb-2">Selected Seat</h5>
            <div class="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span class="font-medium">Seat:</span> {{ selectedSeat()?.row
                }}{{ selectedSeat()?.number }}
              </div>
              <div>
                <span class="font-medium">Class:</span>
                {{ selectedSeat()?.seatClass | titlecase }}
              </div>
              <div>
                <span class="font-medium">Type:</span>
                <span *ngIf="selectedSeat()?.isWindow">Window</span>
                <span *ngIf="selectedSeat()?.isAisle">Aisle</span>
                <span
                  *ngIf="!selectedSeat()?.isWindow && !selectedSeat()?.isAisle"
                  >Middle</span
                >
              </div>
              <div>
                <span class="font-medium">Price:</span>
                {{ selectedSeat()?.price | currency : 'EUR' }}
              </div>
            </div>
          </div>
          }
        </div>

        <!-- Footer -->
        <div
          class="sticky bottom-0 bg-white border-t border-gray-200 p-6 rounded-b-2xl"
        >
          <div class="flex justify-between items-center">
            <button
              (click)="close()"
              class="px-6 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              (click)="confirmSelection()"
              [disabled]="!selectedSeat()"
              class="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all"
            >
              Confirm Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class SeatSelectorComponent {
  flightId = input.required<string>();
  @Output() seatSelected = new EventEmitter<{
    seatRow: string; // Aggiornato per essere coerente con il backend
    seatNumber: number; // Aggiornato per essere coerente con il backend
    seatClass: 'first' | 'economy';
    price: number;
  }>();
  @Output() closed = new EventEmitter<void>();

  seatService = inject(SeatReservationService);
  seats = signal<Record<string, any[]>>({});
  seatRows = computed(() => Object.keys(this.seats()));
  selectedClass = signal<'first' | 'economy'>('economy');
  selectedSeat = signal<any>(null);
  flightData = signal<any>(null);

  constructor() {
    this.loadSeats();
  }

  loadSeats() {
    this.seatService.getFlightSeats(this.flightId()).subscribe((res) => {
      this.seats.set(res.seats || {});
      this.flightData.set(res);
    });
  }

  getSeatsForRow(row: string): any[] {
    return this.seats()[row] || [];
  }

  isSeatAvailable(seat: any): boolean {
    return seat.seatClass === this.selectedClass() && !seat.isReserved;
  }

  getSeatClass(seat: any): string {
    if (seat.isReserved) {
      return 'bg-gray-400 text-white cursor-not-allowed';
    }

    if (seat.seatClass !== this.selectedClass()) {
      return 'bg-gray-300 text-gray-500 cursor-not-allowed';
    }

    if (
      this.selectedSeat() &&
      this.selectedSeat().row === seat.row &&
      this.selectedSeat().number === seat.number
    ) {
      return 'bg-blue-500 text-white hover:bg-blue-600';
    }

    return 'bg-green-500 text-white hover:bg-green-600';
  }

  selectSeat(seat: any) {
    if (this.isSeatAvailable(seat)) {
      this.selectedSeat.set(seat);
    }
  }

  confirmSelection() {
    if (this.selectedSeat()) {
      this.seatSelected.emit({
        seatRow: this.selectedSeat().row, // Mappa row -> seatRow
        seatNumber: this.selectedSeat().number, // Mappa number -> seatNumber
        seatClass: this.selectedSeat().seatClass,
        price: this.selectedSeat().price,
      });
    }
  }

  close() {
    this.closed.emit();
  }
}
