import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AuthService } from '../../auth/auth.service';
import {
  AnalyticsService,
  DashboardAnalytics,
} from '../../services/analytics.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, SidebarComponent],
  template: `
    <div
      class="flex h-screen w-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50"
    >
      <app-sidebar></app-sidebar>
      <div class="flex flex-col flex-1 min-h-screen">
        <header
          class="flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-indigo-100 shadow-lg px-8 py-6"
        >
          <div>
            <h1
              class="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent"
            >
              Aviato Dashboard
            </h1>
            <p class="text-sm text-gray-600 mt-2 font-medium">
              Your central hub for airline management
            </p>
          </div>
          <div *ngIf="user" class="flex items-center gap-4">
            <div
              class="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xl shadow-lg"
            >
              {{ user.name.charAt(0) }}{{ user.surname.charAt(0) }}
            </div>
            <div class="text-right">
              <div class="font-semibold text-lg text-gray-800">
                {{ user.name }} {{ user.surname }}
              </div>
              <div class="text-sm text-gray-600">{{ user.email }}</div>
              <div class="text-xs text-indigo-600 font-medium">
                {{ user.roles.join(', ') }}
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 p-8 overflow-y-auto">
          <!-- Loading State -->
          <div *ngIf="loading" class="flex items-center justify-center py-20">
            <div class="text-center">
              <div
                class="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-6"
              ></div>
              <p class="text-gray-600 text-lg font-medium">
                Loading dashboard...
              </p>
            </div>
          </div>

          <!-- Admin Welcome Section -->
          <div *ngIf="analytics?.isAdmin && !loading" class="max-w-4xl mx-auto">
            <div class="text-center py-16">
              <div class="mb-8">
                <div
                  class="w-24 h-24 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl"
                >
                  <svg
                    class="w-12 h-12 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h2 class="text-4xl font-bold text-gray-800 mb-4">
                  Welcome to Aviato Admin Dashboard
                </h2>
                <p class="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                  As an administrator, you have access to all system management
                  features. Use the sidebar to navigate through different
                  sections.
                </p>
              </div>

              <!-- Admin Quick Actions -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                <div
                  class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">
                    Manage Users
                  </h3>
                  <p class="text-gray-600 text-sm">
                    Create and manage user accounts and permissions
                  </p>
                </div>

                <div
                  class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">
                    Manage Airlines
                  </h3>
                  <p class="text-gray-600 text-sm">
                    Configure airline settings and partnerships
                  </p>
                </div>

                <div
                  class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                  <div
                    class="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-4"
                  >
                    <svg
                      class="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  <h3 class="text-lg font-semibold text-gray-800 mb-2">
                    System Analytics
                  </h3>
                  <p class="text-gray-600 text-sm">
                    View overall system performance and metrics
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Employee Analytics Section -->
          <div
            *ngIf="!analytics?.isAdmin && analytics && !loading"
            class="space-y-8"
          >
            <!-- Welcome Section -->
            <div
              class="bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl shadow-xl p-8 text-white"
            >
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <h2 class="text-3xl font-bold mb-2">
                    Welcome back, {{ analytics.user?.name || user?.name }}!
                  </h2>
                  <p class="text-indigo-100 text-lg">
                    Here's your airline's performance overview
                  </p>

                  <!-- Airlines Display -->
                  <div *ngIf="analytics.user?.airlines?.length" class="mt-4">
                    <p class="text-indigo-200 text-sm font-medium mb-2">
                      Your Airlines:
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <span
                        *ngFor="let airline of analytics.user?.airlines || []"
                        class="px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm border border-white/30"
                      >
                        {{ airline?.name || 'Unknown' }} ({{
                          airline?.code || 'N/A'
                        }})
                      </span>
                    </div>
                  </div>

                  <!-- No Airlines Message -->
                  <div *ngIf="!analytics.user?.airlines?.length" class="mt-4">
                    <div class="flex items-center gap-2">
                      <svg
                        class="w-5 h-5 text-yellow-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                      <span class="text-yellow-200 text-sm font-medium">
                        No airlines assigned - Contact administrator for access
                      </span>
                    </div>
                  </div>
                </div>
                <div class="hidden md:block ml-8">
                  <svg
                    class="w-24 h-24 text-white/20"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="1"
                      d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            <!-- Analytics Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <!-- Total Passengers -->
              <div
                class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">
                      Total Passengers
                    </p>
                    <p class="text-3xl font-bold text-indigo-600">
                      {{ (analytics.totalPassengers || 0).toLocaleString() }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                </div>
              </div>

              <!-- Total Revenue -->
              <div
                class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">
                      Total Revenue
                    </p>
                    <p class="text-3xl font-bold text-green-600">
                      €{{ (analytics.totalRevenue || 0).toLocaleString() }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">All time</p>
                  </div>
                </div>
              </div>

              <!-- Recent Orders -->
              <div
                class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">
                      Recent Orders
                    </p>
                    <p class="text-3xl font-bold text-blue-600">
                      {{ analytics.recentOrders || '0' }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">Last 30 days</p>
                  </div>
                </div>
              </div>

              <!-- Upcoming Flights -->
              <div
                class="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-gray-600 mb-1">
                      Upcoming Flights
                    </p>
                    <p class="text-3xl font-bold text-purple-600">
                      {{ analytics.upcomingFlights || '0' }}
                    </p>
                    <p class="text-xs text-gray-500 mt-1">Scheduled</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Charts Section -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <!-- Popular Routes -->
              <div
                class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <h3
                  class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"
                >
                  <div
                    class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg"
                  >
                    <svg
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                      />
                    </svg>
                  </div>
                  Most Popular Routes
                </h3>
                <div class="space-y-4" *ngIf="analytics?.popularRoutes?.length">
                  <div
                    *ngFor="
                      let route of (analytics?.popularRoutes || []).slice(0, 5);
                      let i = index
                    "
                    class="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-200"
                  >
                    <div class="flex-1">
                      <div class="flex items-center gap-3 mb-2">
                        <div
                          class="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md"
                        >
                          {{ i + 1 }}
                        </div>
                        <div class="flex items-center gap-2">
                          <span class="font-bold text-gray-800 text-lg">{{
                            route.departure.iata
                          }}</span>
                          <svg
                            class="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              stroke-width="2"
                              d="M17 8l4 4m0 0l-4 4m4-4H3"
                            />
                          </svg>
                          <span class="font-bold text-gray-800 text-lg">{{
                            route.arrival.iata
                          }}</span>
                        </div>
                      </div>
                      <p class="text-sm text-gray-600">
                        {{ route.departure.city }} → {{ route.arrival.city }}
                      </p>
                    </div>
                    <div class="text-right">
                      <p class="font-bold text-indigo-600 text-lg">
                        {{ route.bookings }} bookings
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ route.passengers }} passengers
                      </p>
                      <p class="text-xs text-green-600 font-medium">
                        €{{ (route.revenue || 0).toLocaleString() }}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  *ngIf="!analytics?.popularRoutes?.length"
                  class="text-center py-12 text-gray-500"
                >
                  <svg
                    class="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                    />
                  </svg>
                  <p class="text-lg font-medium">No route data available</p>
                  <p class="text-sm text-gray-400">
                    Routes will appear here once bookings are made
                  </p>
                </div>
              </div>

              <!-- Monthly Revenue Chart -->
              <div
                class="bg-white rounded-2xl shadow-lg p-8 border border-gray-100"
              >
                <h3
                  class="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3"
                >
                  <div
                    class="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg"
                  >
                    <svg
                      class="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                  Monthly Revenue
                </h3>
                <div
                  class="space-y-4"
                  *ngIf="analytics?.monthlyRevenue?.length"
                >
                  <div
                    *ngFor="
                      let month of (analytics?.monthlyRevenue || []).slice(-6)
                    "
                    class="space-y-2"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-sm font-medium text-gray-700"
                        >{{ getMonthName(month.month) }} {{ month.year }}</span
                      >
                      <span class="text-sm font-bold text-green-600"
                        >€{{ (month.revenue || 0).toLocaleString() }}</span
                      >
                    </div>
                    <div
                      class="w-full bg-gray-200 rounded-full h-3 shadow-inner"
                    >
                      <div
                        class="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                        [style.width.%]="getRevenuePercentage(month.revenue)"
                      ></div>
                    </div>
                    <div class="flex justify-between text-xs text-gray-500">
                      <span>{{ month.orders }} orders</span>
                      <span
                        >{{ getRevenuePercentage(month.revenue).toFixed(1) }}%
                        of max</span
                      >
                    </div>
                  </div>
                </div>
                <div
                  *ngIf="!analytics?.monthlyRevenue?.length"
                  class="text-center py-12 text-gray-500"
                >
                  <svg
                    class="w-16 h-16 mx-auto mb-4 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p class="text-lg font-medium">No revenue data available</p>
                  <p class="text-sm text-gray-400">
                    Revenue data will appear here once orders are completed
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- No Airline Assigned Message -->
          <div
            *ngIf="analytics?.message === 'No airline assigned' && !loading"
            class="text-center py-20"
          >
            <div class="max-w-md mx-auto">
              <div
                class="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <svg
                  class="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-gray-800 mb-4">
                No Airline Assigned
              </h3>
              <p class="text-gray-600 mb-6">
                You don't have any airlines assigned to your account. Please
                contact an administrator to get access to airline analytics.
              </p>
              <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p class="text-sm text-yellow-800">
                  <strong>Note:</strong> You can still access other dashboard
                  features through the sidebar.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  `,
  styles: `
    :host ::ng-deep body {
      background: linear-gradient(135deg, #e0e7ff 0%, #fff 50%, #bae6fd 100%);
    }
  `,
})
export class DashboardComponent implements OnInit {
  user: User | null = null;
  analytics: DashboardAnalytics | null = null;
  loading = true;

  constructor(
    private auth: AuthService,
    private analyticsService: AnalyticsService
  ) {
    this.auth.user$.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    this.analyticsService.getDashboardAnalytics().subscribe({
      next: (data) => {
        this.analytics = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.loading = false;
      },
    });
  }

  getMonthName(month: number): string {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return months[month - 1] || '';
  }

  getRevenuePercentage(revenue: number): number {
    if (!this.analytics?.monthlyRevenue?.length) return 0;
    const maxRevenue = Math.max(
      ...this.analytics.monthlyRevenue.map((m) => m.revenue)
    );
    return maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
  }
}
