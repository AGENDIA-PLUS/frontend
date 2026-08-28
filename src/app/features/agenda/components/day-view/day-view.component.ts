import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Appointment, Staff } from '../../../../core/models';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { APPOINTMENT_STATUS_TONE } from '../../../../shared/ui/status.util';

const START_HOUR = 8;
const END_HOUR = 21;
const PX_PER_MIN = 1.1;

interface PositionedAppointment {
  appointment: Appointment;
  top: number;
  height: number;
}

@Component({
  selector: 'app-agenda-day-view',
  standalone: true,
  imports: [CommonModule, BadgeComponent],
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
          <div class="day-view__col-body" [style.height.px]="totalHeight">
            @for (hour of hours; track hour) {
              <div class="day-view__gridline" [style.top.px]="(hour - startHour) * 60 * pxPerMin"></div>
            }
            @for (item of positioned(member.id); track item.appointment.id) {
              <button
                type="button"
                class="day-view__appt"
                [class]="'day-view__appt--' + statusTone(item.appointment.status)"
                [style.top.px]="item.top"
                [style.height.px]="item.height"
                (click)="select.emit(item.appointment)"
              >
                <strong>{{ item.appointment.customer?.fullName ?? 'Cliente' }}</strong>
                <small>{{ item.appointment.service?.name }}</small>
              </button>
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

  readonly startHour = START_HOUR;
  readonly pxPerMin = PX_PER_MIN;
  readonly hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);
  readonly totalHeight = (END_HOUR - START_HOUR) * 60 * PX_PER_MIN;

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
}
