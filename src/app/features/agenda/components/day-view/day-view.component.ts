import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDrag, CdkDragEnd } from '@angular/cdk/drag-drop';
import { Appointment, Staff } from '../../../../core/models';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { APPOINTMENT_STATUS_TONE } from '../../../../shared/ui/status.util';

const START_HOUR = 8;
const END_HOUR = 21;
const PX_PER_MIN = 1.1;
const SNAP_MINUTES = 5;

interface PositionedAppointment {
  appointment: Appointment;
  top: number;
  height: number;
}

export interface AppointmentRescheduleRequest {
  appointment: Appointment;
  startsAt: string;
  staffId?: string;
}

@Component({
  selector: 'app-agenda-day-view',
  standalone: true,
  imports: [CommonModule, BadgeComponent, CdkDrag],
  template: `
    <div class="day-view">
      <div class="day-view__time-col">
        <div class="day-view__col-header"></div>
        @for (hour of hours; track hour) {
          <div class="day-view__hour-label" [style.height.px]="60 * pxPerMin">{{ hour }}:00</div>
        }
      </div>

      @for (member of staff; track member.id) {
        <div class="day-view__col">
          <div class="day-view__col-header">{{ member.fullName }}</div>
          <div class="day-view__col-body" [attr.data-staff-id]="member.id" [style.height.px]="totalHeight">
            @for (hour of hours; track hour) {
              <div class="day-view__gridline" [style.top.px]="(hour - startHour) * 60 * pxPerMin"></div>
            }
            @for (item of positioned(member.id); track item.appointment.id) {
              <div
                class="day-view__appt"
                [class]="'day-view__appt--' + statusTone(item.appointment.status)"
                [style.top.px]="item.top"
                [style.height.px]="item.height"
                role="button"
                tabindex="0"
                cdkDrag
                cdkDragBoundary=".day-view"
                [cdkDragDisabled]="item.appointment.status === 'CANCELLED' || item.appointment.status === 'COMPLETED'"
                (cdkDragEnded)="onDragEnded($event, item)"
                (click)="onAppointmentClick(item.appointment)"
                (keydown.enter)="onAppointmentClick(item.appointment)"
              >
                <strong>{{ item.appointment.customer?.fullName ?? 'Cliente' }}</strong>
                <small>{{ item.appointment.service?.name }}</small>
              </div>
            }
          </div>
        </div>
      } @empty {
        <p class="day-view__empty">Añade un profesional para ver la agenda por columnas.</p>
      }
    </div>
  `,
  styleUrl: './day-view.component.scss',
})
export class AgendaDayViewComponent {
  @Input() staff: Staff[] = [];
  @Input() appointments: Appointment[] = [];
  @Output() select = new EventEmitter<Appointment>();
  @Output() rescheduled = new EventEmitter<AppointmentRescheduleRequest>();

  readonly startHour = START_HOUR;
  readonly pxPerMin = PX_PER_MIN;
  readonly hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  readonly totalHeight = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

  // Distingue un clic normal (abrir el modal) de haber soltado tras
  // arrastrar — sin esto, cdkDrag dispara igualmente un evento de click al
  // soltar, y abriría el modal justo después de reprogramar por arrastre.
  private justDragged = false;

  positioned(staffId: string): PositionedAppointment[] {
    return this.appointments
      .filter((a) => a.staffId === staffId && a.status !== 'CANCELLED' && a.status !== 'RESCHEDULED')
      .map((appointment) => {
        const start = new Date(appointment.startsAt);
        const end = new Date(appointment.endsAt);
        const startMin = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
        const durationMin = (end.getTime() - start.getTime()) / 60000;
        return {
          appointment,
          top: Math.max(0, startMin * PX_PER_MIN),
          height: Math.max(28, durationMin * PX_PER_MIN - 2),
        };
      });
  }

  statusTone(status: Appointment['status']): string {
    return APPOINTMENT_STATUS_TONE[status];
  }

  onAppointmentClick(appointment: Appointment): void {
    if (this.justDragged) {
      this.justDragged = false;
      return;
    }
    this.select.emit(appointment);
  }

  /**
   * Arrastrar-y-soltar para reprogramar (sección "drag and drop en
   * Agenda"): al soltar, se calcula la nueva hora a partir de la posición Y
   * dentro de la columna donde cayó (redondeada a bloques de 5 minutos), y
   * el profesional según en qué columna se soltó — puede ser la misma
   * (solo cambia la hora) u otra (cambia también el profesional).
   *
   * `event.source.reset()` es la API pública de CdkDrag para devolver el
   * elemento a su posición original tras el drag — la posición visual "de
   * verdad" la decide el `top` calculado a partir de los datos reales de
   * la cita una vez recargados, no el desplazamiento libre de CDK.
   */
  onDragEnded(event: CdkDragEnd, item: PositionedAppointment): void {
    this.justDragged = true;
    const dropPoint = event.dropPoint;
    const targetEl = document.elementFromPoint(dropPoint.x, dropPoint.y);
    const columnBody = targetEl?.closest('.day-view__col-body') as HTMLElement | null;

    event.source.reset();

    if (!columnBody) return; // soltado fuera de cualquier columna de profesional

    const targetStaffId = columnBody.dataset['staffId'];
    if (!targetStaffId) return;

    const columnRect = columnBody.getBoundingClientRect();
    const offsetY = dropPoint.y - columnRect.top;
    const rawMinutesFromStart = offsetY / this.pxPerMin;
    const snappedMinutes = Math.round(rawMinutesFromStart / SNAP_MINUTES) * SNAP_MINUTES;
    const clampedMinutes = Math.max(0, Math.min(snappedMinutes, (END_HOUR - START_HOUR) * 60));

    const totalMinutesFromMidnight = START_HOUR * 60 + clampedMinutes;
    const newStart = new Date(item.appointment.startsAt);
    newStart.setHours(Math.floor(totalMinutesFromMidnight / 60), totalMinutesFromMidnight % 60, 0, 0);

    const originalStart = new Date(item.appointment.startsAt);
    const sameStaff = targetStaffId === item.appointment.staffId;
    const sameTime = originalStart.getTime() === newStart.getTime();
    if (sameStaff && sameTime) return; // soltado prácticamente donde ya estaba: no hacer nada

    this.rescheduled.emit({
      appointment: item.appointment,
      startsAt: newStart.toISOString(),
      staffId: sameStaff ? undefined : targetStaffId,
    });
  }
}