import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface GoogleCalendarStatus {
  connected: boolean;
}

@Injectable({ providedIn: 'root' })
export class GoogleCalendarService {
  private readonly http = inject(HttpClient);

  getStatus(businessId: string): Observable<GoogleCalendarStatus> {
    return this.http.get<GoogleCalendarStatus>(`${environment.apiUrl}/businesses/${businessId}/google-calendar/status`);
  }

  connect(businessId: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${environment.apiUrl}/businesses/${businessId}/google-calendar/connect`, {});
  }

  disconnect(businessId: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/businesses/${businessId}/google-calendar/disconnect`, {});
  }
}
