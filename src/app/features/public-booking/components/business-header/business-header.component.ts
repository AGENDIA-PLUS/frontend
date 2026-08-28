import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicBusinessResponse } from '../../../../core/services/public-booking.service';

@Component({
  selector: 'app-public-business-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="business-header">
      <div class="business-header__logo">{{ initials() }}</div>
      <div>
        <h1>{{ business.name }}</h1>
        @if (business.description) {
          <p>{{ business.description }}</p>
        }
        @if (business.city) {
          <span class="business-header__location">📍 {{ business.city }}</span>
        }
      </div>
    </header>
  `,
  styleUrl: './business-header.component.scss',
})
export class PublicBusinessHeaderComponent {
  @Input({ required: true }) business!: PublicBusinessResponse['business'];

  initials(): string {
    return this.business.name
      .split(' ')
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  }
}
