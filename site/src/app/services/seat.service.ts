import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private http = inject(HttpClient);

  getFlightSeats(flightId: string) {
    return this.http.get<any>(`/api/seats/flights/${flightId}/seats`);
  }
}
