import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { Plane, CabinConfiguration } from '../../models/plane.model';
import { PlaneService } from '../../services/plane.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-planes-page',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div
          class="w-full max-w-6xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100"
        >
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4"
          >
            <h2 class="text-2xl font-bold text-indigo-800">
              Aircraft Management
            </h2>
            <button
              (click)="showCreateForm = true"
              class="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2 rounded-lg font-semibold shadow"
            >
              Add Aircraft
            </button>
          </div>

          <!-- Create Plane Form -->
          <div
            *ngIf="showCreateForm"
            class="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200"
          >
            <h3 class="text-lg font-semibold mb-4 text-gray-800">
              Add New Aircraft
            </h3>
            <form
              (ngSubmit)="createPlane()"
              #planeForm="ngForm"
              class="space-y-4"
            >
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Code</label
                  >
                  <input
                    [(ngModel)]="newPlane.code"
                    name="code"
                    required
                    placeholder="A320-001"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Manufacturer</label
                  >
                  <input
                    [(ngModel)]="newPlane.manifacturer"
                    name="manifacturer"
                    required
                    placeholder="Airbus"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Model</label
                  >
                  <input
                    [(ngModel)]="newPlane.model"
                    name="model"
                    required
                    placeholder="A320"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Total Seats</label
                  >
                  <input
                    [(ngModel)]="newPlane.seats"
                    name="seats"
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Total Rows</label
                  >
                  <input
                    [(ngModel)]="newPlane.totalRows"
                    name="totalRows"
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1"
                    >Max Seats Per Row</label
                  >
                  <input
                    [(ngModel)]="newPlane.maxSeatsPerRow"
                    name="maxSeatsPerRow"
                    type="number"
                    required
                    min="1"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex items-center">
                  <input
                    [(ngModel)]="newPlane.hasWiFi"
                    name="hasWiFi"
                    type="checkbox"
                    class="mr-2"
                  />
                  <label class="text-sm font-medium text-gray-700"
                    >WiFi Available</label
                  >
                </div>
                <div class="flex items-center">
                  <input
                    [(ngModel)]="newPlane.hasEntertainment"
                    name="hasEntertainment"
                    type="checkbox"
                    class="mr-2"
                  />
                  <label class="text-sm font-medium text-gray-700"
                    >Entertainment System</label
                  >
                </div>
                <div class="flex items-center">
                  <input
                    [(ngModel)]="newPlane.hasPowerOutlets"
                    name="hasPowerOutlets"
                    type="checkbox"
                    class="mr-2"
                  />
                  <label class="text-sm font-medium text-gray-700"
                    >Power Outlets</label
                  >
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1"
                  >Airline</label
                >
                <select
                  [(ngModel)]="newPlane.airlineId"
                  name="airlineId"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select Airline</option>
                  <option
                    *ngFor="let airline of airlines"
                    [value]="airline._id"
                  >
                    {{ airline.name }} ({{ airline.code }})
                  </option>
                </select>
              </div>

              <!-- Cabin Configuration -->
              <div class="border-t pt-4">
                <h4 class="text-md font-semibold mb-3 text-gray-800">
                  Cabin Configuration
                </h4>
                <div
                  *ngFor="
                    let config of newPlane.cabinConfiguration;
                    let i = index
                  "
                  class="mb-4 p-4 bg-white rounded border"
                >
                  <div class="flex justify-between items-center mb-2">
                    <h5 class="font-medium">Section {{ i + 1 }}</h5>
                    <button
                      type="button"
                      (click)="removeCabinConfig(i)"
                      class="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div
                    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
                  >
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >Name</label
                      >
                      <input
                        [(ngModel)]="config.name"
                        [name]="'config' + i + 'name'"
                        placeholder="First Class"
                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >Class</label
                      >
                      <select
                        [(ngModel)]="config.seatClass"
                        [name]="'config' + i + 'class'"
                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="first">First Class</option>
                        <option value="economy">Economy Class</option>
                      </select>
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >Start Row</label
                      >
                      <input
                        [(ngModel)]="config.startRow"
                        [name]="'config' + i + 'startRow'"
                        type="number"
                        min="1"
                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >End Row</label
                      >
                      <input
                        [(ngModel)]="config.endRow"
                        [name]="'config' + i + 'endRow'"
                        type="number"
                        min="1"
                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >Seats Per Row</label
                      >
                      <input
                        [(ngModel)]="config.seatsPerRow"
                        [name]="'config' + i + 'seatsPerRow'"
                        type="number"
                        min="1"
                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >Layout</label
                      >
                      <input
                        [(ngModel)]="config.seatLayout"
                        [name]="'config' + i + 'layout'"
                        placeholder="3-3"
                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label
                        class="block text-xs font-medium text-gray-600 mb-1"
                        >Price Multiplier</label
                      >
                      <input
                        [(ngModel)]="config.priceMultiplier"
                        [name]="'config' + i + 'priceMultiplier'"
                        type="number"
                        min="0.1"
                        step="0.1"
                        class="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  (click)="addCabinConfig()"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                >
                  Add Cabin Section
                </button>
              </div>

              <div class="flex gap-3 pt-4">
                <button
                  type="submit"
                  [disabled]="planeForm.invalid || loading"
                  class="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-400 text-white px-4 py-2 rounded font-semibold"
                >
                  {{ loading ? 'Creating...' : 'Create Aircraft' }}
                </button>
                <button
                  type="button"
                  (click)="cancelCreate()"
                  class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <div *ngIf="loading" class="text-gray-400 italic text-center py-10">
            Loading aircraft...
          </div>
          <div
            *ngIf="!loading && planes.length === 0"
            class="text-gray-400 italic text-center py-10"
          >
            No aircraft found.
          </div>
          <div
            *ngIf="!loading && planes.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            <div
              *ngFor="let plane of planes"
              class="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div class="flex justify-between items-start mb-4">
                <div>
                  <h3 class="text-lg font-bold text-gray-800">
                    {{ plane.code }}
                  </h3>
                  <p class="text-sm text-gray-600">
                    {{ plane.manifacturer }} {{ plane.model }}
                  </p>
                  <p class="text-xs text-gray-500">{{ plane.airline.name }}</p>
                </div>
                <div class="text-right">
                  <span
                    class="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full"
                  >
                    {{ plane.seats }} seats
                  </span>
                </div>
              </div>

              <div class="space-y-2 mb-4">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Total Rows:</span>
                  <span class="font-medium">{{ plane.totalRows }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Max Seats/Row:</span>
                  <span class="font-medium">{{ plane.maxSeatsPerRow }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-600">Cabin Sections:</span>
                  <span class="font-medium">{{
                    plane.cabinConfiguration.length
                  }}</span>
                </div>
              </div>

              <div class="flex flex-wrap gap-1 mb-4">
                <span
                  *ngIf="plane.hasWiFi"
                  class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                >
                  WiFi
                </span>
                <span
                  *ngIf="plane.hasEntertainment"
                  class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  Entertainment
                </span>
                <span
                  *ngIf="plane.hasPowerOutlets"
                  class="inline-block bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                >
                  Power
                </span>
              </div>

              <div class="flex gap-2">
                <button
                  (click)="viewSeats(plane._id)"
                  class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  View Seats
                </button>
                <button
                  (click)="editPlane(plane)"
                  class="flex-1 bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  Edit
                </button>
                <button
                  (click)="deletePlane(plane._id)"
                  class="bg-red-500 hover:bg-red-400 text-white px-3 py-2 rounded text-sm font-medium"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class PlanesPageComponent implements OnInit {
  planes: Plane[] = [];
  airlines: any[] = [];
  loading = true;
  showCreateForm = false;

  newPlane = {
    code: '',
    manifacturer: '',
    model: '',
    seats: 0,
    totalRows: 0,
    maxSeatsPerRow: 0,
    airlineId: '',
    hasWiFi: false,
    hasEntertainment: false,
    hasPowerOutlets: false,
    cabinConfiguration: [] as CabinConfiguration[],
  };

  constructor(
    private planeService: PlaneService,
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (!user || !user.roles.map((r) => r.toLowerCase()).includes('admin')) {
        this.router.navigate(['/']);
      } else {
        this.fetchPlanes();
        this.fetchAirlines();
      }
    });
  }

  fetchPlanes() {
    this.loading = true;
    this.planeService.getPlanes().subscribe({
      next: (planes) => {
        this.planes = planes;
        this.loading = false;
      },
      error: () => {
        this.planes = [];
        this.loading = false;
      },
    });
  }

  fetchAirlines() {
    this.http.get<any[]>('/api/airlines').subscribe({
      next: (airlines) => {
        this.airlines = airlines;
      },
      error: () => {
        this.airlines = [];
      },
    });
  }

  addCabinConfig() {
    this.newPlane.cabinConfiguration.push({
      name: '',
      seatClass: 'economy',
      startRow: '',
      endRow: '',
      seatsPerRow: 0,
      seatLayout: '',
      priceMultiplier: 1.0,
    });
  }

  removeCabinConfig(index: number) {
    this.newPlane.cabinConfiguration.splice(index, 1);
  }

  createPlane() {
    if (this.newPlane.cabinConfiguration.length === 0) {
      alert('Please add at least one cabin configuration');
      return;
    }

    this.loading = true;
    this.planeService.createPlane(this.newPlane).subscribe({
      next: (plane) => {
        this.planes.push(plane);
        this.resetForm();
        this.showCreateForm = false;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error creating plane:', error);
        this.loading = false;
      },
    });
  }

  resetForm() {
    this.newPlane = {
      code: '',
      manifacturer: '',
      model: '',
      seats: 0,
      totalRows: 0,
      maxSeatsPerRow: 0,
      airlineId: '',
      hasWiFi: false,
      hasEntertainment: false,
      hasPowerOutlets: false,
      cabinConfiguration: [],
    };
  }

  cancelCreate() {
    this.showCreateForm = false;
    this.resetForm();
  }

  viewSeats(planeId: string) {
    this.router.navigate(['/planes', planeId, 'seats']);
  }

  editPlane(plane: Plane) {
    // TODO: Implement edit functionality
    console.log('Edit plane:', plane);
  }

  deletePlane(planeId: string) {
    if (!confirm('Are you sure you want to delete this aircraft?')) return;

    this.loading = true;
    this.planeService.deletePlane(planeId).subscribe({
      next: () => {
        this.planes = this.planes.filter((p) => p._id !== planeId);
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }
}
