import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LocationsService, Location } from '../../core/services/locations.service';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { LocationFormModalComponent } from './components/location-form-modal/location-form-modal.component';

@Component({
  selector: 'app-locations-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    LocationFormModalComponent,
  ],
  template: `
    <div class="locations">
      <header class="locations__header">
        <div>
          <h1>Ubicaciones</h1>
          <p>Gestiona las distintas sucursales de tu negocio y asigna profesionales a cada una.</p>
        </div>
        <app-button (clicked)="openCreate()">+ Nueva ubicación</app-button>
      </header>

      @if (loading()) {
        <app-card>
          <app-skeleton height="140px"></app-skeleton>
        </app-card>
      } @else if (upgradeNeeded()) {
        <app-card>
          <app-empty-state
            icon="🏢"
            title="Solo puedes tener 1 ubicación en tu plan actual"
            description="Mejora a Multi-location para gestionar varias sucursales desde la misma cuenta."
          >
            <app-button routerLink="/app/configuracion">Ver planes</app-button>
          </app-empty-state>
        </app-card>
      } @else if (error()) {
        <app-card>
          <app-empty-state icon="⚠️" title="No se pudieron cargar las ubicaciones" [description]="error()!">
            <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
          </app-empty-state>
        </app-card>
      } @else if (locations().length === 0) {
        <app-card>
          <app-empty-state
            icon="🏢"
            title="Todavía no tienes ubicaciones"
            description="Crea tu primera sucursal. Después podrás asignar profesionales a cada una desde la pantalla de Profesionales."
          >
            <app-button (clicked)="openCreate()">Crear mi primera ubicación</app-button>
          </app-empty-state>
        </app-card>
      } @else {
        <div class="locations__grid">
          @for (location of locations(); track location.id) {
            <app-card>
              <div class="location-card">
                <div class="location-card__top">
                  <h3>{{ location.name }}</h3>
                  <app-badge [tone]="location.isActive ? 'success' : 'neutral'">
                    {{ location.isActive ? 'Activa' : 'Inactiva' }}
                  </app-badge>
                </div>
                @if (location.address || location.city) {
                  <p class="location-card__address">
                    {{ location.address }}{{ location.address && location.city ? ', ' : '' }}{{ location.city }}
                  </p>
                }
                <div class="location-card__actions">
                  <app-button variant="secondary" size="sm" (clicked)="openEdit(location)">Editar</app-button>
                  <app-button
                    variant="ghost"
                    size="sm"
                    [loading]="togglingId() === location.id"
                    (clicked)="toggleActive(location)"
                  >
                    {{ location.isActive ? 'Desactivar' : 'Activar' }}
                  </app-button>
                  <app-button variant="danger" size="sm" [loading]="deletingId() === location.id" (clicked)="remove(location)">
                    Eliminar
                  </app-button>
                </div>
              </div>
            </app-card>
          }
        </div>
      }
    </div>

    @if (modalOpen()) {
      <app-location-form-modal
        [businessId]="business()!.id"
        [location]="editingLocation()"
        (closed)="modalOpen.set(false)"
        (saved)="load()"
      ></app-location-form-modal>
    }
  `,
  styleUrl: './locations.page.scss',
})
export class LocationsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly locationsService = inject(LocationsService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly upgradeNeeded = signal(false);
  readonly locations = signal<Location[]>([]);

  readonly modalOpen = signal(false);
  readonly editingLocation = signal<Location | null>(null);
  readonly togglingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  constructor() {
    if (this.business()) this.load();
  }

  load(): void {
    const business = this.business();
    if (!business) return;

    this.loading.set(true);
    this.error.set('');
    this.upgradeNeeded.set(false);

    this.locationsService.findAll(business.id).subscribe({
      next: (list) => {
        this.locations.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
      },
    });
  }

  openCreate(): void {
    this.editingLocation.set(null);
    this.modalOpen.set(true);
  }

  openEdit(location: Location): void {
    this.editingLocation.set(location);
    this.modalOpen.set(true);
  }

  toggleActive(location: Location): void {
    const business = this.business();
    if (!business) return;
    this.togglingId.set(location.id);
    this.locationsService.update(business.id, location.id, { isActive: !location.isActive }).subscribe({
      next: () => {
        this.togglingId.set(null);
        this.load();
      },
      error: (err) => {
        this.togglingId.set(null);
        if (err.status === 403) {
          this.upgradeNeeded.set(true);
        }
      },
    });
  }

  remove(location: Location): void {
    const business = this.business();
    if (!business) return;
    if (!confirm(`¿Eliminar "${location.name}"? Los profesionales asignados quedarán sin ubicación, no se eliminan.`)) return;

    this.deletingId.set(location.id);
    this.locationsService.remove(business.id, location.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => this.deletingId.set(null),
    });
  }
}
