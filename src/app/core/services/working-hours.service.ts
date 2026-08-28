import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface WorkingHourSlot {
  weekday: number;
  startTime: string;
  endTime: string;
}

@Injectable({ providedIn: 'root' })
export class WorkingHoursService {
  private readonly http = inject(HttpClient);

  setBusinessHours(businessId: string, slots: WorkingHourSlot[]): Observable<unknown> {
    return this.http.put(`${environment.apiUrl}/businesses/${businessId}/working-hours`, { slots });
  }

  getBusinessHours(businessId: string): Observable<(WorkingHourSlot & { id: string })[]> {
    return this.http.get<(WorkingHourSlot & { id: string })[]>(`${environment.apiUrl}/businesses/${businessId}/working-hours`);
  }
}
