import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthResponse, BusinessSummary, User } from '../models';

const STORAGE_KEY = 'agendia.session';

interface StoredSession {
  accessToken: string;
  user: User;
  businesses: BusinessSummary[];
  activeBusinessId: string | null;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly _user = signal<User | null>(null);
  private readonly _businesses = signal<BusinessSummary[]>([]);
  private readonly _activeBusinessId = signal<string | null>(null);
  private readonly _token = signal<string | null>(null);

  readonly user = this._user.asReadonly();
  readonly businesses = this._businesses.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly activeBusiness = computed(
    () => this._businesses().find((b) => b.id === this._activeBusinessId()) ?? this._businesses()[0] ?? null,
  );

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
  ) {
    this.restoreSession();
  }

  get token(): string | null {
    return this._token();
  }

  register(payload: { email: string; password: string; fullName: string; phone?: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  login(payload: { email: string; password: string }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, payload)
      .pipe(tap((res) => this.setSession(res)));
  }

  verifyEmail(token: string): Observable<{ message: string }> {
    return this.http.get<{ message: string }>(`${environment.apiUrl}/auth/verify-email/${token}`);
  }

  resendVerification(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/resend-verification`, {});
  }

  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${environment.apiUrl}/auth/reset-password`, { token, newPassword });
  }

  logout(): void {
    this._user.set(null);
    this._businesses.set([]);
    this._activeBusinessId.set(null);
    this._token.set(null);
    localStorage.removeItem(STORAGE_KEY);
    this.router.navigateByUrl('/login');
  }

  setActiveBusiness(businessId: string): void {
    this._activeBusinessId.set(businessId);
    this.persist();
  }

  /** Añade un negocio recién creado a la lista y lo marca como activo (usado por el onboarding). */
  addBusiness(business: BusinessSummary): void {
    this._businesses.update((list) => [...list, business]);
    this._activeBusinessId.set(business.id);
    this.persist();
  }

  /** Refresca la lista de negocios del usuario (tras crear uno nuevo, por ejemplo). */
  setBusinesses(businesses: BusinessSummary[]): void {
    this._businesses.set(businesses);
    if (!this._activeBusinessId() && businesses.length > 0) {
      this._activeBusinessId.set(businesses[0].id);
    }
    this.persist();
  }

  private setSession(res: AuthResponse): void {
    this._user.set(res.user);
    this._businesses.set(res.businesses);
    this._token.set(res.accessToken);
    this._activeBusinessId.set(res.businesses[0]?.id ?? null);
    this.persist();
  }

  private persist(): void {
    if (!this._token()) return;
    const session: StoredSession = {
      accessToken: this._token()!,
      user: this._user()!,
      businesses: this._businesses(),
      activeBusinessId: this._activeBusinessId(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }

  /**
   * Verificar el email pasa en una página aparte (`/verificar-email/:token`,
   * llegado desde el enlace del correo), completamente desconectada del
   * estado de sesión ya guardado en el navegador — sin esto, el aviso de
   * "confirma tu email" del Shell seguía apareciendo aunque el backend ya
   * tuviera el email marcado como verificado, porque el signal `_user`
   * seguía con el valor cacheado de cuando se inició sesión.
   */
  markEmailVerifiedLocally(): void {
    const current = this._user();
    if (!current) return; // no hay sesión activa en este navegador — nada que actualizar
    this._user.set({ ...current, emailVerified: true });
    this.persist();
  }

  private restoreSession(): void {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const session: StoredSession = JSON.parse(raw);
      this._token.set(session.accessToken);
      this._user.set(session.user);
      this._businesses.set(session.businesses);
      this._activeBusinessId.set(session.activeBusinessId);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
