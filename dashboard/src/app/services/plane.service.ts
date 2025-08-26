import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Plane, PlaneSeatsResponse, PlaneStats } from '../models/plane.model';
import { BaseApiService } from './base-api.service';

@Injectable({
  providedIn: 'root',
})
export class PlaneService extends BaseApiService {
  // Get all planes
  getPlanes(): Observable<Plane[]> {
    return this.get<Plane[]>('/planes');
  }

  // Get plane by ID
  getPlane(id: string): Observable<Plane> {
    return this.get<Plane>(`/planes/${id}`);
  }

  // Create new plane
  createPlane(planeData: any): Observable<Plane> {
    return this.post<Plane>('/planes', planeData);
  }

  // Update plane configuration
  updatePlaneConfiguration(id: string, configuration: any): Observable<any> {
    return this.put(`/planes/${id}/configuration`, configuration);
  }

  // Delete plane
  deletePlane(id: string): Observable<any> {
    return this.delete(`/planes/${id}`);
  }

  // Get plane seats
  getPlaneSeats(id: string): Observable<PlaneSeatsResponse> {
    return this.get<PlaneSeatsResponse>(`/planes/${id}/seats`);
  }

  // Get plane stats
  getPlaneStats(id: string): Observable<PlaneStats> {
    return this.get<PlaneStats>(`/planes/${id}/stats`);
  }

  // Seat management methods
  getFlightSeats(flightId: string): Observable<any> {
    return this.get(`/seats/flights/${flightId}/seats`);
  }

  reserveSeat(flightId: string, seatData: any): Observable<any> {
    return this.post(`/seats/flights/${flightId}/seats/reserve`, seatData);
  }

  confirmReservation(reservationId: string): Observable<any> {
    return this.put(`/seats/reservations/${reservationId}/confirm`, {});
  }

  cancelReservation(reservationId: string): Observable<any> {
    return this.delete(`/seats/reservations/${reservationId}`);
  }

  extendReservation(
    reservationId: string,
    minutes: number = 15
  ): Observable<any> {
    return this.put(`/seats/reservations/${reservationId}/extend`, {
      minutes,
    });
  }

  getUserReservations(): Observable<any> {
    return this.get('/seats/user/reservations');
  }
}
