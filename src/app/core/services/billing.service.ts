import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BillingSummary {
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'MULTI_LOCATION';
  status: string;
  currentPeriodEnd: string | null;
  whatsapp: {
    included: number;
    used: number;
    remaining: number;
    overagePriceEur: number;
  };
  limits: {
    staffLimit: number | null;
    appointmentsPerMonthLimit: number | null;
  };
  features: {
    webhooksEnabled: boolean;
    workflowsEnabled: boolean;
  };
}

@Injectable({ providedIn: 'root' })
export class BillingService {
  private readonly http = inject(HttpClient);

  getSummary(businessId: string): Observable<BillingSummary> {
    return this.http.get<BillingSummary>(`${environment.apiUrl}/businesses/${businessId}/billing`);
  }

  createCheckoutSession(
    businessId: string,
    plan: 'PRO' | 'BUSINESS' | 'MULTI_LOCATION',
  ): Observable<{ url: string | null }> {
    return this.http.post<{ url: string | null }>(
      `${environment.apiUrl}/businesses/${businessId}/billing/checkout`,
      { plan },
    );
  }

  createPortalSession(businessId: string): Observable<{ url: string }> {
    return this.http.post<{ url: string }>(`${environment.apiUrl}/businesses/${businessId}/billing/portal`, {});
  }

  /**
   * Sincronización activa al volver del Checkout de Stripe (ver
   * billing.service.ts del backend) — red de seguridad para cuando el
   * webhook aún no ha llegado (típico en local sin `stripe listen`
   * corriendo).
   */
  syncSession(businessId: string, sessionId: string): Observable<BillingSummary> {
    return this.http.post<BillingSummary>(`${environment.apiUrl}/businesses/${businessId}/billing/sync-session`, {
      sessionId,
    });
  }
}
