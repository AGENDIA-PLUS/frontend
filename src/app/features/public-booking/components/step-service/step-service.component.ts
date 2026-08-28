import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicService } from '../../../../core/services/public-booking.service';
import { formatDurationMin } from '../../../../shared/utils/duration.util';

@Component({
  selector: 'app-public-step-service',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="step">
      <h2>¿Qué servicio quieres reservar?</h2>
      <div class="service-list">
        @for (service of services; track service.id) {
          <button type="button" class="service-option" (click)="select.emit(service)">
            <div>
              <strong>{{ service.name }}</strong>
              @if (service.description) {
                <small>{{ service.description }}</small>
              }
              <span class="service-option__duration">⏱ {{ formatDuration(service.durationMin) }}</span>
              @if (service.depositEnabled) {
                <span class="service-option__deposit">💳 Requiere señal para reservar</span>
              }
            </div>
            <span class="service-option__price">{{ service.price }} €</span>
          </button>
        } @empty {
          <p class="step__empty">Este negocio todavía no tiene servicios disponibles.</p>
        }
      </div>
    </div>
  `,
  styleUrl: '../../public-booking.page.scss',
})
export class PublicStepServiceComponent {
  @Input() services: PublicService[] = [];
  @Output() select = new EventEmitter<PublicService>();

  formatDuration = formatDurationMin;
}
