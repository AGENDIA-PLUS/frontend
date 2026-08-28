import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface StatsResponse {
  range: { from: string; to: string };
  totals: {
    totalAppointments: number;
    completed: number;
    cancelled: number;
    noShow: number;
    pending: number;
    newCustomers: number;
    estimatedRevenue: number;
    cancellationRate: number;
    noShowRate: number;
  };
  topServices: { id: string; name: string; count: number }[];
  topStaff: { id: string; name: string; count: number }[];
  appointmentsByDay: { date: string; count: number }[];
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  private readonly http = inject(HttpClient);

  getStats(businessId: string, from: string, to: string): Observable<StatsResponse> {
    return this.http.get<StatsResponse>(`${environment.apiUrl}/businesses/${businessId}/stats`, {
      params: { from, to },
    });
  }
}
