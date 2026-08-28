import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment } from '../models';

@Injectable({ providedIn: 'root' })
export class AppointmentsService {
  private readonly http = inject(HttpClient);

  findAll(businessId: string, from: string, to: string, staffId?: string): Observable<Appointment[]> {
    let url = `${environment.apiUrl}/businesses/${businessId}/appointments?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`;
    if (staffId) url += `&staffId=${staffId}`;
    return this.http.get<Appointment[]>(url);
  }

  create(
    businessId: string,
    payload: { customerId: string; serviceId: string; staffId: string; startsAt: string; notes?: string },
  ): Observable<Appointment> {
    return this.http.post<Appointment>(`${environment.apiUrl}/businesses/${businessId}/appointments`, {
      ...payload,
      source: 'DASHBOARD',
    });
  }

  confirm(businessId: string, appointmentId: string): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${environment.apiUrl}/businesses/${businessId}/appointments/${appointmentId}/confirm`,
      {},
    );
  }

  complete(businessId: string, appointmentId: string): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${environment.apiUrl}/businesses/${businessId}/appointments/${appointmentId}/complete`,
      {},
    );
  }

  markNoShow(businessId: string, appointmentId: string): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${environment.apiUrl}/businesses/${businessId}/appointments/${appointmentId}/no-show`,
      {},
    );
  }

  cancel(businessId: string, appointmentId: string, reason?: string): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${environment.apiUrl}/businesses/${businessId}/appointments/${appointmentId}/cancel`,
      { reason },
    );
  }

  reschedule(
    businessId: string,
    appointmentId: string,
    payload: { startsAt: string; staffId?: string; serviceId?: string },
  ): Observable<Appointment> {
    return this.http.patch<Appointment>(
      `${environment.apiUrl}/businesses/${businessId}/appointments/${appointmentId}/reschedule`,
      payload,
    );
  }
}

