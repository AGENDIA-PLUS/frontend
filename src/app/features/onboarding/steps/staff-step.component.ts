import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

export interface StaffStepData {
  fullName: string;
}

@Component({
  selector: 'app-onboarding-staff-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <form class="step" [formGroup]="form" (ngSubmit)="submit()">
      <h2>¿Quién atiende las citas?</h2>
      <p class="step__subtitle">
        Añade el primer profesional (puedes ser tú mismo). Se le asociará automáticamente el
        servicio que acabas de crear.
      </p>

      <app-input
        label="Nombre del profesional"
        placeholder="Ej: Joisner, Ana, Carlos..."
        formControlName="fullName"
        [error]="submitted() && form.controls.fullName.invalid ? 'Introduce el nombre del profesional.' : ''"
      ></app-input>

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
export class OnboardingStaffStepComponent {
  @Input() loading = false;
  @Input() serverError = '';
  @Output() next = new EventEmitter<StaffStepData>();
  @Output() back = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
  });

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.next.emit(this.form.getRawValue());
  }
}
