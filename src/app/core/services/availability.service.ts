import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StaffAvailability {
  staffId: string;
  staffName: string;
  slots: string[];
}

@Injectable({ providedIn: 'root' })
export class AvailabilityService {
  private readonly http = inject(HttpClient);

  getAvailability(businessId: string, serviceId: string, date: string, staffId?: string): Observable<StaffAvailability[]> {
    let url = `${environment.apiUrl}/businesses/${businessId}/availability?serviceId=${serviceId}&date=${date}`;
    if (staffId) url += `&staffId=${staffId}`;
    return this.http.get<StaffAvailability[]>(url);
  }
}
