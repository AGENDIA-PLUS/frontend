import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LegalLayoutComponent } from './legal-layout.component';

@Component({
  selector: 'app-privacy-page',
  standalone: true,
  imports: [CommonModule, LegalLayoutComponent],
  template: `
    <app-legal-layout>
      <div class="legal-prose">
        <h1>Política de Privacidad</h1>
        <p class="legal-prose__updated">Última actualización: [fecha] — borrador pendiente de revisión legal.</p>

        <h2>1. Quiénes somos</h2>
        <p>
          [Nombre de la empresa/autónomo], con domicilio en [dirección] y NIF/CIF [número],
          es el responsable del tratamiento de los datos personales que se recogen a través
          de esta plataforma ("Agendia").
        </p>

        <h2>2. Qué datos recogemos</h2>
        <ul>
          <li>Datos de cuenta: nombre, email, contraseña (cifrada), teléfono.</li>
          <li>Datos del negocio: nombre, dirección, horarios, servicios, profesionales.</li>
          <li>Datos de clientes finales: nombre, teléfono, email, historial de citas.</li>
          <li>Datos de facturación: gestionados por Stripe, nunca almacenamos números de tarjeta.</li>
          <li>Datos técnicos: dirección IP, tipo de navegador, cookies estrictamente necesarias.</li>
        </ul>

        <h2>3. Con qué finalidad tratamos tus datos</h2>
        <ul>
          <li>Prestar el servicio de gestión de citas y agenda.</li>
          <li>Enviar confirmaciones y recordatorios por WhatsApp o email.</li>
          <li>Gestionar la relación contractual y la facturación.</li>
          <li>Cumplir obligaciones legales y fiscales.</li>
        </ul>

        <h2>4. Encargados de tratamiento</h2>
        <p>
          Utilizamos proveedores externos para prestar el servicio, que actúan como
          encargados de tratamiento bajo contrato: Meta (WhatsApp Business API), Stripe
          (procesamiento de pagos), y el proveedor de infraestructura donde se alojan los
          datos. [Completar con la lista definitiva antes de publicar.]
        </p>

        <h2>5. Cuánto tiempo conservamos los datos</h2>
        <p>
          Los datos se conservan mientras exista una relación contractual activa, y
          posteriormente durante los plazos exigidos por la normativa fiscal y mercantil
          aplicable. [Definir plazos concretos con asesoría legal.]
        </p>

        <h2>6. Tus derechos</h2>
        <p>
          Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición,
          limitación y portabilidad escribiendo a [email de contacto]. También puedes
          solicitar la exportación de tus datos en cualquier momento desde tu cuenta.
        </p>

        <h2>7. Cookies</h2>
        <p>
          Esta plataforma utiliza únicamente cookies técnicas estrictamente necesarias para
          el funcionamiento del servicio (sesión, autenticación). No utilizamos cookies de
          publicidad ni de seguimiento de terceros.
        </p>

        <h2>8. Comunicaciones por WhatsApp</h2>
        <p>
          Si tu negocio activa las notificaciones por WhatsApp, los mensajes se envían a
          través de la API oficial de WhatsApp Business de Meta. Meta actúa como encargado
          de tratamiento de los mensajes enviados y recibidos a través de su plataforma,
          conforme a sus propias condiciones.
        </p>
      </div>
    </app-legal-layout>
  `,
  styleUrl: './legal-prose.scss',
})
export class PrivacyPageComponent {}
