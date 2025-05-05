import {Component, input} from '@angular/core';
import {Flight} from '../../../models/flights.model';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-flight-card',
  imports: [
    NgIf
  ],
  template: `
    <div class="flex justify-between items-center bg-white shadow-md border rounded p-6 relative w-full max-w-4xl">
      <!-- Airline Info -->
      <div class="flex flex-col items-start w-1/5">
        <!--<img src="/assets/airline-logo.svg" alt="Airline Logo" class="w-6 h-6 mb-1">-->
        <span class="text-sm text-gray-600">Operated by</span>
        <span class="text-sm font-medium"> {{ flight().airline }} </span>
      </div>

      <!-- Departure and Arrival -->
      <div class="flex-1 text-center">
        <div class="flex items-center justify-center gap-4">
          <div class="text-xl font-semibold">{{ flight().departure }}</div>
          <div class="text-sm text-gray-500">{{ flight().number }}</div>
          <div class="text-xl font-semibold">{{ flight().arrival }}</div>
        </div>
        <div class="text-sm text-gray-500 mt-1">
          {{ flight().from }} → {{ flight().to }}
        </div>
        <div class="text-sm text-gray-500">duration</div>
      </div>

      <!-- Price and Button -->
      <div class="text-right w-1/4">
<!--
        <div *ngIf="flight().seats<= 3" class="text-xs text-red-700 mb-1"> {{ flight().seats }} seats left</div>
-->
        <span class="text-sm font-bold">
          @if (flight().seats) {
            {{flight().seats}} seats left
          } else {

          }
        </span>
        <div class="text-lg font-bold text-blue-800">{{ flight().price + '€'}}</div>
        <button
          class="mt-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-semibold py-2 px-4 rounded hover:opacity-90">
          Select
        </button>
      </div>
    </div>
  `,
  styles: ``
})
export class FlightCardComponent {
  flight = input.required<Flight>();

}
