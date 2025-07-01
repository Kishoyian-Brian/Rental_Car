import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  cars?: any[];
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private apiUrl = 'http://localhost:3000/locations';

  constructor(private http: HttpClient) {}

  getLocations(): Observable<Location[]> {
    return this.http.get<any>(this.apiUrl).pipe(map(res => res.data));
  }
} 