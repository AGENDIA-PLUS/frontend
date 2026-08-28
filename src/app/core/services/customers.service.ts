import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Appointment, Customer } from '../models';

export interface CustomerStats {
  totalAppointments: number;
  cancellations: number;
  noShows: number;
  lastAppointmentAt: string | null;
  favoriteService: string | null;
  usualStaff: string | null;
}

export interface CustomerProfile {
  customer: Customer;
  stats: CustomerStats;
  history: Appointment[];
}

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly http = inject(HttpClient);

  findAll(businessId: string): Observable<Customer[]> {
    return this.http.get<Customer[]>(`${environment.apiUrl}/businesses/${businessId}/customers`);
  }

  getProfile(businessId: string, customerId: string): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${environment.apiUrl}/businesses/${businessId}/customers/${customerId}/profile`);
  }

  create(businessId: string, payload: { fullName: string; phone?: string; email?: string; notes?: string }): Observable<Customer> {
    return this.http.post<Customer>(`${environment.apiUrl}/businesses/${businessId}/customers`, payload);
  }

  update(
    businessId: string,
    customerId: string,
    payload: Partial<{ fullName: string; phone: string; email: string; notes: string }>,
  ): Observable<Customer> {
    return this.http.patch<Customer>(`${environment.apiUrl}/businesses/${businessId}/customers/${customerId}`, payload);
  }
}
