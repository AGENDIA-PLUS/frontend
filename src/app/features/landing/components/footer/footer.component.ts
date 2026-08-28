import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer__inner">
        <div class="footer__brand">
          <a routerLink="/" class="footer__logo">
            <img src="/assets/agendia-icon-white.svg" alt="" class="footer__logo-mark" width="30" height="30" />
            Agendia
          </a>
          <p>La forma más sencilla de gestionar las citas de tu negocio y automatizar WhatsApp.</p>
        </div>

        <div class="footer__columns">
          <div class="footer__column">
            <h4>Producto</h4>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#funcionalidades">Funcionalidades</a>
            <a href="#precios">Precios</a>
          </div>
          <div class="footer__column">
            <h4>Verticales</h4>
            <a routerLink="/agenda-para-barberias">Agenda para barberías</a>
            <a routerLink="/agenda-para-peluquerias">Agenda para peluquerías</a>
            <a routerLink="/agenda-para-manicuristas">Agenda para manicuristas</a>
            <a routerLink="/agenda-para-tatuadores">Agenda para tatuadores</a>
          </div>
          <div class="footer__column">
            <h4>Cuenta</h4>
            <a routerLink="/login">Iniciar sesión</a>
            <a routerLink="/register">Crear cuenta</a>
          </div>
          <div class="footer__column">
            <h4>Legal</h4>
            <a routerLink="/privacidad">Privacidad</a>
            <a routerLink="/terminos">Términos de servicio</a>
            <a routerLink="/blog">Blog</a>
          </div>
        </div>
      </div>

      <div class="footer__bottom">
        <p>© {{ year }} Agendia. Todos los derechos reservados.</p>
        <p class="footer__powered">Hecho con ❤️ para pequeños negocios.</p>
      </div>
    </footer>
  `,
  styleUrl: './footer.component.scss',
})
export class LandingFooterComponent {
  readonly year = new Date().getFullYear();
}