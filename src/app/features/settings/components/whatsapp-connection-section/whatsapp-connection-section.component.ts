import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { BusinessesService } from '../../../../core/services/businesses.service';
import { WhatsAppBotService } from '../../../../core/services/whatsapp-bot.service';
import { Business } from '../../../../core/models';

@Component({
  selector: 'app-whatsapp-connection-section',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardComponent, BadgeComponent, ButtonComponent, InputComponent],
  template: `
    <app-card>
      <div class="wa-conn__header">
        <h2>Bot de WhatsApp</h2>
        @if (business()) {
          <app-badge [tone]="business()!.whatsappConnected ? 'success' : 'neutral'">
            {{ business()!.whatsappConnected ? 'Conectado' : 'No conectado' }}
          </app-badge>
        }
      </div>
      <p class="wa-conn__hint">
        Conecta el número de WhatsApp Business de este negocio para que el bot pueda
        responder automáticamente a tus clientes: reservar, cancelar y consultar
        disponibilidad, sin que tengas que escribir tú.
      </p>

      <form class="wa-conn__form" [formGroup]="form" (ngSubmit)="submit()">
        <app-input
          label="Phone Number ID (Meta)"
          placeholder="Ej: 109876543210987"
          formControlName="phoneNumberId"
          [error]="submitted() && form.controls.phoneNumberId.invalid ? 'Introduce el Phone Number ID.' : ''"
        ></app-input>
        <app-input
          label="Access Token (Meta)"
          type="password"
          placeholder="EAAxxxxxxxxxxxxx..."
          formControlName="accessToken"
          hint="Se cifra antes de guardarse. Nunca se vuelve a mostrar."
          [error]="submitted() && form.controls.accessToken.invalid ? 'Introduce el access token.' : ''"
        ></app-input>

        @if (serverError()) {
          <p class="wa-conn__error">{{ serverError() }}</p>
        }
        @if (saved()) {
          <p class="wa-conn__success">Conectado correctamente.</p>
        }

        <div class="wa-conn__actions">
          <app-button type="submit" [loading]="loading()">
            {{ business()?.whatsappConnected ? 'Actualizar conexión' : 'Conectar' }}
          </app-button>
        </div>
      </form>

      <p class="wa-conn__docs">
        ¿No sabes dónde conseguir esto? En
        <a href="https://developers.facebook.com" target="_blank" rel="noopener">developers.facebook.com</a>
        crea una app de WhatsApp Business y copia el Phone Number ID y un token de acceso
        permanente desde la configuración de la API.
      </p>
    </app-card>
  `,
  styleUrl: './whatsapp-connection-section.component.scss',
})
export class WhatsAppConnectionSectionComponent implements OnInit {
  @Input({ required: true }) businessId!: string;

  private readonly fb = inject(FormBuilder);
  private readonly businessesService = inject(BusinessesService);
  private readonly whatsAppBotService = inject(WhatsAppBotService);

  readonly business = signal<Business | null>(null);
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly serverError = signal('');
  readonly saved = signal(false);

  readonly form = this.fb.nonNullable.group({
    phoneNumberId: ['', [Validators.required]],
    accessToken: ['', [Validators.required, Validators.minLength(10)]],
  });

  ngOnInit(): void {
    this.businessesService.getOne(this.businessId).subscribe((business) => {
      this.business.set(business);
      if (business.whatsappPhoneNumberId) {
        this.form.controls.phoneNumberId.setValue(business.whatsappPhoneNumberId);
      }
    });
  }

  submit(): void {
    this.submitted.set(true);
    this.saved.set(false);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');

    const raw = this.form.getRawValue();
    this.whatsAppBotService.updateConnection(this.businessId, raw.phoneNumberId, raw.accessToken).subscribe({
      next: (business) => {
        this.loading.set(false);
        this.saved.set(true);
        this.business.set(business);
        this.form.controls.accessToken.setValue('');
        setTimeout(() => this.saved.set(false), 3000);
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo guardar la conexión.');
      },
    });
  }
}
