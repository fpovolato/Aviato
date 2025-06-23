import { Route } from "./route.models";

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