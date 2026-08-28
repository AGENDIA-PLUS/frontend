import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { LocationsService, Location } from '../../../../core/services/locations.service';

@Component({
  selector: 'app-location-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, InputComponent, ButtonComponent],
  template: `
    <app-modal [title]="location ? 'Editar ubicación' : 'Nueva ubicación'" (close)="closed.emit()">
      <form class="form" [formGroup]="form" (ngSubmit)="submit()">
        <app-input
          label="Nombre"
          placeholder="Ej: Sede Centro, Sucursal Norte..."
          formControlName="name"
          [error]="submitted() && form.controls.name.invalid ? 'Introduce un nombre.' : ''"
        ></app-input>

        <app-input label="Dirección (opcional)" placeholder="Calle, número..." formControlName="address"></app-input>
        <app-input label="Ciudad (opcional)" formControlName="city"></app-input>

        @if (serverError()) {
          <p class="form__error">{{ serverError() }}</p>
        }

        <div class="form__actions">
          <app-button variant="ghost" type="button" (clicked)="closed.emit()">Cancelar</app-button>
          <app-button type="submit" [loading]="loading()">{{ location ? 'Guardar cambios' : 'Crear ubicación' }}</app-button>
        </div>
      </form>
    </app-modal>
  `,
  styleUrl: '../../../services/components/service-form-modal/service-form-modal.component.scss',
})
export class LocationFormModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input() location: Location | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly locationsService = inject(LocationsService);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly serverError = signal('');

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    address: [''],
    city: [''],
  });

  ngOnInit(): void {
    if (this.location) {
      this.form.patchValue({
        name: this.location.name,
        address: this.location.address ?? '',
        city: this.location.city ?? '',
      });
    }
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');

    const raw = this.form.getRawValue();
    const payload = { name: raw.name, address: raw.address || undefined, city: raw.city || undefined };

    const request = this.location
      ? this.locationsService.update(this.businessId, this.location.id, payload)
      : this.locationsService.create(this.businessId, payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.saved.emit();
        this.closed.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo guardar la ubicación.');
      },
    });
  }
}
