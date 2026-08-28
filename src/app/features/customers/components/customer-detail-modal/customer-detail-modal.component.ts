import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { SkeletonComponent } from '../../../../shared/ui/skeleton/skeleton.component';
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_TONE } from '../../../../shared/ui/status.util';
import { BadgeTone } from '../../../../shared/ui/badge/badge.component';
import { CustomersService, CustomerProfile } from '../../../../core/services/customers.service';
import { Appointment } from '../../../../core/models';

@Component({
  selector: 'app-customer-detail-modal',
  standalone: true,
  imports: [CommonModule, DatePipe, ModalComponent, BadgeComponent, ButtonComponent, SkeletonComponent],
  template: `
    <app-modal title="Ficha del cliente" [wide]="true" (close)="closed.emit()">
      @if (loading()) {
        <app-skeleton height="220px"></app-skeleton>
      } @else {
        @if (profile(); as p) {
          <div class="detail">
            <div class="detail__header">
              <div>
                <h3>{{ p.customer.fullName }}</h3>
                <p class="detail__contact">
                  @if (p.customer.phone) {
                    <span>📞 {{ p.customer.phone }}</span>
                  }
                  @if (p.customer.email) {
                    <span>✉️ {{ p.customer.email }}</span>
                  }
                </p>
              </div>
              <app-button variant="secondary" size="sm" (clicked)="edit.emit()">Editar datos</app-button>
            </div>

            @if (p.customer.notes) {
              <p class="detail__notes">📝 {{ p.customer.notes }}</p>
            }

            <div class="detail__stats">
              <div class="stat">
                <span>Citas totales</span>
                <strong>{{ p.stats.totalAppointments }}</strong>
              </div>
              <div class="stat">
                <span>Cancelaciones</span>
                <strong>{{ p.stats.cancellations }}</strong>
              </div>
              <div class="stat">
                <span>No-shows</span>
                <strong>{{ p.stats.noShows }}</strong>
              </div>
              <div class="stat">
                <span>Última cita</span>
                <strong>{{ p.stats.lastAppointmentAt ? (p.stats.lastAppointmentAt | date: 'd MMM') : '—' }}</strong>
              </div>
            </div>

            <div class="detail__extra">
              <span><strong>Servicio favorito:</strong> {{ p.stats.favoriteService ?? 'Todavía no hay suficiente historial' }}</span>
              <span><strong>Profesional habitual:</strong> {{ p.stats.usualStaff ?? 'Todavía no hay suficiente historial' }}</span>
            </div>

            <h4 class="detail__history-title">Historial de citas</h4>
            @if (p.history.length === 0) {
              <p class="detail__empty">Este cliente todavía no tiene citas registradas.</p>
            } @else {
              <ul class="history-list">
                @for (appt of p.history; track appt.id) {
                  <li class="history-item">
                    <div>
                      <strong>{{ appt.startsAt | date: 'd MMM yyyy, HH:mm' }}</strong>
                      <small>{{ appt.service?.name }} · {{ appt.staff?.fullName }}</small>
                    </div>
                    <app-badge [tone]="statusTone(appt.status)">{{ statusLabel(appt.status) }}</app-badge>
                  </li>
                }
              </ul>
            }
          </div>
        } @else {
          <!-- La carga terminó pero no hay perfil: la petición falló. Sin
               esta rama, el modal se quedaba en blanco y sin explicación. -->
          <div class="detail__empty">
            <p>No se pudo cargar la información del cliente. Cierra e inténtalo de nuevo.</p>
          </div>
        }
      }
    </app-modal>
  `,
  styleUrl: './customer-detail-modal.component.scss',
})
export class CustomerDetailModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input({ required: true }) customerId!: string;
  @Output() closed = new EventEmitter<void>();
  @Output() edit = new EventEmitter<void>();

  private readonly customersService = inject(CustomersService);

  readonly loading = signal(false);
  readonly profile = signal<CustomerProfile | null>(null);

  ngOnInit(): void {
    this.loading.set(true);
    this.customersService.getProfile(this.businessId, this.customerId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: () => {
        this.profile.set(null);
        this.loading.set(false);
      },
    });
  }

  statusLabel(status: Appointment['status']): string {
    return APPOINTMENT_STATUS_LABEL[status];
  }

  statusTone(status: Appointment['status']): BadgeTone {
    return APPOINTMENT_STATUS_TONE[status];
  }
}
