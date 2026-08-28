import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-product-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="preview">
      <div class="preview__inner">
        <!-- Vista previa: Agenda -->
        <div class="preview__row">
          <div class="preview__copy">
            <span class="preview__eyebrow">Tu agenda</span>
            <h2>Una agenda clara, sin curvas de aprendizaje</h2>
            <p>
              Ve tu día de un vistazo: quién viene, a qué hora y con qué profesional. Crea, mueve o cancela
              citas en segundos, sin manuales ni configuraciones complicadas.
            </p>
            <ul class="preview__list">
              <li>Vista diaria y semanal por profesional</li>
              <li>Arrastra y suelta para reprogramar</li>
              <li>Bloquea horarios para descansos o vacaciones</li>
            </ul>
          </div>
          <div class="preview__visual">
            <div class="mock-agenda">
              <div class="mock-agenda__header">
                <strong>Hoy · Jueves 20</strong>
                <span>Ana · Carlos</span>
              </div>
              @for (slot of agendaSlots; track slot.time) {
                <div class="mock-agenda__row">
                  <span class="mock-agenda__time">{{ slot.time }}</span>
                  @if (slot.appointment) {
                    <div class="mock-agenda__card" [style.background]="slot.color">
                      <strong>{{ slot.appointment }}</strong>
                      <small>{{ slot.client }}</small>
                    </div>
                  } @else {
                    <div class="mock-agenda__empty"></div>
                  }
                </div>
              }
            </div>
          </div>
        </div>

        <!-- Vista previa: Página de reservas -->
        <div class="preview__row preview__row--reverse">
          <div class="preview__copy">
            <span class="preview__eyebrow">Página de reservas</span>
            <h2>Tu cliente reserva solo, desde el móvil, en menos de un minuto</h2>
            <p>
              Sin cuentas, sin apps que instalar. Elige servicio, profesional, día y hora, deja sus datos
              y listo — la cita ya está en tu agenda.
            </p>
            <ul class="preview__list">
              <li>Optimizada para móvil de principio a fin</li>
              <li>Disponibilidad siempre real y actualizada</li>
              <li>Confirmación instantánea por WhatsApp</li>
            </ul>
          </div>
          <div class="preview__visual">
            <div class="mock-booking">
              <div class="mock-booking__step">
                <span class="mock-booking__label">1. Servicio</span>
                <div class="mock-booking__option mock-booking__option--selected">
                  Sesión completa <b>35 €</b>
                </div>
              </div>
              <div class="mock-booking__step">
                <span class="mock-booking__label">2. Profesional</span>
                <div class="mock-booking__chips">
                  <span class="mock-booking__chip mock-booking__chip--selected">Ana</span>
                  <span class="mock-booking__chip">Carlos</span>
                </div>
              </div>
              <div class="mock-booking__step">
                <span class="mock-booking__label">3. Hora — jueves 20</span>
                <div class="mock-booking__chips">
                  <span class="mock-booking__chip">16:00</span>
                  <span class="mock-booking__chip mock-booking__chip--selected">17:00</span>
                  <span class="mock-booking__chip">17:30</span>
                </div>
              </div>
              <div class="mock-booking__cta">Confirmar reserva</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './product-preview.component.scss',
})
export class LandingProductPreviewComponent {
  readonly agendaSlots = [
    { time: '09:00', appointment: null, client: '', color: '' },
    { time: '10:00', appointment: 'Servicio', client: 'Juan', color: 'var(--color-primary-100)' },
    { time: '11:00', appointment: null, client: '', color: '' },
    { time: '12:00', appointment: 'Servicio', client: 'Laura', color: 'var(--color-accent-400)' },
    { time: '13:00', appointment: null, client: '', color: '' },
  ];
}
