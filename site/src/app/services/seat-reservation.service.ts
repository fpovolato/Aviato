import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SeatReservation {
  _id?: string;
  flight: string;
  user: string;
  plane: string;
  seatRow: string;
  seatNumber: number;
  seatClass: 'economy' | 'first';
  status: 'reserved' | 'confirmed' | 'cancelled';
  price: number;
  isAisle?: boolean;
  isWindow?: boolean;
  isEmergencyExit?: boolean;
  isBulkhead?: boolean;
  specialRequests?: string;
  reservationDate?: Date;
  expiresAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SeatReservationService {
  private apiUrl = `${environment.apiUrl}/seat-reservations`;

  constructor(private http: HttpClient) {}

  createReservation(
    reservationData: Partial<SeatReservation>
  ): Observable<SeatReservation> {
    return this.http.post<SeatReservation>(this.apiUrl, reservationData, {
      withCredentials: true,
    });
  }

  confirmReservation(id: string): Observable<SeatReservation> {
    return this.http.patch<SeatReservation>(
      `${this.apiUrl}/${id}/confirm`,
      {},
      { withCredentials: true }
    );
  }

  cancelReservation(id: string): Observable<SeatReservation> {
    return this.http.patch<SeatReservation>(
      `${this.apiUrl}/${id}/cancel`,
      {},
      { withCredentials: true }
    );
  }

  getFlightReservations(flightId: string): Observable<SeatReservation[]> {
    return this.http.get<SeatReservation[]>(
      `${this.apiUrl}/flight/${flightId}`,
      { withCredentials: true }
    );
  }

  getUserReservations(): Observable<SeatReservation[]> {
    return this.http.get<SeatReservation[]>(`${this.apiUrl}/user`, {
      withCredentials: true,
    });
  }

  isSeatAvailable(
    flightId: string,
    seatRow: string,
    seatNumber: number
  ): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.apiUrl}/availability/${flightId}/${seatRow}/${seatNumber}`,
      { withCredentials: true }
    );
  }
}
