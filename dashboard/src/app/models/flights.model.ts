import { Route } from './route.model';

export interface Flight {
  _id: string;
  flightNumber: string;
  airline: {
    _id: string;
    name: string;
    code: string;
  };
  route: Route;
  departureDate: string;
  arrivalDate: string;
  status: string;
  delayedManually?: boolean;
  cancelledManually?: boolean;
}
