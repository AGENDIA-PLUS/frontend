import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

interface Plan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

@Component({
  selector: 'app-landing-pricing',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <section id="precios" class="pricing">
      <div class="pricing__inner">
        <div class="pricing__heading">
          <span class="pricing__eyebrow">Precios</span>
          <h2>Empieza gratis. Crece cuando lo necesites.</h2>
          <p>Sin permanencia. Cambia o cancela tu plan cuando quieras.</p>
        </div>

        <div class="pricing__grid">
          @for (plan of plans; track plan.name) {
            <div class="pricing__card" [class.pricing__card--highlighted]="plan.highlighted">
              @if (plan.highlighted) {
                <span class="pricing__badge">Más popular</span>
              }
              <h3>{{ plan.name }}</h3>
              <p class="pricing__description">{{ plan.description }}</p>
              <div class="pricing__price">
                {{ plan.price }}<span>/{{ plan.period }}</span>
              </div>
              <ul class="pricing__features">
                @for (feature of plan.features; track feature) {
                  <li>{{ feature }}</li>
                }
              </ul>
              <app-button [variant]="plan.highlighted ? 'primary' : 'secondary'" [full]="true" routerLink="/register">
                Empezar
              </app-button>
            </div>
          }
        </div>

        <p class="pricing__note">
          Precios orientativos mientras validamos el producto con los primeros negocios — pueden variar.
        </p>
      </div>
    </section>
  `,
  styleUrl: './pricing.component.scss',
})
export class LandingPricingComponent {
  readonly plans: Plan[] = [
    {
      name: 'Free',
      price: '0€',
      period: 'mes',
      description: 'Para empezar y probar la plataforma sin compromiso.',
      features: ['1 profesional', 'Agenda y página de reservas', 'Gestión de clientes', 'Límite de citas mensuales'],
    },
    {
      name: 'Pro',
      price: '9,99€',
      period: 'mes',
      description: 'Para negocios que ya reciben citas de forma recurrente.',
      features: ['Citas ilimitadas', 'Varios servicios', 'WhatsApp y recordatorios', 'Workflows básicos'],
      highlighted: true,
    },
    {
      name: 'Business',
      price: '19,99€',
      period: 'mes',
      description: 'Para equipos con varios profesionales y más automatización.',
      features: ['Múltiples profesionales', 'Workflows avanzados', 'Webhooks y API', 'Estadísticas'],
    },
    {
      name: 'Multi-location',
      price: '39,99€',
      period: 'mes',
      description: 'Para cadenas con varias sucursales.',
      features: ['Varias sucursales', 'Varios equipos', 'Permisos avanzados', 'Soporte prioritario'],
    },
  ];
}
