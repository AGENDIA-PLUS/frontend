import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-onboarding-publish-step',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <div class="step step--center">
      @if (!published) {
        <div class="publish-icon">🚀</div>
        <h2>Todo listo para publicar</h2>
        <p class="step__subtitle">
          Hemos configurado tu negocio, horario, primer servicio y profesional. El último paso es
          publicar tu página de reservas para que tus clientes puedan verla.
        </p>

        @if (serverError) {
          <p class="step__error">{{ serverError }}</p>
        }

        <div class="step__actions step__actions--center">
          <app-button variant="ghost" type="button" (clicked)="back.emit()">Atrás</app-button>
          <app-button type="button" size="lg" [loading]="loading" (clicked)="publish.emit()">
            Publicar mi agenda
          </app-button>
        </div>
      } @else {
        <div class="publish-icon publish-icon--success">✅</div>
        <h2>Tu agenda está lista</h2>
        <p class="step__subtitle">Comparte este enlace con tus clientes para que empiecen a reservar.</p>

        <div class="publish-link">
          <code>{{ publicUrl }}</code>
          <app-button size="sm" variant="secondary" type="button" (clicked)="copyLink()">
            {{ copied ? '¡Copiado!' : 'Copiar' }}
          </app-button>
        </div>

        <p class="publish-note">
          Comparte este enlace en tu WhatsApp, Instagram o donde prefieras — tus clientes podrán
          reservar directamente desde ahí, sin necesidad de crear una cuenta.
        </p>

        <app-button size="lg" [full]="true" routerLink="/app/dashboard">Ir a mi dashboard</app-button>
      }
    </div>
  `,
  styleUrl: '../onboarding.page.scss',
})
export class OnboardingPublishStepComponent {
  @Input() loading = false;
  @Input() serverError = '';
  @Input() published = false;
  @Input() publicUrl = '';
  @Output() publish = new EventEmitter<void>();
  @Output() back = new EventEmitter<void>();

  copied = false;

  copyLink(): void {
    navigator.clipboard?.writeText(this.publicUrl).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 2000);
    });
  }
}
