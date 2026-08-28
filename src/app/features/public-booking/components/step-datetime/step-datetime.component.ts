import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-public-step-datetime',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, ButtonComponent],
  template: `
    <div class="step">
      <h2>¿Qué día te viene bien?</h2>

      <input type="date" class="native-date" [ngModel]="date" (ngModelChange)="dateChange.emit($event)" [min]="minDate" />

      <div class="slots">
        @if (loading) {
          <p class="step__empty">Buscando huecos libres...</p>
        } @else if (slots.length === 0) {
          <p class="step__empty">No hay huecos disponibles ese día. Prueba con otra fecha.</p>
        } @else {
          <div class="chip-group">
            @for (slot of slots; track slot) {
              <button type="button" class="chip" [class.chip--selected]="selectedSlot === slot" (click)="select.emit(slot)">
                {{ slot | date: 'HH:mm' }}
              </button>
            }
          </div>
        }
      </div>

      <div class="step__nav">
        <app-button variant="ghost" type="button" (clicked)="back.emit()">← Cambiar profesional</app-button>
        <app-button type="button" [disabled]="!selectedSlot" (clicked)="continue.emit()">Continuar</app-button>
      </div>
    </div>
  `,
  styleUrl: '../../public-booking.page.scss',
})
export class PublicStepDatetimeComponent {
  @Input() date = '';
  @Input() minDate = '';
  @Input() slots: string[] = [];
  @Input() loading = false;
  @Input() selectedSlot: string | null = null;
  @Output() dateChange = new EventEmitter<string>();
  @Output() select = new EventEmitter<string>();
  @Output() continue = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();
}
