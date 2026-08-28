import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';

@Component({
  selector: 'app-landing-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent],
  template: `
    <header class="nav" [class.nav--scrolled]="scrolled()">
      <div class="nav__inner">
        <a routerLink="/" class="nav__brand">
          <span class="nav__brand-mark">A</span>
          Agendia
        </a>

        <nav class="nav__links" aria-label="Navegación principal">
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#precios">Precios</a>
          <a href="#faq">Preguntas frecuentes</a>
        </nav>

        <div class="nav__actions">
          <a routerLink="/login" class="nav__login">Iniciar sesión</a>
          <app-button size="sm" routerLink="/register">Crear mi agenda gratis</app-button>
        </div>

        <button class="nav__burger" type="button" (click)="menuOpen.set(!menuOpen())" aria-label="Abrir menú">
          <span></span><span></span><span></span>
        </button>
      </div>

      @if (menuOpen()) {
        <div class="nav__mobile">
          <a href="#como-funciona" (click)="menuOpen.set(false)">Cómo funciona</a>
          <a href="#funcionalidades" (click)="menuOpen.set(false)">Funcionalidades</a>
          <a href="#precios" (click)="menuOpen.set(false)">Precios</a>
          <a href="#faq" (click)="menuOpen.set(false)">Preguntas frecuentes</a>
          <a routerLink="/login" (click)="menuOpen.set(false)">Iniciar sesión</a>
          <app-button [full]="true" routerLink="/register" (clicked)="menuOpen.set(false)">Crear mi agenda gratis</app-button>
        </div>
      }
    </header>
  `,
  styleUrl: './navbar.component.scss',
})
export class LandingNavbarComponent {
  scrolled = signal(false);
  menuOpen = signal(false);

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }
}
