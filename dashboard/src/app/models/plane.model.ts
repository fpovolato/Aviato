export interface CabinConfiguration {
  name: string;
  seatClass: 'economy' | 'first';
  startRow: string;
  endRow: string;
  seatsPerRow: number;
  seatLayout: string;
  priceMultiplier: number;
}

export interface Seat {
  row: string;
  number: number;
  seatClass: 'economy' | 'first';
  isAvailable: boolean;
  isReserved: boolean;
  isAisle: boolean;
  isWindow: boolean;
  isEmergencyExit: boolean;
  isBulkhead: boolean;
}

export interface Plane {
  _id: string;
  code: string;
  manifacturer: string;
  model: string;
  airline: {
    _id: string;
    name: string;
    code: string;
  };
  seats: number;
  totalRows: number;
  maxSeatsPerRow: number;
  cabinConfiguration: CabinConfiguration[];
  seatsConfiguration: Seat[];
  hasWiFi: boolean;
  hasEntertainment: boolean;
  hasPowerOutlets: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlaneStats {
  total: number;
  available: number;
  reserved: number;
  economy: number;
  first: number;
  aisle: number;
  window: number;
  emergencyExit: number;
  bulkhead: number;
}

export interface PlaneSeatsResponse {
  plane: {
    id: string;
    code: string;
    model: string;
    manifacturer: string;
    totalRows: number;
    maxSeatsPerRow: number;
    cabinConfiguration: CabinConfiguration[];
  };
  seats: { [row: string]: Seat[] };
  stats: PlaneStats;
}
