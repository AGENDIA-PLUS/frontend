import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { BillingService, BillingSummary } from '../../../../core/services/billing.service';

interface PlanDisplay {
  plan: 'FREE' | 'PRO' | 'BUSINESS' | 'MULTI_LOCATION';
  name: string;
  priceLabel: string;
  whatsappIncluded: string;
  overagePrice: string;
  features: string[];
}

const PLAN_DISPLAY: PlanDisplay[] = [
  {
    plan: 'FREE',
    name: 'Free',
    priceLabel: '0 €/mes',
    whatsappIncluded: 'Sin WhatsApp (usa Email)',
    overagePrice: '—',
    features: ['1 profesional', 'Hasta 30 citas/mes', 'Agenda y página de reservas'],
  },
  {
    plan: 'PRO',
    name: 'Pro',
    priceLabel: '9,99 €/mes',
    whatsappIncluded: '150 mensajes WhatsApp/mes incluidos',
    overagePrice: '+0,03 €/mensaje adicional',
    features: ['Citas ilimitadas', 'Varios servicios', 'Workflows básicos'],
  },
  {
    plan: 'BUSINESS',
    name: 'Business',
    priceLabel: '19,99 €/mes',
    whatsappIncluded: '500 mensajes WhatsApp/mes incluidos',
    overagePrice: '+0,025 €/mensaje adicional',
    features: ['Múltiples profesionales', 'Workflows avanzados', 'Webhooks y API'],
  },
  {
    plan: 'MULTI_LOCATION',
    name: 'Multi-location',
    priceLabel: '39,99 €/mes+',
    whatsappIncluded: '1.500 mensajes WhatsApp/mes incluidos',
    overagePrice: '+0,02 €/mensaje adicional',
    features: ['Varias sucursales', 'Varios equipos', 'Permisos avanzados'],
  },
];

@Component({
  selector: 'app-billing-section',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, ButtonComponent, SkeletonComponent],
  template: `
    <app-card>
      <h2 class="billing__title">Plan y facturación</h2>

      @if (syncing()) {
        <p class="billing__syncing">✅ Pago recibido — confirmando tu nuevo plan...</p>
        <app-skeleton height="140px"></app-skeleton>
      } @else if (loading()) {
        <app-skeleton height="140px"></app-skeleton>
      } @else if (error()) {
        <p class="billing__error">{{ error() }}</p>
        <app-button variant="secondary" size="sm" (clicked)="load()">Reintentar</app-button>
      } @else {
        @if (summary(); as s) {
          <div class="billing__current">
            <div>
              <span class="billing__current-label">Plan actual</span>
              <div class="billing__current-plan">
                <strong>{{ planName(s.plan) }}</strong>
                <app-badge [tone]="s.status === 'ACTIVE' ? 'success' : 'warning'">{{ s.status }}</app-badge>
              </div>
            </div>
            @if (s.plan !== 'FREE') {
              <app-button variant="secondary" size="sm" [loading]="openingPortal()" (clicked)="openPortal()">
                Gestionar suscripción
              </app-button>
            }
          </div>

          @if (s.whatsapp.included > 0) {
            <div class="billing__usage">
              <div class="billing__usage-header">
                <span>Uso de WhatsApp este periodo</span>
                <span>{{ s.whatsapp.used }} / {{ s.whatsapp.included }}</span>
              </div>
              <div class="billing__usage-bar">
                <div class="billing__usage-fill" [style.width.%]="usagePercent(s)"></div>
              </div>
              @if (s.whatsapp.used > s.whatsapp.included) {
                <p class="billing__overage-note">
                  Has superado tu asignación incluida: el exceso se factura a
                  {{ s.whatsapp.overagePriceEur | number: '1.2-3' }} €/mensaje.
                </p>
              }
            </div>
          }

          @if (checkoutError()) {
            <p class="billing__error">{{ checkoutError() }}</p>
          }

          <div class="billing__plans">
            @for (plan of plans; track plan.plan) {
              <div class="plan-card" [class.plan-card--active]="plan.plan === s.plan">
                @if (plan.plan === s.plan) {
                  <span class="plan-card__badge">Tu plan actual</span>
                }
                <h3>{{ plan.name }}</h3>
                <p class="plan-card__price">{{ plan.priceLabel }}</p>
                @if (plan.plan !== 'FREE') {
                  <p class="plan-card__tax-note">+ IVA según tu país (se calcula al pagar)</p>
                }
                <p class="plan-card__whatsapp">📱 {{ plan.whatsappIncluded }}</p>
                @if (plan.overagePrice !== '—') {
                  <p class="plan-card__overage">{{ plan.overagePrice }}</p>
                }
                <ul class="plan-card__features">
                  @for (feature of plan.features; track feature) {
                    <li>{{ feature }}</li>
                  }
                </ul>
                @if (plan.plan !== 'FREE' && plan.plan !== s.plan) {
                  <app-button
                    size="sm"
                    [full]="true"
                    [loading]="checkingOutPlan() === plan.plan"
                    (clicked)="upgrade(plan.plan)"
                  >
                    Cambiar a {{ plan.name }}
                  </app-button>
                }
              </div>
            }
          </div>
        }

        <p class="billing__disclaimer">
          El coste de WhatsApp depende de las tarifas de Meta, que cambian periódicamente
          (ver estudio de mercado interno) — estos precios son orientativos, no definitivos.
          Los precios no incluyen IVA — se calcula automáticamente según tu país en el
          momento de pagar.
        </p>
      }
    </app-card>
  `,
  styleUrl: './billing-section.component.scss',
})
export class BillingSectionComponent implements OnInit {
  @Input({ required: true }) businessId!: string;

