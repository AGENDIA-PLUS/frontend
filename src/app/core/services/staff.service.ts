import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Staff } from '../models';

@Injectable({ providedIn: 'root' })
export class StaffService {
  private readonly http = inject(HttpClient);

  findAll(businessId: string): Observable<Staff[]> {
    return this.http.get<Staff[]>(`${environment.apiUrl}/businesses/${businessId}/staff`);
  }

  create(businessId: string, payload: { fullName: string; serviceIds?: string[]; locationId?: string | null }): Observable<Staff> {
    return this.http.post<Staff>(`${environment.apiUrl}/businesses/${businessId}/staff`, payload);
  }

  update(
    businessId: string,
    staffId: string,
    payload: Partial<{ fullName: string; serviceIds: string[]; locationId: string | null }>,
  ): Observable<Staff> {
    return this.http.patch<Staff>(`${environment.apiUrl}/businesses/${businessId}/staff/${staffId}`, payload);
  }

  setActive(businessId: string, staffId: string, active: boolean): Observable<Staff> {
    const action = active ? 'activate' : 'deactivate';
    return this.http.patch<Staff>(`${environment.apiUrl}/businesses/${businessId}/staff/${staffId}/${action}`, {});
  }
}
