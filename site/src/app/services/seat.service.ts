import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private http = inject(HttpClient);

  getFlightSeats(flightId: number) {
    return this.http.get<any>(`/api/seats/flights/${flightId}/seats`);
  }
}

