import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ServicesService } from '../../core/services/services.service';
import { StaffService } from '../../core/services/staff.service';
import { Service, Staff } from '../../core/models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { ServiceFormModalComponent } from './components/service-form-modal/service-form-modal.component';
import { formatDurationMin } from '../../shared/utils/duration.util';

@Component({
  selector: 'app-services-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    ServiceFormModalComponent,
  ],
  template: `
    <div class="services">
      <header class="services__header">
        <div>
          <h1>Servicios</h1>
          <p>Los servicios que ofreces, su duración, precio y quién puede realizarlos.</p>
        </div>
        @if (services().length > 0) {
          <app-button (clicked)="openCreate()">+ Nuevo servicio</app-button>
        }
      </header>

      @if (loading()) {
        <div class="services__grid">
          @for (i of [1, 2, 3]; track i) {
            <app-card>
              <app-skeleton width="60%" height="18px"></app-skeleton>
              <div style="height:10px"></div>
              <app-skeleton width="40%" height="14px"></app-skeleton>
            </app-card>
          }
        </div>
      } @else if (services().length === 0) {
        <app-card>
          @if (error()) {
            <app-empty-state icon="⚠️" title="No se pudieron cargar tus servicios" [description]="error()!">
              <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
            </app-empty-state>
          } @else {
            <app-empty-state icon="✂️" title="Todavía no tienes servicios" description="Crea tu primer servicio para que aparezca en tu página de reservas.">
              <app-button (clicked)="openCreate()">Crear mi primer servicio</app-button>
            </app-empty-state>
          }
        </app-card>
      } @else {
        <div class="services__grid">
          @for (service of services(); track service.id) {
            <app-card [hoverable]="true">
              <div class="service-card">
                <div class="service-card__top">
                  <h3>{{ service.name }}</h3>
                  <app-badge [tone]="service.isActive ? 'success' : 'neutral'">
                    {{ service.isActive ? 'Activo' : 'Inactivo' }}
                  </app-badge>
                </div>

                @if (service.description) {
                  <p class="service-card__description">{{ service.description }}</p>
                }

                <div class="service-card__meta">
                  <span>⏱ {{ formatDuration(service.durationMin) }}</span>
                  <span>💶 {{ service.price }} €</span>
                  @if (service.category) {
                    <span>🏷 {{ service.category }}</span>
                  }
                </div>

                @if (service.staff && service.staff.length > 0) {
                  <div class="service-card__staff">
                    @for (s of service.staff; track s.staff.id) {
                      <span class="service-card__staff-chip">{{ s.staff.fullName }}</span>
                    }
                  </div>
                }

                <div class="service-card__actions">
                  <app-button variant="secondary" size="sm" (clicked)="openEdit(service)">Editar</app-button>
                  <app-button
                    variant="ghost"
                    size="sm"
                    [loading]="togglingId() === service.id"
                    (clicked)="toggleActive(service)"
                  >
                    {{ service.isActive ? 'Desactivar' : 'Activar' }}
                  </app-button>
                </div>
              </div>
            </app-card>
          }
        </div>
      }
    </div>

    @if (modalOpen()) {
      <app-service-form-modal
        [businessId]="business()!.id"
        [service]="editingService()"
        [staff]="staff()"
        (closed)="modalOpen.set(false)"
        (saved)="load()"
      ></app-service-form-modal>
    }
  `,
  styleUrl: './services.page.scss',
})
export class ServicesPageComponent {
  private readonly auth = inject(AuthService);
  private readonly servicesService = inject(ServicesService);
  private readonly staffService = inject(StaffService);

  formatDuration = formatDurationMin;

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly services = signal<Service[]>([]);
  readonly staff = signal<Staff[]>([]);
  readonly togglingId = signal<string | null>(null);

  readonly modalOpen = signal(false);
  readonly editingService = signal<Service | null>(null);

  constructor() {
    if (this.business()) {
      this.load();
      this.staffService.findAll(this.business()!.id).subscribe((list) => this.staff.set(list));
    }
  }

  load(): void {
    const business = this.business();
    if (!business) return;
    this.loading.set(true);
    this.error.set('');
    this.servicesService.findAll(business.id).subscribe({
      next: (list) => {
        this.services.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
      },
    });
  }

  openCreate(): void {
    this.editingService.set(null);
    this.modalOpen.set(true);
  }

  openEdit(service: Service): void {
    this.editingService.set(service);
    this.modalOpen.set(true);
  }

  toggleActive(service: Service): void {
    const business = this.business();
    if (!business) return;
    this.togglingId.set(service.id);
    this.servicesService.setActive(business.id, service.id, !service.isActive).subscribe({
      next: () => {
        this.togglingId.set(null);
        this.load();
      },
      error: () => this.togglingId.set(null),
    });
  }
}
