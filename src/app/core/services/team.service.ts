import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TeamMember {
  id: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  createdAt: string;
  user: { id: string; fullName: string; email: string };
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  status: string;
  expiresAt: string;
  createdAt: string;
}

export interface TeamSummary {
  members: TeamMember[];
  invitations: TeamInvitation[];
}

export interface InvitationPreview {
  businessName: string;
  email: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF';
  expiresAt: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
  private readonly http = inject(HttpClient);

  getTeam(businessId: string): Observable<TeamSummary> {
    return this.http.get<TeamSummary>(`${environment.apiUrl}/businesses/${businessId}/team`);
  }

  invite(businessId: string, email: string, role: 'ADMIN' | 'STAFF'): Observable<{ invitation: TeamInvitation; inviteUrl: string }> {
    return this.http.post<{ invitation: TeamInvitation; inviteUrl: string }>(
      `${environment.apiUrl}/businesses/${businessId}/team/invitations`,
      { email, role },
    );
  }

  cancelInvitation(businessId: string, invitationId: string): Observable<unknown> {
    return this.http.delete(`${environment.apiUrl}/businesses/${businessId}/team/invitations/${invitationId}`);
  }

  removeMember(businessId: string, membershipId: string): Observable<unknown> {
    return this.http.delete(`${environment.apiUrl}/businesses/${businessId}/team/members/${membershipId}`);
  }

  // Endpoints públicos de aceptación (no llevan businessId en la URL).
  getInvitationByToken(token: string): Observable<InvitationPreview> {
    return this.http.get<InvitationPreview>(`${environment.apiUrl}/invitations/${token}`);
  }

  acceptInvitation(token: string): Observable<unknown> {
    return this.http.post(`${environment.apiUrl}/invitations/${token}/accept`, {});
  }
}
