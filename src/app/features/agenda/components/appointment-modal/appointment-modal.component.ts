import { Component, EventEmitter, Input, OnInit, Output, computed, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { BadgeComponent } from '../../../../shared/ui/badge/badge.component';
import { APPOINTMENT_STATUS_LABEL, APPOINTMENT_STATUS_TONE } from '../../../../shared/ui/status.util';
import { BadgeTone } from '../../../../shared/ui/badge/badge.component';
import { AppointmentsService } from '../../../../core/services/appointments.service';
import { AvailabilityService, StaffAvailability } from '../../../../core/services/availability.service';
import { CustomersService } from '../../../../core/services/customers.service';
import { Appointment, Customer, Service, Staff } from '../../../../core/models';

type Mode = 'view' | 'create' | 'reschedule';

@Component({
  selector: 'app-appointment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, ModalComponent, ButtonComponent, InputComponent, BadgeComponent],
  template: `
    <app-modal [title]="modalTitle()" (close)="closed.emit()">
      @if (mode() === 'view' && appointment) {
        <!-- ------------------------- VISTA / GESTIÓN ------------------------- -->
        <div class="detail">
          <div class="detail__row">
            <app-badge [tone]="statusTone(appointment.status)">{{ statusLabel(appointment.status) }}</app-badge>
            <strong>{{ appointment.startsAt | date: 'EEEE d MMMM, HH:mm' : undefined : 'es' }}</strong>
          </div>

          <div class="detail__block">
            <span class="detail__label">Cliente</span>
            <strong>{{ appointment.customer?.fullName ?? '—' }}</strong>
            @if (appointment.customer?.phone) {
              <small>{{ appointment.customer?.phone }}</small>
            }
          </div>

          <div class="detail__block">
            <span class="detail__label">Servicio y profesional</span>
            <strong>{{ appointment.service?.name ?? '—' }}</strong>
            <small>con {{ appointment.staff?.fullName ?? '—' }}</small>
          </div>

          @if (appointment.notes) {
            <div class="detail__block">
              <span class="detail__label">Notas</span>
              <p>{{ appointment.notes }}</p>
            </div>
          }

          @if (actionError()) {
            <p class="form__error">{{ actionError() }}</p>
          }

          <div class="detail__actions">
            @if (appointment.status === 'PENDING') {
              <app-button variant="secondary" [loading]="actionLoading() === 'confirm'" (clicked)="confirm()">
                Confirmar
              </app-button>
            }
            @if (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') {
              <app-button variant="ghost" (clicked)="startReschedule()">Reprogramar</app-button>
            }
            @if (appointment.status === 'CONFIRMED') {
              <app-button variant="secondary" [loading]="actionLoading() === 'complete'" (clicked)="complete()">
                Marcar completada
              </app-button>
              <app-button variant="ghost" [loading]="actionLoading() === 'noshow'" (clicked)="noShow()">
                No se presentó
              </app-button>
            }
            @if (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') {
              <app-button variant="danger" [loading]="actionLoading() === 'cancel'" (clicked)="cancel()">
                Cancelar cita
              </app-button>
            }
          </div>
        </div>
      } @else {
        <!-- ------------------------- CREAR / REPROGRAMAR ------------------------- -->
        <div class="form">
          @if (mode() === 'create') {
            <div class="form__field">
              <span class="form__label">Cliente</span>
              <app-input placeholder="Buscar por nombre o teléfono..." [(ngModel)]="customerFilter"></app-input>

              @if (!selectedCustomerId()) {
                <div class="customer-list">
                  @for (c of filteredCustomers(); track c.id) {
                    <button type="button" class="customer-item" (click)="selectedCustomerId.set(c.id)">
                      <strong>{{ c.fullName }}</strong>
                      <small>{{ c.phone }}</small>
                    </button>
                  } @empty {
                    <p class="customer-empty">Sin coincidencias. Crea uno nuevo abajo.</p>
                  }
                </div>

                <button type="button" class="new-customer-toggle" (click)="showNewCustomer.set(!showNewCustomer())">
                  {{ showNewCustomer() ? '– Ocultar' : '+ Crear cliente nuevo' }}
                </button>

                @if (showNewCustomer()) {
                  <div class="new-customer">
                    <app-input label="Nombre" [(ngModel)]="newCustomerName" [ngModelOptions]="{ standalone: true }"></app-input>
                    <app-input label="Teléfono" [(ngModel)]="newCustomerPhone" [ngModelOptions]="{ standalone: true }"></app-input>
                    <app-button type="button" size="sm" [loading]="creatingCustomer()" (clicked)="createCustomer()">
                      Crear y seleccionar
                    </app-button>
                  </div>
                }
              } @else {
                <div class="selected-customer">
                  ✓ {{ selectedCustomerName() }}
                  <button type="button" (click)="selectedCustomerId.set(null)">Cambiar</button>
                </div>
              }
            </div>

            <div class="form__field">
              <span class="form__label">Servicio</span>
              <div class="chip-group">
                @for (s of services; track s.id) {
                  <button
                    type="button"
                    class="chip"
                    [class.chip--selected]="selectedServiceId() === s.id"
                    (click)="selectService(s.id)"
                  >
                    {{ s.name }}
                  </button>
                }
              </div>
            </div>

            <div class="form__field">
              <span class="form__label">Profesional</span>
              <div class="chip-group">
                @for (s of staffOptionsForService(); track s.id) {
                  <button
                    type="button"
                    class="chip"
                    [class.chip--selected]="selectedStaffId() === s.id"
                    (click)="selectStaff(s.id)"
                  >
                    {{ s.fullName }}
                  </button>
                } @empty {
                  <p class="chip-empty">Elige primero un servicio.</p>
                }
              </div>
            </div>
          }

          <div class="form__field">
            <span class="form__label">Día</span>
            <input type="date" class="native-date" [(ngModel)]="selectedDate" [ngModelOptions]="{ standalone: true }" (change)="loadAvailability()" />
          </div>

          <div class="form__field">
            <span class="form__label">Hora disponible</span>
            @if (loadingSlots()) {
              <p class="chip-empty">Buscando huecos libres...</p>
            } @else if (availableSlots().length === 0) {
              <p class="chip-empty">No hay huecos disponibles ese día. Prueba otra fecha.</p>
            } @else {
              <div class="chip-group">
                @for (slot of availableSlots(); track slot) {
                  <button
                    type="button"
                    class="chip"
                    [class.chip--selected]="selectedSlot() === slot"
                    (click)="selectedSlot.set(slot)"
                  >
                    {{ slot | date: 'HH:mm' }}
                  </button>
                }
              </div>
            }
          </div>

          @if (actionError()) {
            <p class="form__error">{{ actionError() }}</p>
          }

          <div class="form__actions">
            @if (mode() === 'reschedule') {
              <app-button variant="ghost" type="button" (clicked)="mode.set('view')">Atrás</app-button>
            }
            <app-button
              type="button"
              [full]="mode() === 'create'"
              size="lg"
              [loading]="actionLoading() === 'submit'"
              [disabled]="!canSubmit()"
              (clicked)="submit()"
            >
              {{ mode() === 'create' ? 'Crear cita' : 'Confirmar nueva hora' }}
            </app-button>
          </div>
        </div>
      }
    </app-modal>
  `,
  styleUrl: './appointment-modal.component.scss',
})
export class AppointmentModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input() date = '';
  @Input() services: Service[] = [];
  @Input() staff: Staff[] = [];
  @Input() appointment: Appointment | null = null;

  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly appointmentsService = inject(AppointmentsService);
  private readonly availabilityService = inject(AvailabilityService);
  private readonly customersService = inject(CustomersService);

  readonly mode = signal<Mode>('create');
  readonly actionLoading = signal<'confirm' | 'complete' | 'noshow' | 'cancel' | 'submit' | null>(null);
  readonly actionError = signal('');

  // --- Creación ---
  customerFilter = '';
  readonly customers = signal<Customer[]>([]);
  readonly selectedCustomerId = signal<string | null>(null);
  readonly showNewCustomer = signal(false);
  readonly creatingCustomer = signal(false);
  newCustomerName = '';
  newCustomerPhone = '';

  readonly selectedServiceId = signal<string | null>(null);
  readonly selectedStaffId = signal<string | null>(null);
  selectedDate = '';
  readonly selectedSlot = signal<string | null>(null);
  readonly availableSlots = signal<string[]>([]);
  readonly loadingSlots = signal(false);

  readonly filteredCustomers = computed(() => {
    const term = this.customerFilter.trim().toLowerCase();
    if (!term) return this.customers().slice(0, 8);
    return this.customers()
      .filter((c) => c.fullName.toLowerCase().includes(term) || c.phone?.includes(term))
      .slice(0, 8);
  });

  readonly selectedCustomerName = computed(
    () => this.customers().find((c) => c.id === this.selectedCustomerId())?.fullName ?? '',
  );

  readonly staffOptionsForService = computed(() => {
    const service = this.services.find((s) => s.id === this.selectedServiceId());
    if (!service?.staff) return [];
    return service.staff.map((s) => s.staff);
  });

  readonly canSubmit = computed(() => {
    if (this.mode() === 'create') {
      return !!this.selectedCustomerId() && !!this.selectedServiceId() && !!this.selectedStaffId() && !!this.selectedSlot();
    }
    return !!this.selectedSlot();
  });

  modalTitle(): string {
    if (this.mode() === 'reschedule') return 'Reprogramar cita';
    if (this.mode() === 'view') return 'Detalle de la cita';
    return 'Nueva cita';
  }

  ngOnInit(): void {
    this.selectedDate = this.date || new Date().toISOString().slice(0, 10);

    if (this.appointment) {
      this.mode.set('view');
      this.selectedServiceId.set(this.appointment.serviceId);
      this.selectedStaffId.set(this.appointment.staffId);
      this.selectedDate = this.appointment.startsAt.slice(0, 10);
    } else {
      this.mode.set('create');
      this.customersService.findAll(this.businessId).subscribe((list) => this.customers.set(list));
    }
  }

  selectService(id: string): void {
    this.selectedServiceId.set(id);
    this.selectedStaffId.set(null);
    this.availableSlots.set([]);
    this.selectedSlot.set(null);
  }

  selectStaff(id: string): void {
    this.selectedStaffId.set(id);
    this.loadAvailability();
  }

  /**
   * Al pasar a modo reprogramación, servicio/profesional ya vienen fijados
   * desde la cita original (ngOnInit), pero la disponibilidad nunca se había
   * cargado todavía — sin esto, el selector de horas aparecía vacío hasta
   * que el usuario tocaba manualmente el campo de fecha.
   */
  startReschedule(): void {
    this.mode.set('reschedule');
    this.loadAvailability();
  }

  createCustomer(): void {
    if (!this.newCustomerName.trim()) return;
    this.creatingCustomer.set(true);
    this.customersService
      .create(this.businessId, { fullName: this.newCustomerName, phone: this.newCustomerPhone || undefined })
      .subscribe({
        next: (customer) => {
          this.customers.update((list) => [...list, customer]);
          this.selectedCustomerId.set(customer.id);
          this.showNewCustomer.set(false);
          this.creatingCustomer.set(false);
        },
        error: (err) => {
          this.actionError.set(err?.error?.message ?? 'No se pudo crear el cliente.');
          this.creatingCustomer.set(false);
        },
      });
  }

  loadAvailability(): void {
    const serviceId = this.selectedServiceId();
    const staffId = this.selectedStaffId();
    if (!serviceId || !staffId || !this.selectedDate) return;

    this.loadingSlots.set(true);
    this.availableSlots.set([]);
    this.selectedSlot.set(null);

    this.availabilityService.getAvailability(this.businessId, serviceId, this.selectedDate, staffId).subscribe({
      next: (result: StaffAvailability[]) => {
        this.availableSlots.set(result[0]?.slots ?? []);
        this.loadingSlots.set(false);
      },
      error: () => {
        this.loadingSlots.set(false);
      },
    });
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.actionError.set('');
    this.actionLoading.set('submit');

    if (this.mode() === 'create') {
      this.appointmentsService
        .create(this.businessId, {
          customerId: this.selectedCustomerId()!,
          serviceId: this.selectedServiceId()!,
          staffId: this.selectedStaffId()!,
          startsAt: this.selectedSlot()!,
        })
        .subscribe({
          next: () => this.finish(),
          error: (err) => this.fail(err),
        });
    } else if (this.mode() === 'reschedule' && this.appointment) {
      this.appointmentsService
        .reschedule(this.businessId, this.appointment.id, { startsAt: this.selectedSlot()! })
        .subscribe({
          next: () => this.finish(),
          error: (err) => this.fail(err),
        });
    }
  }

  confirm(): void {
    this.runAction('confirm', () => this.appointmentsService.confirm(this.businessId, this.appointment!.id));
  }
  complete(): void {
    this.runAction('complete', () => this.appointmentsService.complete(this.businessId, this.appointment!.id));
  }
  noShow(): void {
    this.runAction('noshow', () => this.appointmentsService.markNoShow(this.businessId, this.appointment!.id));
  }
  cancel(): void {
    this.runAction('cancel', () => this.appointmentsService.cancel(this.businessId, this.appointment!.id));
  }

  private runAction(key: 'confirm' | 'complete' | 'noshow' | 'cancel', call: () => ReturnType<AppointmentsService['confirm']>): void {
    this.actionError.set('');
    this.actionLoading.set(key);
    call().subscribe({
      next: () => this.finish(),
      error: (err) => this.fail(err),
    });
  }

  private finish(): void {
    this.actionLoading.set(null);
    this.saved.emit();
    this.closed.emit();
  }

  private fail(err: any): void {
    this.actionLoading.set(null);
    this.actionError.set(err?.error?.message ?? 'Ha ocurrido un problema. Inténtalo de nuevo.');
  }

  statusLabel(status: Appointment['status']): string {
    return APPOINTMENT_STATUS_LABEL[status];
  }
  statusTone(status: Appointment['status']): BadgeTone {
    return APPOINTMENT_STATUS_TONE[status];
  }
}
