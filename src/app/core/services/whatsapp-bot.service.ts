import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Business } from '../models';

@Injectable({ providedIn: 'root' })
export class WhatsAppBotService {
  private readonly http = inject(HttpClient);

  updateConnection(businessId: string, phoneNumberId: string, accessToken: string): Observable<Business> {
    return this.http.patch<Business>(`${environment.apiUrl}/businesses/${businessId}/whatsapp-connection`, {
      phoneNumberId,
      accessToken,
    });
  }

  simulate(businessId: string, phone: string, text: string): Observable<{ reply: string }> {
    return this.http.post<{ reply: string }>(`${environment.apiUrl}/businesses/${businessId}/whatsapp-bot/simulate`, {
      phone,
      text,
    });
  }
}
