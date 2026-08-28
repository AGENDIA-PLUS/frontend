import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { StaffService } from '../../core/services/staff.service';
import { ServicesService } from '../../core/services/services.service';
import { LocationsService, Location } from '../../core/services/locations.service';
import { Service, Staff } from '../../core/models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { StaffFormModalComponent } from './components/staff-form-modal/staff-form-modal.component';

@Component({
  selector: 'app-staff-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    StaffFormModalComponent,
  ],
  template: `
    <div class="staff-page">
      <header class="staff-page__header">
        <div>
          <h1>Profesionales</h1>
          <p>Quiénes atienden las citas de tu negocio y qué servicios puede realizar cada uno.</p>
        </div>
        @if (staff().length > 0) {
          <app-button (clicked)="openCreate()">+ Nuevo profesional</app-button>
        }
      </header>

      @if (loading()) {
        <div class="staff-page__grid">
          @for (i of [1, 2, 3]; track i) {
            <app-card>
              <app-skeleton width="50%" height="18px"></app-skeleton>
              <div style="height:10px"></div>
              <app-skeleton width="70%" height="14px"></app-skeleton>
            </app-card>
          }
        </div>
      } @else if (staff().length === 0) {
        <app-card>
          @if (error()) {
            <app-empty-state icon="⚠️" title="No se pudieron cargar tus profesionales" [description]="error()!">
              <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
            </app-empty-state>
          } @else {
            <app-empty-state icon="🧑‍💼" title="Todavía no tienes profesionales" description="Añade al primer profesional para poder recibir citas.">
              <app-button (clicked)="openCreate()">Añadir mi primer profesional</app-button>
            </app-empty-state>
          }
        </app-card>
      } @else {
        <div class="staff-page__grid">
          @for (member of staff(); track member.id) {
            <app-card [hoverable]="true">
              <div class="staff-card">
                <div class="staff-card__top">
                  <div class="staff-card__avatar">{{ initials(member.fullName) }}</div>
                  <div>
                    <h3>{{ member.fullName }}</h3>
                    <app-badge [tone]="member.isActive ? 'success' : 'neutral'">
                      {{ member.isActive ? 'Activo' : 'Inactivo' }}
                    </app-badge>
                    @if (member.location) {
                      <span class="staff-card__location">📍 {{ member.location.name }}</span>
                    }
                  </div>
                </div>

                @if (member.services && member.services.length > 0) {
                  <div class="staff-card__services">
                    @for (s of member.services; track s.service.id) {
                      <span class="staff-card__service-chip">{{ s.service.name }}</span>
                    }
                  </div>
                } @else {
                  <p class="staff-card__no-services">Sin servicios asociados todavía.</p>
                }

                <div class="staff-card__actions">
                  <app-button variant="secondary" size="sm" (clicked)="openEdit(member)">Editar</app-button>
                  <app-button
                    variant="ghost"
                    size="sm"
                    [loading]="togglingId() === member.id"
                    (clicked)="toggleActive(member)"
                  >
                    {{ member.isActive ? 'Desactivar' : 'Activar' }}
                  </app-button>
                </div>
              </div>
            </app-card>
          }
        </div>
      }
    </div>

    @if (modalOpen()) {
      <app-staff-form-modal
        [businessId]="business()!.id"
        [staffMember]="editingStaff()"
        [services]="services()"
        [locations]="locations()"
        (closed)="modalOpen.set(false)"
        (saved)="load()"
      ></app-staff-form-modal>
    }
  `,
  styleUrl: './staff.page.scss',
})
export class StaffPageComponent {
  private readonly auth = inject(AuthService);
  private readonly staffService = inject(StaffService);
  private readonly servicesService = inject(ServicesService);
  private readonly locationsService = inject(LocationsService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly staff = signal<Staff[]>([]);
  readonly services = signal<Service[]>([]);
  readonly locations = signal<Location[]>([]);
  readonly togglingId = signal<string | null>(null);

  readonly modalOpen = signal(false);
  readonly editingStaff = signal<Staff | null>(null);

  constructor() {
    if (this.business()) {
      this.load();
      this.servicesService.findAll(this.business()!.id).subscribe((list) => this.services.set(list));
      this.locationsService.findAll(this.business()!.id).subscribe({
        next: (list) => this.locations.set(list),
        // Plan sin multi-location -> 200 con como mucho 1 ubicación, o el
        // negocio simplemente no tiene ninguna todavía: en ambos casos el
        // selector del modal no se muestra (locations.length > 1), así que
        // un fallo aquí no debe romper la carga de profesionales.
        error: () => this.locations.set([]),
      });
    }
  }

  load(): void {
    const business = this.business();
    if (!business) return;
    this.loading.set(true);
    this.error.set('');
    this.staffService.findAll(business.id).subscribe({
      next: (list) => {
        this.staff.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
      },
    });
  }

  openCreate(): void {
    this.editingStaff.set(null);
    this.modalOpen.set(true);
  }

  openEdit(member: Staff): void {
    this.editingStaff.set(member);
    this.modalOpen.set(true);
  }

  toggleActive(member: Staff): void {
    const business = this.business();
    if (!business) return;
    this.togglingId.set(member.id);
    this.staffService.setActive(business.id, member.id, !member.isActive).subscribe({
      next: () => {
        this.togglingId.set(null);
        this.load();
      },
      error: () => this.togglingId.set(null),
    });
  }

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}