  private readonly billingService = inject(BillingService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly syncing = signal(false);
  readonly error = signal('');
  readonly summary = signal<BillingSummary | null>(null);
  readonly checkingOutPlan = signal<string | null>(null);
  readonly checkoutError = signal('');
  readonly openingPortal = signal(false);

  readonly plans = PLAN_DISPLAY;

  ngOnInit(): void {
    const params = this.route.snapshot.queryParamMap;
    const sessionId = params.get('session_id');

    if (params.get('billing') === 'success' && sessionId) {
      this.syncAfterCheckout(sessionId);
    } else {
      this.load();
    }
  }

  /**
   * Al volver de Stripe Checkout, sincroniza activamente el plan en vez de
   * esperar pasivamente al webhook — que en local no llega si no se tiene
   * `stripe listen` corriendo, dejando la pantalla mostrando el plan
   * antiguo pese a que el pago sí se completó.
   */
  private syncAfterCheckout(sessionId: string): void {
    this.syncing.set(true);
    this.billingService.syncSession(this.businessId, sessionId).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.syncing.set(false);
        // Limpia los query params para que un refresco de página no
        // reintente la sincronización con una sesión ya consumida.
        this.router.navigate([], { queryParams: {}, replaceUrl: true });
      },
      error: () => {
        this.syncing.set(false);
        // Si la sincronización activa falla (p.ej. la sesión ya expiró),
        // no es un error fatal: el webhook normal la actualizará en cuanto
        // llegue. Se recarga el resumen normal como último recurso.
        this.load();
      },
    });
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.billingService.getSummary(this.businessId).subscribe({
      next: (summary) => {
        this.summary.set(summary);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo cargar la información de facturación.');
      },
    });
  }

  planName(plan: string): string {
    return this.plans.find((p) => p.plan === plan)?.name ?? plan;
  }

  usagePercent(summary: BillingSummary): number {
    if (summary.whatsapp.included === 0) return 0;
    return Math.min(100, (summary.whatsapp.used / summary.whatsapp.included) * 100);
  }

  upgrade(plan: 'PRO' | 'BUSINESS' | 'MULTI_LOCATION'): void {
    this.checkingOutPlan.set(plan);
    this.checkoutError.set('');
    this.billingService.createCheckoutSession(this.businessId, plan).subscribe({
      next: (res) => {
        this.checkingOutPlan.set(null);
        if (res.url) {
          window.location.href = res.url;
        } else {
          this.checkoutError.set('No se pudo iniciar el proceso de pago.');
        }
      },
      error: (err) => {
        this.checkingOutPlan.set(null);
        this.checkoutError.set(
          err?.error?.message ?? 'No se pudo iniciar el proceso de pago. La facturación puede no estar configurada todavía en este entorno.',
        );
      },
    });
  }

  openPortal(): void {
    this.openingPortal.set(true);
    this.billingService.createPortalSession(this.businessId).subscribe({
      next: (res) => {
        this.openingPortal.set(false);
        window.location.href = res.url;
      },
      error: () => {
        this.openingPortal.set(false);
        this.checkoutError.set('No se pudo abrir el portal de gestión de la suscripción.');
      },
    });
  }
}
