export interface Route {
  _id: string;
  code: string;
  departureAirport: {
    _id: string;
    name: string;
    iata: string;
  };
  arrivalAirport: {
    _id: string;
    name: string;
    iata: string;
  };
} 