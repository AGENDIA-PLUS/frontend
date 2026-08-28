import { Component } from '@angular/core';
import { LandingNavbarComponent } from './components/navbar/navbar.component';
import { LandingHeroComponent } from './components/hero/hero.component';
import { LandingHowItWorksComponent } from './components/how-it-works/how-it-works.component';
import { LandingProductPreviewComponent } from './components/product-preview/product-preview.component';
import { LandingWhatsappSectionComponent } from './components/whatsapp-section/whatsapp-section.component';
import { LandingFeaturesComponent } from './components/features/features.component';
import { LandingTestimonialsComponent } from './components/testimonials/testimonials.component';
import { LandingPricingComponent } from './components/pricing/pricing.component';
import { LandingFaqComponent } from './components/faq/faq.component';
import { LandingFinalCtaComponent } from './components/final-cta/final-cta.component';
import { LandingFooterComponent } from './components/footer/footer.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    LandingNavbarComponent,
    LandingHeroComponent,
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
    <app-landing-navbar></app-landing-navbar>
    <main>
      <app-landing-hero></app-landing-hero>
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
  `,
})
export class LandingPageComponent {}
