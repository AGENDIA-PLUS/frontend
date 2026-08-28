import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { DepositsService, DepositConnectStatus } from '../../../../core/services/deposits.service';

@Component({
  selector: 'app-deposits-section',
  standalone: true,
  imports: [CommonModule, CardComponent, BadgeComponent, ButtonComponent],
  template: `
    <app-card>
      <div class="deposits__header">
        <h2>Depósitos / señal</h2>
        @if (status(); as s) {
          <app-badge [tone]="s.chargesEnabled ? 'success' : s.connected ? 'warning' : 'neutral'">
            {{ s.chargesEnabled ? 'Conectado' : s.connected ? 'Conexión incompleta' : 'No conectado' }}
          </app-badge>
        }
      </div>
      <p class="deposits__hint">
        Cobra una señal por adelantado al reservar para reducir las ausencias sin avisar. El dinero
        va directamente a tu propia cuenta de Stripe, no a la nuestra — nunca pasa por Agendia.
      </p>
      <p class="deposits__hint">
        <strong>Sobre el IVA:</strong> como el dinero va a tu propia cuenta, el IVA de las señales es
        responsabilidad fiscal tuya, no de Agendia. Si quieres que Stripe lo calcule automáticamente
        según la ubicación de cada cliente, actívalo desde tu propio Dashboard de Stripe → Tax — si no
        lo activas, la señal se cobra sin impuesto añadido.
      </p>

      @if (loading()) {
        <p class="deposits__hint">Cargando...</p>
      } @else if (status()?.chargesEnabled) {
        <p class="deposits__success">
          ✅ Tu cuenta de Stripe está lista para recibir depósitos. Activa el depósito en cada
          servicio desde la pantalla de Servicios.
        </p>
        <app-button variant="ghost" size="sm" [loading]="disconnecting()" (clicked)="disconnect()">
          Desconectar cuenta
        </app-button>
      } @else if (status()?.connected) {
        <p class="deposits__warning">
          Tu cuenta de Stripe está conectada pero todavía no ha completado la verificación. Entra a
          tu dashboard de Stripe para terminarla.
        </p>
      } @else {
        <app-button [loading]="connecting()" (clicked)="connect()">Conectar con Stripe</app-button>
      }

      @if (connectMessage()) {
        <p [class]="connectMessageIsError() ? 'deposits__error' : 'deposits__success'">{{ connectMessage() }}</p>
      }
    </app-card>
  `,
  styleUrl: './deposits-section.component.scss',
})
export class DepositsSectionComponent implements OnInit {
  @Input({ required: true }) businessId!: string;

  private readonly depositsService = inject(DepositsService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly status = signal<DepositConnectStatus | null>(null);
  readonly connecting = signal(false);
  readonly disconnecting = signal(false);
  readonly connectMessage = signal('');
  readonly connectMessageIsError = signal(false);

  ngOnInit(): void {
    const connectParam = this.route.snapshot.queryParamMap.get('connect');
    if (connectParam === 'success') {
      this.connectMessage.set('Cuenta de Stripe conectada correctamente.');
      this.connectMessageIsError.set(false);
    } else if (connectParam === 'error') {
      this.connectMessage.set('No se pudo completar la conexión con Stripe. Inténtalo de nuevo.');
      this.connectMessageIsError.set(true);
    }
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.depositsService.getStatus(this.businessId).subscribe({
      next: (status) => {
        this.status.set(status);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  connect(): void {
    this.connecting.set(true);
    this.depositsService.connect(this.businessId).subscribe({
      next: (res) => {
        window.location.href = res.url;
      },
      error: () => {
        this.connecting.set(false);
        this.connectMessage.set('No se pudo iniciar la conexión con Stripe.');
        this.connectMessageIsError.set(true);
      },
    });
  }

  disconnect(): void {
    if (
      !confirm(
        '¿Desconectar tu cuenta de Stripe? Los servicios con depósito activado dejarán de poder cobrarlo hasta que vuelvas a conectar.',
      )
    )
      return;
    this.disconnecting.set(true);
    this.depositsService.disconnect(this.businessId).subscribe({
      next: () => {
        this.disconnecting.set(false);
        this.load();
      },
      error: () => this.disconnecting.set(false),
    });
  }
}
