import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TeamService, TeamMember, TeamInvitation } from '../../core/services/team.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { InviteModalComponent } from './components/invite-modal/invite-modal.component';

const ROLE_LABEL: Record<string, string> = { OWNER: 'Propietario', ADMIN: 'Admin', STAFF: 'Staff' };

@Component({
  selector: 'app-team-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    InviteModalComponent,
  ],
  template: `
    <div class="team">
      <header class="team__header">
        <div>
          <h1>Equipo</h1>
          <p>Quién tiene acceso a este negocio y con qué rol.</p>
        </div>
        <app-button (clicked)="modalOpen.set(true)">+ Invitar</app-button>
      </header>

      @if (loading()) {
        <app-card>
          <app-skeleton height="160px"></app-skeleton>
        </app-card>
      } @else if (error()) {
        <app-card>
          <app-empty-state icon="⚠️" title="No se pudo cargar el equipo" [description]="error()!">
            <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
          </app-empty-state>
        </app-card>
      } @else {
        <app-card [padded]="false">
          <div class="team__section-title">Miembros</div>
          <ul class="team__list">
            @for (member of members(); track member.id) {
              <li class="team__row">
                <div class="team__avatar">{{ initials(member.user.fullName) }}</div>
                <div class="team__info">
                  <strong>{{ member.user.fullName }}</strong>
                  <small>{{ member.user.email }}</small>
                </div>
                <app-badge [tone]="member.role === 'OWNER' ? 'primary' : 'neutral'">{{ roleLabel(member.role) }}</app-badge>
                @if (member.role !== 'OWNER') {
                  <app-button variant="ghost" size="sm" [loading]="removingId() === member.id" (clicked)="remove(member)">
                    Eliminar
                  </app-button>
                }
              </li>
            }
          </ul>
        </app-card>

        @if (invitations().length > 0) {
          <app-card [padded]="false">
            <div class="team__section-title">Invitaciones pendientes</div>
            <ul class="team__list">
              @for (invitation of invitations(); track invitation.id) {
                <li class="team__row">
                  <div class="team__avatar team__avatar--pending">✉️</div>
                  <div class="team__info">
                    <strong>{{ invitation.email }}</strong>
                    <small>Expira {{ invitation.expiresAt | date: 'd MMM' }}</small>
                  </div>
                  <app-badge tone="warning">{{ roleLabel(invitation.role) }}</app-badge>
                  <app-button
                    variant="ghost"
                    size="sm"
                    [loading]="cancellingId() === invitation.id"
                    (clicked)="cancelInvitation(invitation)"
                  >
                    Cancelar
                  </app-button>
                </li>
              }
            </ul>
          </app-card>
        }

        @if (upgradeHint()) {
          <p class="team__upgrade-hint">
            💡 Invitar más personas requiere el plan Business o superior.
            <a routerLink="/app/configuracion">Ver planes</a>
          </p>
        }
      }
    </div>

    @if (modalOpen()) {
      <app-invite-modal [businessId]="business()!.id" (closed)="modalOpen.set(false)" (saved)="load()"></app-invite-modal>
    }
  `,
  styleUrl: './team.page.scss',
})
export class TeamPageComponent {
  private readonly auth = inject(AuthService);
  private readonly teamService = inject(TeamService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly members = signal<TeamMember[]>([]);
  readonly invitations = signal<TeamInvitation[]>([]);
  readonly modalOpen = signal(false);
  readonly removingId = signal<string | null>(null);
  readonly cancellingId = signal<string | null>(null);

  // Mostrado como pista informativa, no como bloqueo: el modal de invitar ya
  // muestra el error real del backend (con el nombre del plan) si el negocio
  // no tiene la función habilitada, así que aquí basta con un aviso suave.
  readonly upgradeHint = computed(() => this.members().length <= 1);

  constructor() {
    if (this.business()) this.load();
  }

  load(): void {
    const business = this.business();
    if (!business) return;
    this.loading.set(true);
    this.error.set('');

    this.teamService.getTeam(business.id).subscribe({
      next: (summary) => {
        this.members.set(summary.members);
        this.invitations.set(summary.invitations);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
      },
    });
  }

  remove(member: TeamMember): void {
    const business = this.business();
    if (!business) return;
    if (!confirm(`¿Quitar a ${member.user.fullName} de este negocio?`)) return;

    this.removingId.set(member.id);
    this.teamService.removeMember(business.id, member.id).subscribe({
      next: () => {
        this.removingId.set(null);
        this.load();
      },
      error: () => this.removingId.set(null),
    });
  }

  cancelInvitation(invitation: TeamInvitation): void {
    const business = this.business();
    if (!business) return;
    this.cancellingId.set(invitation.id);
    this.teamService.cancelInvitation(business.id, invitation.id).subscribe({
      next: () => {
        this.cancellingId.set(null);
        this.load();
      },
      error: () => this.cancellingId.set(null),
    });
  }

  roleLabel(role: string): string {
    return ROLE_LABEL[role] ?? role;
  }

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}
