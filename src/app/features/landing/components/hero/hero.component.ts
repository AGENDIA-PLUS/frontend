import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-landing-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <section class="hero">
      <div class="hero__inner">
        <div class="hero__copy animate-fade-up">
          <span class="hero__eyebrow">Para negocios que trabajan con citas</span>
          <h1 class="hero__title">
            Gestiona las citas de tu negocio <span class="hero__title-accent">automáticamente por WhatsApp</span>
          </h1>
          <p class="hero__subtitle">
            Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme,
            recuerde y gestione las citas de tus clientes por ti. Sin llamadas, sin líos, sin huecos vacíos.
          </p>

          <div class="hero__verticals" aria-label="Negocios a los que sirve Agendia">
            @for (vertical of verticals; track vertical) {
              <span class="hero__vertical-chip">{{ vertical }}</span>
            }
          </div>

          <div class="hero__actions">
            <app-button size="lg" routerLink="/register">Crear mi agenda gratis</app-button>
            <a href="#como-funciona" class="hero__secondary-cta">
              Ver cómo funciona
              <span aria-hidden="true">↓</span>
            </a>
          </div>

          <div class="hero__trust">
            <div class="hero__trust-avatars" aria-hidden="true">
              <span></span><span></span><span></span>
            </div>
            <p>Ya lo usan negocios que han dejado de perder citas por no contestar a tiempo.</p>
          </div>
        </div>

        <div class="hero__visual animate-fade-up">
          <div class="hero__phone">
            <div class="hero__phone-notch"></div>
            <div class="hero__chat">
              <div class="hero__chat-header">
                <span class="hero__chat-avatar">TN</span>
                <div>
                  <strong>Tu negocio</strong>
                  <small>en línea</small>
                </div>
              </div>
              <div class="hero__bubble hero__bubble--in">
                Hola María 👋 Tu cita ha sido reservada para el jueves a las 17:00.
              </div>
              <div class="hero__bubble hero__bubble--in hero__bubble--reminder">
                Te recordamos que mañana tienes tu cita a las 17:00. ¿Confirmas?
                <div class="hero__chat-actions">
                  <span>Confirmar</span><span>Cambiar</span>
                </div>
              </div>
              <div class="hero__bubble hero__bubble--out">Confirmar ✅</div>
            </div>
          </div>
          <div class="hero__floating-card">
            <span class="hero__floating-dot"></span>
            Cita confirmada automáticamente
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: './hero.component.scss',
})
export class LandingHeroComponent {
  readonly verticals = [
    'Barberías',
    'Peluquerías',
    'Manicuristas',
    'Lashes y pestañas',
    'Tatuadores',
    'Masajistas',
    'Entrenadores personales',
    'Peluquerías caninas',
  ];
}
