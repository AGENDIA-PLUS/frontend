import { Component, EventEmitter, Input, OnInit, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPreview, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { WORKFLOW_ACTION_LABEL, WORKFLOW_TRIGGER_LABEL } from '../../../../shared/ui/workflow.util';
import { WorkflowsService, WorkflowActionInput } from '../../../../core/services/workflows.service';
import { Service, Staff, Workflow, WorkflowActionType, WorkflowTriggerType } from '../../../../core/models';

interface ActionRow {
  type: WorkflowActionType;
  text: string;
  minutes: number;
  hours: number;
  days: number;
  status: string;
  url: string;
}

const TRIGGER_TYPES: WorkflowTriggerType[] = [
  'APPOINTMENT_CREATED',
  'APPOINTMENT_CONFIRMED',
  'APPOINTMENT_CANCELLED',
  'APPOINTMENT_MODIFIED',
  'APPOINTMENT_COMPLETED',
  'CUSTOMER_CREATED',
  'CUSTOMER_INACTIVE',
];

const ACTION_TYPES: WorkflowActionType[] = ['WAIT', 'SEND_WHATSAPP', 'SEND_EMAIL', 'CHANGE_STATUS', 'CALL_WEBHOOK', 'CREATE_TASK'];

function emptyAction(type: WorkflowActionType): ActionRow {
  return { type, text: '', minutes: 0, hours: 0, days: 0, status: 'COMPLETED', url: '' };
}

@Component({
  selector: 'app-workflow-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPreview,
    ModalComponent,
    InputComponent,
    SelectComponent,
    ButtonComponent,
  ],
  template: `
    <app-modal [title]="workflow ? 'Editar workflow' : 'Nuevo workflow'" [wide]="true" (close)="closed.emit()">
      <div class="wf-form">
        <app-input label="Nombre del workflow" placeholder="Ej: Recordatorio 24h antes" [(ngModel)]="name"></app-input>

        <!-- EVENTO -->
        <div class="wf-form__field">
          <span class="wf-form__label">🟣 Evento (cuándo se dispara)</span>
          <app-select [options]="triggerOptions" [(ngModel)]="triggerType"></app-select>
        </div>

        <!-- CONDICIÓN -->
        <div class="wf-form__field">
          <span class="wf-form__label">🔵 Condición (opcional)</span>
          <div class="wf-form__row">
            <app-select label="Solo si el servicio es" placeholder="Cualquier servicio" [options]="serviceOptions" [(ngModel)]="conditionServiceId"></app-select>
            <app-select label="Solo si el profesional es" placeholder="Cualquier profesional" [options]="staffOptions" [(ngModel)]="conditionStaffId"></app-select>
          </div>
        </div>

        <!-- ACCIONES -->
        <div class="wf-form__field">
          <span class="wf-form__label">🟢 Acciones (en orden) — arrastra ⠿ para reordenar</span>

          <div class="wf-flow" cdkDropList (cdkDropListDropped)="onActionDrop($event)">
            @for (action of actions; track $index; let i = $index) {
              <div class="wf-flow__step" cdkDrag [cdkDragDisabled]="actions.length < 2">
                <div class="wf-flow__step-header">
                  @if (actions.length > 1) {
                    <span class="wf-flow__drag-handle" cdkDragHandle aria-label="Arrastrar para reordenar">⠿</span>
                  }
                  <strong>{{ i + 1 }}. {{ actionLabel(action.type) }}</strong>
                  <button type="button" class="wf-flow__remove" (click)="removeAction(i)">Eliminar</button>
                </div>

                @switch (action.type) {
                  @case ('WAIT') {
                    <div class="wf-form__row wf-form__row--3">
                      <app-input label="Días" type="number" [(ngModel)]="action.days"></app-input>
                      <app-input label="Horas" type="number" [(ngModel)]="action.hours"></app-input>
                      <app-input label="Minutos" type="number" [(ngModel)]="action.minutes"></app-input>
                    </div>
                  }
                  @case ('SEND_WHATSAPP') {
                    <textarea class="wf-form__textarea" rows="2" placeholder="Texto del mensaje..." [(ngModel)]="action.text"></textarea>
                  }
                  @case ('SEND_EMAIL') {
                    <textarea class="wf-form__textarea" rows="2" placeholder="Texto del email..." [(ngModel)]="action.text"></textarea>
                  }
                  @case ('CHANGE_STATUS') {
                    <app-select [options]="statusOptions" [(ngModel)]="action.status"></app-select>
                  }
                  @case ('CALL_WEBHOOK') {
                    <app-input placeholder="https://..." [(ngModel)]="action.url" hint="La entrega real de webhooks llega en una fase posterior; de momento se registra el paso."></app-input>
                  }
                  @case ('CREATE_TASK') {
                    <app-input placeholder="Título de la tarea" [(ngModel)]="action.text" hint="Todavía no existe un módulo de tareas; se deja constancia en el registro de ejecución."></app-input>
                  }
                }

                <div class="wf-flow__drag-preview" *cdkDragPreview>
                  {{ i + 1 }}. {{ actionLabel(action.type) }}
                </div>
              </div>
            } @empty {
              <p class="wf-form__hint">Añade al menos una acción.</p>
            }
          </div>

          <div class="wf-add-action">
            <app-select placeholder="Añadir acción..." [options]="actionTypeOptions" [(ngModel)]="newActionType"></app-select>
            <app-button type="button" variant="secondary" size="sm" (clicked)="addAction()">+ Añadir</app-button>
          </div>
        </div>

        @if (serverError()) {
          <p class="wf-form__error">{{ serverError() }}</p>
        }

        <div class="wf-form__actions">
          <app-button variant="ghost" type="button" (clicked)="closed.emit()">Cancelar</app-button>
          <app-button type="button" [loading]="loading()" (clicked)="submit()">
            {{ workflow ? 'Guardar cambios' : 'Crear workflow' }}
          </app-button>
        </div>
      </div>
    </app-modal>
  `,
  styleUrl: './workflow-form-modal.component.scss',
})
export class WorkflowFormModalComponent implements OnInit {
  @Input({ required: true }) businessId!: string;
  @Input() workflow: Workflow | null = null;
  @Input() services: Service[] = [];
  @Input() staff: Staff[] = [];
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly workflowsService = inject(WorkflowsService);

