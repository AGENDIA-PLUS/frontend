import { Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ModalComponent } from '../../../../shared/ui/modal/modal.component';
import { InputComponent } from '../../../../shared/ui/input/input.component';
import { SelectComponent, SelectOption } from '../../../../shared/ui/select/select.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { TeamService } from '../../../../core/services/team.service';

@Component({
  selector: 'app-invite-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent, InputComponent, SelectComponent, ButtonComponent],
  template: `
    <app-modal title="Invitar a alguien al equipo" (close)="closed.emit()">
      @if (!inviteUrl()) {
        <form class="form" [formGroup]="form" (ngSubmit)="submit()">
          <app-input
            label="Email"
            type="email"
            placeholder="persona@email.com"
            formControlName="email"
            [error]="submitted() && form.controls.email.invalid ? 'Introduce un email válido.' : ''"
          ></app-input>

          <app-select label="Rol" [options]="roleOptions" formControlName="role"></app-select>

          <p class="form__hint">
            <strong>Admin</strong> puede gestionar todo salvo la facturación. <strong>Staff</strong>
            puede usar la agenda pero no cambiar la configuración del negocio.
          </p>

          @if (serverError()) {
            <p class="form__error">{{ serverError() }}</p>
          }

          <div class="form__actions">
            <app-button variant="ghost" type="button" (clicked)="closed.emit()">Cancelar</app-button>
            <app-button type="submit" [loading]="loading()">Enviar invitación</app-button>
          </div>
        </form>
      } @else {
        <div class="success">
          <div class="success__icon">✅</div>
          <p>Invitación creada. Comparte este enlace si el email no llega:</p>
          <div class="success__link">
            <code>{{ inviteUrl() }}</code>
            <app-button size="sm" variant="secondary" type="button" (clicked)="copyLink()">
              {{ copied() ? '¡Copiado!' : 'Copiar' }}
            </app-button>
          </div>
          <app-button [full]="true" (clicked)="saved.emit(); closed.emit()">Listo</app-button>
        </div>
      }
    </app-modal>
  `,
  styleUrls: ['../../../services/components/service-form-modal/service-form-modal.component.scss', './invite-modal.component.scss'],
})
export class InviteModalComponent {
  @Input({ required: true }) businessId!: string;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);
  private readonly teamService = inject(TeamService);

  readonly submitted = signal(false);
  readonly loading = signal(false);
  readonly serverError = signal('');
  readonly inviteUrl = signal('');
  readonly copied = signal(false);

  readonly roleOptions: SelectOption[] = [
    { value: 'STAFF', label: 'Staff' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['STAFF', [Validators.required]],
  });

  submit(): void {
    this.submitted.set(true);
    if (this.form.invalid) return;

    this.loading.set(true);
    this.serverError.set('');

    const raw = this.form.getRawValue();
    this.teamService.invite(this.businessId, raw.email, raw.role as 'ADMIN' | 'STAFF').subscribe({
      next: (res) => {
        this.loading.set(false);
        this.inviteUrl.set(res.inviteUrl);
      },
      error: (err) => {
        this.loading.set(false);
        this.serverError.set(err?.error?.message ?? 'No se pudo enviar la invitación.');
      },
    });
  }

  copyLink(): void {
    navigator.clipboard?.writeText(this.inviteUrl()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}
