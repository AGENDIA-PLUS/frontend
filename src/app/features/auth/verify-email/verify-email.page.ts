import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthLayoutComponent } from '../auth-layout.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-email-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AuthLayoutComponent, ButtonComponent],
  template: `
    <app-auth-layout headline="Verificando tu email" subheadline="Un último paso para confirmar tu cuenta.">
      <div class="auth-form">
        @if (loading()) {
          <div class="forgot__sent-icon">⏳</div>
          <h1>Verificando...</h1>
        } @else if (success()) {
          <div class="forgot__sent-icon">✅</div>
          <h1>¡Email verificado!</h1>
          <p class="auth-form__subtitle">Tu cuenta ya está confirmada.</p>
          <app-button routerLink="/app/dashboard" [full]="true">Ir a mi panel</app-button>
        } @else {
          <div class="forgot__sent-icon">⚠️</div>
          <h1>No se pudo verificar</h1>
          <p class="auth-form__subtitle">{{ errorMessage() }}</p>
          <app-button routerLink="/login" [full]="true">Iniciar sesión</app-button>
        }
      </div>
    </app-auth-layout>
  `,
  styleUrl: '../auth-form.scss',
})
export class VerifyEmailPageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly success = signal(false);
  readonly errorMessage = signal('');

  ngOnInit(): void {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.auth.verifyEmail(token).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        // Si esta pestaña/navegador tiene sesión activa (mismo dispositivo
        // donde se registró), refleja el cambio de inmediato en vez de
        // esperar a que se cierre sesión y se vuelva a entrar.
        this.auth.markEmailVerifiedLocally();
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err?.error?.message ?? 'Este enlace no es válido o ya caducó.');
      },
    });
  }
}
