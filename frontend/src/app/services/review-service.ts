import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching ratings:', error);
        return of([]);
      })
    );
  }

  createReview(review: { rating: number; comment?: string; carId: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, review);
  }

  getReviewsByCar(carId: string): Observable<Review[]> {
    return this.http.get<{ data: Review[] }>(`${this.apiUrl}/car/${carId}`).pipe(
      map(response => response.data || []),
      catchError(error => {
        console.error('Error fetching car reviews:', error);
        return of([]);
      })
    );
  }
} 