import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VerticalConfig } from '../vertical-landing.data';

@Component({
  selector: 'app-vertical-pain-point',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="pain-point">
      <div class="pain-point__inner">
        <h2>{{ config.painPointTitle }}</h2>
        <p>{{ config.painPointBody }}</p>
      </div>
    </section>
  `,
  styleUrl: './pain-point.component.scss',
})
export class VerticalPainPointComponent {
  @Input({ required: true }) config!: VerticalConfig;
}
