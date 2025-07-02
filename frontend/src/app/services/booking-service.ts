import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Booking {
  id: string;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    imageUrls: string[];
    dailyRate: number;
    location?: {
      id: string;
      name: string;
    };
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class BookingService {
  private apiUrl = 'http://localhost:3000/bookings';

  constructor(private http: HttpClient) {}

  getUserBookings(): Observable<Booking[]> {
    return this.http.get<any>(`${this.apiUrl}/my-bookings`).pipe(
      map(res => res.data || []),
      catchError(err => {
        console.error('Error fetching user bookings:', err);
        return of([]);
      })
    );
  }

  createBooking(booking: { carId: string; startDate: string; endDate: string; locationId: string }): Observable<any> {
    return this.http.post<any>(this.apiUrl, booking);
  }

  confirmBooking(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/confirm`, {});
  }

  cancelBooking(id: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}/cancel`, {});
  }

  getAllBookings(): Observable<Booking[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(res => res.data || []),
      catchError(err => {
        console.error('Error fetching all bookings:', err);
        return of([]);
      })
    );
  }
} 