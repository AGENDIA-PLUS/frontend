import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { NotificationsService } from '../../core/services/notifications.service';
import { Message } from '../../core/models';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { MESSAGE_CHANNEL_LABEL, MESSAGE_STATUS_LABEL, MESSAGE_STATUS_TONE } from '../../shared/ui/workflow.util';
import { BadgeTone } from '../../shared/ui/badge/badge.component';

@Component({
  selector: 'app-notifications-page',
  standalone: true,
  imports: [CommonModule, DatePipe, CardComponent, BadgeComponent, ButtonComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="notifications">
      <header class="notifications__header">
        <h1>Notificaciones</h1>
        <p>Registro de los mensajes de WhatsApp y Email enviados a tus clientes.</p>
      </header>

      @if (loading()) {
        <app-card [padded]="false">
          <div class="notifications__skeleton">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="notifications__skeleton-row">
                <app-skeleton width="50%" height="14px"></app-skeleton>
                <app-skeleton width="15%" height="14px"></app-skeleton>
              </div>
            }
          </div>
        </app-card>
      } @else if (error()) {
        <app-card>
          <app-empty-state icon="⚠️" title="No se pudo cargar el registro" [description]="error()!">
            <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
          </app-empty-state>
        </app-card>
      } @else if (messages().length === 0) {
        <app-card>
          <app-empty-state
            icon="💬"
            title="Todavía no se ha enviado ningún mensaje"
            description="Cuando se cree, cancele o reprograme una cita, aquí aparecerá el registro de las notificaciones enviadas."
          />
        </app-card>
      } @else {
        <app-card [padded]="false">
          <ul class="notifications__list">
            @for (message of messages(); track message.id) {
              <li class="notifications__item">
                <div class="notifications__icon">{{ message.channel === 'WHATSAPP' ? '💬' : '✉️' }}</div>
                <div class="notifications__info">
                  <div class="notifications__top-row">
                    <strong>{{ channelLabel(message.channel) }} · {{ message.template }}</strong>
                    <span class="notifications__date">{{ message.createdAt | date: 'd MMM, HH:mm' }}</span>
                  </div>
                  @if (message.payload?.text) {
                    <p class="notifications__text">{{ message.payload?.text }}</p>
                  }
                  @if (message.error) {
                    <p class="notifications__error">⚠️ {{ message.error }}</p>
                  }
                  @if (message.payload?.simulated) {
                    <span class="notifications__simulated">Simulado (sin proveedor real configurado)</span>
                  }
                </div>
                <app-badge [tone]="statusTone(message.status)">{{ statusLabel(message.status) }}</app-badge>
              </li>
            }
          </ul>
        </app-card>
      }
    </div>
  `,
  styleUrl: './notifications.page.scss',
})
export class NotificationsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly notificationsService = inject(NotificationsService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly messages = signal<Message[]>([]);

  constructor() {
    if (this.business()) this.load();
  }

  load(): void {
    const business = this.business();
    if (!business) return;
    this.loading.set(true);
    this.error.set('');
    this.notificationsService.findAll(business.id).subscribe({
      next: (list) => {
        this.messages.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
      },
    });
  }

  channelLabel(channel: Message['channel']): string {
    return MESSAGE_CHANNEL_LABEL[channel];
  }
  statusLabel(status: Message['status']): string {
    return MESSAGE_STATUS_LABEL[status];
  }
  statusTone(status: Message['status']): BadgeTone {
    return MESSAGE_STATUS_TONE[status];
  }
}
