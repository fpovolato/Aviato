import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { FlightCardComponent } from '../flights-list/flight-card/flight-card.component';

@Component({
  selector: 'app-home',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FlightCardComponent,
  ],
  template: `
    <div
      class="min-h-screen bg-gradient-to-br from-blue-100 via-blue-50 to-white flex flex-col"
    >
      <main
        class="flex flex-col items-center justify-center flex-1 pt-12 pb-16"
      >
        <div class="flex flex-col items-center w-full">
          <img
            src="/assets/logo.svg"
            alt="Aviato Logo"
            class="w-44 md:w-64 mb-4 drop-shadow-lg"
          />
          <h1
            class="text-4xl md:text-5xl font-extrabold text-blue-800 mb-2 tracking-tight text-center"
          >
            Welcome to Aviato
          </h1>
          <p
            class="text-lg md:text-xl text-blue-700 mb-8 text-center max-w-2xl"
          >
            Find and book your next flight with ease. Search, compare, and fly
            with confidence.
          </p>
          <form
            class="w-full max-w-4xl bg-white/90 rounded-2xl shadow-2xl border border-blue-100 p-8 flex flex-col gap-4 backdrop-blur-sm"
            (ngSubmit)="onSearchFlights($event)"
          >
            <div class="flex flex-col md:flex-row gap-4">
              <div class="flex-1 min-w-[160px] relative">
                <label class="block text-sm font-semibold mb-1">From</label>
                <input
                  type="text"
                  placeholder="Airport"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  [formControl]="fromControl"
                  autocomplete="off"
                />
                <ul
                  *ngIf="fromSuggestions.length"
                  class="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 max-h-56 overflow-auto shadow"
                >
                  <li
                    *ngFor="let a of fromSuggestions"
                    (click)="selectFrom(a)"
                    class="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    {{ a.name }}
                    <span class="text-gray-500">({{ a.iata || a.icao }})</span>
                    - {{ a.city }}, {{ a.country }}
                  </li>
                </ul>
                <div
                  *ngIf="fromNoResults"
                  class="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 px-4 py-2 text-sm text-gray-500 shadow"
                >
                  No results found
                </div>
              </div>
              <div class="w-40">
                <label class="block text-sm font-semibold mb-1"
                  >Departure date</label
                >
                <input
                  type="date"
                  [(ngModel)]="departureDate"
                  name="departureDate"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
              <div class="w-32">
                <label class="block text-sm font-semibold mb-1"
                  >Departure time</label
                >
                <input
                  type="time"
                  [(ngModel)]="departureTime"
                  name="departureTime"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div class="flex flex-col md:flex-row gap-4 items-end">
              <div class="flex-1 min-w-[160px] relative">
                <label class="block text-sm font-semibold mb-1">To</label>
                <input
                  type="text"
                  placeholder="Airport"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  [formControl]="toControl"
                  autocomplete="off"
                />
                <ul
                  *ngIf="toSuggestions.length"
                  class="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 max-h-56 overflow-auto shadow"
                >
                  <li
                    *ngFor="let a of toSuggestions"
                    (click)="selectTo(a)"
                    class="px-4 py-2 hover:bg-blue-100 cursor-pointer text-sm"
                  >
                    {{ a.name }}
                    <span class="text-gray-500">({{ a.iata || a.icao }})</span>
                    - {{ a.city }}, {{ a.country }}
                  </li>
                </ul>
                <div
                  *ngIf="toNoResults"
                  class="absolute z-10 bg-white border border-gray-200 rounded w-full mt-1 px-4 py-2 text-sm text-gray-500 shadow"
                >
                  No results found
                </div>
              </div>
              <div class="w-40">
                <label class="block text-sm font-semibold mb-1"
                  >Return date</label
                >
                <input
                  type="date"
                  [(ngModel)]="returnDate"
                  name="returnDate"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  [disabled]="!roundTrip"
                />
              </div>
              <div class="w-32">
                <label class="block text-sm font-semibold mb-1"
                  >Return time</label
                >
                <input
                  type="time"
                  [(ngModel)]="returnTime"
                  name="returnTime"
                  class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  [disabled]="!roundTrip"
                />
              </div>
              <div
                class="flex flex-row items-center gap-4 ml-auto mb-2 md:mb-0"
              >
                <label class="inline-flex items-center">
                  <input
                    type="checkbox"
                    class="form-checkbox h-5 w-5 text-blue-600"
                    [(ngModel)]="roundTrip"
                    name="roundTrip"
                  />
                  <span class="ml-2 text-sm">Round trip</span>
                </label>
                <button
                  class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold shadow"
                >
                  Search flights
                </button>
              </div>
            </div>
          </form>
          <div class="w-full max-w-4xl mt-10" *ngIf="flights.length > 0">
            <h2 class="text-2xl font-bold mb-6 text-blue-800">
              Available flights
            </h2>
            <div class="flex flex-col gap-8">
              <ng-container *ngFor="let result of flights">
                <app-flight-card
                  *ngIf="result.type === 'direct'"
                  [flight]="result.segments[0]"
                  (addToCart)="addToCart($event)"
                ></app-flight-card>
                <div
                  *ngIf="result.type === 'one-stop'"
                  class="bg-white/90 border border-blue-100 rounded-2xl shadow-lg p-6"
                >
                  <div
                    class="flex items-center justify-between cursor-pointer"
                    (click)="result.expanded = !result.expanded"
                  >
                    <div>
                      <span class="font-bold text-blue-700">One-stop:</span>
                      {{
                        result.segments[0].route.departureAirport.iata ||
                          result.segments[0].route.departureAirport.name
                      }}
                      →
                      {{
                        result.segments[1].route.arrivalAirport.iata ||
                          result.segments[1].route.arrivalAirport.name
                      }}
                      <span class="text-gray-500 ml-2"
                        >via
                        {{
                          result.segments[0].route.arrivalAirport.iata ||
                            result.segments[0].route.arrivalAirport.name
                        }}</span
                      >
                    </div>
                    <span class="text-blue-600 font-semibold">
                      {{ result.expanded ? 'Hide details' : 'Show details' }}
                    </span>
                  </div>
                  <div *ngIf="result.expanded" class="mt-4 flex flex-col gap-4">
                    <app-flight-card
                      [flight]="result.segments[0]"
                      (addToCart)="addToCart($event)"
                    ></app-flight-card>
                    <app-flight-card
                      [flight]="result.segments[1]"
                      (addToCart)="addToCart($event)"
                    ></app-flight-card>
                  </div>
                  <div class="flex justify-end mt-4">
                    <button
                      (click)="addToCart(result.segments)"
                      class="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-700 hover:to-blue-500 text-white px-6 py-2 rounded-xl font-semibold shadow"
                    >
                      Add both segments to cart
                    </button>
                  </div>
                </div>
              </ng-container>
            </div>
          </div>
          <div
            class="w-full max-w-4xl mt-10 text-center text-gray-500"
            *ngIf="!searching && flights.length === 0 && flights"
          >
            <span>No flights found.</span>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: '',
})
export class HomeComponent {
  roundTrip = false;

  fromControl = new FormControl('');
  toControl = new FormControl('');
  departureDate = '';
  departureTime = '';
  returnDate = '';
  returnTime = '';

  fromSuggestions: any[] = [];
  toSuggestions: any[] = [];
  fromNoResults = false;
  toNoResults = false;

  flights: any[] = [];
  searching = false;

  selectedFromAirport: any = null;
  selectedToAirport: any = null;

  private justSelectedFrom = false;
  private justSelectedTo = false;

  constructor(private http: HttpClient) {
    this.fromControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) =>
          q && q.length > 1
            ? this.http.get<any[]>(`/api/airports/search?q=${q}`)
            : of([])
        )
      )
      .subscribe((results) => {
        this.fromSuggestions = results;
        this.fromNoResults =
          typeof this.fromControl.value === 'string' &&
          this.fromControl.value.length > 1 &&
          results.length === 0;
      });

    this.toControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((q) =>
          q && q.length > 1
            ? this.http.get<any[]>(`/api/airports/search?q=${q}`)
            : of([])
        )
      )
      .subscribe((results) => {
        this.toSuggestions = results;
        this.toNoResults =
          typeof this.toControl.value === 'string' &&
          this.toControl.value.length > 1 &&
          results.length === 0;
      });

    this.fromControl.valueChanges.subscribe((val) => {
      if (
        !this.justSelectedFrom &&
        typeof val === 'string' &&
        (!this.selectedFromAirport ||
          this.formatAirport(this.selectedFromAirport) !== val)
      ) {
        this.selectedFromAirport = null;
      }
    });
    this.toControl.valueChanges.subscribe((val) => {
      if (
        !this.justSelectedTo &&
        typeof val === 'string' &&
        (!this.selectedToAirport ||
          this.formatAirport(this.selectedToAirport) !== val)
      ) {
        this.selectedToAirport = null;
      }
    });
  }

  selectFrom(airport: any) {
    this.justSelectedFrom = true;
    this.fromControl.setValue(this.formatAirport(airport), {
      emitEvent: false,
    });
    this.selectedFromAirport = airport;
    this.fromSuggestions = [];
    this.fromNoResults = false;
    setTimeout(() => (this.justSelectedFrom = false), 100);
  }

  selectTo(airport: any) {
    this.justSelectedTo = true;
    this.toControl.setValue(this.formatAirport(airport), { emitEvent: false });
    this.selectedToAirport = airport;
    this.toSuggestions = [];
    this.toNoResults = false;
    setTimeout(() => (this.justSelectedTo = false), 100);
  }

  formatAirport(a: any) {
    return `${a.name} (${a.iata || a.icao || ''}) - ${a.city}, ${a.country}`;
  }

  mapFlight(f: any, stops = 0) {
    return {
      ...f,
      departureCode:
        f.route?.departureAirport?.iata || f.route?.departureAirport?.name,
      arrivalCode:
        f.route?.arrivalAirport?.iata || f.route?.arrivalAirport?.name,
      stops,
    };
  }

  onSearchFlights(event: Event) {
    event.preventDefault();
    this.searching = true;
    const params: any = {};
    if (!this.selectedFromAirport?._id || !this.selectedToAirport?._id) {
      alert(
        'Please select both departure and arrival airports from the suggestions.'
      );
      this.searching = false;
      return;
    }
    if (this.selectedFromAirport?._id)
      params.from = this.selectedFromAirport._id;
    if (this.selectedToAirport?._id) params.to = this.selectedToAirport._id;
    // Departure
    if (this.departureDate) {
      if (this.departureTime) {
        params.departureDate = this.departureDate + 'T' + this.departureTime;
      } else {
        // Filtro per tutto il giorno: >= inizio giorno, < giorno successivo
        params.departureDate = this.departureDate + 'T00:00';
        params.departureDateEnd = this.addOneDay(this.departureDate) + 'T00:00';
      }
    }
    // Return
    if (this.roundTrip && this.returnDate) {
      if (this.returnTime) {
        params.returnDate = this.returnDate + 'T' + this.returnTime;
      } else {
        params.returnDate = this.returnDate + 'T00:00';
        params.returnDateEnd = this.addOneDay(this.returnDate) + 'T00:00';
      }
    }
    this.http.get<any[]>('/api/flights/search', { params }).subscribe({
      next: (flights) => {
        this.flights = flights.map((result) => {
          if (result.type === 'direct') {
            return {
              ...result,
              segments: [this.mapFlight(result.segments[0], 0)],
            };
          } else if (result.type === 'one-stop') {
            return {
              ...result,
              segments: [
                this.mapFlight(result.segments[0], 1),
                this.mapFlight(result.segments[1], 1),
              ],
            };
          }
          return result;
        });
        this.searching = false;
      },
      error: () => {
        this.flights = [];
        this.searching = false;
      },
    });
  }

  addOneDay(dateStr: string): string {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }

  addToCart(flight: any) {
    // TODO: integrare con il carrello
    alert('Added to cart: ' + flight.flightNumber);
  }
}
