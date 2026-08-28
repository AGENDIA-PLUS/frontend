import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { ServicesService } from '../../core/services/services.service';
import { StaffService } from '../../core/services/staff.service';
import { Appointment, AppointmentStatus, Service, Staff } from '../../core/models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_TONE } from '../../shared/ui/status.util';
import { BadgeTone } from '../../shared/ui/badge/badge.component';
import { AppointmentModalComponent } from '../agenda/components/appointment-modal/appointment-modal.component';

type StatusFilter = AppointmentStatus | 'ALL';

@Component({
  selector: 'app-appointments-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    AppointmentModalComponent,
  ],
  template: `
    <div class="appointments">
      <header class="appointments__header">
        <div>
          <h1>Citas</h1>
          <p>Todas las citas de tu negocio, con filtros por estado, fecha y profesional.</p>
        </div>
      </header>

      <div class="appointments__filters">
        <div class="filter">
          <label>Desde</label>
          <input type="date" [(ngModel)]="fromDate" (change)="load()" />
        </div>
        <div class="filter">
          <label>Hasta</label>
          <input type="date" [(ngModel)]="toDate" (change)="load()" />
        </div>
        <div class="filter">
          <label>Profesional</label>
          <select [(ngModel)]="staffFilter" (change)="load()">
            <option value="">Todos</option>
            @for (member of staff(); track member.id) {
              <option [value]="member.id">{{ member.fullName }}</option>
            }
          </select>
        </div>
        <div class="filter">
          <label>Estado</label>
          <select [(ngModel)]="statusFilter">
            <option value="ALL">Todos</option>
            @for (status of statuses; track status) {
              <option [value]="status">{{ statusLabel(status) }}</option>
            }
          </select>
        </div>
      </div>

      @if (loading()) {
        <app-card [padded]="false">
          <div class="appointments__skeleton">
            @for (i of [1, 2, 3, 4, 5]; track i) {
              <div class="appointments__skeleton-row">
                <app-skeleton width="30%" height="14px"></app-skeleton>
                <app-skeleton width="15%" height="14px"></app-skeleton>
              </div>
            }
          </div>
        </app-card>
      } @else if (error()) {
        <app-card>
          <app-empty-state icon="⚠️" title="No se pudieron cargar las citas" [description]="error()!">
            <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
          </app-empty-state>
        </app-card>
      } @else if (filteredAppointments().length === 0) {
        <app-card>
          <app-empty-state icon="🗓️" title="No hay citas en este rango" description="Prueba a ampliar las fechas o cambiar los filtros." />
        </app-card>
      } @else {
        <app-card [padded]="false">
          <ul class="appointments__list">
            @for (appt of filteredAppointments(); track appt.id) {
              <li>
                <button type="button" class="appointments__row" (click)="openDetail(appt)">
                  <div class="appointments__datetime">
                    <strong>{{ appt.startsAt | date: 'd MMM' }}</strong>
                    <small>{{ appt.startsAt | date: 'HH:mm' }}</small>
                  </div>
                  <div class="appointments__info">
                    <strong>{{ appt.customer?.fullName ?? 'Cliente' }}</strong>
                    <small>{{ appt.service?.name }} · {{ appt.staff?.fullName }}</small>
                  </div>
                  <app-badge [tone]="statusTone(appt.status)">{{ statusLabel(appt.status) }}</app-badge>
                </button>
              </li>
            }
          </ul>
        </app-card>
      }
    </div>

    @if (modalOpen() && selectedAppointment()) {
      <app-appointment-modal
        [businessId]="business()!.id"
        [appointment]="selectedAppointment()"
        [services]="services()"
        [staff]="staff()"
        (closed)="modalOpen.set(false)"
        (saved)="load()"
      ></app-appointment-modal>
    }
  `,
  styleUrl: './appointments.page.scss',
})
export class AppointmentsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly servicesService = inject(ServicesService);
  private readonly staffService = inject(StaffService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly appointments = signal<Appointment[]>([]);
  readonly staff = signal<Staff[]>([]);
  readonly services = signal<Service[]>([]);

  readonly modalOpen = signal(false);
  readonly selectedAppointment = signal<Appointment | null>(null);

  readonly statuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED', 'NO_SHOW'];
  statusFilter: StatusFilter = 'ALL';
  staffFilter = '';

  fromDate = this.daysFromNow(-7);
  toDate = this.daysFromNow(30);

  readonly filteredAppointments = computed(() => {
    const list = this.appointments();
    if (this.statusFilter === 'ALL') return list;
    return list.filter((a) => a.status === this.statusFilter);
  });

  constructor() {
    if (this.business()) {
      this.load();
      this.staffService.findAll(this.business()!.id).subscribe((list) => this.staff.set(list));
      this.servicesService.findAll(this.business()!.id).subscribe((list) => this.services.set(list));
    }
  }

  load(): void {
    const business = this.business();
    if (!business) return;

    this.loading.set(true);
    this.error.set('');

    const from = new Date(this.fromDate);
    from.setHours(0, 0, 0, 0);
    const to = new Date(this.toDate);
    to.setHours(23, 59, 59, 999);

    this.appointmentsService.findAll(business.id, from.toISOString(), to.toISOString(), this.staffFilter || undefined).subscribe({
      next: (list) => {
        this.appointments.set(list.sort((a, b) => new Date(b.startsAt).getTime() - new Date(a.startsAt).getTime()));
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
      },
    });
  }

  openDetail(appointment: Appointment): void {
    this.selectedAppointment.set(appointment);
    this.modalOpen.set(true);
  }

  statusLabel(status: AppointmentStatus): string {
    return APPOINTMENT_STATUS_LABEL[status];
  }
  statusTone(status: AppointmentStatus): BadgeTone {
    return APPOINTMENT_STATUS_TONE[status];
  }

  private daysFromNow(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
