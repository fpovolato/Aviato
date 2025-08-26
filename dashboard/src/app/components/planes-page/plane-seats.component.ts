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

          <!-- Simplified Statistics -->
          <div
            *ngIf="seatsData"
            class="mb-10 grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl text-center border border-blue-200/50 shadow-sm">
              <div class="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                {{ seatsData.stats.total }}
              </div>
              <div class="text-sm font-medium text-blue-800">Total Seats</div>
            </div>
            <div class="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl text-center border border-emerald-200/50 shadow-sm">
              <div class="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                {{ seatsData.stats.available }}
              </div>
              <div class="text-sm font-medium text-emerald-800">Available</div>
            </div>
            <div class="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl text-center border border-green-200/50 shadow-sm">
              <div class="text-3xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">
                {{ seatsData.stats.first }}
              </div>
              <div class="text-sm font-medium text-green-800">First Class</div>
            </div>
            <div class="bg-gradient-to-br from-slate-50 to-slate-100 p-6 rounded-xl text-center border border-slate-200/50 shadow-sm">
              <div class="text-3xl font-bold bg-gradient-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent">
                {{ seatsData.stats.economy }}
              </div>
              <div class="text-sm font-medium text-slate-800">Economy</div>
            </div>
          </div>

          <!-- Enhanced Seat Map -->
          <div
            *ngIf="seatsData"
            class="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8"
          >
            <div class="flex items-center space-x-3 mb-6">
              <div class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-800">Aircraft Seat Layout</h3>
            </div>

            <!-- Simplified Legend -->
            <div class="mb-8 flex items-center justify-center">
              <div class="flex flex-wrap gap-8 text-sm">
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-lg shadow-sm border border-green-300"></div>
                  <span class="font-semibold text-gray-700">First Class</span>
                </div>
                <div class="flex items-center gap-3">
                  <div class="w-6 h-6 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg shadow-sm border border-blue-300"></div>
                  <span class="font-semibold text-gray-700">Economy</span>
                </div>
              </div>
            </div>

            <!-- Horizontal Aircraft Layout -->
            <div class="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-6 border-2 border-slate-200">
              <div class="flex items-center justify-center space-x-4">
                <!-- Aircraft nose -->
                <div class="flex flex-col items-center">
                  <div class="w-8 h-20 bg-gradient-to-r from-slate-300 to-slate-400 rounded-l-full border-2 border-slate-300 relative">
                    <div class="absolute left-1 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-red-400 rounded-full"></div>
                  </div>
                  <div class="text-xs font-semibold text-slate-600 mt-2 rotate-90 whitespace-nowrap">Nose</div>
                </div>

                <!-- Compact Seat Grid -->
                <div class="flex-1 overflow-x-auto">
                  <div class="flex items-center space-x-2 min-w-max">
                    <div *ngFor="let row of seatRows" class="flex flex-col items-center space-y-2 bg-white/70 rounded-xl p-3 border border-slate-200">
                      <!-- Row number at top -->
                      <div class="text-xs font-bold text-slate-700 bg-slate-200 rounded-lg px-2 py-1">{{ row }}</div>
                      
                      <!-- Seats in vertical column for each row -->
                      <div class="flex flex-col gap-1">
                        <ng-container *ngFor="let seat of getSeatsForRow(row); let i = index">
                          <div
                            [ngClass]="getSeatClass(seat)"
                            class="w-8 h-8 rounded-lg font-bold text-xs transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-110 border cursor-pointer"
                            [title]="getSeatTooltip(seat)"
                          >
                            {{ seat.number }}
                          </div>
                          <!-- Add separator after 3rd seat for corridor -->
                          <div *ngIf="seat.number === 3" class="h-1 border-t border-dashed border-slate-300 mx-2"></div>
                        </ng-container>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Aircraft tail -->
                <div class="flex flex-col items-center">
                  <div class="w-6 h-16 bg-gradient-to-l from-slate-300 to-slate-400 rounded-r-full border-2 border-slate-300"></div>
                  <div class="text-xs font-semibold text-slate-600 mt-2 rotate-90 whitespace-nowrap">Tail</div>
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
    if (seat.seatClass === 'first') {
      return 'flex items-center justify-center bg-gradient-to-br from-green-400 to-green-500 text-white border-green-500';
    } else {
      return 'flex items-center justify-center bg-gradient-to-br from-blue-400 to-blue-500 text-white border-blue-500';
    }
  }

  getSeatTooltip(seat: Seat): string {
    let tooltip = `Seat ${seat.row}${seat.number}\n`;
    tooltip += `Class: ${
      seat.seatClass === 'first' ? 'First Class' : 'Economy'
    }`;

    return tooltip;
  }

  goBack() {
    this.router.navigate(['/planes']);
  }
}
