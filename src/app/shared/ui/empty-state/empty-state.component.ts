import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="empty-state">
      <div class="empty-state__icon" aria-hidden="true">{{ icon }}</div>
      <h3 class="empty-state__title">{{ title }}</h3>
      @if (description) {
        <p class="empty-state__description">{{ description }}</p>
      }
      <div class="empty-state__action">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrl: './empty-state.component.scss',
})
export class EmptyStateComponent {
  @Input() icon = '📭';
  @Input() title = 'Todavía no hay nada aquí';
  @Input() description = '';
}
