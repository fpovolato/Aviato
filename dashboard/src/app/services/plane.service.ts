import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Plane, PlaneSeatsResponse, PlaneStats } from '../models/plane.model';

@Injectable({
  providedIn: 'root',
})
export class PlaneService {
  constructor(private http: HttpClient) {}

  // Get all planes
  getPlanes(): Observable<Plane[]> {
    return this.http.get<Plane[]>('/api/planes');
  }

  // Get plane by ID
  getPlane(id: string): Observable<Plane> {
    return this.http.get<Plane>(`/api/planes/${id}`);
  }

  // Create new plane
  createPlane(planeData: any): Observable<Plane> {
    return this.http.post<Plane>('/api/planes', planeData);
  }

  // Update plane configuration
  updatePlaneConfiguration(id: string, configuration: any): Observable<any> {
    return this.http.put(`/api/planes/${id}/configuration`, configuration);
  }

  // Delete plane
  deletePlane(id: string): Observable<any> {
    return this.http.delete(`/api/planes/${id}`);
  }

  // Get plane seats
  getPlaneSeats(id: string): Observable<PlaneSeatsResponse> {
    return this.http.get<PlaneSeatsResponse>(`/api/planes/${id}/seats`);
  }

  // Get plane stats
  getPlaneStats(id: string): Observable<PlaneStats> {
    return this.http.get<PlaneStats>(`/api/planes/${id}/stats`);
  }

  // Get flight seats (for seat selection)
  getFlightSeats(flightId: string): Observable<any> {
    return this.http.get(`/api/seats/flights/${flightId}/seats`);
  }

  // Reserve seat
  reserveSeat(flightId: string, seatData: any): Observable<any> {
    return this.http.post(
      `/api/seats/flights/${flightId}/seats/reserve`,
      seatData
    );
  }

  // Confirm reservation
  confirmReservation(reservationId: string): Observable<any> {
    return this.http.put(
      `/api/seats/reservations/${reservationId}/confirm`,
      {}
    );
  }

  // Cancel reservation
  cancelReservation(reservationId: string): Observable<any> {
    return this.http.delete(`/api/seats/reservations/${reservationId}`);
  }

  // Extend reservation
  extendReservation(
    reservationId: string,
    minutes: number = 15
  ): Observable<any> {
    return this.http.put(`/api/seats/reservations/${reservationId}/extend`, {
      minutes,
    });
  }

  // Get user reservations
  getUserReservations(): Observable<any> {
    return this.http.get('/api/seats/user/reservations');
  }
}
