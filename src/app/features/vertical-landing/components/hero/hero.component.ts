import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { VerticalConfig } from '../../vertical-landing.data';

@Component({
  selector: 'app-vertical-hero',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <section class="hero">
      <div class="hero__inner">
        <div class="hero__copy animate-fade-up">
          <span class="hero__eyebrow">{{ config.eyebrow }}</span>
          <h1 class="hero__title">
            {{ config.headline }} <span class="hero__title-accent">{{ config.headlineAccent }}</span>
          </h1>
          <p class="hero__subtitle">{{ config.subheadline }}</p>

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
                <span class="hero__chat-avatar">{{ initials(config.exampleStaffName) }}</span>
                <div>
                  <strong>Tu negocio</strong>
                  <small>en línea</small>
                </div>
              </div>
              <div class="hero__bubble hero__bubble--in">
                Hola 👋 Tu cita de {{ config.exampleServiceName.toLowerCase() }} ha sido reservada para el jueves a las 17:00.
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
            {{ config.exampleServiceName }} · {{ config.exampleServicePrice }} €
          </div>
        </div>
      </div>
    </section>
  `,
  styleUrl: '../../../landing/components/hero/hero.component.scss',
})
export class VerticalHeroComponent {
  @Input({ required: true }) config!: VerticalConfig;

  initials(name: string): string {
    return name.slice(0, 2).toUpperCase();
  }
}
