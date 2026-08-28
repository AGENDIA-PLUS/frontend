import { Component, EventEmitter, Input, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { WorkingHourSlot } from '../../../core/services/working-hours.service';

interface DayConfig {
  weekday: number;
  label: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-onboarding-hours-step',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonComponent],
  template: `
    <div class="step">
      <h2>¿Cuándo trabajas?</h2>
      <p class="step__subtitle">Podrás afinar horarios por profesional más adelante. Empecemos con el horario general.</p>

      <div class="hours-grid">
        @for (day of days; track day.weekday) {
          <div class="hours-row" [class.hours-row--disabled]="!day.enabled">
            <label class="hours-row__toggle">
              <input type="checkbox" [(ngModel)]="day.enabled" />
              {{ day.label }}
            </label>
            @if (day.enabled) {
              <div class="hours-row__times">
                <input type="time" [(ngModel)]="day.startTime" />
                <span>—</span>
                <input type="time" [(ngModel)]="day.endTime" />
              </div>
            } @else {
              <span class="hours-row__closed">Cerrado</span>
            }
          </div>
        }
      </div>

      @if (serverError) {
        <p class="step__error">{{ serverError }}</p>
      }

      <div class="step__actions">
        <app-button variant="ghost" type="button" (clicked)="back.emit()">Atrás</app-button>
        <app-button type="button" size="lg" [loading]="loading" (clicked)="submit()">Continuar</app-button>
      </div>
    </div>
  `,
  styleUrl: '../onboarding.page.scss',
})
export class OnboardingHoursStepComponent {
  @Input() loading = false;
  @Input() serverError = '';
  @Output() next = new EventEmitter<WorkingHourSlot[]>();
  @Output() back = new EventEmitter<void>();

  readonly days: DayConfig[] = [
    { weekday: 1, label: 'Lunes', enabled: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 2, label: 'Martes', enabled: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 3, label: 'Miércoles', enabled: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 4, label: 'Jueves', enabled: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 5, label: 'Viernes', enabled: true, startTime: '09:00', endTime: '18:00' },
    { weekday: 6, label: 'Sábado', enabled: true, startTime: '10:00', endTime: '14:00' },
    { weekday: 0, label: 'Domingo', enabled: false, startTime: '09:00', endTime: '18:00' },
  ];

  submit(): void {
    const slots: WorkingHourSlot[] = this.days
      .filter((d) => d.enabled)
      .map((d) => ({ weekday: d.weekday, startTime: d.startTime, endTime: d.endTime }));
    this.next.emit(slots);
  }
}
