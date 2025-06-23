import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';

interface Airport {
  _id: string;
  name: string;
  iata: string;
}

@Component({
  selector: 'app-routes-create',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div class="w-full max-w-xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100">
          <h2 class="text-2xl font-bold text-indigo-800 mb-6">Create Route</h2>
          <form (ngSubmit)="onSubmit()" #routeForm="ngForm" class="flex flex-col gap-6">
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Route Code</label>
              <input
                type="text"
                [(ngModel)]="code"
                name="code"
                required
                maxlength="10"
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Departure Airport</label>
              <select
                [(ngModel)]="departureAirportId"
                name="departureAirport"
                required
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="" disabled selected>Select airport</option>
                <option *ngFor="let airport of airports" [value]="airport._id">
                  {{ airport.name }} ({{ airport.iata }})
                </option>
              </select>
            </div>
            <div>
              <label class="block mb-1 font-semibold text-indigo-700">Arrival Airport</label>
              <select
                [(ngModel)]="arrivalAirportId"
                name="arrivalAirport"
                required
                class="w-full px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="" disabled selected>Select airport</option>
                <option *ngFor="let airport of airports" [value]="airport._id">
                  {{ airport.name }} ({{ airport.iata }})
                </option>
              </select>
            </div>
            <div *ngIf="error" class="text-red-500 text-sm">{{ error }}</div>
            <button
              type="submit"
              [disabled]="routeForm.invalid || loading"
              class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow disabled:opacity-50"
            >
              {{ loading ? 'Creating...' : 'Create Route' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class RoutesCreateComponent implements OnInit {
  code = '';
  departureAirportId = '';
  arrivalAirportId = '';
  airports: Airport[] = [];
  loading = false;
  error = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchAirports();
  }

  fetchAirports() {
    this.http.get<Airport[]>('/api/airports').subscribe({
      next: (airports) => {
        this.airports = airports;
      },
      error: () => {
        this.airports = [];
      }
    });
  }

  onSubmit() {
    if (this.departureAirportId === this.arrivalAirportId) {
      this.error = 'Departure and arrival airports must be different.';
      return;
    }
    this.loading = true;
    this.error = '';
    this.http.post('/api/routes', {
      code: this.code,
      departureAirport: this.departureAirportId,
      arrivalAirport: this.arrivalAirportId
    }).subscribe({
      next: () => {
        this.router.navigate(['/routes']);
      },
      error: (err) => {
        this.error = err?.error?.message || 'Failed to create route.';
        this.loading = false;
      }
    });
  }
} 