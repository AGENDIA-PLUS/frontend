import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { BusinessesService } from '../../core/services/businesses.service';
import { WorkingHoursService, WorkingHourSlot } from '../../core/services/working-hours.service';
import { Business } from '../../core/models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { BillingSectionComponent } from './components/billing-section/billing-section.component';
import { WhatsAppConnectionSectionComponent } from './components/whatsapp-connection-section/whatsapp-connection-section.component';
import { DepositsSectionComponent } from './components/deposits-section/deposits-section.component';
import { IntegrationsSectionComponent } from './components/integrations-section/integrations-section.component';
import { WhatsAppSimulatorComponent } from './components/whatsapp-simulator/whatsapp-simulator.component';

interface DayConfig {
  weekday: number;
  label: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const WEEKDAY_LABELS: Record<number, string> = {
  0: 'Domingo',
  1: 'Lunes',
  2: 'Martes',
  3: 'Miércoles',
  4: 'Jueves',
  5: 'Viernes',
  6: 'Sábado',
};

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    SkeletonComponent,
    BillingSectionComponent,
    WhatsAppConnectionSectionComponent,
    DepositsSectionComponent,
    IntegrationsSectionComponent,
    WhatsAppSimulatorComponent,
  ],
  template: `
    <div class="settings">
      <header class="settings__header">
        <h1>Configuración</h1>
        <p>Los datos de tu negocio y tu horario general.</p>
      </header>

      @if (loading()) {
        <app-card>
          <app-skeleton height="220px"></app-skeleton>
        </app-card>
      } @else {
        <app-billing-section [businessId]="activeBusiness()!.id"></app-billing-section>

        <app-whatsapp-connection-section [businessId]="activeBusiness()!.id"></app-whatsapp-connection-section>
        <app-deposits-section [businessId]="activeBusiness()!.id"></app-deposits-section>
        <app-integrations-section [businessId]="activeBusiness()!.id"></app-integrations-section>
        <app-whatsapp-simulator [businessId]="activeBusiness()!.id"></app-whatsapp-simulator>

        <app-card>
          <h2 class="settings__section-title">Datos del negocio</h2>
          <form class="settings__form" [formGroup]="form" (ngSubmit)="submitBusiness()">
            <div class="settings__row">
              <app-input label="Nombre" formControlName="name" [error]="submitted() && form.controls.name.invalid ? 'Introduce el nombre.' : ''"></app-input>
              <app-input label="Ciudad" formControlName="city"></app-input>
            </div>
            <div class="settings__field">
              <label class="settings__label" for="description">Descripción</label>
              <textarea id="description" class="settings__textarea" rows="2" formControlName="description"></textarea>
            </div>
            <div class="settings__row">
              <app-input label="Teléfono" formControlName="phone"></app-input>
              <app-input label="WhatsApp" formControlName="whatsapp"></app-input>
            </div>
            <div class="settings__row">
              <app-input label="Email" type="email" formControlName="email"></app-input>
              <app-input label="Dirección" formControlName="address"></app-input>
            </div>
            <div class="settings__row">
              <app-input
                label="Anticipación mínima (minutos)"
                type="number"
                formControlName="minBookingNoticeMinutes"
                hint="Tiempo mínimo antes de una cita para poder reservarla."
              ></app-input>
              <app-input
                label="Horizonte máximo (días)"
                type="number"
                formControlName="maxBookingHorizonDays"
                hint="Con cuánta antelación se puede reservar."
              ></app-input>
            </div>
            <div class="settings__field">
              <label class="settings__label" for="cancellationPolicy">Política de cancelación</label>
              <textarea id="cancellationPolicy" class="settings__textarea" rows="2" formControlName="cancellationPolicy"></textarea>
            </div>

            @if (businessError()) {
              <p class="settings__error">{{ businessError() }}</p>
            }
            @if (businessSaved()) {
              <p class="settings__success">Cambios guardados correctamente.</p>
            }

            <div class="settings__actions">
              <app-button type="submit" [loading]="savingBusiness()">Guardar cambios</app-button>
            </div>
          </form>
        </app-card>

        <app-card>
          <h2 class="settings__section-title">Horario general</h2>
          <p class="settings__hint">Este es el horario por defecto del negocio. Cada profesional puede tener el suyo propio.</p>

          <div class="hours-grid">
            @for (day of days; track day.weekday) {
              <div class="hours-row" [class.hours-row--disabled]="!day.enabled">
                <label class="hours-row__toggle">
                  <input type="checkbox" [(ngModel)]="day.enabled" [ngModelOptions]="{ standalone: true }" />
                  {{ day.label }}
                </label>
                @if (day.enabled) {
                  <div class="hours-row__times">
                    <input type="time" [(ngModel)]="day.startTime" [ngModelOptions]="{ standalone: true }" />
                    <span>—</span>
                    <input type="time" [(ngModel)]="day.endTime" [ngModelOptions]="{ standalone: true }" />
                  </div>
                } @else {
                  <span class="hours-row__closed">Cerrado</span>
                }
              </div>
            }
          </div>

          @if (hoursError()) {
            <p class="settings__error">{{ hoursError() }}</p>
          }
          @if (hoursSaved()) {
            <p class="settings__success">Horario actualizado correctamente.</p>
          }

          <div class="settings__actions">
            <app-button [loading]="savingHours()" (clicked)="submitHours()">Guardar horario</app-button>
          </div>
        </app-card>
      }
    </div>
  `,
  styleUrl: './settings.page.scss',
})
export class SettingsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly businessesService = inject(BusinessesService);
  private readonly workingHoursService = inject(WorkingHoursService);
  private readonly fb = inject(FormBuilder);

  readonly activeBusiness = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly savingBusiness = signal(false);
  readonly businessError = signal('');
  readonly businessSaved = signal(false);
  readonly savingHours = signal(false);
  readonly hoursError = signal('');
  readonly hoursSaved = signal(false);

  readonly days: DayConfig[] = [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({
    weekday,
    label: WEEKDAY_LABELS[weekday],
    enabled: false,
    startTime: '09:00',
    endTime: '18:00',
  }));

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    city: [''],
    phone: [''],
    whatsapp: [''],
    email: ['', [Validators.email]],
    address: [''],
    minBookingNoticeMinutes: [60, [Validators.min(0)]],
    maxBookingHorizonDays: [60, [Validators.min(1)]],
    cancellationPolicy: [''],
  });

  constructor() {
    const business = this.activeBusiness();
    if (business) {
      this.loading.set(true);
      this.businessesService.getOne(business.id).subscribe((full) => {
        this.patchForm(full);
        this.loading.set(false);
      });
      this.workingHoursService.getBusinessHours(business.id).subscribe((hours) => {
        for (const h of hours) {
          const day = this.days.find((d) => d.weekday === h.weekday);
          if (day) {
            day.enabled = true;
            day.startTime = h.startTime;
            day.endTime = h.endTime;
          }
        }
      });
    }
  }

  private patchForm(business: Business): void {
    this.form.patchValue({
      name: business.name,
      description: business.description ?? '',
      city: business.city ?? '',
      phone: business.phone ?? '',
      whatsapp: business.whatsapp ?? '',
      email: business.email ?? '',
      address: business.address ?? '',
      minBookingNoticeMinutes: business.minBookingNoticeMinutes,
      maxBookingHorizonDays: business.maxBookingHorizonDays,
      cancellationPolicy: business.cancellationPolicy ?? '',
    });
  }

  submitBusiness(): void {
    this.submitted.set(true);
    this.businessSaved.set(false);
    if (this.form.invalid) return;

    const business = this.activeBusiness();
    if (!business) return;

    this.savingBusiness.set(true);
    this.businessError.set('');

    const raw = this.form.getRawValue();
    this.businessesService
      .update(business.id, {
        name: raw.name,
        description: raw.description || undefined,
        city: raw.city || undefined,
        phone: raw.phone || undefined,
        whatsapp: raw.whatsapp || undefined,
        email: raw.email || undefined,
        address: raw.address || undefined,
        minBookingNoticeMinutes: Number(raw.minBookingNoticeMinutes),
        maxBookingHorizonDays: Number(raw.maxBookingHorizonDays),
        cancellationPolicy: raw.cancellationPolicy || undefined,
      })
      .subscribe({
        next: () => {
          this.savingBusiness.set(false);
          this.businessSaved.set(true);
          setTimeout(() => this.businessSaved.set(false), 3000);
        },
        error: (err) => {
          this.savingBusiness.set(false);
          this.businessError.set(err?.error?.message ?? 'No se pudieron guardar los cambios.');
        },
      });
  }

  submitHours(): void {
    const business = this.activeBusiness();
    if (!business) return;

    this.savingHours.set(true);
    this.hoursError.set('');
    this.hoursSaved.set(false);

    const slots: WorkingHourSlot[] = this.days
      .filter((d) => d.enabled)
      .map((d) => ({ weekday: d.weekday, startTime: d.startTime, endTime: d.endTime }));

    this.workingHoursService.setBusinessHours(business.id, slots).subscribe({
      next: () => {
        this.savingHours.set(false);
        this.hoursSaved.set(true);
        setTimeout(() => this.hoursSaved.set(false), 3000);
      },
      error: (err) => {
        this.savingHours.set(false);
        this.hoursError.set(err?.error?.message ?? 'No se pudo guardar el horario.');
      },
    });
  }
}
