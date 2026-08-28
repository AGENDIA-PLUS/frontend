import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

export interface ServiceStepData {
  name: string;
  durationMin: number;
  price: number;
}

@Component({
  selector: 'app-onboarding-service-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <form class="step" [formGroup]="form" (ngSubmit)="submit()">
      <h2>Añade tu primer servicio</h2>
      <p class="step__subtitle">Podrás añadir más servicios después. Empecemos con el más habitual.</p>

      <app-input
        label="Nombre del servicio"
        placeholder="Ej: Corte de cabello, Manicura, Sesión de tatuaje..."
        formControlName="name"
        [error]="submitted() && form.controls.name.invalid ? 'Introduce el nombre del servicio.' : ''"
      ></app-input>

      <div class="step__row">
        <app-input
          label="Duración (minutos)"
          type="number"
          placeholder="30"
          formControlName="durationMin"
          [error]="submitted() && form.controls.durationMin.invalid ? 'Introduce una duración válida.' : ''"
        ></app-input>
        <app-input
          label="Precio (€)"
          type="number"
          placeholder="15"
          formControlName="price"
          [error]="submitted() && form.controls.price.invalid ? 'Introduce un precio válido.' : ''"
        ></app-input>
      </div>

      @if (serverError) {
        <p class="step__error">{{ serverError }}</p>
      }

      <div class="step__actions">
        <app-button variant="ghost" type="button" (clicked)="back.emit()">Atrás</app-button>
        <app-button type="submit" size="lg" [loading]="loading">Continuar</app-button>
      </div>
    </form>
  `,
  styleUrl: '../onboarding.page.scss',
})
export class OnboardingServiceStepComponent {
  @Input() loading = false;
  @Input() serverError = '';
  @Output() next = new EventEmitter<ServiceStepData>();
  @Output() back = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    durationMin: [30, [Validators.required, Validators.min(5)]],
    price: [15, [Validators.required, Validators.min(0)]],
  });

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.next.emit({ name: raw.name, durationMin: Number(raw.durationMin), price: Number(raw.price) });
  }
}
