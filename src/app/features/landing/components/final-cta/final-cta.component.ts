import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-landing-final-cta',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <section class="final-cta">
      <div class="final-cta__inner">
        <h2>Tu agenda está a un clic de dejar de gestionarse por WhatsApp manual</h2>
        <p>Crea tu cuenta gratis y publica tu página de reservas hoy mismo.</p>
        <app-button size="lg" routerLink="/register">Crear mi agenda gratis</app-button>
      </div>
    </section>
  `,
  styleUrl: './final-cta.component.scss',
})
export class LandingFinalCtaComponent {}
