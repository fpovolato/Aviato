import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FlightInfo {
  _id: string;
  flightNumber: string;
  departure: string;
  departureDate: string;
  arrival: string;
  arrivalDate: string;
  price: number;
  from: string;
  to: string;
  airline: string;
  route?: {
    departureAirport?: {
      city: string;
      iata?: string;
      name: string;
    };
    arrivalAirport?: {
      city: string;
      iata?: string;
      name: string;
    };
  };
}

export interface OrderItem {
  flight: string | FlightInfo;
  quantity: number;
  priceAtPurchase: number;
  selectedSeat?: {
    row: string;
    number: number;
    seatClass: 'first' | 'economy';
  };
  additionalLuggage?: number;
  passengers?: number;
  seatClass?: 'first' | 'economy';
}

export interface SeatReservationData {
  flight: string;
  plane: string;
  seatRow: string;
  seatNumber: number;
  seatClass: 'first' | 'economy';
  price: number;
  isAisle?: boolean;
  isWindow?: boolean;
  isEmergencyExit?: boolean;
  isBulkhead?: boolean;
}

export interface Order {
  _id?: string;
  user: string;
  items: OrderItem[];
  total: number;
  status: 'Pending' | 'Completed' | 'Cancelled' | 'Refunded';
  paymentMethod: 'Credit Card' | 'PayPal' | 'Bank Transfer';
  paymentDetails?: any;
  purchasedAt?: Date;
  seatReservations?: SeatReservationData[];
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  createOrder(orderData: Partial<Order>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, orderData, {
      withCredentials: true,
    });
  }

  getUserOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/my`, {
      withCredentials: true,
    });
  }

  getOrderById(id: string): Observable<Order> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, {
      withCredentials: true,
    });
  }

  updateOrderStatus(id: string, status: Order['status']): Observable<Order> {
    return this.http.patch<Order>(
      `${this.apiUrl}/${id}/status`,
      { status },
      { withCredentials: true }
    );
  }
}
