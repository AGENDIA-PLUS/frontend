import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

export interface BusinessStepData {
  name: string;
  slug: string;
  vertical: string;
}

@Component({
  selector: 'app-onboarding-business-step',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, SelectComponent, ButtonComponent],
  template: `
    <form class="step" [formGroup]="form" (ngSubmit)="submit()">
      <h2>Cuéntanos sobre tu negocio</h2>
      <p class="step__subtitle">Esto será lo primero que vean tus clientes en tu página de reservas.</p>

      <app-input
        label="Nombre del negocio"
        placeholder="Ej: Barbería Joisner, Uñas Bella, Estudio Tinta..."
        formControlName="name"
        [error]="submitted() && form.controls.name.invalid ? 'Introduce el nombre de tu negocio.' : ''"
      ></app-input>

      <app-select
        label="Tipo de negocio"
        placeholder="Selecciona una opción"
        [options]="verticalOptions"
        formControlName="vertical"
        [error]="submitted() && form.controls.vertical.invalid ? 'Selecciona el tipo de negocio.' : ''"
      ></app-select>

      <app-input
        label="Enlace de tu página de reservas"
        prefixIcon="/"
        formControlName="slug"
        hint="Se genera automáticamente, pero puedes personalizarlo."
        [error]="submitted() && form.controls.slug.invalid ? 'Usa solo minúsculas, números y guiones.' : ''"
      ></app-input>

      @if (serverError) {
        <p class="step__error">{{ serverError }}</p>
      }

      <app-button type="submit" [full]="true" size="lg" [loading]="loading">Continuar</app-button>
    </form>
  `,
  styleUrl: '../onboarding.page.scss',
})
export class OnboardingBusinessStepComponent {
  @Input() loading = false;
  @Input() serverError = '';
  @Output() next = new EventEmitter<BusinessStepData>();

  private readonly fb = inject(FormBuilder);
  readonly submitted = signal(false);

  readonly verticalOptions: SelectOption[] = [
    { value: 'barberia', label: 'Barbería' },
    { value: 'peluqueria', label: 'Peluquería' },
    { value: 'manicura', label: 'Manicura / Uñas' },
    { value: 'lashes', label: 'Lashes / Pestañas' },
    { value: 'masajista', label: 'Masajista' },
    { value: 'tatuador', label: 'Tatuador' },
    { value: 'entrenador_personal', label: 'Entrenador personal' },
    { value: 'peluqueria_canina', label: 'Peluquería canina' },
    { value: 'otro', label: 'Otro' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    vertical: ['', [Validators.required]],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
  });

  private slugTouchedManually = false;

  constructor() {
    this.form.controls.name.valueChanges.subscribe(() => this.onNameInput());
    this.form.controls.slug.valueChanges.subscribe(() => {
      // Si el usuario edita el slug directamente, dejamos de autogenerarlo desde el nombre.
      this.slugTouchedManually = true;
    });
  }

  onNameInput(): void {
    if (this.slugTouchedManually) return;
    const slug = this.form.controls.name.value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    this.form.controls.slug.setValue(slug, { emitEvent: false });
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.next.emit(this.form.getRawValue());
  }
}
