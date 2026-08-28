import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="skeleton skeleton-pulse" [style.width]="width" [style.height]="height" [style.border-radius]="radius"></div>`,
  styles: [
    `
      .skeleton {
        background: var(--color-gray-200);
        display: block;
      }
    `,
  ],
})
export class SkeletonComponent {
  @Input() width = '100%';
  @Input() height = '16px';
  @Input() radius = 'var(--radius-sm)';
}
