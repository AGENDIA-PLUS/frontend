import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { StaffService } from '../../../../core/services/staff.service';
import { Service, Staff } from '../../../../core/models';
import { Location } from '../../../../core/services/locations.service';

@Component({
  selector: 'app-staff-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, InputComponent, SelectComponent, ButtonComponent],
  template: `
    <app-modal [title]="staffMember ? 'Editar profesional' : 'Nuevo profesional'" (close)="closed.emit()">
      <form class="form" [formGroup]="form" (ngSubmit)="submit()">
        <app-input
          label="Nombre completo"
          placeholder="Ej: Joisner, Ana, Carlos..."
          formControlName="fullName"
          [error]="submitted() && form.controls.fullName.invalid ? 'Introduce el nombre.' : ''"
        ></app-input>

        @if (locations.length > 1) {
          <app-select
            label="Ubicación"
            placeholder="Sin asignar"
            [options]="locationOptions"
            formControlName="locationId"
          ></app-select>
        }

        <div class="form__field">
          <span class="form__label">Servicios que puede realizar</span>
          @if (services.length === 0) {
            <p class="form__hint">Todavía no tienes servicios. Podrás asociarlos después.</p>
          } @else {
            <div class="staff-list">
              @for (service of services; track service.id) {
                <label class="staff-item">
                  <input type="checkbox" [checked]="isServiceSelected(service.id)" (change)="toggleService(service.id)" />
                  {{ service.name }}
                </label>
              }
            </div>
          }
        </div>

        @if (serverError()) {
          <p class="form__error">{{ serverError() }}</p>
        }

        <div class="form__actions">
          <app-button variant="ghost" type="button" (clicked)="closed.emit()">Cancelar</app-button>
          <app-button type="submit" [loading]="loading()">{{ staffMember ? 'Guardar cambios' : 'Añadir profesional' }}</app-button>
        </div>
      </form>
    </app-modal>
  `,
  styleUrl: '../../../services/components/service-form-modal/service-form-modal.component.scss',
})
export class StaffFormModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input() staffMember: Staff | null = null;
  @Input() services: Service[] = [];
  @Input() locations: Location[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly staffService = inject(StaffService);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly serverError = signal('');
  readonly selectedServiceIds = signal<Set<string>>(new Set());

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    locationId: [''],
  });

  get locationOptions(): SelectOption[] {
    return this.locations.map((l) => ({ value: l.id, label: l.name }));
  }

  ngOnInit(): void {
    if (this.staffMember) {
      this.form.patchValue({ fullName: this.staffMember.fullName, locationId: this.staffMember.locationId ?? '' });
      const ids = (this.staffMember.services ?? []).map((s) => s.service.id);
      this.selectedServiceIds.set(new Set(ids));
    }
  }

  isServiceSelected(id: string): boolean {
    return this.selectedServiceIds().has(id);
  }

  toggleService(id: string): void {
    const set = new Set(this.selectedServiceIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedServiceIds.set(set);
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');

    const raw = this.form.getRawValue();
    const payload = {
      fullName: raw.fullName,
      serviceIds: Array.from(this.selectedServiceIds()),
      // Cadena vacía = "Sin asignar" en el desplegable -> se manda null para
      // desasignar explícitamente; si no hay más de 1 ubicación, el campo ni
      // siquiera se muestra y se manda undefined (no se toca el valor actual).
      locationId: this.locations.length > 1 ? raw.locationId || null : undefined,
    };

    const request = this.staffMember
      ? this.staffService.update(this.businessId, this.staffMember.id, payload)
      : this.staffService.create(this.businessId, payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.saved.emit();
        this.closed.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo guardar el profesional.');
      },
    });
  }
}
