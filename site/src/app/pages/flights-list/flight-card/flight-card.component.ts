import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB');
}

function formatTime(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

@Component({
  selector: 'app-flight-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col md:flex-row justify-between items-center bg-gradient-to-br from-blue-50 to-white shadow-xl border border-blue-200 rounded-3xl px-6 py-3 gap-6 hover:scale-[1.015] hover:shadow-2xl transition-all w-full max-w-3xl mx-auto relative overflow-hidden min-h-[140px]"
    >
      <div class="absolute top-4 left-4 flex flex-col gap-2 z-10 items-end">
        <span
          *ngIf="flight.stops === 0"
          class="bg-blue-600/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow"
          >Direct</span
        >
        <span
          *ngIf="flight.stops === 1"
          class="bg-yellow-400/90 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow"
          >1 stop</span
        >
      </div>
      <div class="absolute bottom-4 left-4 z-10">
        <span
          *ngIf="flight.airline?.name"
          class="bg-white/90 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1 rounded-full shadow flex items-center gap-1"
        >
          <svg
            class="inline w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M2 16l10-12 10 12H2z"
            />
          </svg>
          {{ flight.airline?.name }}
        </span>
      </div>
      <div class="flex-1 text-center flex flex-col gap-2">
        <div class="flex items-center justify-center gap-10">
          <div class="flex flex-col items-center">
            <span class="text-2xl font-extrabold text-blue-800">{{
              flight.departureCode
            }}</span>
            <span class="text-xs text-gray-500">{{
              formatDate(flight.departureDate)
            }}</span>
            <span class="text-xs text-gray-500">{{
              formatTime(flight.departureDate)
            }}</span>
          </div>
          <span class="text-3xl text-blue-400">
            <svg
              class="inline w-8 h-8"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M9 17l6-6-6-6"
              />
            </svg>
          </span>
          <div class="flex flex-col items-center">
            <span class="text-2xl font-extrabold text-blue-800">{{
              flight.arrivalCode
            }}</span>
            <span class="text-xs text-gray-500">{{
              formatDate(flight.arrivalDate)
            }}</span>
            <span class="text-xs text-gray-500">{{
              formatTime(flight.arrivalDate)
            }}</span>
          </div>
        </div>
        <div
          class="text-xs text-gray-500 mt-1 flex flex-wrap justify-center gap-2"
        >
          <span
            >Flight:
            <span class="font-mono">{{ flight.flightNumber }}</span></span
          >
          <span *ngIf="flight.plane?.model">| {{ flight.plane?.model }}</span>
        </div>
      </div>
      <!-- Price & Seats -->
      <div class="text-right w-full md:w-1/4 flex flex-col items-end gap-2">
        <span
          class="text-sm font-bold flex items-center gap-1"
          [ngClass]="{
            'text-red-500':
              flight.seatsAvailable === 0 || flight.seatsAvailable <= 10,
            'text-black': flight.seatsAvailable > 10
          }"
        >
          <svg
            *ngIf="flight.seatsAvailable > 0"
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5 12h14M12 5l7 7-7 7"
            />
          </svg>
          <ng-container *ngIf="flight.seatsAvailable === 0"
            >Sold out</ng-container
          >
          <ng-container
            *ngIf="flight.seatsAvailable > 0 && flight.seatsAvailable <= 10"
            >Only {{ flight.seatsAvailable }} left!</ng-container
          >
          <ng-container *ngIf="flight.seatsAvailable > 10"
            >{{ flight.seatsAvailable }} seats</ng-container
          >
        </span>
        <div
          class="text-2xl font-extrabold text-blue-700 bg-gradient-to-r from-blue-100 to-blue-300 px-5 py-2 rounded-xl shadow-md border border-blue-200"
        >
          {{ flight.price | currency : 'EUR' : 'symbol' : '1.2-2' }}
        </div>
        <button
          (click)="addToCart.emit(flight)"
          [disabled]="flight.seatsAvailable === 0"
          class="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white font-semibold py-2 px-6 rounded-xl shadow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <svg
            class="inline w-5 h-5 mr-1 -mt-1"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.35 2.7A2 2 0 0 0 7.48 19h9.04a2 2 0 0 0 1.83-1.3L21 13M7 13V6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v7"
            />
          </svg>
          Add to cart
        </button>
      </div>
    </div>
  `,
  styles: '',
  host: { '[class.w-full]': 'true' },
})
export class FlightCardComponent {
  @Input() flight: any;
  @Output() addToCart = new EventEmitter<any>();
  formatDate = formatDate;
  formatTime = formatTime;
}
