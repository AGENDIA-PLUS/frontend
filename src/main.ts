import { bootstrapApplication } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// El pipe `date` se usa en varios sitios con locale 'es' explícito
// (dashboard, agenda, confirmación de reserva pública...) para mostrar
// fechas en español ("jueves, 27 de agosto"). Angular necesita que ese
// paquete de datos de idioma se registre explícitamente antes de arrancar
// — sin esto, cualquier uso del pipe con 'es' rompe el componente entero
// con NG0701, aunque el resto de la app funcione bien.
registerLocaleData(localeEs);

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));
