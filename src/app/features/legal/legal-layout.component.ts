import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingNavbarComponent } from '../landing/components/navbar/navbar.component';
import { LandingFooterComponent } from '../landing/components/footer/footer.component';

@Component({
  selector: 'app-legal-layout',
  standalone: true,
  imports: [CommonModule, LandingNavbarComponent, LandingFooterComponent],
  template: `
    <app-landing-navbar></app-landing-navbar>
    <main class="legal">
      <div class="legal__container">
        <div class="legal__disclaimer">
          ⚠️ <strong>Borrador orientativo, no un documento legal definitivo.</strong> Antes de
          publicar esta página en producción, debe revisarla y adaptarla un profesional del
          derecho cualificado en protección de datos (RGPD/LOPDGDD), tal como exige la
          sección 36 del proyecto.
        </div>
        <ng-content></ng-content>
      </div>
    </main>
    <app-landing-footer></app-landing-footer>
  `,
  styleUrl: './legal-layout.component.scss',
})
export class LegalLayoutComponent {}
