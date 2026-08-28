import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { BusinessesService } from '../../core/services/businesses.service';
import { WorkingHoursService, WorkingHourSlot } from '../../core/services/working-hours.service';
import { ServicesService } from '../../core/services/services.service';
import { StaffService } from '../../core/services/staff.service';

import { OnboardingBusinessStepComponent, BusinessStepData } from './steps/business-step.component';
import { OnboardingHoursStepComponent } from './steps/hours-step.component';
import { OnboardingServiceStepComponent, ServiceStepData } from './steps/service-step.component';
import { OnboardingStaffStepComponent, StaffStepData } from './steps/staff-step.component';
import { OnboardingPublishStepComponent } from './steps/publish-step.component';

const STEP_LABELS = ['Negocio', 'Horario', 'Servicio', 'Profesional', 'Publicar'];

@Component({
  selector: 'app-onboarding-page',
  standalone: true,
  imports: [
    CommonModule,
    OnboardingBusinessStepComponent,
    OnboardingHoursStepComponent,
    OnboardingServiceStepComponent,
    OnboardingStaffStepComponent,
    OnboardingPublishStepComponent,
  ],
  template: `
    <div class="onboarding">
      <div class="onboarding__card">
        <ol class="onboarding__progress">
          @for (label of stepLabels; track label; let i = $index) {
            <li
              class="onboarding__progress-item"
              [class.onboarding__progress-item--active]="currentStep() === i + 1"
              [class.onboarding__progress-item--done]="currentStep() > i + 1"
            >
              <span class="onboarding__progress-dot">{{ currentStep() > i + 1 ? '✓' : i + 1 }}</span>
              {{ label }}
            </li>
          }
        </ol>

        @switch (currentStep()) {
          @case (1) {
            <app-onboarding-business-step
              [loading]="loading()"
              [serverError]="error()"
              (next)="submitBusiness($event)"
            ></app-onboarding-business-step>
          }
          @case (2) {
            <app-onboarding-hours-step
              [loading]="loading()"
              [serverError]="error()"
              (next)="submitHours($event)"
              (back)="currentStep.set(1)"
            ></app-onboarding-hours-step>
          }
          @case (3) {
            <app-onboarding-service-step
              [loading]="loading()"
              [serverError]="error()"
              (next)="submitService($event)"
              (back)="currentStep.set(2)"
            ></app-onboarding-service-step>
          }
          @case (4) {
            <app-onboarding-staff-step
              [loading]="loading()"
              [serverError]="error()"
              (next)="submitStaff($event)"
              (back)="currentStep.set(3)"
            ></app-onboarding-staff-step>
          }
          @case (5) {
            <app-onboarding-publish-step
              [loading]="loading()"
              [serverError]="error()"
              [published]="published()"
              [publicUrl]="publicUrl()"
              (publish)="submitPublish()"
              (back)="currentStep.set(4)"
            ></app-onboarding-publish-step>
          }
        }
      </div>
    </div>
  `,
  styleUrl: './onboarding.page.scss',
})
export class OnboardingPageComponent {
  private readonly auth = inject(AuthService);
  private readonly businessesService = inject(BusinessesService);
  private readonly workingHoursService = inject(WorkingHoursService);
  private readonly servicesService = inject(ServicesService);
  private readonly staffService = inject(StaffService);

  readonly stepLabels = STEP_LABELS;
  readonly currentStep = signal(1);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly published = signal(false);
  readonly publicUrl = signal('');

  private businessId = '';
  private businessSlug = '';
  private firstServiceId = '';

  submitBusiness(data: BusinessStepData): void {
    this.loading.set(true);
    this.error.set('');

    this.businessesService.create(data).subscribe({
      next: (business) => {
        this.businessId = business.id;
        this.businessSlug = business.slug;
        this.auth.addBusiness({ id: business.id, name: business.name, slug: business.slug, role: 'OWNER' });
        this.loading.set(false);
        this.currentStep.set(2);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo crear el negocio.');
      },
    });
  }

  submitHours(slots: WorkingHourSlot[]): void {
    this.loading.set(true);
    this.error.set('');

    this.workingHoursService.setBusinessHours(this.businessId, slots).subscribe({
      next: () => {
        this.loading.set(false);
        this.currentStep.set(3);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo guardar el horario.');
      },
    });
  }

  submitService(data: ServiceStepData): void {
    this.loading.set(true);
    this.error.set('');

    this.servicesService.create(this.businessId, data).subscribe({
      next: (service) => {
        this.firstServiceId = service.id;
        this.loading.set(false);
        this.currentStep.set(4);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo crear el servicio.');
      },
    });
  }

  submitStaff(data: StaffStepData): void {
    this.loading.set(true);
    this.error.set('');

    this.staffService.create(this.businessId, { fullName: data.fullName, serviceIds: [this.firstServiceId] }).subscribe({
      next: () => {
        this.loading.set(false);
        this.currentStep.set(5);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo añadir el profesional.');
      },
    });
  }

  submitPublish(): void {
    this.loading.set(true);
    this.error.set('');

    this.businessesService.publish(this.businessId).subscribe({
      next: () => {
        this.loading.set(false);
        this.published.set(true);
        this.publicUrl.set(`${window.location.origin}/reservar/${this.businessSlug}`);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo publicar tu página.');
      },
    });
  }
}
