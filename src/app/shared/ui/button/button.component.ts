import { Component, EventEmitter, Input, Output, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'whatsapp';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      class="btn"
      [class]="'btn--' + variant + ' btn--' + size"
      [class.btn--full]="full"
      [class.btn--loading]="loading"
      [disabled]="disabled || loading"
      (click)="clicked.emit($event)"
    >
      @if (loading) {
        <span class="btn__spinner" aria-hidden="true"></span>
      }
      <span class="btn__content" [class.btn__content--hidden]="loading">
        <ng-content></ng-content>
      </span>
    </button>
  `,
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() type: 'button' | 'submit' = 'button';
  @Input({ transform: booleanAttribute }) disabled = false;
  @Input({ transform: booleanAttribute }) loading = false;
  @Input({ transform: booleanAttribute }) full = false;
  @Output() clicked = new EventEmitter<MouseEvent>();
}
