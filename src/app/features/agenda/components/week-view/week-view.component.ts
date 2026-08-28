import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Appointment } from '../../../../core/models';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { APPOINTMENT_STATUS_TONE } from '../../../../shared/ui/status.util';

@Component({
  selector: 'app-agenda-week-view',
  standalone: true,
  imports: [CommonModule, DatePipe, BadgeComponent],
  template: `
    <div class="week-view">
      @for (day of days; track day.toISOString()) {
        <div class="week-view__day" [class.week-view__day--today]="isToday(day)">
          <div class="week-view__day-header">
            <span>{{ day | date: 'EEE' : undefined : 'es' }}</span>
            <strong>{{ day | date: 'd' }}</strong>
          </div>
          <div class="week-view__list">
            @for (appt of appointmentsFor(day); track appt.id) {
              <button type="button" class="week-view__item" (click)="select.emit(appt)">
                <span class="week-view__time">{{ appt.startsAt | date: 'HH:mm' }}</span>
                <span class="week-view__dot" [class]="'week-view__dot--' + statusTone(appt.status)"></span>
                <span class="week-view__name">{{ appt.customer?.fullName ?? 'Cliente' }}</span>
              </button>
            } @empty {
              <p class="week-view__empty">—</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './week-view.component.scss',
})
export class AgendaWeekViewComponent {
  @Input() days: Date[] = [];
  @Input() appointments: Appointment[] = [];
  @Output() select = new EventEmitter<Appointment>();

  appointmentsFor(day: Date): Appointment[] {
    return this.appointments
      .filter((a) => new Date(a.startsAt).toDateString() === day.toDateString() && a.status !== 'CANCELLED' && a.status !== 'RESCHEDULED')
      .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
  }

  isToday(day: Date): boolean {
    return day.toDateString() === new Date().toDateString();
  }

  statusTone(status: Appointment['status']): string {
    return APPOINTMENT_STATUS_TONE[status];
  }
}
