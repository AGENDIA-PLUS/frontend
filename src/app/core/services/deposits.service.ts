import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DepositConnectStatus {
  connected: boolean;
  chargesEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class DepositsService {
  private readonly http = inject(HttpClient);

  getStatus(businessId: string): Observable<DepositConnectStatus> {
    return this.http.get<DepositConnectStatus>(`${environment.apiUrl}/businesses/${businessId}/deposits/status`);
  }

  connect(businessId: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${environment.apiUrl}/businesses/${businessId}/deposits/connect`, {});
  }

  disconnect(businessId: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/businesses/${businessId}/deposits/disconnect`, {});
  }
}