  readonly loading = signal(false);
  readonly serverError = signal('');

  name = '';
  triggerType: WorkflowTriggerType = 'APPOINTMENT_CREATED';
  conditionServiceId = '';
  conditionStaffId = '';
  actions: ActionRow[] = [emptyAction('WAIT')];
  newActionType: WorkflowActionType = 'SEND_WHATSAPP';

  readonly triggerOptions: SelectOption[] = TRIGGER_TYPES.map((t) => ({ value: t, label: WORKFLOW_TRIGGER_LABEL[t] }));
  readonly actionTypeOptions: SelectOption[] = ACTION_TYPES.map((t) => ({ value: t, label: WORKFLOW_ACTION_LABEL[t] }));
  readonly statusOptions: SelectOption[] = [
    { value: 'CONFIRMED', label: 'Confirmada' },
    { value: 'COMPLETED', label: 'Completada' },
    { value: 'CANCELLED', label: 'Cancelada' },
    { value: 'NO_SHOW', label: 'No-show' },
  ];

  get serviceOptions(): SelectOption[] {
    return this.services.map((s) => ({ value: s.id, label: s.name }));
  }
  get staffOptions(): SelectOption[] {
    return this.staff.map((s) => ({ value: s.id, label: s.fullName }));
  }

  ngOnInit(): void {
    if (this.workflow) {
      this.name = this.workflow.name;
      this.triggerType = this.workflow.triggers[0]?.type ?? 'APPOINTMENT_CREATED';
      const conditions = this.workflow.triggers[0]?.conditions ?? {};
      this.conditionServiceId = (conditions['serviceId'] as string) ?? '';
      this.conditionStaffId = (conditions['staffId'] as string) ?? '';
      this.actions = this.workflow.actions
        .sort((a, b) => a.order - b.order)
        .map((a) => this.actionToRow(a.type, a.config));
    }
  }

