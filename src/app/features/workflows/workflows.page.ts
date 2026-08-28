import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { WorkflowsService } from '../../core/services/workflows.service';
import { ServicesService } from '../../core/services/services.service';
import { StaffService } from '../../core/services/staff.service';
import { Service, Staff, Workflow } from '../../core/models';
import { ButtonComponent } from '../../shared/ui/button/button.component';
import { CardComponent } from '../../shared/ui/card/card.component';
import { BadgeComponent } from '../../shared/ui/badge/badge.component';
import { SkeletonComponent } from '../../shared/ui/skeleton/skeleton.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component';
import { WORKFLOW_ACTION_LABEL, WORKFLOW_TRIGGER_LABEL } from '../../shared/ui/workflow.util';
import { WorkflowFormModalComponent } from './components/workflow-form-modal/workflow-form-modal.component';

@Component({
  selector: 'app-workflows-page',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    SkeletonComponent,
    EmptyStateComponent,
    WorkflowFormModalComponent,
  ],
  template: `
    <div class="workflows">
      <header class="workflows__header">
        <div>
          <h1>Workflows</h1>
          <p>Automatiza acciones cuando ocurre algo: EVENTO → CONDICIÓN → ACCIÓN.</p>
        </div>
        @if (workflows().length > 0) {
          <app-button (clicked)="openCreate()">+ Nuevo workflow</app-button>
        }
      </header>

      @if (loading()) {
        <div class="workflows__grid">
          @for (i of [1, 2]; track i) {
            <app-card>
              <app-skeleton width="50%" height="18px"></app-skeleton>
              <div style="height:10px"></div>
              <app-skeleton width="80%" height="14px"></app-skeleton>
            </app-card>
          }
        </div>
      } @else if (error()) {
        <app-card>
          <app-empty-state icon="⚠️" title="No se pudieron cargar los workflows" [description]="error()!">
            <app-button variant="secondary" (clicked)="load()">Reintentar</app-button>
          </app-empty-state>
        </app-card>
      } @else if (workflows().length === 0) {
        <app-card>
          <app-empty-state
            icon="⚙️"
            title="Todavía no tienes workflows"
            description="Crea tu primera automatización, por ejemplo: al confirmar una cita, esperar 24h y enviar un recordatorio por WhatsApp."
          >
            <app-button (clicked)="openCreate()">Crear mi primer workflow</app-button>
          </app-empty-state>
        </app-card>
      } @else {
        <div class="workflows__grid">
          @for (workflow of workflows(); track workflow.id) {
            <app-card [hoverable]="true">
              <div class="workflow-card">
                <div class="workflow-card__top">
                  <h3>{{ workflow.name }}</h3>
                  <app-badge [tone]="workflow.isActive ? 'success' : 'neutral'">
                    {{ workflow.isActive ? 'Activo' : 'Inactivo' }}
                  </app-badge>
                </div>

                <div class="workflow-card__flow">
                  <span class="workflow-card__chip workflow-card__chip--event">{{ triggerLabel(workflow) }}</span>
                  @for (action of workflow.actions; track action.id) {
                    <span class="workflow-card__arrow">→</span>
                    <span class="workflow-card__chip">{{ actionLabel(action.type) }}</span>
                  }
                </div>

                <div class="workflow-card__actions">
                  <app-button variant="secondary" size="sm" (clicked)="openEdit(workflow)">Editar</app-button>
                  <app-button
                    variant="ghost"
                    size="sm"
                    [loading]="togglingId() === workflow.id"
                    (clicked)="toggleActive(workflow)"
                  >
                    {{ workflow.isActive ? 'Desactivar' : 'Activar' }}
                  </app-button>
                  <app-button variant="danger" size="sm" [loading]="deletingId() === workflow.id" (clicked)="remove(workflow)">
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
      <app-workflow-form-modal
        [businessId]="business()!.id"
        [workflow]="editingWorkflow()"
        [services]="services()"
        [staff]="staff()"
        (closed)="modalOpen.set(false)"
        (saved)="load()"
      ></app-workflow-form-modal>
    }
  `,
  styleUrl: './workflows.page.scss',
})
export class WorkflowsPageComponent {
  private readonly auth = inject(AuthService);
  private readonly workflowsService = inject(WorkflowsService);
  private readonly servicesService = inject(ServicesService);
  private readonly staffService = inject(StaffService);

  readonly business = computed(() => this.auth.activeBusiness());
  readonly loading = signal(false);
  readonly error = signal('');
  readonly workflows = signal<Workflow[]>([]);
  readonly services = signal<Service[]>([]);
  readonly staff = signal<Staff[]>([]);
  readonly togglingId = signal<string | null>(null);
  readonly deletingId = signal<string | null>(null);

  readonly modalOpen = signal(false);
  readonly editingWorkflow = signal<Workflow | null>(null);

  constructor() {
    const business = this.business();
    if (business) {
      this.load();
      this.servicesService.findAll(business.id).subscribe((list) => this.services.set(list));
      this.staffService.findAll(business.id).subscribe((list) => this.staff.set(list));
    }
  }

  load(): void {
    const business = this.business();
    if (!business) return;
    this.loading.set(true);
    this.error.set('');
    this.workflowsService.findAll(business.id).subscribe({
      next: (list) => {
        this.workflows.set(list);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Comprueba tu conexión e inténtalo de nuevo.');
      },
    });
  }

  openCreate(): void {
    this.editingWorkflow.set(null);
    this.modalOpen.set(true);
  }

  openEdit(workflow: Workflow): void {
    this.editingWorkflow.set(workflow);
    this.modalOpen.set(true);
  }

  toggleActive(workflow: Workflow): void {
    const business = this.business();
    if (!business) return;
    this.togglingId.set(workflow.id);
    this.workflowsService.setActive(business.id, workflow.id, !workflow.isActive).subscribe({
      next: () => {
        this.togglingId.set(null);
        this.load();
      },
      error: () => this.togglingId.set(null),
    });
  }

  remove(workflow: Workflow): void {
    const business = this.business();
    if (!business) return;
    if (!confirm(`¿Eliminar el workflow "${workflow.name}"? Esta acción no se puede deshacer.`)) return;

    this.deletingId.set(workflow.id);
    this.workflowsService.remove(business.id, workflow.id).subscribe({
      next: () => {
        this.deletingId.set(null);
        this.load();
      },
      error: () => this.deletingId.set(null),
    });
  }

  triggerLabel(workflow: Workflow): string {
    const type = workflow.triggers[0]?.type;
    return type ? WORKFLOW_TRIGGER_LABEL[type] : 'Sin evento';
  }

  actionLabel(type: Workflow['actions'][number]['type']): string {
    return WORKFLOW_ACTION_LABEL[type];
  }
}
