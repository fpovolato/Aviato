import {
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  signal,
  computed,
} from '@angular/core';
import { SeatService } from '../../services/seat.service';

@Component({
  selector: 'app-seat-selector',
  standalone: true,
  imports: [],
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-h-[80vh] overflow-y-auto w-full max-w-md">
        <h3 class="text-xl font-bold mb-4">Select Seat</h3>
        @for (row of seatRows(); track row) {
        <div class="flex items-center mb-2">
          <span class="w-6 font-medium">{{ row }}</span>
          <div class="flex flex-wrap gap-2 flex-1 ml-2">
            @for (seat of seats()[row]; track seat.number) {
            <button
              class="w-8 h-8 text-white rounded"
              [class.bg-green-500]="isSeatAvailable(seat)"
              [class.bg-gray-400]="!isSeatAvailable(seat)"
              [disabled]="!isSeatAvailable(seat)"
              (click)="selectSeat(seat)"
            >
              {{ seat.number }}
            </button>
            }
          </div>
        </div>
        }
        <div class="text-right mt-4">
          <button
            class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            (click)="close()"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class SeatSelectorComponent {
  flightId = input.required<number>();
  seatClass = input<'first' | 'economy'>('economy');
  @Output() seatSelected = new EventEmitter<{
    row: string;
    number: number;
    seatClass: 'first' | 'economy';
  }>();
  @Output() closed = new EventEmitter<void>();

  seatService = inject(SeatService);
  seats = signal<Record<string, any[]>>({});
  seatRows = computed(() => Object.keys(this.seats()));

  constructor() {
    this.loadSeats();
  }

  loadSeats() {
    this.seatService.getFlightSeats(this.flightId()).subscribe((res) => {
      this.seats.set(res.seats || {});
    });
  }

  isSeatAvailable(seat: any): boolean {
    return seat.seatClass === this.seatClass() && !seat.isReserved;
  }

  selectSeat(seat: any) {
    if (this.isSeatAvailable(seat)) {
      this.seatSelected.emit({
        row: seat.row,
        number: seat.number,
        seatClass: seat.seatClass,
      });
    }
  }

  close() {
    this.closed.emit();
  }
}

