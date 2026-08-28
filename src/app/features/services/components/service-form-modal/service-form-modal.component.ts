import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { ServicesService } from '../../../../core/services/services.service';
import { Service, Staff } from '../../../../core/models';
import { formatDurationMin } from '../../../../shared/utils/duration.util';

@Component({
  selector: 'app-service-form-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, InputComponent, SelectComponent, ButtonComponent],
  template: `
    <app-modal [title]="service ? 'Editar servicio' : 'Nuevo servicio'" (close)="closed.emit()">
      <form class="form" [formGroup]="form" (ngSubmit)="submit()">
        <app-input
          label="Nombre del servicio"
          placeholder="Ej: Corte de cabello"
          formControlName="name"
          [error]="submitted() && form.controls.name.invalid ? 'Introduce el nombre del servicio.' : ''"
        ></app-input>

        <div class="form__field">
          <label class="form__label" for="description">Descripción (opcional)</label>
          <textarea
            id="description"
            class="form__textarea"
            rows="2"
            placeholder="Breve descripción para tus clientes"
            formControlName="description"
          ></textarea>
        </div>

        <div class="form__field">
          <span class="form__label">Duración</span>
          <div class="form__row form__row--duration">
            <app-input label="Horas" type="number" formControlName="durationHours"></app-input>
            <app-input label="Minutos" type="number" formControlName="durationMinutes"></app-input>
          </div>
          @if (submitted() && totalDurationMin() <= 0) {
            <p class="form__field-error">Introduce una duración mayor que 0.</p>
          } @else {
            <p class="form__hint">Total: {{ totalDurationLabel() }}</p>
          }
        </div>
        <app-input
          label="Precio (€)"
          type="number"
          formControlName="price"
          [error]="submitted() && form.controls.price.invalid ? 'Precio inválido.' : ''"
        ></app-input>

        <app-input label="Categoría (opcional)" placeholder="Ej: Cabello, Barba, Combo..." formControlName="category"></app-input>

        <div class="form__field">
          <label class="deposit-toggle">
            <input type="checkbox" formControlName="depositEnabled" />
            Pedir depósito/señal para reservar este servicio
          </label>
          <p class="form__hint">
            Reduce las ausencias sin avisar: el cliente paga una parte por adelantado al reservar.
            Requiere conectar tu cuenta de Stripe en Configuración.
          </p>
        </div>

        @if (form.controls.depositEnabled.value) {
          <div class="form__row">
            <app-select label="Tipo" [options]="depositTypeOptions" formControlName="depositType"></app-select>
            <app-input
              [label]="form.controls.depositType.value === 'PERCENTAGE' ? 'Porcentaje (%)' : 'Importe (€)'"
              type="number"
              formControlName="depositAmount"
              [error]="submitted() && depositAmountInvalid() ? 'Introduce un importe válido.' : ''"
            ></app-input>
          </div>
        }

        <div class="form__field">
          <span class="form__label">Profesionales que lo realizan</span>
          @if (staff.length === 0) {
            <p class="form__hint">Todavía no tienes profesionales. Podrás asociarlos después.</p>
          } @else {
            <div class="staff-list">
              @for (member of staff; track member.id) {
                <label class="staff-item">
                  <input type="checkbox" [checked]="isStaffSelected(member.id)" (change)="toggleStaff(member.id)" />
                  {{ member.fullName }}
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
          <app-button type="submit" [loading]="loading()">{{ service ? 'Guardar cambios' : 'Crear servicio' }}</app-button>
        </div>
      </form>
    </app-modal>
  `,
  styleUrl: './service-form-modal.component.scss',
})
export class ServiceFormModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input() service: Service | null = null;
  @Input() staff: Staff[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly servicesService = inject(ServicesService);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly serverError = signal('');
  readonly selectedStaffIds = signal<Set<string>>(new Set());

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    durationHours: [0, [Validators.min(0)]],
    durationMinutes: [30, [Validators.min(0), Validators.max(59)]],
    price: [0, [Validators.required, Validators.min(0)]],
    category: [''],
    depositEnabled: [false],
    depositType: ['FIXED' as 'FIXED' | 'PERCENTAGE'],
    depositAmount: [0],
  });

  readonly depositTypeOptions: SelectOption[] = [
    { value: 'FIXED', label: 'Importe fijo' },
    { value: 'PERCENTAGE', label: 'Porcentaje del precio' },
  ];

  ngOnInit(): void {
    if (this.service) {
      this.form.patchValue({
        name: this.service.name,
        description: this.service.description ?? '',
        durationHours: Math.floor(this.service.durationMin / 60),
        durationMinutes: this.service.durationMin % 60,
        price: Number(this.service.price),
        category: this.service.category ?? '',
        depositEnabled: this.service.depositEnabled ?? false,
        depositType: (this.service.depositType as 'FIXED' | 'PERCENTAGE') ?? 'FIXED',
        depositAmount: this.service.depositAmount ? Number(this.service.depositAmount) : 0,
      });
      const ids = (this.service.staff ?? []).map((s) => s.staff.id);
      this.selectedStaffIds.set(new Set(ids));
    }
  }

  isStaffSelected(id: string): boolean {
    return this.selectedStaffIds().has(id);
  }

  toggleStaff(id: string): void {
    const set = new Set(this.selectedStaffIds());
    if (set.has(id)) set.delete(id);
    else set.add(id);
    this.selectedStaffIds.set(set);
  }

  /**
   * Un tatuador vendiendo sesiones de 6 horas no debería tener que hacer la
   * multiplicación mental a minutos — el formulario captura horas/minutos
   * por separado y aquí se combinan en el total que espera el backend
   * (Service.durationMin sigue siendo minutos internamente, sin tocar el
   * motor de disponibilidad).
   */
  totalDurationMin(): number {
    const raw = this.form.getRawValue();
    return Number(raw.durationHours || 0) * 60 + Number(raw.durationMinutes || 0);
  }

  totalDurationLabel(): string {
    return formatDurationMin(this.totalDurationMin());
  }

  depositAmountInvalid(): boolean {
    if (!this.form.controls.depositEnabled.value) return false;
    const amount = Number(this.form.controls.depositAmount.value);
    if (amount <= 0) return true;
    if (this.form.controls.depositType.value === 'PERCENTAGE' && amount > 100) return true;
    return false;
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.totalDurationMin() <= 0 || this.depositAmountInvalid()) return;

    this.loading.set(true);
    this.serverError.set('');

    const raw = this.form.getRawValue();
    const payload = {
      name: raw.name,
      description: raw.description || undefined,
      durationMin: this.totalDurationMin(),
      price: Number(raw.price),
      category: raw.category || undefined,
      staffIds: Array.from(this.selectedStaffIds()),
      depositEnabled: raw.depositEnabled,
      depositType: raw.depositEnabled ? raw.depositType : undefined,
      depositAmount: raw.depositEnabled ? Number(raw.depositAmount) : undefined,
    };

    const request = this.service
      ? this.servicesService.update(this.businessId, this.service.id, payload)
      : this.servicesService.create(this.businessId, payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.saved.emit();
        this.closed.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo guardar el servicio.');
      },
    });
  }
}
