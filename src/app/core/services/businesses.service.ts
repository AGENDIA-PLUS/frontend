import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Business, BusinessSummary } from '../models';

@Injectable({ providedIn: 'root' })
export class BusinessesService {
  private readonly http = inject(HttpClient);

  listMine(): Observable<BusinessSummary[]> {
    return this.http.get<BusinessSummary[]>(`${environment.apiUrl}/businesses`);
  }

  getOne(businessId: string): Observable<Business> {
    return this.http.get<Business>(`${environment.apiUrl}/businesses/${businessId}`);
  }

  create(payload: { name: string; slug: string; vertical?: string; city?: string }): Observable<Business> {
    return this.http.post<Business>(`${environment.apiUrl}/businesses`, payload);
  }

  update(businessId: string, payload: Partial<Business>): Observable<Business> {
    return this.http.patch<Business>(`${environment.apiUrl}/businesses/${businessId}`, payload);
  }

  publish(businessId: string): Observable<Business> {
    return this.http.post<Business>(`${environment.apiUrl}/businesses/${businessId}/publish`, {});
  }
}
