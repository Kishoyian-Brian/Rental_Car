export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface LocationWithCars extends Location {
  cars?: any[]; // Car interface array
}

export interface LocationFilters {
  city?: string;
  state?: string;
  zipCode?: string;
} 