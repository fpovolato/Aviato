import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { OrderService, Order } from '../services/order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 py-12"
    >
      <div
        class="w-full max-w-4xl bg-white/90 rounded-2xl shadow-xl p-8 border border-blue-100"
      >
        <h2
          class="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg
            class="w-7 h-7 text-blue-400"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          User Details
        </h2>
        <ng-container *ngIf="user() as u; else notLogged">
          <div class="mb-6">
            <div class="font-semibold text-lg">
              {{ u.name }} {{ u.surname }}
            </div>
            <div class="text-sm text-gray-500">{{ u.email }}</div>
            <div class="text-xs text-gray-400 mb-2">
              Roles: {{ u.roles.join(', ') }}
            </div>
          </div>

          <div *ngIf="u.airlines?.length" class="mb-6">
            <h3 class="text-lg font-semibold text-blue-700 mb-2">
              Your Airlines
            </h3>
            <ul class="space-y-2">
              <li
                *ngFor="let airline of u.airlines"
                class="p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-3 shadow-sm"
              >
                <span class="font-bold text-blue-700">{{ airline.name }}</span>
                <span
                  class="ml-auto text-xs bg-blue-200 text-blue-800 rounded px-2 py-0.5"
                  >{{ airline.code }}</span
                >
              </li>
            </ul>
          </div>

          <!-- Order History Section -->
          <div class="mb-6">
            <h3
              class="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Order History
            </h3>

            <div
              *ngIf="orders().length === 0"
              class="text-gray-500 italic text-center py-8"
            >
              No orders found.
            </div>

            <div *ngIf="orders().length > 0" class="space-y-4">
              <div
                *ngFor="let order of orders()"
                class="border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div class="flex justify-between items-start mb-3">
                  <div>
                    <div class="font-semibold text-gray-800">
                      Order #{{ order._id?.slice(-8) }}
                    </div>
                    <div class="text-sm text-gray-500">
                      {{ order.purchasedAt | date : 'medium' }}
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span
                      [class]="getStatusClass(order.status)"
                      class="px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {{ order.status }}
                    </span>
                    <div class="text-lg font-bold text-blue-600">
                      €{{ order.total.toFixed(2) }}
                    </div>
                  </div>
                </div>

                <div class="space-y-2">
                  <div
                    *ngFor="let item of order.items"
                    class="flex justify-between items-start py-3 border-b border-gray-100 last:border-b-0"
                  >
                    <div class="flex-1">
                      <div class="font-medium text-gray-800 mb-2">
                        Flight {{ getFlightDisplay(item.flight).flightNumber }}
                      </div>

                      <!-- Flight Route and Times -->
                      <div class="text-sm text-gray-600 mb-2">
                        <div class="flex items-center gap-4">
                          <div class="flex items-center gap-2">
                            <svg
                              class="w-4 h-4 text-green-500"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                            <span class="font-medium">{{
                              getFlightDisplay(item.flight).from
                            }}</span>
                            <span class="text-gray-400">→</span>
                            <span class="font-medium">{{
                              getFlightDisplay(item.flight).to
                            }}</span>
                          </div>
                        </div>

                        <div class="flex items-center gap-6 mt-1">
                          <div class="flex items-center gap-1">
                            <svg
                              class="w-3 h-3 text-blue-500"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span class="text-xs">{{
                              getFlightDisplay(item.flight).departure
                            }}</span>
                          </div>
                          <div class="flex items-center gap-1">
                            <svg
                              class="w-3 h-3 text-red-500"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            <span class="text-xs">{{
                              getFlightDisplay(item.flight).arrival
                            }}</span>
                          </div>
                        </div>

                        <div class="text-xs text-gray-500 mt-1">
                          {{
                            getFlightDisplay(item.flight).departureDate
                              | date : 'dd/MM/yyyy'
                          }}
                        </div>
                      </div>

                      <div class="text-sm text-gray-500">
                        Quantity: {{ item.quantity }} × €{{
                          item.priceAtPurchase.toFixed(2)
                        }}
                      </div>

                      <!-- Cost Summary -->
                      <div class="mt-2 p-2 bg-gray-50 rounded-lg">
                        <div class="text-xs font-medium text-gray-700 mb-1">
                          Cost Breakdown:
                        </div>
                        <div class="space-y-1 text-xs text-gray-600">
                          <div class="flex justify-between">
                            <span
                              >Base fare ({{
                                getItemDetails(item).passengers
                              }}
                              passenger{{
                                getItemDetails(item).passengers > 1 ? 's' : ''
                              }})</span
                            >
                            <span>€{{ getBaseFare(item).toFixed(2) }}</span>
                            >
                          </div>
                          <div
                            *ngIf="getItemDetails(item).seatClass === 'first'"
                            class="flex justify-between text-blue-600"
                          >
                            <span>First class upgrade</span>
                            <span
                              >€{{ getFirstClassTotal(item).toFixed(2) }}</span
                            >
                          </div>
                          <div
                            *ngIf="
                              getItemDetails(item).additionalLuggage &&
                              getItemDetails(item).additionalLuggage > 0
                            "
                            class="flex justify-between text-green-600"
                          >
                            <span
                              >Additional luggage ({{
                                getItemDetails(item).additionalLuggage
                              }}
                              × €{{ getLuggagePrice(item) }})</span
                            >
                            <span
                              >€{{
                                (
                                  getItemDetails(item).passengers *
                                  getItemDetails(item).additionalLuggage *
                                  getLuggagePrice(item)
                                ).toFixed(2)
                              }}</span
                            >
                          </div>
                        </div>
                      </div>

                      <div
                        *ngIf="item.selectedSeat"
                        class="text-xs text-blue-600 mt-1"
                      >
                        Seat: {{ item.selectedSeat.row
                        }}{{ item.selectedSeat.number }} ({{
                          item.selectedSeat.seatClass
                        }})
                      </div>
                    </div>
                    <div class="text-right">
                      <div class="font-medium">
                        €{{ (item.quantity * item.priceAtPurchase).toFixed(2) }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Order Summary -->
                <div class="mt-4 p-3 bg-blue-50 rounded-lg">
                  <div class="text-sm font-medium text-blue-800 mb-2">
                    Order Summary:
                  </div>
                  <div class="space-y-1 text-xs text-blue-700">
                    <div class="flex justify-between">
                      <span>Total passengers</span>
                      <span>{{ getTotalPassengers(order.items) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>First class upgrades</span>
                      <span>{{ getFirstClassCount(order.items) }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>Additional luggage</span>
                      <span>{{ getTotalLuggage(order.items) }} pieces</span>
                    </div>
                    <div
                      class="flex justify-between font-medium pt-1 border-t border-blue-200"
                    >
                      <span>Total amount</span>
                      <span>€{{ order.total.toFixed(2) }}</span>
                    </div>
                  </div>
                </div>

                <div class="mt-3 pt-3 border-t border-gray-200">
                  <div class="text-sm text-gray-600">
                    Payment: {{ order.paymentMethod }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            (click)="logout()"
            class="mt-8 w-full bg-red-500 hover:bg-red-400 text-white px-5 py-2 rounded-lg font-semibold shadow"
          >
            Logout
          </button>
        </ng-container>
        <ng-template #notLogged>
          <div class="text-gray-400 italic text-center">
            You are not logged in.
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: '',
})
export class UserPageComponent implements OnInit {
  auth = inject(AuthService);
  orderService = inject(OrderService);
  router = inject(Router);
  user = computed(() => this.auth.currentUser);
  orders = signal<Order[]>([]);

  ngOnInit() {
    this.loadOrderHistory();
  }

  loadOrderHistory() {
    this.orderService.getUserOrders().subscribe({
      next: (orders) => {
        this.orders.set(orders);
      },
      error: (error) => {
        console.error('Error loading order history:', error);
      },
    });
  }

  getFlightDisplay(flight: string | any): any {
    if (typeof flight === 'string') {
      return {
        flightNumber: flight,
        from: 'Unknown',
        to: 'Unknown',
        departure: '00:00',
        arrival: '00:00',
        departureDate: new Date(),
        arrivalDate: new Date(),
      };
    }

    // Extract airport information from the nested structure
    const departureAirport = flight?.route?.departureAirport;
    const arrivalAirport = flight?.route?.arrivalAirport;

    return {
      flightNumber: flight?.flightNumber || 'Unknown Flight',
      from: departureAirport
        ? `${departureAirport.city} (${
            departureAirport.iata || departureAirport.name
          })`
        : 'Unknown',
      to: arrivalAirport
        ? `${arrivalAirport.city} (${
            arrivalAirport.iata || arrivalAirport.name
          })`
        : 'Unknown',
      departure: flight?.departure || '00:00',
      arrival: flight?.arrival || '00:00',
      departureDate: flight?.departureDate
        ? new Date(flight.departureDate)
        : new Date(),
      arrivalDate: flight?.arrivalDate
        ? new Date(flight.arrivalDate)
        : new Date(),
    };
  }

  getItemDetails(item: any): any {
    // Use the data saved in the order from backend
    return {
      additionalLuggage: item.additionalLuggage || 0,
      seatClass: item.seatClass || 'economy',
      passengers: item.passengers || item.quantity || 1,
    };
  }

  getBaseFare(item: any): number {
    const passengers = this.getItemDetails(item).passengers;
    const basePrice =
      typeof item.flight === 'string' ? 0 : (item.flight as any)?.price || 0;
    return passengers * basePrice;
  }

  getLuggageTotal(item: any): number {
    const details = this.getItemDetails(item);
    const luggagePrice = this.getLuggagePrice(item);
    return details.passengers * details.additionalLuggage * luggagePrice;
  }

  getFirstClassTotal(item: any): number {
    const details = this.getItemDetails(item);
    return details.seatClass === 'first' ? details.passengers * 100 : 0;
  }

  getLuggagePrice(item: any): number {
    return typeof item.flight === 'string'
      ? 30
      : (item.flight as any)?.additionalLuggagePrice || 30;
  }

  getTotalPassengers(items: any[]): number {
    return items.reduce((total, item) => {
      return total + (item.passengers || item.quantity || 1);
    }, 0);
  }

  getFirstClassCount(items: any[]): number {
    return items.reduce((total, item) => {
      return (
        total +
        (item.seatClass === 'first' ? item.passengers || item.quantity || 1 : 0)
      );
    }, 0);
  }

  getTotalLuggage(items: any[]): number {
    return items.reduce((total, item) => {
      const passengers = item.passengers || item.quantity || 1;
      return total + (item.additionalLuggage || 0) * passengers;
    }, 0);
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      case 'Refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