  private actionToRow(type: WorkflowActionType, config: Record<string, unknown>): ActionRow {
    const row = emptyAction(type);
    if (type === 'WAIT') {
      row.days = Number(config['days'] ?? 0);
      row.hours = Number(config['hours'] ?? 0);
      row.minutes = Number(config['minutes'] ?? 0);
    } else if (type === 'SEND_WHATSAPP' || type === 'SEND_EMAIL' || type === 'CREATE_TASK') {
      row.text = String(config['text'] ?? '');
    } else if (type === 'CHANGE_STATUS') {
      row.status = String(config['status'] ?? 'COMPLETED');
    } else if (type === 'CALL_WEBHOOK') {
      row.url = String(config['url'] ?? '');
    }
    return row;
  }

  actionLabel(type: WorkflowActionType): string {
    return WORKFLOW_ACTION_LABEL[type];
  }

  addAction(): void {
    this.actions = [...this.actions, emptyAction(this.newActionType)];
  }

  removeAction(index: number): void {
    this.actions = this.actions.filter((_, i) => i !== index);
  }

  /**
   * Drag-and-drop de reordenación (backlog "workflow builder"): antes solo
   * se podía añadir/eliminar acciones en el orden en que se crearon, sin
   * forma de cambiar la secuencia salvo borrar y volver a crear todas desde
   * cero. `moveItemInArray` de @angular/cdk/drag-drop muta el array in situ,
   * así que se reasigna a una copia para que Angular detecte el cambio
   * correctamente con OnPush/signals en otros sitios del proyecto.
   */
  onActionDrop(event: CdkDragDrop<ActionRow[]>): void {
    const updated = [...this.actions];
    moveItemInArray(updated, event.previousIndex, event.currentIndex);
    this.actions = updated;
  }

  private buildActionInputs(): WorkflowActionInput[] {
    return this.actions.map((a) => {
      let config: Record<string, unknown> = {};
      if (a.type === 'WAIT') config = { days: Number(a.days) || 0, hours: Number(a.hours) || 0, minutes: Number(a.minutes) || 0 };
      else if (a.type === 'SEND_WHATSAPP' || a.type === 'SEND_EMAIL' || a.type === 'CREATE_TASK') config = { text: a.text };
      else if (a.type === 'CHANGE_STATUS') config = { status: a.status };
      else if (a.type === 'CALL_WEBHOOK') config = { url: a.url };
      return { type: a.type, config };
    });
  }

  submit(): void {
    if (!this.name.trim() || this.actions.length === 0) {
      this.serverError.set('Ponle un nombre y añade al menos una acción.');
      return;
    }

    this.loading.set(true);
    this.serverError.set('');

    const conditions: Record<string, unknown> = {};
    if (this.conditionServiceId) conditions['serviceId'] = this.conditionServiceId;
    if (this.conditionStaffId) conditions['staffId'] = this.conditionStaffId;

    const payload = {
      name: this.name,
      isActive: this.workflow?.isActive ?? true,
      trigger: { type: this.triggerType, conditions: Object.keys(conditions).length ? conditions : undefined },
      actions: this.buildActionInputs(),
    };

    const request = this.workflow
      ? this.workflowsService.update(this.businessId, this.workflow.id, payload)
      : this.workflowsService.create(this.businessId, payload);

    request.subscribe({
      next: () => {
        this.loading.set(false);
        this.saved.emit();
        this.closed.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo guardar el workflow.');
      },
    });
  }
}
