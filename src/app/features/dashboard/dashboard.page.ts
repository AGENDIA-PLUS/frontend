import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { Appointment } from '../../core/models';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_TONE } from '../../shared/ui/status.util';
import { BadgeTone } from '../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    ButtonComponent,
  ],
  template: `
    <div class="dashboard">
      <header class="dashboard__header">
        <div>
          <h1>Hoy</h1>
          <p>{{ today | date: "EEEE, d 'de' MMMM" : undefined : 'es' }}</p>
        </div>
      </header>

      @if (!auth.activeBusiness()) {
        <!-- Todavía no existe ningún negocio para este usuario: la UI de
             creación de negocio llega en el siguiente bloque de frontend
             (Onboarding). Se documenta aquí en vez de simularla con datos. -->
        <app-card>
          <app-empty-state
            icon="🏪"
            title="Todavía no tienes un negocio configurado"
            description="Crea tu negocio en unos pocos pasos: nombre, horario, tu primer servicio y profesional."
          >
            <app-button variant="secondary" routerLink="/onboarding">Crear mi negocio</app-button>
          </app-empty-state>
        </app-card>
      } @else {
        @if (loading()) {
          <div class="dashboard__stats">
            @for (i of [1, 2, 3, 4]; track i) {
              <app-card>
                <app-skeleton width="60%" height="14px"></app-skeleton>
                <div style="height: 10px"></div>
                <app-skeleton width="40%" height="28px"></app-skeleton>
              </app-card>
            }
          </div>
        } @else if (error()) {
          <app-card>
            <app-empty-state icon="⚠️" title="No se pudieron cargar las citas de hoy" [description]="error()!">
              <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
            </app-empty-state>
          </app-card>
        } @else {
          <div class="dashboard__stats">
            <app-card>
              <span class="dashboard__stat-label">Citas hoy</span>
              <strong class="dashboard__stat-value">{{ appointments().length }}</strong>
            </app-card>
            <app-card>
              <span class="dashboard__stat-label">Confirmadas</span>
              <strong class="dashboard__stat-value dashboard__stat-value--success">{{ confirmedCount() }}</strong>
            </app-card>
            <app-card>
              <span class="dashboard__stat-label">Pendientes</span>
              <strong class="dashboard__stat-value dashboard__stat-value--warning">{{ pendingCount() }}</strong>
            </app-card>
            <app-card>
              <span class="dashboard__stat-label">Canceladas</span>
              <strong class="dashboard__stat-value dashboard__stat-value--danger">{{ cancelledCount() }}</strong>
            </app-card>
          </div>

          <app-card [padded]="false">
            <div class="dashboard__list-header">
              <h2>Próximas citas</h2>
            </div>

            @if (upcoming().length === 0) {
              <app-empty-state
                icon="📭"
                title="No tienes más citas hoy"
                description="Cuando lleguen nuevas reservas desde tu página pública o las crees desde la agenda, aparecerán aquí."
              />
            } @else {
              <ul class="dashboard__list">
                @for (appt of upcoming(); track appt.id) {
                  <li class="dashboard__item">
                    <span class="dashboard__item-time">{{ appt.startsAt | date: 'HH:mm' }}</span>
                    <div class="dashboard__item-info">
                      <strong>{{ appt.customer?.fullName ?? 'Cliente' }}</strong>
                      <small>{{ appt.service?.name ?? 'Servicio' }} · {{ appt.staff?.fullName ?? 'Profesional' }}</small>
                    </div>
                    <app-badge [tone]="statusTone(appt.status)">{{ statusLabel(appt.status) }}</app-badge>
                  </li>
                }
              </ul>
            }
          </app-card>
        }
      }
    </div>
  `,
  styleUrl: './dashboard.page.scss',
})
export class DashboardPageComponent {
  protected readonly auth = inject(AuthService);
  private readonly appointmentsService = inject(AppointmentsService);

  readonly today = new Date();
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly appointments = signal<Appointment[]>([]);

  readonly confirmedCount = computed(() => this.appointments().filter((a) => a.status === 'CONFIRMED').length);
  readonly pendingCount = computed(() => this.appointments().filter((a) => a.status === 'PENDING').length);
  readonly cancelledCount = computed(() => this.appointments().filter((a) => a.status === 'CANCELLED').length);
  readonly upcoming = computed(() =>
    [...this.appointments()]
      .filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED')
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime()),
  );

  constructor() {
    if (this.auth.activeBusiness()) {
      this.load();
    }
  }

  load(): void {
    const business = this.auth.activeBusiness();
    if (!business) return;

    this.loading.set(true);
    this.error.set(null);

    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    this.appointmentsService.findAll(business.id, start.toISOString(), end.toISOString()).subscribe({
      next: (appointments) => {
        this.appointments.set(appointments);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: Appointment['status']): string {
    return APPOINTMENT_STATUS_LABEL[status];
  }

  statusTone(status: Appointment['status']): BadgeTone {
    return APPOINTMENT_STATUS_TONE[status];
  }
}
