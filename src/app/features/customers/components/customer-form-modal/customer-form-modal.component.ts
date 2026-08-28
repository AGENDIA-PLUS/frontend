import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { CustomersService } from '../../../../core/services/customers.service';
import { Customer } from '../../../../core/models';

@Component({
  selector: 'app-customer-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, InputComponent, ButtonComponent],
  template: `
    <app-modal [title]="customer ? 'Editar cliente' : 'Nuevo cliente'" (close)="closed.emit()">
      <form class="form" [formGroup]="form" (ngSubmit)="submit()">
        <app-input
          label="Nombre completo"
          placeholder="Ej: María García"
          formControlName="fullName"
          [error]="submitted() && form.controls.fullName.invalid ? 'Introduce el nombre.' : ''"
        ></app-input>

        <app-input label="Teléfono" placeholder="+34 600 000 000" formControlName="phone"></app-input>
        <app-input label="Email (opcional)" type="email" placeholder="maria@example.com" formControlName="email"></app-input>

        <div class="form__field">
          <label class="form__label" for="notes">Notas (opcional)</label>
          <textarea id="notes" class="form__textarea" rows="2" placeholder="Preferencias, alergias..." formControlName="notes"></textarea>
        </div>

        @if (serverError()) {
          <p class="form__error">{{ serverError() }}</p>
        }

        <div class="form__actions">
          <app-button variant="ghost" type="button" (clicked)="closed.emit()">Cancelar</app-button>
          <app-button type="submit" [loading]="loading()">{{ customer ? 'Guardar cambios' : 'Crear cliente' }}</app-button>
        </div>
      </form>
    </app-modal>
  `,
  styleUrl: '../../../services/components/service-form-modal/service-form-modal.component.scss',
})
export class CustomerFormModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input() customer: Customer | null = null;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly customersService = inject(CustomersService);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly serverError = signal('');

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: [''],
    email: ['', [Validators.email]],
    notes: [''],
  });

  ngOnInit(): void {
    if (this.customer) {
      this.form.patchValue({
        fullName: this.customer.fullName,
        phone: this.customer.phone ?? '',
        email: this.customer.email ?? '',
        notes: this.customer.notes ?? '',
      });
    }
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');

    const raw = this.form.getRawValue();
    const payload = {
      fullName: raw.fullName,
      phone: raw.phone || undefined,
      email: raw.email || undefined,
      notes: raw.notes || undefined,
    };

    const request = this.customer
      ? this.customersService.update(this.businessId, this.customer.id, payload)
      : this.customersService.create(this.businessId, payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.saved.emit();
        this.closed.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo guardar el cliente.');
      },
    });
  }
}
