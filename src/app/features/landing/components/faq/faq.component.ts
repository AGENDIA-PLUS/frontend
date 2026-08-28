import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

interface FaqItem {
  question: string;
  answer: string;
}

@Component({
  selector: 'app-landing-faq',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section id="faq" class="faq">
      <div class="faq__inner">
        <div class="faq__heading">
          <span class="faq__eyebrow">Preguntas frecuentes</span>
          <h2>Todo lo que quieres saber antes de empezar</h2>
        </div>

        <div class="faq__list">
          @for (item of items; track item.question; let i = $index) {
            <div class="faq__item">
              <button
                class="faq__question"
                type="button"
                [attr.aria-expanded]="openIndex() === i"
                (click)="toggle(i)"
              >
                {{ item.question }}
                <span class="faq__icon" [class.faq__icon--open]="openIndex() === i">+</span>
              </button>
              @if (openIndex() === i) {
                <p class="faq__answer">{{ item.answer }}</p>
              }
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrl: './faq.component.scss',
})
export class LandingFaqComponent {
  openIndex = signal<number | null>(0);

  toggle(index: number): void {
    this.openIndex.set(this.openIndex() === index ? null : index);
  }

  readonly items: FaqItem[] = [
    {
      question: '¿Necesito tarjeta de crédito para empezar?',
      answer: 'No. El plan Free no requiere tarjeta. Puedes crear tu agenda y probar la plataforma sin compromiso.',
    },
    {
      question: '¿Mis clientes necesitan instalar algo?',
      answer: 'No. Reservan desde una página web normal, optimizada para el móvil, sin descargar ninguna app.',
    },
    {
      question: '¿Cómo funciona lo de WhatsApp exactamente?',
      answer:
        'Cuando se crea, cancela o reprograma una cita, Agendia envía automáticamente el mensaje correspondiente por WhatsApp usando la API oficial de Meta — nunca con métodos no oficiales que puedan bloquear tu número.',
    },
    {
      question: '¿Puedo tener varios profesionales?',
      answer: 'Sí, en los planes Pro y superiores puedes añadir todos los profesionales que necesites, cada uno con su propio horario y servicios.',
    },
    {
      question: '¿Puedo cancelar cuando quiera?',
      answer: 'Sí, no hay permanencia. Puedes cambiar de plan o cancelar tu suscripción en cualquier momento.',
    },
  ];
}
