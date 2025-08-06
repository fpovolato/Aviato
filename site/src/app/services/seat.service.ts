import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SeatService {
  private http = inject(HttpClient);

  getFlightSeats(flightId: string) {
    return this.http.get<any>(
      `${environment.apiUrl}/seats/flights/${flightId}/seats`,
      {
        withCredentials: true,
      }
    );
  }
}
