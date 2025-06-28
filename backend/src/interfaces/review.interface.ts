export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  carId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReviewWithRelations extends Review {
  user?: any; // User interface
  car?: any; // Car interface
}

export interface ReviewFilters {
  userId?: string;
  carId?: string;
  minRating?: number;
  maxRating?: number;
} 