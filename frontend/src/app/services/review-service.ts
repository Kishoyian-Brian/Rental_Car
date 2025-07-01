import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  userId: string;
  carId: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email?: string;
  };
  car?: {
    id: string;
    make: string;
    model: string;
    year: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = 'http://localhost:3000/reviews'; // Adjust if your backend runs elsewhere

  constructor(private http: HttpClient) { }

  getRatings(): Observable<Review[]> {
    return this.http.get<{ data: Review[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }
} 