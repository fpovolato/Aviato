import {Component, signal} from '@angular/core';
import {Flight} from '../../models/flights.model';
import {FlightCardComponent} from './flight-card/flight-card.component';

@Component({
  selector: 'app-flights-list',
  imports: [
    FlightCardComponent
  ],
  template: `
    <div class="p-8 grid grid-cols-1 gap-5">
      @for (flight of flights(); track flight.id) {
        <app-flight-card [flight]="flight" />
      }
    </div>
  `,
  styles: ``
})
export class FlightsListComponent {
  flights = signal<Flight[]>([
    {
      id: 1,
      number: 'FR 1000',
      airline: 'Ryanair',
      from: 'Rome',
      to: 'Paris',
      departure: '10:30',
      departureDate: '2025-05-10',
      arrival: '12:15',
      arrivalDate: '2025-05-10',
      price: 120.50,
      seats: 12,
    },
    {
      id: 2,
      number: 'FR 1000',
      airline: 'Ryanair',
      from: 'New York',
      to: 'London',
      departure: '18:45',
      departureDate: '2025-06-01',
      arrival: '06:30',
      arrivalDate: '2025-06-02',
      price: 450.00,
      seats: 5,
    },
    {
      id: 3,
      number: 'FR 1000',
      airline: 'Ryanair',
      from: 'Berlin',
      to: 'Madrid',
      departure: '09:00',
      departureDate: '2025-05-15',
      arrival: '11:45',
      arrivalDate: '2025-05-15',
      price: 89.99,
      seats: 0,
    },
    {
      id: 4,
      number: 'FR 1000',
      airline: 'Ryanair',
      from: 'Tokyo',
      to: 'Seoul',
      departure: '13:20',
      departureDate: '2025-07-03',
      arrival: '15:00',
      arrivalDate: '2025-07-03',
      price: 220.00,
      seats: 20,
    },
    {
      id: 5,
      number: 'FR 1000',
      airline: 'Ryanair',
      from: 'Los Angeles',
      to: 'Chicago',
      departure: '07:10',
      departureDate: '2025-08-21',
      arrival: '13:50',
      arrivalDate: '2025-08-21',
      price: 180.25,
      seats: 0,
    },
  ])
}
