import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Message } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private readonly http = inject(HttpClient);

  findAll(businessId: string): Observable<Message[]> {
    return this.http.get<Message[]>(`${environment.apiUrl}/businesses/${businessId}/messages`);
  }
}
