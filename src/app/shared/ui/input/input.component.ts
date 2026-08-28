import { Component, Input, forwardRef, booleanAttribute } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let uid = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="field">
      @if (label) {
        <label [for]="id" class="field__label">
          {{ label }}
          @if (required) {
            <span class="field__required" aria-hidden="true">*</span>
          }
        </label>
      }
      <div class="field__control" [class.field__control--error]="error">
        @if (prefixIcon) {
          <span class="field__icon">{{ prefixIcon }}</span>
        }
        <input
          [id]="id"
          [type]="type"
          [placeholder]="placeholder"
          [value]="value"
          [disabled]="disabled"
          [attr.aria-invalid]="!!error"
          [attr.aria-describedby]="error ? id + '-error' : null"
          (input)="onInput($event)"
          (blur)="onTouched()"
        />
      </div>
      @if (error) {
        <p class="field__error" [id]="id + '-error'">{{ error }}</p>
      } @else if (hint) {
        <p class="field__hint">{{ hint }}</p>
      }
    </div>
  `,
  styleUrl: './input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label = '';
  @Input() placeholder = '';
  @Input() type: 'text' | 'email' | 'password' | 'tel' | 'number' = 'text';
  @Input() hint = '';
  @Input() error = '';
  @Input({ transform: booleanAttribute }) required = false;
  @Input() prefixIcon = '';

  readonly id = `app-input-${uid++}`;
  value = '';
  disabled = false;

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  onInput(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }
  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
