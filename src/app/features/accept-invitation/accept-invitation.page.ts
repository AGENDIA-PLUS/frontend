import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TeamService, InvitationPreview } from '../../core/services/team.service';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/ui/card/card.component';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';

const ROLE_LABEL: Record<string, string> = { OWNER: 'Propietario', ADMIN: 'Admin', STAFF: 'Staff' };

@Component({
  selector: 'app-accept-invitation-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CardComponent, ButtonComponent, SkeletonComponent, EmptyStateComponent],
  template: `
    <div class="accept">
      <app-card>
        @if (loading()) {
          <app-skeleton height="140px"></app-skeleton>
        } @else if (error()) {
          <app-empty-state icon="⚠️" title="No se pudo abrir la invitación" [description]="error()!">
            <app-button routerLink="/">Ir a la página principal</app-button>
          </app-empty-state>
        } @else {
          @if (invitation(); as inv){
          <div class="accept__content">
            <div class="accept__icon">👋</div>
            <h1>Te han invitado a {{ inv.businessName }}</h1>
            <p>
              Como <strong>{{ roleLabel(inv.role) }}</strong>, para el email
              <strong>{{ inv.email }}</strong>.
            </p>

            @if (!auth.isAuthenticated()) {
              <p class="accept__hint">
                Inicia sesión o crea una cuenta con ese mismo email para poder aceptar.
              </p>
              <div class="accept__actions">
                <app-button [full]="true" (clicked)="goToLogin()">Iniciar sesión</app-button>
                <app-button variant="secondary" [full]="true" (clicked)="goToRegister()">Crear cuenta</app-button>
              </div>
            } @else {
              @if (acceptError()) {
                <p class="accept__error">{{ acceptError() }}</p>
              }
              <app-button [full]="true" size="lg" [loading]="accepting()" (clicked)="accept()">
                Aceptar invitación
              </app-button>
            }
          </div>
        }
      }
      </app-card>
    </div>
  `,
  styleUrl: './accept-invitation.page.scss',
})
export class AcceptInvitationPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teamService = inject(TeamService);
  protected readonly auth = inject(AuthService);

  private token = '';
  readonly loading = signal(true);
  readonly error = signal('');
  readonly invitation = signal<InvitationPreview | null>(null);
  readonly accepting = signal(false);
  readonly acceptError = signal('');

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token') ?? '';
    this.teamService.getInvitationByToken(this.token).subscribe({
      next: (invitation) => {
        this.invitation.set(invitation);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'Esta invitación no existe o ya no es válida.');
      },
    });
  }

  goToLogin(): void {
    this.router.navigateByUrl(`/login?redirect=/invitaciones/${this.token}`);
  }
  goToRegister(): void {
    this.router.navigateByUrl(`/register?redirect=/invitaciones/${this.token}`);
  }

  accept(): void {
    this.accepting.set(true);
    this.acceptError.set('');
    this.teamService.acceptInvitation(this.token).subscribe({
      next: () => {
        this.accepting.set(false);
        this.router.navigateByUrl('/app/dashboard');
      },
      error: (err) => {
        this.accepting.set(false);
        this.acceptError.set(err?.error?.message ?? 'No se pudo aceptar la invitación.');
      },
    });
  }

  roleLabel(role: string): string {
    return ROLE_LABEL[role] ?? role;
  }
}
