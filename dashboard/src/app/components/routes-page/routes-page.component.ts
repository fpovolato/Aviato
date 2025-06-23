import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Route as RouteModel } from '../../models/route.model';

@Component({
  selector: 'app-routes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100">
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div class="w-full max-w-4xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
            <h2 class="text-2xl font-bold text-indigo-800">Routes</h2>
            <button (click)="goToCreateRoute()" class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow">Create Route</button>
          </div>
          <div class="mb-6 flex flex-col md:flex-row gap-4 items-center">
            <input
              [(ngModel)]="search"
              type="text"
              placeholder="Search by code or airport..."
              class="w-full md:w-96 px-4 py-2 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button (click)="applyFilter()" class="bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg font-semibold">Search</button>
          </div>
          <div *ngIf="loading" class="text-gray-400 italic text-center py-10">Loading routes...</div>
          <div *ngIf="!loading && filteredRoutes.length === 0" class="text-gray-400 italic text-center py-10">No routes found.</div>
          <table *ngIf="!loading && filteredRoutes.length > 0" class="w-full text-left border-collapse mt-4">
            <thead>
              <tr class="bg-indigo-50">
                <th class="p-2">Code</th>
                <th class="p-2">From</th>
                <th class="p-2">To</th>
                <th class="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let route of filteredRoutes" class="border-b hover:bg-indigo-50/50">
                <td class="p-2 font-semibold">{{ route.code }}</td>
                <td class="p-2">{{ route.departureAirport.name }} ({{ route.departureAirport.iata }})</td>
                <td class="p-2">{{ route.arrivalAirport.name }} ({{ route.arrivalAirport.iata }})</td>
                <td class="p-2">
                  <button (click)="deleteRoute(route._id)" class="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded shadow">Delete</button>
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
export class RoutesPageComponent implements OnInit {
  routes: RouteModel[] = [];
  filteredRoutes: RouteModel[] = [];
  search = '';
  loading = true;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchRoutes();
  }

  fetchRoutes() {
    this.loading = true;
    this.http.get<RouteModel[]>('/api/routes').subscribe({
      next: (routes) => {
        this.routes = routes;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.routes = [];
        this.filteredRoutes = [];
        this.loading = false;
      }
    });
  }

  applyFilter() {
    const s = this.search.toLowerCase();
    this.filteredRoutes = this.routes.filter(r =>
      r.code.toLowerCase().includes(s) ||
      r.departureAirport.name.toLowerCase().includes(s) ||
      r.arrivalAirport.name.toLowerCase().includes(s) ||
      r.departureAirport.iata.toLowerCase().includes(s) ||
      r.arrivalAirport.iata.toLowerCase().includes(s)
    );
  }

  goToCreateRoute() {
    this.router.navigate(['/routes/create']);
  }

  deleteRoute(id: string) {
    if (!confirm('Are you sure you want to delete this route?')) return;
    this.http.delete(`/api/routes/${id}`).subscribe(() => {
      this.routes = this.routes.filter(r => r._id !== id);
      this.applyFilter();
    });
  }
} 