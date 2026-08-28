import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { GoogleCalendarService, GoogleCalendarStatus } from '../../../../core/services/google-calendar.service';

@Component({
  selector: 'app-integrations-section',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <app-card>
      <h2 class="integrations__title">Integraciones</h2>

      <div class="integration-row">
        <div class="integration-row__info">
          <strong>📅 Google Calendar</strong>
          <p>Cada cita nueva se añade automáticamente a tu calendario de Google. Se borra si la cancelas.</p>
        </div>
        <div class="integration-row__action">
          @if (status(); as s) {
            @if (s.connected) {
              <app-badge tone="success">Conectado</app-badge>
              <app-button variant="ghost" size="sm" [loading]="disconnecting()" (clicked)="disconnect()">
                Desconectar
              </app-button>
            } @else {
              <app-button size="sm" [loading]="connecting()" (clicked)="connect()">Conectar</app-button>
            }
          }
        </div>
      </div>

      @if (googleMessage()) {
        <p [class]="googleMessageIsError() ? 'integrations__error' : 'integrations__success'">{{ googleMessage() }}</p>
      }

      <div class="integration-row integration-row--info-only">
        <div class="integration-row__info">
          <strong>⚡ Zapier / Make</strong>
          <p>
            Conecta Agendia con miles de apps (Google Sheets, Slack, tu CRM...) usando el módulo de
            "Webhooks" de Zapier o Make junto con tus propios
            <a routerLink="/app/webhooks">Webhooks salientes</a>
            — no hace falta ninguna app especial, solo la URL y el secreto que generes ahí.
          </p>
        </div>
      </div>
    </app-card>
  `,
  styleUrl: './integrations-section.component.scss',
})
export class IntegrationsSectionComponent implements OnInit {
  @Input({ required: true }) businessId!: string;

  private readonly googleCalendarService = inject(GoogleCalendarService);
  private readonly route = inject(ActivatedRoute);

  readonly status = signal<GoogleCalendarStatus | null>(null);
  readonly connecting = signal(false);
  readonly disconnecting = signal(false);
  readonly googleMessage = signal('');
  readonly googleMessageIsError = signal(false);

  ngOnInit(): void {
    const googleParam = this.route.snapshot.queryParamMap.get('google');
    if (googleParam === 'success') {
      this.googleMessage.set('Google Calendar conectado correctamente.');
      this.googleMessageIsError.set(false);
    } else if (googleParam === 'error') {
      this.googleMessage.set('No se pudo conectar Google Calendar. Inténtalo de nuevo.');
      this.googleMessageIsError.set(true);
    }
    this.load();
  }

  load(): void {
    this.googleCalendarService.getStatus(this.businessId).subscribe({
      next: (status) => this.status.set(status),
      error: () => {},
    });
  }

  connect(): void {
    this.connecting.set(true);
    this.googleCalendarService.connect(this.businessId).subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: (err) => {
        this.connecting.set(false);
        this.googleMessage.set(err?.error?.message ?? 'No se pudo iniciar la conexión con Google.');
        this.googleMessageIsError.set(true);
      },
    });
  }

  disconnect(): void {
    if (
      !confirm(
        '¿Desconectar Google Calendar? Las citas ya sincronizadas no se borrarán de tu calendario, pero las nuevas dejarán de añadirse.',
      )
    )
      return;
    this.disconnecting.set(true);
    this.googleCalendarService.disconnect(this.businessId).subscribe({
      next: () => {
        this.disconnecting.set(false);
        this.load();
      },
      error: () => this.disconnecting.set(false),
    });
  }
}
