import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { WebhooksService, WebhookDelivery } from '../../../../core/services/webhooks.service';
import { WEBHOOK_EVENT_LABELS } from '../../../../shared/utils/webhook-events.util';

const STATUS_TONE: Record<string, 'success' | 'danger' | 'neutral'> = {
  SUCCESS: 'success',
  FAILED: 'danger',
  PENDING: 'neutral',
};

@Component({
  selector: 'app-webhook-deliveries-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, ModalComponent, BadgeComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <app-modal title="Historial de entregas" [wide]="true" (close)="closed.emit()">
      @if (loading()) {
        <app-skeleton height="200px"></app-skeleton>
      } @else if (deliveries().length === 0) {
        <app-empty-state icon="📭" title="Todavía no hay entregas" description="Se registrarán aquí en cuanto ocurra alguno de los eventos suscritos." />
      } @else {
        <ul class="deliveries">
          @for (delivery of deliveries(); track delivery.id) {
            <li class="deliveries__row">
              <div class="deliveries__info">
                <strong>{{ eventLabel(delivery.event) }}</strong>
                <small>{{ delivery.createdAt | date: 'd MMM, HH:mm' }} · {{ delivery.attempts }} intento(s)</small>
              </div>
              <div class="deliveries__status">
                @if (delivery.responseCode) {
                  <span class="deliveries__code">HTTP {{ delivery.responseCode }}</span>
                }
                <app-badge [tone]="statusTone(delivery.status)">{{ statusLabel(delivery.status) }}</app-badge>
              </div>
            </li>
          }
        </ul>
      }
    </app-modal>
  `,
  styleUrl: './webhook-deliveries-modal.component.scss',
})
export class WebhookDeliveriesModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input({ required: true }) webhookId!: string;
  @Output() closed = new EventEmitter<void>();

  private readonly webhooksService = inject(WebhooksService);

  readonly loading = signal(true);
  readonly deliveries = signal<WebhookDelivery[]>([]);

  ngOnInit(): void {
    this.webhooksService.findDeliveries(this.businessId, this.webhookId).subscribe({
      next: (list) => {
        this.deliveries.set(list);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  eventLabel(event: string): string {
    return WEBHOOK_EVENT_LABELS[event] ?? event;
  }

  statusLabel(status: string): string {
    return status === 'SUCCESS' ? 'Entregado' : status === 'FAILED' ? 'Fallido' : 'Pendiente';
  }

  statusTone(status: string): 'success' | 'danger' | 'neutral' {
    return STATUS_TONE[status] ?? 'neutral';
  }
}
