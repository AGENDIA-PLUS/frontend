import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-stack" role="status" aria-live="polite">
      @for (toast of toastService.toasts(); track toast.id) {
        <div class="toast" [class]="'toast--' + toast.type">
          <span class="toast__icon">
            @switch (toast.type) {
              @case ('success') { ✓ }
              @case ('error') { ✕ }
              @default { ℹ }
            }
          </span>
          <span class="toast__message">{{ toast.message }}</span>
          <button class="toast__close" type="button" (click)="toastService.dismiss(toast.id)" aria-label="Cerrar">
            ×
          </button>
        </div>
      }
    </div>
  `,
  styleUrl: './toast.component.scss',
})
export class ToastContainerComponent {
  protected readonly toastService = inject(ToastService);
}
