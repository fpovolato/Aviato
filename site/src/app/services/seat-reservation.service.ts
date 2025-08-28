import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseApiService } from './base-api.service';

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
  specialRequests?: string;
  reservationDate?: Date;
  expiresAt?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class SeatReservationService extends BaseApiService {
  private seatApiUrl = '/seat-reservations';

  createReservation(
    reservationData: Partial<SeatReservation>
  ): Observable<SeatReservation> {
    return this.post<SeatReservation>(this.seatApiUrl, reservationData);
  }

  confirmReservation(id: string): Observable<SeatReservation> {
    return this.patch<SeatReservation>(`${this.seatApiUrl}/${id}/confirm`, {});
  }

  cancelReservation(id: string): Observable<SeatReservation> {
    return this.patch<SeatReservation>(`${this.seatApiUrl}/${id}/cancel`, {});
  }

  getFlightReservations(flightId: string): Observable<SeatReservation[]> {
    return this.get<SeatReservation[]>(`${this.seatApiUrl}/flight/${flightId}`);
  }

  getFlightSeats(flightId: string): Observable<any> {
    return this.get<any>(`/seats/flights/${flightId}/seats`);
  }

  getUserReservations(): Observable<SeatReservation[]> {
    return this.get<SeatReservation[]>(`${this.seatApiUrl}/user`);
  }

  isSeatAvailable(
    flightId: string,
    seatRow: string,
    seatNumber: number
  ): Observable<boolean> {
    return this.get<boolean>(
      `${this.seatApiUrl}/availability/${flightId}/${seatRow}/${seatNumber}`
    );
  }
}
