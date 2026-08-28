import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-testimonials',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="testimonials">
      <div class="testimonials__inner">
        <span class="testimonials__eyebrow">Primeros negocios</span>
        <h2>Estamos empezando junto a los primeros negocios reales</h2>
        <p class="testimonials__subtitle">
          Agendia está validándose con negocios reales ahora mismo — barberías, peluquerías,
          estudios de manicura y más. En cuanto tengamos casos y testimonios verificados,
          aparecerán aquí — nada de reseñas inventadas.
        </p>

        <div class="testimonials__grid">
          @for (slot of placeholderSlots; track slot) {
            <div class="testimonials__card testimonials__card--placeholder">
              <div class="testimonials__quote-mark">“</div>
              <p>Este espacio está reservado para el testimonio de un negocio real que ya use Agendia.</p>
              <div class="testimonials__author">
                <span class="testimonials__avatar"></span>
                <div>
                  <strong>Próximamente</strong>
                  <small>Tu negocio podría ser el primero</small>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './testimonials.component.scss',
})
export class LandingTestimonialsComponent {
  readonly placeholderSlots = [1, 2, 3];
}
