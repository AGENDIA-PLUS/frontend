import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Service } from '../models';

interface ServicePayload {
  name: string;
  durationMin: number;
  price: number;
  description?: string;
  category?: string;
  staffIds?: string[];
  depositEnabled?: boolean;
  depositType?: 'FIXED' | 'PERCENTAGE';
  depositAmount?: number;
}

@Injectable({ providedIn: 'root' })
export class ServicesService {
  private readonly http = inject(HttpClient);

  findAll(businessId: string): Observable<Service[]> {
    return this.http.get<Service[]>(`${environment.apiUrl}/businesses/${businessId}/services`);
  }

  create(businessId: string, payload: ServicePayload): Observable<Service> {
    return this.http.post<Service>(`${environment.apiUrl}/businesses/${businessId}/services`, payload);
  }

  update(businessId: string, serviceId: string, payload: Partial<ServicePayload>): Observable<Service> {
    return this.http.patch<Service>(`${environment.apiUrl}/businesses/${businessId}/services/${serviceId}`, payload);
  }

  setActive(businessId: string, serviceId: string, active: boolean): Observable<Service> {
    const action = active ? 'activate' : 'deactivate';
    return this.http.patch<Service>(`${environment.apiUrl}/businesses/${businessId}/services/${serviceId}/${action}`, {});
  }
}
