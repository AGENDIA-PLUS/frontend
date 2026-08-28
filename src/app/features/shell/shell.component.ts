import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  available: boolean;
}

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="shell" [class.shell--sidebar-open]="sidebarOpen()">
      <aside class="shell__sidebar">
        <a routerLink="/app/dashboard" class="shell__brand">
          <span class="shell__brand-mark">A</span>
          Agendia
        </a>

        @if (auth.activeBusiness(); as business) {
          <div class="shell__business">
            <span class="shell__business-dot"></span>
            <div>
              <strong>{{ business.name }}</strong>
              <small>/{{ business.slug }}</small>
            </div>
          </div>
        }

        <nav class="shell__nav">
          @for (item of navItems; track item.route) {
            @if (item.available) {
              <a [routerLink]="item.route" routerLinkActive="shell__nav-item--active" class="shell__nav-item">
                <span class="shell__nav-icon">{{ item.icon }}</span>
                {{ item.label }}
              </a>
            } @else {
              <span class="shell__nav-item shell__nav-item--disabled" [title]="'Próximamente: ' + item.label">
                <span class="shell__nav-icon">{{ item.icon }}</span>
                {{ item.label }}
                <span class="shell__nav-soon">Pronto</span>
              </span>
            }
          }
        </nav>

        <button class="shell__logout" type="button" (click)="auth.logout()">
          <span aria-hidden="true">↩</span>
          Cerrar sesión
        </button>
      </aside>

      <div class="shell__main">
        <header class="shell__topbar">
          <button class="shell__menu-toggle" type="button" (click)="sidebarOpen.set(!sidebarOpen())" aria-label="Abrir menú">
            ☰
          </button>
          <div class="shell__topbar-spacer"></div>
          @if (auth.user(); as user) {
            <div class="shell__user">
              <span class="shell__user-avatar">{{ initials(user.fullName) }}</span>
              <span class="shell__user-name">{{ user.fullName }}</span>
            </div>
          }
        </header>

        <main class="shell__content">
          @if (showVerifyBanner()) {
            <div class="shell__verify-banner">
              <span>📧 Confirma tu email para asegurar el acceso a tu cuenta.</span>
              <div class="shell__verify-banner-actions">
                <button type="button" (click)="resendVerification()" [disabled]="resending()">
                  {{ resending() ? 'Enviando...' : 'Reenviar email' }}
                </button>
                <button type="button" class="shell__verify-banner-dismiss" (click)="dismissBanner()" aria-label="Cerrar aviso">
                  ✕
                </button>
              </div>
            </div>
            @if (resendMessage()) {
              <p class="shell__verify-banner-confirm">{{ resendMessage() }}</p>
            }
          }
          <router-outlet></router-outlet>
        </main>
      </div>

      @if (sidebarOpen()) {
        <button class="shell__backdrop" type="button" (click)="sidebarOpen.set(false)" aria-label="Cerrar menú"></button>
      }
    </div>
  `,
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  readonly sidebarOpen = signal(false);

  // Aviso descartable por sesión de navegador: no es un bloqueo (el email
  // sin verificar no impide usar la app), solo un recordatorio suave.
  private readonly bannerDismissed = signal(sessionStorage.getItem('agendia-verify-banner-dismissed') === '1');
  readonly resending = signal(false);
  readonly resendMessage = signal('');

  readonly showVerifyBanner = computed(() => {
    const user = this.auth.user();
    return !!user && user.emailVerified === false && !this.bannerDismissed();
  });

  dismissBanner(): void {
    this.bannerDismissed.set(true);
    sessionStorage.setItem('agendia-verify-banner-dismissed', '1');
  }

  resendVerification(): void {
    this.resending.set(true);
    this.resendMessage.set('');
    this.auth.resendVerification().subscribe({
      next: (res) => {
        this.resending.set(false);
        this.resendMessage.set(res.message);
      },
      error: () => {
        this.resending.set(false);
        this.resendMessage.set('No se pudo reenviar el email. Inténtalo de nuevo en unos minutos.');
      },
    });
  }

  // Solo Dashboard está implementado (Bloque de frontend actual). El resto
  // queda visible en la navegación para transmitir la estructura completa
  // del producto, pero deshabilitado con un indicador claro de "Pronto"
  // hasta que se construya cada módulo — así se evita enlazar a rutas
  // inexistentes o mostrar datos inventados.
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: '🏠', route: '/app/dashboard', available: true },
    { label: 'Estadísticas', icon: '📊', route: '/app/estadisticas', available: true },
    { label: 'Agenda', icon: '📅', route: '/app/agenda', available: true },
    { label: 'Citas', icon: '🗓️', route: '/app/citas', available: true },
    { label: 'Clientes', icon: '👥', route: '/app/clientes', available: true },
    { label: 'Servicios', icon: '✂️', route: '/app/servicios', available: true },
    { label: 'Profesionales', icon: '🧑‍💼', route: '/app/profesionales', available: true },
    { label: 'Ubicaciones', icon: '🏢', route: '/app/ubicaciones', available: true },
    { label: 'Workflows', icon: '⚙️', route: '/app/workflows', available: true },
    { label: 'Notificaciones', icon: '💬', route: '/app/notificaciones', available: true },
    { label: 'Equipo', icon: '👤', route: '/app/equipo', available: true },
    { label: 'Webhooks', icon: '🔗', route: '/app/webhooks', available: true },
    { label: 'Configuración', icon: '🔧', route: '/app/configuracion', available: true },
  ];

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}
