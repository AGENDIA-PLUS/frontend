import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PublicBookingService, PublicBusinessResponse, PublicService, PublicStaff } from '../../core/services/public-booking.service';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { PublicBusinessHeaderComponent } from './components/business-header/business-header.component';
import { PublicStepServiceComponent } from './components/step-service/step-service.component';
import { PublicStepStaffComponent } from './components/step-staff/step-staff.component';
import { PublicStepDatetimeComponent } from './components/step-datetime/step-datetime.component';
import { PublicStepDetailsComponent, PublicCustomerData } from './components/step-details/step-details.component';
import { PublicConfirmationComponent } from './components/confirmation/confirmation.component';

type Step = 'service' | 'staff' | 'datetime' | 'details' | 'confirmation';

@Component({
  selector: 'app-public-booking-page',
  standalone: true,
  imports: [
    CommonModule,
    SkeletonComponent,
    EmptyStateComponent,
    PublicBusinessHeaderComponent,
    PublicStepServiceComponent,
    PublicStepStaffComponent,
    PublicStepDatetimeComponent,
    PublicStepDetailsComponent,
    PublicConfirmationComponent,
  ],
  template: `
    <div class="public-booking">
      <div class="public-booking__card">
        @if (loadingBusiness()) {
          <app-skeleton height="60px"></app-skeleton>
          <div style="height:16px"></div>
          <app-skeleton height="240px"></app-skeleton>
        } @else {
          @if (data(); as d) {
            <app-public-business-header [business]="d.business"></app-public-business-header>

            @switch (step()) {
              @case ('service') {
                <app-public-step-service [services]="d.services" (select)="selectService($event)"></app-public-step-service>
              }
              @case ('staff') {
                <app-public-step-staff [staff]="staffForSelectedService()" (select)="selectStaff($event)" (back)="step.set('service')"></app-public-step-staff>
              }
              @case ('datetime') {
                <app-public-step-datetime
                  [date]="selectedDate"
                  [minDate]="todayIso"
                  [slots]="slots()"
                  [loading]="loadingSlots()"
                  [selectedSlot]="selectedSlot()"
                  (dateChange)="onDateChange($event)"
                  (select)="selectedSlot.set($event)"
                  (continue)="step.set('details')"
                  (back)="step.set('staff')"
                ></app-public-step-datetime>
              }
              @case ('details') {
                <app-public-step-details
                  [loading]="submitting()"
                  [serverError]="submitError()"
                  (next)="submitBooking($event)"
                  (back)="step.set('datetime')"
                ></app-public-step-details>
              }
              @case ('confirmation') {
                <app-public-confirmation
                  [startsAt]="selectedSlot()!"
                  [serviceName]="selectedService()!.name"
                  [staffName]="selectedStaffMember()!.fullName"
                ></app-public-confirmation>
              }
            }
          } @else {
            <!-- data() es null: o el negocio no existe/no está publicado (notFound),
                 o la petición falló por otro motivo. Mismo mensaje en ambos casos,
                 sin distinguir detalles internos al usuario final. -->
            <app-empty-state icon="🔍" title="Página no encontrada" description="Este enlace de reservas no existe o el negocio todavía no lo ha publicado." />
          }
        }
      </div>

      <p class="public-booking__powered">Powered by Agendia</p>
    </div>
  `,
  styleUrl: './public-booking.page.scss',
})
export class PublicBookingPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly publicBookingService = inject(PublicBookingService);

  private slug = '';
  readonly loadingBusiness = signal(true);
  readonly notFound = signal(false);
  readonly data = signal<PublicBusinessResponse | null>(null);

  readonly step = signal<Step>('service');
  readonly selectedService = signal<PublicService | null>(null);
  readonly selectedStaffMember = signal<PublicStaff | null>(null);
  readonly selectedSlot = signal<string | null>(null);
  readonly slots = signal<string[]>([]);
  readonly loadingSlots = signal(false);
  readonly submitting = signal(false);
  readonly submitError = signal('');

  readonly todayIso = new Date().toISOString().slice(0, 10);
  selectedDate = this.todayIso;

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.publicBookingService.getBusiness(this.slug).subscribe({
      next: (data) => {
        this.data.set(data);
        this.loadingBusiness.set(false);
      },
      error: () => {
        this.notFound.set(true);
        this.loadingBusiness.set(false);
      },
    });
  }

  staffForSelectedService() {
    const serviceId = this.selectedService()?.id;
    const all = this.data()?.staff ?? [];
    return all.filter((s) => s.serviceIds.includes(serviceId ?? ''));
  }

  selectService(service: PublicService): void {
    this.selectedService.set(service);
    this.step.set('staff');
  }

  selectStaff(staff: PublicStaff): void {
    this.selectedStaffMember.set(staff);
    this.step.set('datetime');
    this.loadSlots();
  }

  onDateChange(date: string): void {
    this.selectedDate = date;
    this.loadSlots();
  }

  private loadSlots(): void {
    const serviceId = this.selectedService()?.id;
    const staffId = this.selectedStaffMember()?.id;
    if (!serviceId || !staffId) return;

    this.loadingSlots.set(true);
    this.slots.set([]);
    this.selectedSlot.set(null);

    this.publicBookingService.getAvailability(this.slug, serviceId, this.selectedDate, staffId).subscribe({
      next: (result) => {
        this.slots.set(result[0]?.slots ?? []);
        this.loadingSlots.set(false);
      },
      error: () => this.loadingSlots.set(false),
    });
  }

  submitBooking(customer: PublicCustomerData): void {
    const service = this.selectedService();
    const staff = this.selectedStaffMember();
    const slot = this.selectedSlot();
    if (!service || !staff || !slot) return;

    this.submitting.set(true);
    this.submitError.set('');

    this.publicBookingService
      .createBooking(this.slug, {
        serviceId: service.id,
        staffId: staff.id,
        startsAt: slot,
        fullName: customer.fullName,
        phone: customer.phone,
        email: customer.email,
      })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          // Si el servicio pide depósito y el negocio tiene Stripe Connect
          // listo, el backend devuelve el link de pago — se redirige antes
          // de mostrar la confirmación (la cita ya existe, pero queda
          // pendiente de la señal hasta que el cliente pague).
          if (res.depositCheckoutUrl) {
            window.location.href = res.depositCheckoutUrl;
            return;
          }
          this.step.set('confirmation');
        },
        error: (err) => {
          this.submitting.set(false);
          this.submitError.set(err?.error?.message ?? 'No se pudo completar la reserva. Inténtalo de nuevo.');
        },
      });
  }
}
