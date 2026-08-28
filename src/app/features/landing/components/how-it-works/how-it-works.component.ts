import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-landing-how-it-works',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="como-funciona" class="how">
      <div class="how__inner">
        <div class="how__heading">
          <span class="how__eyebrow">Cómo funciona</span>
          <h2>De cero a tu primera cita reservada en menos de 10 minutos</h2>
          <p>Crea tu agenda → comparte el enlace → recibe la cita → gestiónala. Así de simple.</p>
        </div>

        <div class="how__steps">
          @for (step of steps; track step.number) {
            <div class="how__step">
              <div class="how__step-icon">{{ step.icon }}</div>
              <span class="how__step-number">{{ step.number }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './how-it-works.component.scss',
})
export class LandingHowItWorksComponent {
  readonly steps: Step[] = [
    {
      number: '01',
      icon: '🗓️',
      title: 'Configura tu negocio',
      description: 'Añade tu horario, tus servicios (corte, manicura, tatuaje, masaje...) y tus profesionales en un par de pasos.',
    },
    {
      number: '02',
      icon: '🔗',
      title: 'Comparte tu enlace',
      description: 'Recibe una página de reservas propia para compartir por WhatsApp, Instagram o tu bio.',
    },
    {
      number: '03',
      icon: '📅',
      title: 'Recibe reservas solo',
      description: 'Tus clientes eligen servicio, profesional y hora. La cita aparece directamente en tu agenda.',
    },
    {
      number: '04',
      icon: '💬',
      title: 'Automatiza el resto',
      description: 'Agendia confirma, recuerda y gestiona cancelaciones por WhatsApp. Tú solo atiendes a tus clientes.',
    },
  ];
}
