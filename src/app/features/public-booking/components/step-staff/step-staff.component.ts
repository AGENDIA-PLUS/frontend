import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { PublicStaff } from '../../../../core/services/public-booking.service';

@Component({
  selector: 'app-public-step-staff',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  template: `
    <div class="step">
      <h2>¿Con quién prefieres tu cita?</h2>
      <div class="staff-grid">
        @for (member of staff; track member.id) {
          <button type="button" class="staff-option" (click)="select.emit(member)">
            <div class="staff-option__avatar">{{ initials(member.fullName) }}</div>
            <strong>{{ member.fullName }}</strong>
          </button>
        } @empty {
          <p class="step__empty">No hay profesionales disponibles para este servicio.</p>
        }
      </div>
      <app-button variant="ghost" type="button" (clicked)="back.emit()">← Cambiar servicio</app-button>
    </div>
  `,
  styleUrl: '../../public-booking.page.scss',
})
export class PublicStepStaffComponent {
  @Input() staff: PublicStaff[] = [];
  @Output() select = new EventEmitter<PublicStaff>();
  @Output() back = new EventEmitter<void>();

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}
