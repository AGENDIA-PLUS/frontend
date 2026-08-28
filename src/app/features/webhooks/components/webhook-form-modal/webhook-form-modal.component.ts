import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { WebhooksService, Webhook } from '../../../../core/services/webhooks.service';
import { WEBHOOK_EVENT_NAMES, WEBHOOK_EVENT_LABELS } from '../../../../shared/utils/webhook-events.util';

@Component({
  selector: 'app-webhook-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, InputComponent, ButtonComponent],
  template: `
    <app-modal [title]="webhook ? 'Editar webhook' : 'Nuevo webhook'" (close)="closed.emit()">
      @if (!newSecret()) {
        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <app-input
            label="URL de destino"
            placeholder="https://tu-servidor.com/webhooks/agendia"
            formControlName="url"
            [error]="submitted() && form.controls.url.invalid ? 'Introduce una URL https:// válida.' : ''"
          ></app-input>

          <div class="form__field">
            <span class="form__label">Eventos a los que suscribirse</span>
            <div class="events-list">
              @for (event of eventNames; track event) {
                <label class="events-item">
                  <input type="checkbox" [checked]="isEventSelected(event)" (change)="toggleEvent(event)" />
                  {{ eventLabel(event) }}
                </label>
              }
            </div>
            @if (submitted() && selectedEvents().size === 0) {
              <p class="form__field-error">Selecciona al menos un evento.</p>
            }
          </div>

          @if (serverError()) {
            <p class="form__error">{{ serverError() }}</p>
          }

          <div class="form__actions">
            <app-button variant="ghost" type="button" (clicked)="closed.emit()">Cancelar</app-button>
            <app-button type="submit" [loading]="loading()">{{ webhook ? 'Guardar cambios' : 'Crear webhook' }}</app-button>
          </div>
        </form>
      } @else {
        <div class="success">
          <div class="success__icon">🔑</div>
          <h3>Webhook creado</h3>
          <p>
            Guarda este secreto ahora — <strong>no volverá a mostrarse</strong>. Úsalo para verificar la firma
            <code>X-Webhook-Signature</code> de cada entrega (HMAC-SHA256).
          </p>
          <div class="success__secret">
            <code>{{ newSecret() }}</code>
            <app-button size="sm" variant="secondary" type="button" (clicked)="copySecret()">
              {{ copied() ? '¡Copiado!' : 'Copiar' }}
            </app-button>
          </div>
          <app-button [full]="true" (clicked)="finish()">Listo</app-button>
        </div>
      }
    </app-modal>
  `,
  styleUrls: ['../../../services/components/service-form-modal/service-form-modal.component.scss', './webhook-form-modal.component.scss'],
})
export class WebhookFormModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input() webhook: Webhook | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly webhooksService = inject(WebhooksService);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly serverError = signal('');
  readonly selectedEvents = signal<Set<string>>(new Set());
  readonly newSecret = signal('');
  readonly copied = signal(false);

  readonly eventNames = WEBHOOK_EVENT_NAMES;

  readonly form = this.fb.nonNullable.group({
    url: ['', [Validators.required, Validators.pattern(/^https:\/\/.+/)]],
  });

  ngOnInit(): void {
    if (this.webhook) {
      this.form.patchValue({ url: this.webhook.url });
      this.selectedEvents.set(new Set(this.webhook.events));
    }
  }

  eventLabel(event: string): string {
    return WEBHOOK_EVENT_LABELS[event] ?? event;
  }

  isEventSelected(event: string): boolean {
    return this.selectedEvents().has(event);
  }

  toggleEvent(event: string): void {
    const set = new Set(this.selectedEvents());
    if (set.has(event)) set.delete(event);
    else set.add(event);
    this.selectedEvents.set(set);
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.selectedEvents().size === 0) return;

    this.loading.set(true);
    this.serverError.set('');

    const payload = { url: this.form.getRawValue().url, events: Array.from(this.selectedEvents()) };

    if (this.webhook) {
      this.webhooksService.update(this.businessId, this.webhook.id, payload).subscribe({
        next: () => {
          this.loading.set(false);
          this.saved.emit();
          this.closed.emit();
        },
        error: (err) => {
          this.loading.set(false);
          this.serverError.set(err?.error?.message ?? 'No se pudo guardar el webhook.');
        },
      });
    } else {
      this.webhooksService.create(this.businessId, payload).subscribe({
        next: (res) => {
          this.loading.set(false);
          this.newSecret.set(res.secret);
        },
        error: (err) => {
          this.loading.set(false);
          this.serverError.set(err?.error?.message ?? 'No se pudo crear el webhook.');
        },
      });
    }
  }

  copySecret(): void {
    navigator.clipboard?.writeText(this.newSecret()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  finish(): void {
    this.saved.emit();
    this.closed.emit();
  }
}
