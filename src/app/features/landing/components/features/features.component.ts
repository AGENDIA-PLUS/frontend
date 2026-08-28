import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Feature {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-landing-features',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="funcionalidades" class="features">
      <div class="features__inner">
        <div class="features__heading">
          <span class="features__eyebrow">Funcionalidades</span>
          <h2>Todo lo que necesitas para gestionar tu negocio, nada de lo que no</h2>
        </div>

        <div class="features__grid">
          @for (feature of features; track feature.title) {
            <div class="features__card">
              <span class="features__icon">{{ feature.icon }}</span>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './features.component.scss',
})
export class LandingFeaturesComponent {
  readonly features: Feature[] = [
    { icon: '📅', title: 'Agenda diaria y semanal', description: 'Visualiza y gestiona todas tus citas en una interfaz clara, sin curva de aprendizaje.' },
    { icon: '🌐', title: 'Página de reservas propia', description: 'Un enlace único para compartir en redes o WhatsApp donde tus clientes reservan solos.' },
    { icon: '💬', title: 'Confirmaciones y recordatorios', description: 'Mensajes automáticos por WhatsApp para reducir cancelaciones y no-shows.' },
    { icon: '✂️', title: 'Servicios y precios', description: 'Define tus servicios, duración y precio, y decide qué profesional puede realizar cada uno.' },
    { icon: '👥', title: 'Gestión de clientes', description: 'Historial de citas, última visita, servicio favorito y profesional habitual de cada cliente.' },
    { icon: '⚙️', title: 'Workflows automáticos', description: 'Crea automatizaciones tipo "si pasa X, espera Y, envía Z" sin escribir código.' },
  ];
}
