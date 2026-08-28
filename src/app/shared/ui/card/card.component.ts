import { Component, Input, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" [class.card--padded]="padded" [class.card--hoverable]="hoverable">
      <ng-content></ng-content>
    </div>
  `,
  styleUrl: './card.component.scss',
})
export class CardComponent {
  @Input({ transform: booleanAttribute }) padded = true;
  @Input({ transform: booleanAttribute }) hoverable = false;
}
