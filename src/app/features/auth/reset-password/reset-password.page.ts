import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, AuthLayoutComponent, InputComponent, ButtonComponent],
  template: `
    <app-auth-layout headline="Crea una nueva contraseña" subheadline="Elige una contraseña segura para tu cuenta.">
      @if (done()) {
        <div class="auth-form">
          <div class="forgot__sent-icon">✅</div>
          <h1>Contraseña actualizada</h1>
          <p class="auth-form__subtitle">Ya puedes iniciar sesión con tu nueva contraseña.</p>
          <app-button routerLink="/login" [full]="true">Iniciar sesión</app-button>
        </div>
      } @else {
        <form class="auth-form" [formGroup]="form" (ngSubmit)="submit()">
          <h1>Nueva contraseña</h1>
          <p class="auth-form__subtitle">Elige una contraseña de al menos 8 caracteres.</p>

          <app-input
            label="Nueva contraseña"
            type="password"
            formControlName="newPassword"
            [error]="submitted() && form.controls.newPassword.invalid ? 'Debe tener al menos 8 caracteres.' : ''"
          ></app-input>

          <app-input
            label="Confirmar contraseña"
            type="password"
            formControlName="confirmPassword"
            [error]="submitted() && passwordsDontMatch() ? 'Las contraseñas no coinciden.' : ''"
          ></app-input>

          @if (serverError()) {
            <p class="auth-form__error">{{ serverError() }}</p>
          }

          <app-button type="submit" size="lg" [full]="true" [loading]="loading()">Guardar nueva contraseña</app-button>

          <p class="auth-form__subtitle">
            <a routerLink="/olvide-contrasena">Pedir un enlace nuevo</a>
          </p>
        </form>
      }
    </app-auth-layout>
  `,
  styleUrl: '../auth-form.scss',
})
export class ResetPasswordPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private token = '';
  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly done = signal(false);
  readonly serverError = signal('');

  readonly form = this.fb.nonNullable.group({
    newPassword: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
  }

  passwordsDontMatch(): boolean {
    const raw = this.form.getRawValue();
    return raw.newPassword !== raw.confirmPassword;
  }

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid || this.passwordsDontMatch()) return;

    this.loading.set(true);
    this.serverError.set('');

    this.auth.resetPassword(this.token, this.form.getRawValue().newPassword).subscribe({
      next: () => {
        this.loading.set(false);
        this.done.set(true);
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo restablecer la contraseña. El enlace puede haber caducado.');
      },
    });
  }
}
