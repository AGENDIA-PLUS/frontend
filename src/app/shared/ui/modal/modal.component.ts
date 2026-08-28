import { Component, EventEmitter, HostListener, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" (click)="close.emit()">
      <div class="modal" [class.modal--wide]="wide" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <header class="modal__header">
          <h2>{{ title }}</h2>
          <button class="modal__close" type="button" (click)="close.emit()" aria-label="Cerrar">×</button>
        </header>
        <div class="modal__body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
  styleUrl: './modal.component.scss',
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() title = '';
  @Input() wide = false;
  @Output() close = new EventEmitter<void>();

  // Bloqueo de scroll del fondo (sección "el sidebar debe quedarse fijo
  // mientras el modal se desplaza"): sin esto, con un modal de contenido
  // largo el navegador desplaza la página ENTERA de detrás (sidebar
  // incluido) en vez de moverse solo dentro de la caja del modal — el
  // max-height/overflow del propio modal no evita que la página de fondo
  // también se desplace si el gesto de scroll ocurre sobre el backdrop en
  // vez de sobre el cuerpo del modal. Se guarda el valor previo por si
  // hubiera más de un modal abierto a la vez (poco común, pero por si acaso
  // no se pisan al cerrarse en distinto orden).
  private previousBodyOverflow = '';

  ngOnInit(): void {
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
  }

  ngOnDestroy(): void {
    document.body.style.overflow = this.previousBodyOverflow;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close.emit();
  }
}
