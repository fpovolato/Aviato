import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { Flight } from '../../models/flights.model';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router } from '@angular/router';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-flights-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div
          class="w-full max-w-5xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100"
        >
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4"
          >
            <h2 class="text-2xl font-bold text-indigo-800">Flights</h2>
            <button
              (click)="goToCreateFlight()"
              class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow"
            >
              Create Flight
            </button>
          </div>
          <div class="mb-6 flex flex-col md:flex-row gap-4 items-center">
            <input
              [(ngModel)]="search"
              type="text"
              placeholder="Search by flight number, airline, or airport..."
              class="w-full md:w-96 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              (click)="applyFilter()"
              class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Search
            </button>
          </div>
          <div *ngIf="loading" class="text-gray-400 italic text-center py-10">
            Loading flights...
          </div>
          <div
            *ngIf="!loading && filteredFlights.length === 0"
            class="text-gray-400 italic text-center py-10"
          >
            No flights found.
          </div>
          <table
            *ngIf="!loading && filteredFlights.length > 0"
            class="w-full text-left border-collapse mt-4"
          >
            <thead>
              <tr class="bg-indigo-50">
                <th class="p-2">Flight#</th>
                <th class="p-2">Airline</th>
                <th class="p-2">From</th>
                <th class="p-2">To</th>
                <th class="p-2">Departure</th>
                <th class="p-2">Arrival</th>
                <th class="p-2">Status</th>
                <th class="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                *ngFor="let flight of filteredFlights"
                class="border-b hover:bg-indigo-50/50"
              >
                <td class="p-2 font-semibold">{{ flight.flightNumber }}</td>
                <td class="p-2">{{ flight.airline.name }}</td>
                <td class="p-2">
                  {{ flight.route.departureAirport.name }} ({{
                    flight.route.departureAirport.iata
                  }})
                </td>
                <td class="p-2">
                  {{ flight.route.arrivalAirport.name }} ({{
                    flight.route.arrivalAirport.iata
                  }})
                </td>
                <td class="p-2">
                  {{ flight.departureDate | date : 'dd/MM/yy HH:mm' }}
                </td>
                <td class="p-2">
                  {{ flight.arrivalDate | date : 'dd/MM/yy HH:mm' }}
                </td>
                <td class="p-2">
                  <select
                    [ngModel]="flight.status"
                    (ngModelChange)="onStatusChange(flight, $event)"
                    [disabled]="flight.status === 'cancelled'"
                    [ngClass]="{
                      'bg-green-100 text-green-800 border-green-300':
                        flight.status === 'scheduled',
                      'bg-blue-100 text-blue-800 border-blue-300':
                        flight.status === 'departed' ||
                        flight.status === 'landed',
                      'bg-yellow-100 text-yellow-800 border-yellow-300':
                        flight.status === 'delayed',
                      'bg-red-100 text-red-800 border-red-300':
                        flight.status === 'cancelled'
                    }"
                    class="px-2 py-1 rounded text-xs font-bold border focus:outline-none"
                  >
                    <option
                      value="scheduled"
                      class="text-green-800 bg-green-100"
                    >
                      scheduled
                    </option>
                    <option value="departed" class="text-blue-800 bg-blue-100">
                      departed
                    </option>
                    <option value="landed" class="text-blue-800 bg-blue-100">
                      landed
                    </option>
                    <option
                      value="delayed"
                      class="text-yellow-800 bg-yellow-100"
                    >
                      delayed
                    </option>
                    <option value="cancelled" class="text-red-800 bg-red-100">
                      cancelled
                    </option>
                  </select>
                </td>
                <td class="p-2">
                  <button
                    (click)="deleteFlight(flight._id)"
                    class="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded shadow"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class FlightsPageComponent implements OnInit {
  user: User | null = null;
  flights: Flight[] = [];
  filteredFlights: Flight[] = [];
  search = '';
  loading = true;

  constructor(
    private auth: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      this.user = user;
      this.fetchFlights();
    });
  }

  fetchFlights() {
    this.loading = true;
    this.http.get<Flight[]>('/api/flights').subscribe({
      next: (flights) => {
        if (this.user?.roles.includes('admin')) {
          this.flights = flights;
        } else if (this.user?.airlines && this.user.airlines.length > 0) {
          this.flights = flights.filter((f) =>
            this.user!.airlines!.some((a) => a._id === f.airline._id)
          );
        } else {
          this.flights = [];
        }
        this.autoUpdateStatuses();
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.flights = [];
        this.filteredFlights = [];
        this.loading = false;
      },
    });
  }

  autoUpdateStatuses() {
    const now = new Date();
    for (const flight of this.flights) {
      if (flight.status === 'delayed' || flight.status === 'cancelled')
        continue;
      const dep = new Date(flight.departureDate);
      const arr = new Date(flight.arrivalDate);
      let newStatus = 'scheduled';
      if (now >= dep && now < arr) newStatus = 'departed';
      if (now >= arr) newStatus = 'landed';
      if (flight.status !== newStatus) {
        flight.status = newStatus;
        // Persist auto status update to backend
        this.http
          .put(`/api/flights/${flight._id}`, { status: newStatus })
          .subscribe();
      }
    }
  }

  onStatusChange(flight: Flight, newStatus: string) {
    const update: any = { status: newStatus };
    this.http
      .patch(`/api/flights/${flight._id}/status`, update)
      .subscribe(() => {
        flight.status = newStatus;
        this.applyFilter();
      });
  }

  applyFilter() {
    const s = this.search.toLowerCase();
    this.filteredFlights = this.flights.filter(
      (f) =>
        f.flightNumber.toLowerCase().includes(s) ||
        f.airline.name.toLowerCase().includes(s) ||
        f.route.departureAirport.name.toLowerCase().includes(s) ||
        f.route.arrivalAirport.name.toLowerCase().includes(s)
    );
  }

  deleteFlight(id: string) {
    if (!confirm('Are you sure you want to delete this flight?')) return;
    this.http.delete(`/api/flights/${id}`).subscribe(() => {
      this.flights = this.flights.filter((f) => f._id !== id);
      this.applyFilter();
    });
  }

  // Update filter on search change
  ngOnChanges() {
    this.applyFilter();
  }

  // For two-way binding
  ngDoCheck() {
    this.applyFilter();
  }

  goToCreateFlight() {
    this.router.navigate(['/flights/create']);
  }
}
