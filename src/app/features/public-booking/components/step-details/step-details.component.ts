import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

export interface PublicCustomerData {
  fullName: string;
  phone: string;
  email?: string;
}

@Component({
  selector: 'app-public-step-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputComponent, ButtonComponent],
  template: `
    <form class="step" [formGroup]="form" (ngSubmit)="submit()">
      <h2>Tus datos</h2>
      <p class="step__subtitle">Te enviaremos la confirmación de tu cita por WhatsApp.</p>

      <app-input
        label="Nombre completo"
        placeholder="Tu nombre"
        formControlName="fullName"
        [error]="submitted() && form.controls.fullName.invalid ? 'Introduce tu nombre.' : ''"
      ></app-input>

      <app-input
        label="Teléfono (WhatsApp)"
        type="tel"
        placeholder="+34 600 000 000"
        formControlName="phone"
        [error]="submitted() && form.controls.phone.invalid ? 'Introduce un teléfono válido.' : ''"
      ></app-input>

      <app-input label="Email (opcional)" type="email" placeholder="tu@email.com" formControlName="email"></app-input>

      @if (serverError) {
        <p class="step__error">{{ serverError }}</p>
      }

      <div class="step__nav">
        <app-button variant="ghost" type="button" (clicked)="back.emit()">← Atrás</app-button>
        <app-button type="submit" size="lg" [loading]="loading">Confirmar reserva</app-button>
      </div>
    </form>
  `,
  styleUrl: '../../public-booking.page.scss',
})
export class PublicStepDetailsComponent {
  @Input() loading = false;
  @Input() serverError = '';
  @Output() next = new EventEmitter<PublicCustomerData>();
  @Output() back = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  readonly submitted = signal(false);

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.email]],
  });

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;
    const raw = this.form.getRawValue();
    this.next.emit({ fullName: raw.fullName, phone: raw.phone, email: raw.email || undefined });
  }
}
