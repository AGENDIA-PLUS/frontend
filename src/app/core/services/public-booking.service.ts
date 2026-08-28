import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PublicService {
  id: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: string;
  category: string | null;
  imageUrl: string | null;
  depositEnabled?: boolean;
  depositType?: 'FIXED' | 'PERCENTAGE' | null;
  depositAmount?: string | null;
}

export interface PublicStaff {
  id: string;
  fullName: string;
  photoUrl: string | null;
  serviceIds: string[];
}

export interface PublicBusinessResponse {
  business: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
    description: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
    whatsapp: string | null;
    timezone: string;
    currency: string;
    cancellationPolicy: string | null;
  };
  services: PublicService[];
  staff: PublicStaff[];
}

export interface PublicAvailability {
  staffId: string;
  staffName: string;
  slots: string[];
}

@Injectable({ providedIn: 'root' })
export class PublicBookingService {
  private readonly http = inject(HttpClient);

  getBusiness(slug: string): Observable<PublicBusinessResponse> {
    return this.http.get<PublicBusinessResponse>(`${environment.apiUrl}/public/${slug}`);
  }

  getAvailability(slug: string, serviceId: string, date: string, staffId?: string): Observable<PublicAvailability[]> {
    let url = `${environment.apiUrl}/public/${slug}/availability?serviceId=${serviceId}&date=${date}`;
    if (staffId) url += `&staffId=${staffId}`;
    return this.http.get<PublicAvailability[]>(url);
  }

  createBooking(
    slug: string,
    payload: {
      serviceId: string;
      staffId: string;
      startsAt: string;
      fullName: string;
      phone: string;
      email?: string;
      notes?: string;
    },
  ): Observable<{
    appointment: any;
    manage: { appointmentId: string; requiresPhone: boolean };
    depositCheckoutUrl: string | null;
  }> {
    return this.http.post<any>(`${environment.apiUrl}/public/${slug}/bookings`, payload);
  }
}
