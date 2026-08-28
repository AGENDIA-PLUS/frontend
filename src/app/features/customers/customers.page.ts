import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { CustomersService } from '../../core/services/customers.service';
import { Customer } from '../../core/models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { InputComponent } from '../../shared/ui/input/input.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { CustomerFormModalComponent } from './components/customer-form-modal/customer-form-modal.component';
import { CustomerDetailModalComponent } from './components/customer-detail-modal/customer-detail-modal.component';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    ButtonComponent,
    CardComponent,
    InputComponent,
    SkeletonComponent,
    EmptyStateComponent,
    CustomerFormModalComponent,
    CustomerDetailModalComponent,
  ],
  template: `
    <div class="customers">
      <header class="customers__header">
        <div>
          <h1>Clientes</h1>
          <p>Todos los clientes que han reservado contigo, con su historial y estadísticas.</p>
        </div>
        @if (customers().length > 0) {
          <app-button (clicked)="openCreate()">+ Nuevo cliente</app-button>
        }
      </header>

      @if (customers().length > 0) {
        <div class="customers__search">
          <app-input placeholder="Buscar por nombre o teléfono..." [(ngModel)]="searchTerm"></app-input>
        </div>
      }

      @if (loading()) {
        <app-card [padded]="false">
          <div class="customers__skeleton-list">
            @for (i of [1, 2, 3, 4]; track i) {
              <div class="customers__skeleton-row">
                <app-skeleton width="40%" height="14px"></app-skeleton>
                <app-skeleton width="20%" height="14px"></app-skeleton>
              </div>
            }
          </div>
        </app-card>
      } @else if (customers().length === 0) {
        <app-card>
          @if (error()) {
            <app-empty-state icon="⚠️" title="No se pudieron cargar tus clientes" [description]="error()!">
              <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
            </app-empty-state>
          } @else {
            <app-empty-state icon="👥" title="Todavía no tienes clientes" description="Los clientes se crean automáticamente cuando reservan, o puedes añadirlos tú mismo.">
              <app-button (clicked)="openCreate()">Añadir mi primer cliente</app-button>
            </app-empty-state>
          }
        </app-card>
      } @else if (filteredCustomers().length === 0) {
        <app-card>
          <app-empty-state icon="🔍" title="Sin resultados" description="Prueba con otro nombre o número de teléfono." />
        </app-card>
      } @else {
        <app-card [padded]="false">
          <ul class="customers__list">
            @for (customer of filteredCustomers(); track customer.id) {
              <li>
                <button type="button" class="customers__row" (click)="openDetail(customer)">
                  <div class="customers__avatar">{{ initials(customer.fullName) }}</div>
                  <div class="customers__info">
                    <strong>{{ customer.fullName }}</strong>
                    <small>{{ customer.phone ?? 'Sin teléfono' }}</small>
                  </div>
                  <span class="customers__since">Desde {{ customer.createdAt | date: 'MMM yyyy' }}</span>
                </button>
              </li>
            }
          </ul>
        </app-card>
      }
    </div>

    @if (formModalOpen()) {
      <app-customer-form-modal
        [businessId]="business()!.id"
        [customer]="editingCustomer()"
        (closed)="formModalOpen.set(false)"
        (saved)="load()"
      ></app-customer-form-modal>
    }

    @if (detailModalOpen() && selectedCustomerId()) {
      <app-customer-detail-modal
        [businessId]="business()!.id"
        [customerId]="selectedCustomerId()!"
        (closed)="detailModalOpen.set(false)"
        (edit)="switchToEdit()"
      ></app-customer-detail-modal>
    }
  `,
  styleUrl: './customers.page.scss',
})
export class CustomersPageComponent {
  private readonly auth = inject(AuthService);
  private readonly customersService = inject(CustomersService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly customers = signal<Customer[]>([]);
  searchTerm = '';

  readonly formModalOpen = signal(false);
  readonly editingCustomer = signal<Customer | null>(null);
  readonly detailModalOpen = signal(false);
  readonly selectedCustomerId = signal<string | null>(null);

  readonly filteredCustomers = computed(() => {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.customers();
    return this.customers().filter(
      (c) => c.fullName.toLowerCase().includes(term) || c.phone?.toLowerCase().includes(term),
    );
  });

  constructor() {
    if (this.business()) this.load();
  }

  load(): void {
    const business = this.business();
    if (!business) return;
    this.loading.set(true);
    this.error.set('');
    this.customersService.findAll(business.id).subscribe({
      next: (list) => {
        this.customers.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
      },
    });
  }

  openCreate(): void {
    this.editingCustomer.set(null);
    this.formModalOpen.set(true);
  }

  openDetail(customer: Customer): void {
    this.selectedCustomerId.set(customer.id);
    this.detailModalOpen.set(true);
  }

  switchToEdit(): void {
    const customer = this.customers().find((c) => c.id === this.selectedCustomerId());
    if (!customer) return;
    this.detailModalOpen.set(false);
    this.editingCustomer.set(customer);
    this.formModalOpen.set(true);
  }

  initials(fullName: string): string {
    return fullName
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}
