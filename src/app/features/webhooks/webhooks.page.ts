import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { WebhooksService, Webhook } from '../../core/services/webhooks.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { WEBHOOK_EVENT_LABELS } from '../../shared/utils/webhook-events.util';
import { WebhookFormModalComponent } from './components/webhook-form-modal/webhook-form-modal.component';
import { WebhookDeliveriesModalComponent } from './components/webhook-deliveries-modal/webhook-deliveries-modal.component';

@Component({
  selector: 'app-webhooks-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    WebhookFormModalComponent,
    WebhookDeliveriesModalComponent,
  ],
  template: `
    <div class="webhooks">
      <header class="webhooks__header">
        <div>
          <h1>Webhooks</h1>
          <p>Avisa a tus propias herramientas (Zapier, tu CRM, una hoja de cálculo...) cuando pase algo en tu negocio.</p>
        </div>
        @if (webhooks().length > 0) {
          <app-button (clicked)="openCreate()">+ Nuevo webhook</app-button>
        }
      </header>

      @if (loading()) {
        <app-card>
          <app-skeleton height="160px"></app-skeleton>
        </app-card>
      } @else if (upgradeNeeded()) {
        <app-card>
          <app-empty-state
            icon="🔒"
            title="Los webhooks no están disponibles en tu plan"
            description="Mejora a Business o superior para integrar tu negocio con Zapier, tu CRM o cualquier herramienta externa."
          >
            <app-button routerLink="/app/configuracion">Ver planes</app-button>
          </app-empty-state>
        </app-card>
      } @else if (error()) {
        <app-card>
          <app-empty-state icon="⚠️" title="No se pudieron cargar los webhooks" [description]="error()!">
            <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
          </app-empty-state>
        </app-card>
      } @else if (webhooks().length === 0) {
        <app-card>
          <app-empty-state
            icon="🔗"
            title="Todavía no tienes webhooks"
            description="Crea uno para que tu negocio avise a otra herramienta (Zapier, tu CRM...) cada vez que se cree, cancele o complete una cita."
          >
            <app-button (clicked)="openCreate()">Crear mi primer webhook</app-button>
          </app-empty-state>
        </app-card>
      } @else {
        <div class="webhooks__list">
          @for (webhook of webhooks(); track webhook.id) {
            <app-card>
              <div class="webhook-card">
                <div class="webhook-card__top">
                  <div class="webhook-card__url">
                    <strong>{{ webhook.url }}</strong>
                    <app-badge [tone]="webhook.isActive ? 'success' : 'neutral'">
                      {{ webhook.isActive ? 'Activo' : 'Inactivo' }}
                    </app-badge>
                  </div>
                </div>

                <div class="webhook-card__events">
                  @for (event of webhook.events; track event) {
                    <span class="webhook-card__chip">{{ eventLabel(event) }}</span>
                  }
                </div>

                <div class="webhook-card__actions">
                  <app-button variant="secondary" size="sm" (clicked)="openEdit(webhook)">Editar</app-button>
                  <app-button variant="ghost" size="sm" (clicked)="openDeliveries(webhook)">Ver entregas</app-button>
                  <app-button
                    variant="ghost"
                    size="sm"
                    [loading]="regeneratingId() === webhook.id"
                    (clicked)="regenerateSecret(webhook)"
                  >
                    Regenerar secreto
                  </app-button>
                  <app-button
                    variant="ghost"
                    size="sm"
                    [loading]="togglingId() === webhook.id"
                    (clicked)="toggleActive(webhook)"
                  >
                    {{ webhook.isActive ? 'Desactivar' : 'Activar' }}
                  </app-button>
                  <app-button variant="danger" size="sm" [loading]="deletingId() === webhook.id" (clicked)="remove(webhook)">
                    Eliminar
                  </app-button>
                </div>

                @if (regeneratedSecretFor() === webhook.id) {
                  <div class="webhook-card__new-secret">
                    <p>Nuevo secreto (guárdalo ahora, no volverá a mostrarse):</p>
                    <code>{{ newSecretValue() }}</code>
                  </div>
                }
              </div>
            </app-card>
          }
        </div>
      }
    </div>

    @if (modalOpen()) {
      <app-webhook-form-modal
        [businessId]="business()!.id"
        [webhook]="editingWebhook()"
        (closed)="modalOpen.set(false)"
        (saved)="load()"
      ></app-webhook-form-modal>
    }

    @if (deliveriesFor()) {
      <app-webhook-deliveries-modal
        [businessId]="business()!.id"
        [webhookId]="deliveriesFor()!"
        (closed)="deliveriesFor.set(null)"
      ></app-webhook-deliveries-modal>
    }
  `,
  styleUrl: './webhooks.page.scss',
})
export class WebhooksPageComponent {
  private readonly auth = inject(AuthService);
  private readonly webhooksService = inject(WebhooksService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly upgradeNeeded = signal(false);
  readonly webhooks = signal<Webhook[]>([]);

  readonly modalOpen = signal(false);
  readonly editingWebhook = signal<Webhook | null>(null);
  readonly deliveriesFor = signal<string | null>(null);

  readonly togglingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);
  readonly regeneratingId = signal<string | null>(null);
  readonly regeneratedSecretFor = signal<string | null>(null);
  readonly newSecretValue = signal('');

  constructor() {
    if (this.business()) this.load();
  }

  load(): void {
    const business = this.business();
    if (!business) return;

    this.loading.set(true);
    this.error.set('');
    this.upgradeNeeded.set(false);

    this.webhooksService.findAll(business.id).subscribe({
      next: (list) => {
        this.webhooks.set(list);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        if (err.status === 403) {
          this.upgradeNeeded.set(true);
        } else {
          this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
        }
      },
    });
  }

  openCreate(): void {
    this.editingWebhook.set(null);
    this.modalOpen.set(true);
  }

  openEdit(webhook: Webhook): void {
    this.editingWebhook.set(webhook);
    this.modalOpen.set(true);
  }

  openDeliveries(webhook: Webhook): void {
    this.deliveriesFor.set(webhook.id);
  }

  toggleActive(webhook: Webhook): void {
    const business = this.business();
    if (!business) return;
    this.togglingId.set(webhook.id);
    this.webhooksService.update(business.id, webhook.id, { isActive: !webhook.isActive }).subscribe({
      next: () => {
        this.togglingId.set(null);
        this.load();
      },
      error: () => this.togglingId.set(null),
    });
  }

  regenerateSecret(webhook: Webhook): void {
    const business = this.business();
    if (!business) return;
    if (
      !confirm(
        'Esto invalida el secreto anterior. Cualquier integración que verifique la firma antigua dejará de funcionar hasta que la actualices. ¿Continuar?',
      )
    )
      return;

    this.regeneratingId.set(webhook.id);
    this.webhooksService.regenerateSecret(business.id, webhook.id).subscribe({
      next: (res) => {
        this.regeneratingId.set(null);
        this.regeneratedSecretFor.set(webhook.id);
        this.newSecretValue.set(res.secret);
      },
      error: () => this.regeneratingId.set(null),
    });
  }

  remove(webhook: Webhook): void {
    const business = this.business();
    if (!business) return;
    if (!confirm(`¿Eliminar el webhook a "${webhook.url}"? Esta acción no se puede deshacer.`)) return;

    this.deletingId.set(webhook.id);
    this.webhooksService.remove(business.id, webhook.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => this.deletingId.set(null),
    });
  }

  eventLabel(event: string): string {
    return WEBHOOK_EVENT_LABELS[event] ?? event;
  }
}
