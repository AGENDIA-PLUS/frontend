# Frontend — Agendia (Angular)

Angular 18 standalone (sin NgModules), organizado por features, con un sistema de
diseño propio en `src/app/styles/` reutilizado en toda la app.

## Cómo ejecutar

```bash
cd frontend
npm install
npm start          # http://localhost:4200, con el backend corriendo en :3000
```

> Nota: igual que con el backend, este código se ha escrito en un entorno sin acceso a
> red ni posibilidad de ejecutar `npm install`/`ng serve`, así que no he podido
> verificarlo en vivo aquí. Está escrito siguiendo las convenciones estándar de
> Angular 18 (standalone components, signals, control flow `@if/@for`), pero conviene
> que confirmes `Build: OK` tras el primer `npm start`.

## Qué está construido (conectado de verdad al backend)

- **Sistema de diseño** (`app/styles/_tokens.scss`, `_mixins.scss`): colores, tipografía,
  espaciado, sombras — una única fuente de verdad visual para toda la app.
- **Componentes UI compartidos** (`shared/ui/`): Button, Input (compatible con Reactive
  Forms), Card, Badge, Toast, EmptyState, Skeleton.
- **Landing page** completa: navbar responsive, hero con mockup de WhatsApp, cómo
  funciona, vista previa de agenda y de la página de reservas, sección de
  automatizaciones, funcionalidades, testimonios (placeholder honesto, sin inventar
  reseñas), precios (los 4 planes de la sección 33 del backlog, marcados como
  orientativos), FAQ, CTA final y footer completo.
- **Auth**: login y registro con formularios reactivos, validación inline, estados de
  carga/error, conectados a `POST /auth/login` y `POST /auth/register` reales.
- **Shell autenticado**: sidebar con navegación a las 9 secciones del producto (solo
  Dashboard está activo; el resto se muestra deshabilitado con una etiqueta "Pronto"
  en vez de enlazar a rutas que no existen todavía o simular contenido).
- **Dashboard**: citas de hoy, contadores (confirmadas/pendientes/canceladas) y próximas
  citas, todo desde `GET /businesses/:id/appointments` real — con loading skeletons,
  estado vacío, y estado de error con reintento. Si el usuario todavía no tiene un
  negocio creado, lo dirige al onboarding en vez de mostrar datos inventados.
- **Onboarding**: wizard de 5 pasos (negocio → horario → primer servicio → primer
  profesional → publicar), cada paso conectado a su endpoint real
  (`POST /businesses`, `PUT /working-hours`, `POST /services`, `POST /staff`,
  `POST /publish`), con barra de progreso, y pantalla final con el enlace público para
  compartir. Tras el registro, el usuario llega aquí automáticamente.
- **Agenda**: vista día (columnas por profesional con citas posicionadas por hora,
  8:00-21:00) y vista semana (7 columnas con lista compacta), navegación
  anterior/hoy/siguiente, todo desde `GET /appointments` real. Modal único que sirve
  para **crear** una cita (búsqueda/creación de cliente, selección de servicio →
  profesional → disponibilidad real vía `GET /availability` → hora) y para **gestionar**
  una existente (confirmar, completar, marcar no-show, cancelar, reprogramar — cada
  acción contra su endpoint real del backend).
- **Servicios**: listado en tarjetas (duración, precio, categoría, profesionales
  asociados), crear/editar en modal, activar/desactivar. Conectado a
  `GET/POST/PATCH /services` y a `.../activate` `.../deactivate`.
- **Profesionales**: mismo patrón que Servicios pero en la dirección inversa (qué
  servicios puede realizar cada profesional), conectado a `GET/POST/PATCH /staff`.

## Componentes de sistema de diseño añadidos en este bloque

- **Select** (`shared/ui/select/`): mismo lenguaje visual que Input, compatible con
  Reactive Forms.
- **Modal** (`shared/ui/modal/`): overlay reutilizable con cierre por click en backdrop
  o tecla Escape, usado por el modal de citas y disponible para cualquier módulo futuro.

## Corrección de un bug de Angular (bindings booleanos)

Los `@Input()` booleanos (`full`, `disabled`, `loading`, `padded`, `hoverable`,
`required`) ahora usan `{ transform: booleanAttribute }`, así que tanto
`<app-button full>` como `<app-button [full]="true">` funcionan correctamente. Antes,
escribir el atributo sin corchetes lo dejaba como un atributo HTML inerte que nunca
llegaba al componente (el valor por defecto `false` nunca cambiaba). Se corrigieron
también los 6 usos existentes que ya estaban escritos con la sintaxis incorrecta.

## Corrección de posicionamiento (importante)

La landing inicial mencionaba "barbería" de forma exclusiva en varios puntos (titular,
subtítulo del hero, "cómo funciona"...). Se corrigió para reflejar la arquitectura real:
un único motor genérico que sirve a barberías, peluquerías, manicuristas, tatuadores,
masajistas, entrenadores personales y peluquerías caninas — con una franja de chips en
el hero listando los verticales soportados. Las landings *específicas* por vertical
(`/agenda-para-barberias`, etc., sección 37 del backlog) siguen pendientes y serán la
vía para el mensaje 100% enfocado en un solo vertical cuando se aborde el SEO.

## Qué falta (por orden de prioridad, según el brief)

1. **Clientes** (listado + ficha con historial/estadísticas).
2. **Página pública de reservas** (el flujo de 5 pasos de cara al cliente final — el
   backend ya funciona, `GET /public/:slug`, ver el enlace que muestra el onboarding).
3. **Citas** (vista de gestión más allá del resumen del dashboard/agenda).
4. **Configuración** del negocio.
5. **Workflows** — base visual EVENTO → CONDICIÓN → ACCIÓN.
6. **Notificaciones** — log de mensajes enviados.

Cada uno de estos módulos ya tiene su API REST terminada y probada en el backend
(ver README raíz); "solo" falta construir la interfaz, siguiendo el mismo patrón que
Dashboard: servicio en `core/services/`, página en `features/<módulo>/`, reutilizando
los componentes de `shared/ui/`.
