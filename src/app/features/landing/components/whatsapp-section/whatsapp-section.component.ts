import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-whatsapp-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="wa">
      <div class="wa__inner">
        <div class="wa__heading">
          <span class="wa__eyebrow">Automatizaciones</span>
          <h2>WhatsApp es tu recepcionista, funcionando las 24 horas</h2>
          <p>
            Cada cita dispara automáticamente el mensaje adecuado: confirmación al reservar, recordatorio
            24h antes, y gestión de cancelaciones o cambios — sin que tú tengas que escribir nada.
          </p>
        </div>

        <div class="wa__flow">
          <div class="wa__flow-card">
            <span class="wa__flow-tag">Evento</span>
            <strong>Nueva cita reservada</strong>
          </div>
          <div class="wa__flow-arrow">→</div>
          <div class="wa__flow-card">
            <span class="wa__flow-tag">Espera</span>
            <strong>24 horas antes</strong>
          </div>
          <div class="wa__flow-arrow">→</div>
          <div class="wa__flow-card wa__flow-card--whatsapp">
            <span class="wa__flow-tag">Acción</span>
            <strong>Enviar recordatorio por WhatsApp</strong>
          </div>
        </div>

        <div class="wa__grid">
          <div class="wa__item">
            <span class="wa__item-icon">✅</span>
            <h3>Confirmación instantánea</h3>
            <p>En cuanto un cliente reserva, recibe la confirmación con día, hora y servicio.</p>
          </div>
          <div class="wa__item">
            <span class="wa__item-icon">⏰</span>
            <h3>Recordatorios automáticos</h3>
            <p>24h antes de cada cita, para reducir los olvidos y los huecos vacíos en tu agenda.</p>
          </div>
          <div class="wa__item">
            <span class="wa__item-icon">🔄</span>
            <h3>Cancelar o cambiar, solo</h3>
            <p>El cliente puede cancelar o pedir otra hora desde el propio WhatsApp, sin llamarte.</p>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './whatsapp-section.component.scss',
})
export class LandingWhatsappSectionComponent {}
