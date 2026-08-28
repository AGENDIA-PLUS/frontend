import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { VERTICAL_CONFIGS, VerticalConfig } from './vertical-landing.data';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { LandingNavbarComponent } from '../landing/components/navbar/navbar.component';
import { VerticalHeroComponent } from './components/hero/hero.component';
import { VerticalPainPointComponent } from './components/pain-point.component';
import { LandingHowItWorksComponent } from '../landing/components/how-it-works/how-it-works.component';
import { LandingProductPreviewComponent } from '../landing/components/product-preview/product-preview.component';
import { LandingWhatsappSectionComponent } from '../landing/components/whatsapp-section/whatsapp-section.component';
import { LandingFeaturesComponent } from '../landing/components/features/features.component';
import { LandingTestimonialsComponent } from '../landing/components/testimonials/testimonials.component';
import { LandingPricingComponent } from '../landing/components/pricing/pricing.component';
import { LandingFaqComponent } from '../landing/components/faq/faq.component';
import { LandingFinalCtaComponent } from '../landing/components/final-cta/final-cta.component';
import { LandingFooterComponent } from '../landing/components/footer/footer.component';

@Component({
  selector: 'app-vertical-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    EmptyStateComponent,
    ButtonComponent,
    LandingNavbarComponent,
    VerticalHeroComponent,
    VerticalPainPointComponent,
    LandingHowItWorksComponent,
    LandingProductPreviewComponent,
    LandingWhatsappSectionComponent,
    LandingFeaturesComponent,
    LandingTestimonialsComponent,
    LandingPricingComponent,
    LandingFaqComponent,
    LandingFinalCtaComponent,
    LandingFooterComponent,
  ],
  template: `
    @if (config) {
      <app-landing-navbar></app-landing-navbar>
      <main>
        <app-vertical-hero [config]="config"></app-vertical-hero>
        <app-vertical-pain-point [config]="config"></app-vertical-pain-point>
        <app-landing-how-it-works></app-landing-how-it-works>
        <app-landing-product-preview></app-landing-product-preview>
        <app-landing-whatsapp-section></app-landing-whatsapp-section>
        <app-landing-features></app-landing-features>
        <app-landing-testimonials></app-landing-testimonials>
        <app-landing-pricing></app-landing-pricing>
        <app-landing-faq></app-landing-faq>
        <app-landing-final-cta></app-landing-final-cta>
      </main>
      <app-landing-footer></app-landing-footer>
    } @else {
      <div class="vertical-landing__not-found">
        <app-empty-state icon="🔍" title="Página no encontrada" description="Todavía no existe una página para este tipo de negocio.">
          <app-button routerLink="/">Ir a la página principal</app-button>
        </app-empty-state>
      </div>
    }
  `,
  styles: [
    `
      .vertical-landing__not-found {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    `,
  ],
})
export class VerticalLandingPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  config: VerticalConfig | null = null;

  ngOnInit(): void {
    const slug = this.route.snapshot.data['vertical'] as string;
    this.config = VERTICAL_CONFIGS[slug] ?? null;

    if (this.config) {
      this.title.setTitle(this.config.metaTitle);
      this.meta.updateTag({ name: 'description', content: this.config.metaDescription });
    }
  }
}
