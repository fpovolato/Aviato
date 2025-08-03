import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { User } from '../../models/user.model';
import { PlaneSeatsResponse, Seat } from '../../models/plane.model';
import { PlaneService } from '../../services/plane.service';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-plane-seats',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-100 via-white to-blue-100"
    >
      <app-sidebar></app-sidebar>
      <div class="flex-1 flex flex-col items-center p-10 overflow-auto">
        <div
          class="w-full max-w-7xl bg-white/90 rounded-2xl shadow-xl p-10 border border-indigo-100"
        >
          <div class="flex justify-between items-center mb-6">
            <div>
              <h2 class="text-2xl font-bold text-indigo-800">Aircraft Seats</h2>
              <p class="text-gray-600">
                {{ planeInfo?.code }} - {{ planeInfo?.manifacturer }}
                {{ planeInfo?.model }}
              </p>
            </div>
            <button
              (click)="goBack()"
              class="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold"
            >
              Back to Aircraft
            </button>
          </div>

          <!-- Statistics -->
          <div
            *ngIf="seatsData"
            class="mb-8 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4"
          >
            <div class="bg-blue-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-blue-600">
                {{ seatsData.stats.total }}
              </div>
              <div class="text-sm text-blue-800">Total Seats</div>
            </div>
            <div class="bg-green-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-green-600">
                {{ seatsData.stats.available }}
              </div>
              <div class="text-sm text-green-800">Available</div>
            </div>
            <div class="bg-yellow-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-yellow-600">
                {{ seatsData.stats.first }}
              </div>
              <div class="text-sm text-yellow-800">First Class</div>
            </div>
            <div class="bg-gray-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-gray-600">
                {{ seatsData.stats.economy }}
              </div>
              <div class="text-sm text-gray-800">Economy</div>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-purple-600">
                {{ seatsData.stats.window }}
              </div>
              <div class="text-sm text-purple-800">Window</div>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-orange-600">
                {{ seatsData.stats.aisle }}
              </div>
              <div class="text-sm text-orange-800">Aisle</div>
            </div>
            <div class="bg-red-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-red-600">
                {{ seatsData.stats.emergencyExit }}
              </div>
              <div class="text-sm text-red-800">Emergency Exit</div>
            </div>
            <div class="bg-indigo-50 p-4 rounded-lg text-center">
              <div class="text-2xl font-bold text-indigo-600">
                {{ seatsData.stats.bulkhead }}
              </div>
              <div class="text-sm text-indigo-800">Bulkhead</div>
            </div>
          </div>

          <!-- Seat Map -->
          <div
            *ngIf="seatsData"
            class="bg-white rounded-lg border border-gray-200 p-6"
          >
            <h3 class="text-lg font-semibold mb-4 text-gray-800">
              Seat Layout
            </h3>

            <!-- Legend -->
            <div class="mb-6 flex flex-wrap gap-4 text-sm">
              <div class="flex items-center">
                <div class="w-4 h-4 bg-gray-200 rounded mr-2"></div>
                <span>Available</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-green-500 rounded mr-2"></div>
                <span>First Class</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-blue-500 rounded mr-2"></div>
                <span>Economy</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-purple-500 rounded mr-2"></div>
                <span>Window</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-orange-500 rounded mr-2"></div>
                <span>Aisle</span>
              </div>
              <div class="flex items-center">
                <div class="w-4 h-4 bg-red-500 rounded mr-2"></div>
                <span>Emergency Exit</span>
              </div>
            </div>

            <!-- Seat Grid -->
            <div class="overflow-x-auto">
              <div class="inline-block min-w-full">
                <div *ngFor="let row of seatRows" class="mb-2">
                  <div class="flex items-center">
                    <div class="w-12 text-center font-bold text-gray-600">
                      {{ row }}
                    </div>
                    <div class="flex gap-1 ml-4">
                      <div
                        *ngFor="let seat of getSeatsForRow(row)"
                        [ngClass]="getSeatClass(seat)"
                        class="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                        [title]="getSeatTooltip(seat)"
                      >
                        {{ seat.number }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cabin Sections Info -->
            <div class="mt-8">
              <h4 class="text-md font-semibold mb-3 text-gray-800">
                Cabin Sections
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div
                  *ngFor="let section of planeInfo?.cabinConfiguration"
                  class="bg-gray-50 p-4 rounded-lg"
                >
                  <h5 class="font-semibold text-gray-800">
                    {{ section.name }}
                  </h5>
                  <div class="text-sm text-gray-600 space-y-1">
                    <div>
                      Class:
                      {{
                        section.seatClass === 'first'
                          ? 'First Class'
                          : 'Economy'
                      }}
                    </div>
                    <div>
                      Rows: {{ section.startRow }} - {{ section.endRow }}
                    </div>
                    <div>Seats per row: {{ section.seatsPerRow }}</div>
                    <div>Layout: {{ section.seatLayout }}</div>
                    <div>Price multiplier: {{ section.priceMultiplier }}x</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div *ngIf="loading" class="text-gray-400 italic text-center py-10">
            Loading seat configuration...
          </div>

          <div
            *ngIf="!loading && !seatsData"
            class="text-gray-400 italic text-center py-10"
          >
            No seat configuration found.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: ``,
})
export class PlaneSeatsComponent implements OnInit {
  planeId: string = '';
  seatsData: PlaneSeatsResponse | null = null;
  planeInfo: any = null;
  loading = true;

  constructor(
    private planeService: PlaneService,
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.auth.user$.subscribe((user) => {
      if (!user || !user.roles.map((r) => r.toLowerCase()).includes('admin')) {
        this.router.navigate(['/']);
      } else {
        this.route.params.subscribe((params) => {
          this.planeId = params['id'];
          this.fetchSeats();
        });
      }
    });
  }

  fetchSeats() {
    this.loading = true;
    this.planeService.getPlaneSeats(this.planeId).subscribe({
      next: (data) => {
        this.seatsData = data;
        this.planeInfo = data.plane;
        this.loading = false;
      },
      error: () => {
        this.seatsData = null;
        this.loading = false;
      },
    });
  }

  get seatRows(): string[] {
    if (!this.seatsData) return [];
    return Object.keys(this.seatsData.seats).sort();
  }

  getSeatsForRow(row: string): Seat[] {
    if (!this.seatsData) return [];
    return this.seatsData.seats[row] || [];
  }

  getSeatClass(seat: Seat): string {
    let classes =
      'w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white cursor-pointer hover:opacity-80 transition-opacity';

    if (seat.isEmergencyExit) {
      return classes + ' bg-red-500';
    } else if (seat.isWindow) {
      return classes + ' bg-purple-500';
    } else if (seat.isAisle) {
      return classes + ' bg-orange-500';
    } else if (seat.seatClass === 'first') {
      return classes + ' bg-green-500';
    } else {
      return classes + ' bg-blue-500';
    }
  }

  getSeatTooltip(seat: Seat): string {
    let tooltip = `Seat ${seat.row}${seat.number}\n`;
    tooltip += `Class: ${
      seat.seatClass === 'first' ? 'First Class' : 'Economy'
    }\n`;

    if (seat.isWindow) tooltip += 'Window seat\n';
    if (seat.isAisle) tooltip += 'Aisle seat\n';
    if (seat.isEmergencyExit) tooltip += 'Emergency exit row\n';
    if (seat.isBulkhead) tooltip += 'Bulkhead row\n';

    return tooltip;
  }

  goBack() {
    this.router.navigate(['/planes']);
  }
}
