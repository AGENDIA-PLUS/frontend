import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LegalLayoutComponent } from './legal-layout.component';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [CommonModule, LegalLayoutComponent],
  template: `
    <app-legal-layout>
      <div class="legal-prose">
        <h1>Términos de Servicio</h1>
        <p class="legal-prose__updated">Última actualización: [fecha] — borrador pendiente de revisión legal.</p>

        <h2>1. Aceptación de los términos</h2>
        <p>
          Al crear una cuenta en Agendia aceptas estos términos. Si no estás de acuerdo, no
          debes utilizar la plataforma.
        </p>

        <h2>2. Descripción del servicio</h2>
        <p>
          Agendia es una plataforma de gestión de citas y agenda para negocios, con página
          de reservas pública, notificaciones automáticas y automatizaciones. El servicio se
          presta "tal cual" y puede evolucionar con el tiempo.
        </p>

        <h2>3. Cuenta y responsabilidad del usuario</h2>
        <ul>
          <li>Eres responsable de mantener la confidencialidad de tu contraseña.</li>
          <li>Eres responsable de la veracidad de los datos que introduces sobre tu negocio.</li>
          <li>No puedes usar la plataforma para actividades ilegales o fraudulentas.</li>
        </ul>

        <h2>4. Planes y facturación</h2>
        <p>
          El plan Free no requiere tarjeta de crédito. Los planes de pago se facturan de
          forma recurrente mensual a través de Stripe. Puedes cancelar tu suscripción en
          cualquier momento desde el Portal de Cliente; la cancelación tiene efecto al final
          del periodo ya pagado. El coste de los mensajes de WhatsApp que superen la
          asignación incluida en tu plan se factura aparte, según las tarifas vigentes en
          cada momento (ver la sección de facturación de tu cuenta).
        </p>

        <h2>5. Datos de tus clientes</h2>
        <p>
          Eres el responsable del tratamiento de los datos de tus propios clientes finales
          (quienes reservan citas contigo). Agendia actúa como encargado de tratamiento de
          esos datos en tu nombre.
        </p>

        <h2>6. Disponibilidad del servicio</h2>
        <p>
          Hacemos esfuerzos razonables para mantener el servicio disponible, pero no
          garantizamos un funcionamiento ininterrumpido. No nos hacemos responsables de
          interrupciones causadas por terceros (por ejemplo, la API de WhatsApp de Meta).
        </p>

        <h2>7. Limitación de responsabilidad</h2>
        <p>
          En la medida permitida por la ley, no seremos responsables de daños indirectos,
          pérdida de beneficios o de datos derivados del uso de la plataforma.
        </p>

        <h2>8. Modificaciones</h2>
        <p>
          Podemos actualizar estos términos. Te avisaremos de cambios sustanciales con
          antelación razonable.
        </p>

        <h2>9. Contacto</h2>
        <p>Para cualquier duda sobre estos términos, escríbenos a [email de contacto].</p>
      </div>
    </app-legal-layout>
  `,
  styleUrl: './legal-prose.scss',
})
export class TermsPageComponent {}
