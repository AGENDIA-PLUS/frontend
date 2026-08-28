import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="auth">
      <div class="auth__panel">
        <a routerLink="/" class="auth__brand">
          <span class="auth__brand-mark">A</span>
          Agendia
        </a>

        <div class="auth__panel-content">
          <h2>{{ headline }}</h2>
          <p>{{ subheadline }}</p>

          <ul class="auth__points">
            <li>Publica tu página de reservas en minutos</li>
            <li>Confirmaciones y recordatorios automáticos por WhatsApp</li>
            <li>Sin permanencia, cancela cuando quieras</li>
          </ul>
        </div>
      </div>

      <div class="auth__form-side">
        <a routerLink="/" class="auth__brand auth__brand--mobile">
          <span class="auth__brand-mark">A</span>
          Agendia
        </a>
        <div class="auth__form-wrapper">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './auth-layout.component.scss',
})
export class AuthLayoutComponent {
  @Input() headline = 'Tu agenda, lista en minutos.';
  @Input() subheadline = 'Únete a los negocios que ya gestionan sus citas sin esfuerzo.';
}
