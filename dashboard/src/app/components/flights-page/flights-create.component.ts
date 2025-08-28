import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-flights-create',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex items-center justify-center">
        <div
          class="w-full max-w-2xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100"
        >
          <h2 class="text-2xl font-bold text-indigo-800 mb-6">Create Flight</h2>
          <form (ngSubmit)="submit()" #flightForm="ngForm" class="space-y-4">
            <div>
              <label class="block font-semibold mb-1">Flight Number</label>
              <input
                name="flightNumber"
                [(ngModel)]="flight.flightNumber"
                required
                class="w-full px-3 py-2 border rounded"
              />
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block font-semibold mb-1">Route</label>
                <select name="route" [(ngModel)]="flight.route" required>
                  <option *ngFor="let r of routes" [value]="r._id">
                    {{ r.departureAirport.name }} ({{
                      r.departureAirport.iata
                    }}) → {{ r.arrivalAirport.name }} ({{
                      r.arrivalAirport.iata
                    }})
                  </option>
                </select>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block font-semibold mb-1">Departure Date</label>
                <input
                  name="departureDate"
                  [(ngModel)]="flight.departureDate"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div class="flex-1">
                <label class="block font-semibold mb-1">Arrival Date</label>
                <input
                  name="arrivalDate"
                  [(ngModel)]="flight.arrivalDate"
                  type="datetime-local"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block font-semibold mb-1">Airline</label>
                <select
                  name="airline"
                  [(ngModel)]="flight.airline"
                  required
                  class="w-full px-3 py-2 border rounded"
                  [disabled]="airlines.length === 0"
                >
                  <option *ngFor="let al of airlines" [value]="al._id">
                    {{ al.name }} ({{ al.code }})
                  </option>
                </select>
                <div
                  *ngIf="airlines.length === 0"
                  class="text-red-500 text-xs mt-1"
                >
                  No airlines available for flight creation.
                </div>
              </div>
              <div class="flex-1">
                <label class="block font-semibold mb-1">Plane</label>
                <select
                  name="plane"
                  [(ngModel)]="flight.plane"
                  required
                  class="w-full px-3 py-2 border rounded"
                >
                  <option *ngFor="let p of planes" [value]="p._id">
                    {{ p.code }} - {{ p.manifacturer }} {{ p.model }}
                  </option>
                </select>
              </div>
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block font-semibold mb-1">Status</label>
                <select
                  name="status"
                  [(ngModel)]="flight.status"
                  required
                  class="w-full px-3 py-2 border rounded"
                >
                  <option value="scheduled">scheduled</option>
                  <option value="departed">departed</option>
                  <option value="landed">landed</option>
                  <option value="delayed">delayed</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </div>
              <div class="flex-1">
                <label class="block font-semibold mb-1">Price</label>
                <input
                  name="price"
                  [(ngModel)]="flight.price"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div class="flex gap-4">
              <div class="flex-1">
                <label class="block font-semibold mb-1"
                  >First Class Price</label
                >
                <input
                  name="firstClassPrice"
                  [(ngModel)]="flight.firstClassPrice"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
              <div class="flex-1">
                <label class="block font-semibold mb-1"
                  >Additional Luggage Price</label
                >
                <input
                  name="additionalLuggagePrice"
                  [(ngModel)]="flight.additionalLuggagePrice"
                  type="number"
                  min="0"
                  required
                  class="w-full px-3 py-2 border rounded"
                />
              </div>
            </div>
            <div class="flex justify-end gap-4 mt-6">
              <button
                type="button"
                (click)="router.navigate(['/flights'])"
                class="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                [disabled]="flightForm.invalid || loading"
                class="px-6 py-2 rounded bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
              >
                Create
              </button>
            </div>
            <div *ngIf="error" class="text-red-600 mt-2">{{ error }}</div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class FlightsCreateComponent implements OnInit {
  flight: any = {
    flightNumber: '',
    route: '',
    departureDate: '',
    arrivalDate: '',
    airline: '',
    plane: '',
    status: 'scheduled',
    price: '',
    firstClassPrice: '',
    additionalLuggagePrice: '',
  };
  airlines: any[] = [];
  routes: any[] = [];
  planes: any[] = [];
  loading = false;
  error = '';
  user: any = null;

  constructor(
    private http: HttpClient,
    public router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      this.user = user;
      this.http.get<any[]>('/api/airlines').subscribe((data) => {
        if (
          user &&
          user.roles.includes('employee') &&
          user.airlines &&
          user.airlines.length > 0
        ) {
          this.airlines = data.filter((a) =>
            user.airlines.some((ua: any) => ua._id === a._id)
          );
          if (this.airlines.length === 1)
            this.flight.airline = String(this.airlines[0]._id);
        } else {
          this.airlines = data;
        }
      });
    });
    this.http
      .get<any[]>('/api/routes')
      .subscribe((data) => (this.routes = data));
    this.http
      .get<any[]>('/api/planes')
      .subscribe((data) => (this.planes = data));
  }

  submit() {
    this.loading = true;
    this.error = '';
    const body = { ...this.flight };
    if (body.departureDate)
      body.departureDate = new Date(body.departureDate).toISOString();
    if (body.arrivalDate)
      body.arrivalDate = new Date(body.arrivalDate).toISOString();
    this.http.post('/api/flights', body).subscribe({
      next: () => this.router.navigate(['/flights']),
      error: (err) => {
        this.error = err.error?.message || 'Error creating flight';
        this.loading = false;
      },
    });
  }
}
