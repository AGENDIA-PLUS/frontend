import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Webhook {
  id: string;
  businessId: string;
  url: string;
  events: string[];
  isActive: boolean;
  createdAt: string;
}

export interface WebhookWithSecret extends Webhook {
  secret: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  responseCode: number | null;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  attempts: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class WebhooksService {
  private readonly http = inject(HttpClient);

  findAll(businessId: string): Observable<Webhook[]> {
    return this.http.get<Webhook[]>(`${environment.apiUrl}/businesses/${businessId}/webhooks`);
  }

  create(businessId: string, payload: { url: string; events: string[] }): Observable<WebhookWithSecret> {
    return this.http.post<WebhookWithSecret>(`${environment.apiUrl}/businesses/${businessId}/webhooks`, payload);
  }

  update(
    businessId: string,
    webhookId: string,
    payload: { url?: string; events?: string[]; isActive?: boolean },
  ): Observable<Webhook> {
    return this.http.patch<Webhook>(`${environment.apiUrl}/businesses/${businessId}/webhooks/${webhookId}`, payload);
  }

  regenerateSecret(businessId: string, webhookId: string): Observable<WebhookWithSecret> {
    return this.http.post<WebhookWithSecret>(
      `${environment.apiUrl}/businesses/${businessId}/webhooks/${webhookId}/regenerate-secret`,
      {},
    );
  }

  remove(businessId: string, webhookId: string): Observable<unknown> {
    return this.http.delete(`${environment.apiUrl}/businesses/${businessId}/webhooks/${webhookId}`);
  }

  findDeliveries(businessId: string, webhookId: string): Observable<WebhookDelivery[]> {
    return this.http.get<WebhookDelivery[]>(
      `${environment.apiUrl}/businesses/${businessId}/webhooks/${webhookId}/deliveries`,
    );
  }
}
