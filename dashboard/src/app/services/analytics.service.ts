import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

export interface DashboardAnalytics {
  isAdmin?: boolean;
  message?: string;
  totalPassengers?: number;
  totalRevenue?: number;
  popularRoutes?: PopularRoute[];
  monthlyRevenue?: MonthlyRevenue[];
  recentOrders?: number;
  upcomingFlights?: number;
  user?: {
    name: string;
    surname: string;
    email: string;
    roles: string[];
    airlines?: { _id: string; name: string; code: string }[];
  };
}

export interface PopularRoute {
  routeCode: string;
  departure: {
    name: string;
    city: string;
    iata: string;
  };
  arrival: {
    name: string;
    city: string;
    iata: string;
  };
  bookings: number;
  passengers: number;
  revenue: number;
}

export interface MonthlyRevenue {
  year: number;
  month: number;
  revenue: number;
  orders: number;
}

export interface AirlineAnalytics {
  totalPassengers: number;
  totalRevenue: number;
  popularRoutes: PopularRoute[];
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService extends BaseApiService {
  getDashboardAnalytics(): Observable<DashboardAnalytics> {
    return this.get<DashboardAnalytics>('/analytics/dashboard');
  }

  getAirlineAnalytics(airlineId: string): Observable<AirlineAnalytics> {
    return this.get<AirlineAnalytics>(`/analytics/airline/${airlineId}`);
  }
}
