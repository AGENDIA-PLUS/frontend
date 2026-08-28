import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type BadgeTone = 'neutral' | 'success' | 'warning' | 'danger' | 'primary';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="badge" [class]="'badge--' + tone">
      <ng-content></ng-content>
    </span>
  `,
  styleUrl: './badge.component.scss',
})
export class BadgeComponent {
  @Input() tone: BadgeTone = 'neutral';
}
