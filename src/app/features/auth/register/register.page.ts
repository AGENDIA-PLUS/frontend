import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayoutComponent, InputComponent, ButtonComponent],
  template: `
    <app-auth-layout
      headline="Crea tu agenda gratis."
      subheadline="Sin tarjeta de crédito. Publica tu página de reservas en minutos."
    >
      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Crea tu cuenta</h1>
        <p class="auth-form__subtitle">
          ¿Ya tienes cuenta?
          <a routerLink="/login">Inicia sesión</a>
        </p>

        <app-input
          label="Nombre completo"
          placeholder="Joisner Pérez"
          formControlName="fullName"
          [error]="submitted() && form.controls.fullName.invalid ? 'Introduce tu nombre.' : ''"
        ></app-input>

        <app-input
          label="Email"
          type="email"
          placeholder="tu@negocio.com"
          formControlName="email"
          [error]="submitted() && form.controls.email.invalid ? 'Introduce un email válido.' : ''"
        ></app-input>

        <app-input
          label="Contraseña"
          type="password"
          placeholder="Mínimo 8 caracteres"
          formControlName="password"
          hint="Usa al menos 8 caracteres."
          [error]="submitted() && form.controls.password.invalid ? 'La contraseña debe tener al menos 8 caracteres.' : ''"
        ></app-input>

        @if (serverError()) {
          <p class="auth-form__error">{{ serverError() }}</p>
        }

        <app-button type="submit" [full]="true" size="lg" [loading]="loading()">Crear mi agenda gratis</app-button>

        <p class="auth-form__legal">
          Al crear tu cuenta aceptas nuestros Términos de servicio y la Política de privacidad.
        </p>
      </form>
    </app-auth-layout>
  `,
  styleUrl: '../auth-form.scss',
})
export class RegisterPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly serverError = signal('');

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    this.submitted.set(true);
    this.serverError.set('');

    if (this.form.invalid) return;

    this.loading.set(true);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        // Si venía de aceptar una invitación de equipo, respeta ese destino;
        // si no, un usuario recién registrado nunca tiene negocios todavía y
        // va directo al onboarding.
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirect || '/onboarding');
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo crear la cuenta.');
      },
    });
  }
}
