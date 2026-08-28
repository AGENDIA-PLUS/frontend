import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayoutComponent, InputComponent, ButtonComponent],
  template: `
    <app-auth-layout headline="¿Olvidaste tu contraseña?" subheadline="Te enviamos un enlace para restablecerla.">
      @if (sent()) {
        <div class="auth-form">
          <div class="forgot__sent-icon">✉️</div>
          <h1>Revisa tu email</h1>
          <p class="auth-form__subtitle">
            Si <strong>{{ submittedEmail }}</strong> tiene una cuenta con nosotros, te hemos enviado un enlace para
            restablecer tu contraseña. Caduca en 1 hora.
          </p>
          <app-button routerLink="/login" [full]="true">Volver a iniciar sesión</app-button>
        </div>
      } @else {
        <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
          <h1>Recuperar contraseña</h1>
          <p class="auth-form__subtitle">Introduce tu email y te enviaremos un enlace para restablecerla.</p>

          <app-input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            formControlName="email"
            [error]="submitted() && form.controls.email.invalid ? 'Introduce un email válido.' : ''"
          ></app-input>

          <app-button type="submit" size="lg" [full]="true" [loading]="loading()">Enviar enlace</app-button>

          <p class="auth-form__subtitle">
            <a routerLink="/login">Volver a iniciar sesión</a>
          </p>
        </form>
      }
    </app-auth-layout>
  `,
  styleUrl: '../auth-form.scss',
})
export class ForgotPasswordPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly sent = signal(false);
  submittedEmail = '';

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.submittedEmail = this.form.getRawValue().email;

    this.auth.forgotPassword(this.submittedEmail).subscribe({
      next: () => {
        this.loading.set(false);
        this.sent.set(true);
      },
      error: () => {
        // Aunque falle, mostramos el mismo mensaje genérico: no filtramos
        // si el fallo es porque el email no existe o por otro motivo.
        this.loading.set(false);
        this.sent.set(true);
      },
    });
  }
}
