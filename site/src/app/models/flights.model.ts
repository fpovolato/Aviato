export interface Flight {
  id: number;
  mongoId?: string; // MongoDB ObjectId for API calls
  number: string;
  airline: string;
  from: string;
  to: string;
  departure: string;
  departureDate: string;
  arrival: string;
  arrivalDate: string;
  price: number;
  firstClassPrice: number;
  seats: number;
  additionalLuggagePrice: number;
  selectedSeats?: {
    passengerNumber: number;
    seatRow: string;
    seatNumber: number;
    seatClass: 'first' | 'economy';
    price: number;
  }[];
  /*
  planeType: Object;
*/
}
