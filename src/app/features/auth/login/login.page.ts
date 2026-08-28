import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayoutComponent, InputComponent, ButtonComponent],
  template: `
    <app-auth-layout headline="Bienvenido de nuevo." subheadline="Entra para gestionar tu agenda y tus citas de hoy.">
      <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Inicia sesión</h1>
        <p class="auth-form__subtitle">
          ¿Todavía no tienes cuenta?
          <a routerLink="/register">Crea tu agenda gratis</a>
        </p>

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
          placeholder="••••••••"
          formControlName="password"
          [error]="submitted() && form.controls.password.invalid ? 'Introduce tu contraseña.' : ''"
        ></app-input>

        <p class="auth-form__forgot">
          <a routerLink="/olvide-contrasena">¿Olvidaste tu contraseña?</a>
        </p>

        @if (serverError()) {
          <p class="auth-form__error">{{ serverError() }}</p>
        }

        <app-button type="submit" [full]="true" size="lg" [loading]="loading()">Iniciar sesión</app-button>
      </form>
    </app-auth-layout>
  `,
  styleUrl: '../auth-form.scss',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(false);
  readonly submitted = signal(false);
  readonly serverError = signal('');

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  submit(): void {
    this.submitted.set(true);
    this.serverError.set('');

    if (this.form.invalid) return;

    this.loading.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        const redirect = this.route.snapshot.queryParamMap.get('redirect');
        this.router.navigateByUrl(redirect || (this.auth.businesses().length === 0 ? '/onboarding' : '/app'));
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo iniciar sesión.');
      },
    });
  }
}
