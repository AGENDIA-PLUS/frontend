import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent } from '../../../../shared/ui/card/card.component';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { WhatsAppBotService } from '../../../../core/services/whatsapp-bot.service';

interface ChatBubble {
  from: 'customer' | 'bot';
  text: string;
}

@Component({
  selector: 'app-whatsapp-simulator',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, ButtonComponent],
  template: `
    <app-card>
      <div class="sim__header">
        <h2>Probar el bot</h2>
        <app-button variant="ghost" size="sm" (clicked)="reset()">Reiniciar conversación</app-button>
      </div>
      <p class="sim__hint">
        Simula ser un cliente escribiendo por WhatsApp. Funciona igual que el bot real, sin
        necesidad de tener credenciales de Meta conectadas — perfecto para probar el flujo.
      </p>

      <div class="sim__phone">
        <div class="sim__chat">
          @if (messages().length === 0) {
            <p class="sim__empty">Escribe algo como "quiero una cita" para empezar.</p>
          }
          @for (bubble of messages(); track $index) {
            <div class="sim__bubble" [class.sim__bubble--bot]="bubble.from === 'bot'">
              {{ bubble.text }}
            </div>
          }
          @if (loading()) {
            <div class="sim__bubble sim__bubble--bot sim__bubble--typing">Escribiendo...</div>
          }
        </div>

        <form class="sim__input-row" (ngSubmit)="send()">
          <input
            class="sim__input"
            placeholder="Escribe un mensaje..."
            [(ngModel)]="draft"
            name="draft"
            [disabled]="loading()"
          />
          <app-button type="submit" size="sm" [disabled]="!draft.trim()" [loading]="loading()">Enviar</app-button>
        </form>
      </div>

      @if (error()) {
        <p class="sim__error">{{ error() }}</p>
      }
    </app-card>
  `,
  styleUrl: './whatsapp-simulator.component.scss',
})
export class WhatsAppSimulatorComponent implements OnInit {
  @Input({ required: true }) businessId!: string;

  private readonly whatsAppBotService = inject(WhatsAppBotService);

  readonly messages = signal<ChatBubble[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  draft = '';

  // Número de prueba estable durante la sesión del navegador, para que la
  // conversación mantenga su estado entre mensajes (igual que un cliente
  // real escribiendo desde su móvil).
  private testPhone = '';

  ngOnInit(): void {
    this.testPhone = this.getOrCreateTestPhone();
  }

  send(): void {
    const text = this.draft.trim();
    if (!text) return;

    this.messages.update((list) => [...list, { from: 'customer', text }]);
    this.draft = '';
    this.loading.set(true);
    this.error.set('');

    this.whatsAppBotService.simulate(this.businessId, this.testPhone, text).subscribe({
      next: (res) => {
        this.messages.update((list) => [...list, { from: 'bot', text: res.reply }]);
        this.loading.set(false);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.message ?? 'No se pudo enviar el mensaje.');
      },
    });
  }

  reset(): void {
    this.messages.set([]);
    this.error.set('');
    sessionStorage.removeItem(this.storageKey());
    this.testPhone = this.getOrCreateTestPhone();
  }

  private storageKey(): string {
    return `agendia-sim-phone-${this.businessId}`;
  }

  private getOrCreateTestPhone(): string {
    const key = this.storageKey();
    const existing = sessionStorage.getItem(key);
    if (existing) return existing;
    const phone = `+3460${Math.floor(1000000 + Math.random() * 8999999)}`;
    sessionStorage.setItem(key, phone);
    return phone;
  }
}
