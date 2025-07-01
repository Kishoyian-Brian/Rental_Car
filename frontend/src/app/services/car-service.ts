import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  category: string;
  transmission: string;
  fuelType: string;
  seats: number;
  doors: number;
  dailyRate: number;
  hourlyRate?: number;
  available: boolean;
  features: string[];
  imageUrls: string[];
  locationId?: string;
  createdAt: string;
  updatedAt: string;
  averageRating?: number;
  reviewCount?: number;
  location?: {
    id: string;
    name: string;
    city: string;
    state: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = 'http://localhost:3000/cars'; 

  constructor(private http: HttpClient) { }

  getCars(): Observable<Car[]> {
    return this.http.get<{ data: Car[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  getCarById(id: string): Observable<Car> {
    return this.http.get<{ data: Car }>(`${this.apiUrl}/${id}`).pipe(map(res => res.data));
  }

  createCar(formData: FormData): Observable<Car> {
    return this.http.post<{ data: Car }>(this.apiUrl, formData).pipe(map(res => res.data));
  }

  updateCar(id: string, car: any): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${id}`, car);
  }

  deleteCar(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  toggleAvailability(id: string): Observable<Car> {
    return this.http.patch<{ data: Car }>(`${this.apiUrl}/${id}/toggle-availability`, null).pipe(map(res => res.data));
  }

  uploadImages(id: string, images: File[]): Observable<Car> {
    const formData = new FormData();
    images.forEach(img => formData.append('images', img));
    return this.http.post<{ data: Car }>(`${this.apiUrl}/${id}/upload-images`, formData).pipe(map(res => res.data));
  }

  filterCars(filters: any): Observable<Car[]> {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') params.append(key, String(value));
    });
    return this.http.get<{ data: Car[] }>(`${this.apiUrl}?${params.toString()}`).pipe(map(res => res.data));
  }
}
