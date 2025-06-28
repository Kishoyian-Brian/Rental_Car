export enum CarCategory {
  ECONOMY = 'ECONOMY',
  COMPACT = 'COMPACT',
  MID_SIZE = 'MID_SIZE',
  FULL_SIZE = 'FULL_SIZE',
  SUV = 'SUV',
  LUXURY = 'LUXURY',
  VAN = 'VAN',
  SPORTS = 'SPORTS',
}

export enum TransmissionType {
  MANUAL = 'MANUAL',
  AUTOMATIC = 'AUTOMATIC',
}

export enum FuelType {
  GASOLINE = 'GASOLINE',
  DIESEL = 'DIESEL',
  HYBRID = 'HYBRID',
  ELECTRIC = 'ELECTRIC',
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  category: CarCategory;
  transmission: TransmissionType;
  fuelType: FuelType;
  seats: number;
  doors: number;
  dailyRate: number;
  hourlyRate?: number;
  available: boolean;
  features: string[];
  imageUrls: string[];
  locationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarWithLocation extends Car {
  location?: Location;
}

export interface CarSearchFilters {
  category?: CarCategory;
  transmission?: TransmissionType;
  fuelType?: FuelType;
  available?: boolean;
  locationId?: string;
  minSeats?: number;
  maxSeats?: number;
  minDailyRate?: number;
  maxDailyRate?: number;
}
