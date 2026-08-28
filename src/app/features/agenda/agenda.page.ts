import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { AppointmentsService } from '../../core/services/appointments.service';
import { ServicesService } from '../../core/services/services.service';
import { StaffService } from '../../core/services/staff.service';
import { Appointment, Service, Staff } from '../../core/models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { AgendaDayViewComponent, AppointmentRescheduleRequest } from './components/day-view/day-view.component';
import { AgendaWeekViewComponent } from './components/week-view/week-view.component';
import { AppointmentModalComponent } from './components/appointment-modal/appointment-modal.component';

type ViewMode = 'day' | 'week';

@Component({
  selector: 'app-agenda-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    ButtonComponent,
    CardComponent,
    SkeletonComponent,
    EmptyStateComponent,
    AgendaDayViewComponent,
    AgendaWeekViewComponent,
    AppointmentModalComponent,
  ],
  template: `
    <div class="agenda">
      <header class="agenda__header">
        <div>
          <h1>Agenda</h1>
          <p>{{ headerLabel() }}</p>
        </div>
        <app-button (clicked)="openCreateModal()">+ Nueva cita</app-button>
      </header>

      @if (rescheduleError()) {
        <p class="agenda__reschedule-error">{{ rescheduleError() }}</p>
      }

      @if (!business()) {
        <app-card>
          <app-empty-state icon="🏪" title="Configura tu negocio primero" description="Necesitas completar el onboarding antes de ver tu agenda." />
        </app-card>
      } @else {
        <div class="agenda__toolbar">
          <div class="agenda__nav">
            <app-button variant="ghost" size="sm" (clicked)="navigate(-1)">← Anterior</app-button>
            <app-button variant="ghost" size="sm" (clicked)="goToday()">Hoy</app-button>
            <app-button variant="ghost" size="sm" (clicked)="navigate(1)">Siguiente →</app-button>
          </div>
          <div class="agenda__view-toggle">
            <button type="button" [class.active]="view() === 'day'" (click)="view.set('day')">Día</button>
            <button type="button" [class.active]="view() === 'week'" (click)="view.set('week')">Semana</button>
          </div>
        </div>

        @if (loading()) {
          <app-card>
            <app-skeleton height="360px"></app-skeleton>
          </app-card>
        } @else if (staff().length === 0) {
          <app-card>
            <app-empty-state icon="🧑‍💼" title="Todavía no tienes profesionales" description="Añade un profesional para empezar a recibir citas en tu agenda." />
          </app-card>
        } @else if (view() === 'day') {
          <app-agenda-day-view
            [staff]="staff()"
            [appointments]="appointments()"
            (select)="openViewModal($event)"
            (rescheduled)="onDragRescheduled($event)"
          ></app-agenda-day-view>
        } @else {
          <app-agenda-week-view [days]="weekDays()" [appointments]="appointments()" (select)="openViewModal($event)"></app-agenda-week-view>
        }
      }
    </div>

    @if (modalOpen()) {
      <app-appointment-modal
        [businessId]="business()!.id"
        [date]="currentDateIso()"
        [services]="services()"
        [staff]="staff()"
        [appointment]="modalAppointment()"
        (closed)="modalOpen.set(false)"
        (saved)="reload()"
      ></app-appointment-modal>
    }
  `,
  styleUrl: './agenda.page.scss',
})
export class AgendaPageComponent {
  private readonly auth = inject(AuthService);
  private readonly appointmentsService = inject(AppointmentsService);
  private readonly servicesService = inject(ServicesService);
  private readonly staffService = inject(StaffService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly view = signal<ViewMode>('day');
  readonly currentDate = signal(new Date());
  readonly loading = signal(false);
  readonly rescheduleError = signal('');

  readonly staff = signal<Staff[]>([]);
  readonly services = signal<Service[]>([]);
  readonly appointments = signal<Appointment[]>([]);

  readonly modalOpen = signal(false);
  readonly modalAppointment = signal<Appointment | null>(null);

  readonly currentDateIso = computed(() => this.currentDate().toISOString().slice(0, 10));

  readonly weekDays = computed(() => {
    const d = new Date(this.currentDate());
    const day = d.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(d);
    monday.setDate(d.getDate() + diffToMonday);
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date(monday);
      day.setDate(monday.getDate() + i);
      return day;
    });
  });

  readonly headerLabel = computed(() => {
    if (this.view() === 'day') {
      return this.currentDate().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    const days = this.weekDays();
    return `${days[0].toLocaleDateString('es', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('es', { day: 'numeric', month: 'short' })}`;
  });

  constructor() {
    if (this.business()) {
      this.loadStaffAndServices();
      this.reload();
    }
  }

  navigate(direction: 1 | -1): void {
    const d = new Date(this.currentDate());
    d.setDate(d.getDate() + direction * (this.view() === 'day' ? 1 : 7));
    this.currentDate.set(d);
    this.reload();
  }

  goToday(): void {
    this.currentDate.set(new Date());
    this.reload();
  }

  loadStaffAndServices(): void {
    const business = this.business();
    if (!business) return;
    this.staffService.findAll(business.id).subscribe((list) => this.staff.set(list.filter((s) => s.isActive)));
    this.servicesService.findAll(business.id).subscribe((list) => this.services.set(list.filter((s) => s.isActive)));
  }

  reload(): void {
    const business = this.business();
    if (!business) return;

    this.loading.set(true);
    const { from, to } = this.rangeForView();

    this.appointmentsService.findAll(business.id, from, to).subscribe({
      next: (list) => {
        this.appointments.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  private rangeForView(): { from: string; to: string } {
    if (this.view() === 'day') {
      const start = new Date(this.currentDate());
      start.setHours(0, 0, 0, 0);
      const end = new Date(this.currentDate());
      end.setHours(23, 59, 59, 999);
      return { from: start.toISOString(), to: end.toISOString() };
    }
    const days = this.weekDays();
    const start = new Date(days[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(days[6]);
    end.setHours(23, 59, 59, 999);
    return { from: start.toISOString(), to: end.toISOString() };
  }

  openCreateModal(): void {
    this.modalAppointment.set(null);
    this.modalOpen.set(true);
  }

  openViewModal(appointment: Appointment): void {
    this.modalAppointment.set(appointment);
    this.modalOpen.set(true);
  }

  /**
   * Reprogramar por arrastre (sección "drag and drop en Agenda"): la vista
   * de día ya calculó la nueva hora/profesional a partir de dónde se soltó
   * la cita; aquí solo se llama a la misma API de reprogramar que ya usa
   * el modal. Si el nuevo hueco choca con otra cita del mismo profesional
   * (el EXCLUDE constraint de Postgres lo rechaza — sección 59), se
   * recarga para que la cita "vuelva" visualmente a su sitio real en vez
   * de quedarse mostrando una posición que nunca se llegó a guardar.
   */
  onDragRescheduled(request: AppointmentRescheduleRequest): void {
    const business = this.business();
    if (!business) return;

    this.rescheduleError.set('');

    this.appointmentsService
      .reschedule(business.id, request.appointment.id, {
        startsAt: request.startsAt,
        staffId: request.staffId,
      })
      .subscribe({
        next: () => this.reload(),
        error: (err) => {
          this.rescheduleError.set(
            err?.error?.message ?? 'No se pudo mover la cita a ese hueco (puede que choque con otra cita).',
          );
          this.reload(); // revierte la posición visual a los datos reales
        },
      });
  }
}