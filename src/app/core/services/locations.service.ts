import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Location {
  id: string;
  businessId: string;
  name: string;
  address: string | null;
  city: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class LocationsService {
  private readonly http = inject(HttpClient);

  findAll(businessId: string): Observable<Location[]> {
    return this.http.get<Location[]>(`${environment.apiUrl}/businesses/${businessId}/locations`);
  }

  create(businessId: string, payload: { name: string; address?: string; city?: string }): Observable<Location> {
    return this.http.post<Location>(`${environment.apiUrl}/businesses/${businessId}/locations`, payload);
  }

  update(
    businessId: string,
    locationId: string,
    payload: { name?: string; address?: string; city?: string; isActive?: boolean },
  ): Observable<Location> {
    return this.http.patch<Location>(`${environment.apiUrl}/businesses/${businessId}/locations/${locationId}`, payload);
  }

  remove(businessId: string, locationId: string): Observable<unknown> {
    return this.http.delete(`${environment.apiUrl}/businesses/${businessId}/locations/${locationId}`);
  }
}
