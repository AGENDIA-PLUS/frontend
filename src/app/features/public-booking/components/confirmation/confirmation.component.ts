import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-public-confirmation',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="step step--center">
      <div class="confirmation-icon">✅</div>
      <h2>¡Cita reservada!</h2>
      <p class="step__subtitle">
        Te esperamos el {{ startsAt | date: "EEEE d 'de' MMMM 'a las' HH:mm" : undefined : 'es' }} para
        {{ serviceName }} con {{ staffName }}.
      </p>
      <p class="confirmation-note">Recibirás la confirmación por WhatsApp en breve.</p>
    </div>
  `,
  styleUrl: '../../public-booking.page.scss',
})
export class PublicConfirmationComponent {
  @Input({ required: true }) startsAt!: string;
  @Input({ required: true }) serviceName!: string;
  @Input({ required: true }) staffName!: string;
}
