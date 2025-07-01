import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Booking {
  id: string;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    imageUrls: string[];
    dailyRate: number;
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

  getUserBookings(userId: string): Observable<Booking[]> {
    return this.http.get<any>(`${this.apiUrl}?userId=${userId}`).pipe(map(res => res.data));
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
} 