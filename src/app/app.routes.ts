import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.page').then((m) => m.LandingPageComponent),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.page').then((m) => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.page').then((m) => m.RegisterPageComponent),
  },
  {
    path: 'olvide-contrasena',
    loadComponent: () =>
      import('./features/auth/forgot-password/forgot-password.page').then((m) => m.ForgotPasswordPageComponent),
    title: 'Recuperar contraseña',
  },
  {
    path: 'restablecer-contrasena/:token',
    loadComponent: () =>
      import('./features/auth/reset-password/reset-password.page').then((m) => m.ResetPasswordPageComponent),
    title: 'Nueva contraseña',
  },
  {
    path: 'verificar-email/:token',
    loadComponent: () => import('./features/auth/verify-email/verify-email.page').then((m) => m.VerifyEmailPageComponent),
    title: 'Verificar email',
  },
  {
    path: 'reservar/:slug',
    loadComponent: () => import('./features/public-booking/public-booking.page').then((m) => m.PublicBookingPageComponent),
    title: 'Reservar cita',
  },
  {
    path: 'invitaciones/:token',
    loadComponent: () =>
      import('./features/accept-invitation/accept-invitation.page').then((m) => m.AcceptInvitationPageComponent),
    title: 'Invitación de equipo',
  },
  {
    path: 'privacidad',
    loadComponent: () => import('./features/legal/privacy.page').then((m) => m.PrivacyPageComponent),
    title: 'Política de Privacidad — Agendia',
  },
  {
    path: 'terminos',
    loadComponent: () => import('./features/legal/terms.page').then((m) => m.TermsPageComponent),
    title: 'Términos de Servicio — Agendia',
  },
  {
    path: 'blog',
    loadComponent: () => import('./features/blog/blog-list.page').then((m) => m.BlogListPageComponent),
    title: 'Blog — Agendia',
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./features/blog/blog-post.page').then((m) => m.BlogPostPageComponent),
  },
  // Landings por vertical (sección 4/37/40): un único motor, contenido de marketing
  // distinto por tipo de negocio. Añadir un vertical nuevo es solo una entrada más
  // en vertical-landing.data.ts + una línea de ruta aquí, sin tocar el resto de la app.
  //
  // Cada vertical tiene además una ruta hija /:city (sección "SEO programático") que
  // combina vertical + ciudad para long-tail SEO ("agenda para barberías en Madrid") —
  // reutiliza el mismo motor de secciones vía VerticalCityLandingPageComponent, sin
  // duplicar ninguna landing a mano por ciudad.
  {
    path: 'agenda-para-barberias',
    loadComponent: () => import('./features/vertical-landing/vertical-landing.page').then((m) => m.VerticalLandingPageComponent),
    data: { vertical: 'barberias' },
  },
  {
    path: 'agenda-para-barberias/:city',
    loadComponent: () =>
      import('./features/vertical-landing/vertical-city-landing.page').then((m) => m.VerticalCityLandingPageComponent),
    data: { vertical: 'barberias' },
  },
  {
    path: 'agenda-para-peluquerias',
    loadComponent: () => import('./features/vertical-landing/vertical-landing.page').then((m) => m.VerticalLandingPageComponent),
    data: { vertical: 'peluquerias' },
  },
  {
    path: 'agenda-para-peluquerias/:city',
    loadComponent: () =>
      import('./features/vertical-landing/vertical-city-landing.page').then((m) => m.VerticalCityLandingPageComponent),
    data: { vertical: 'peluquerias' },
  },
  {
    path: 'agenda-para-manicuristas',
    loadComponent: () => import('./features/vertical-landing/vertical-landing.page').then((m) => m.VerticalLandingPageComponent),
    data: { vertical: 'manicuristas' },
  },
  {
    path: 'agenda-para-manicuristas/:city',
    loadComponent: () =>
      import('./features/vertical-landing/vertical-city-landing.page').then((m) => m.VerticalCityLandingPageComponent),
    data: { vertical: 'manicuristas' },
  },
  {
    path: 'agenda-para-lashes',
    loadComponent: () => import('./features/vertical-landing/vertical-landing.page').then((m) => m.VerticalLandingPageComponent),
    data: { vertical: 'lashes' },
  },
  {
    path: 'agenda-para-lashes/:city',
    loadComponent: () =>
      import('./features/vertical-landing/vertical-city-landing.page').then((m) => m.VerticalCityLandingPageComponent),
    data: { vertical: 'lashes' },
  },
  {
    path: 'agenda-para-masajistas',
    loadComponent: () => import('./features/vertical-landing/vertical-landing.page').then((m) => m.VerticalLandingPageComponent),
    data: { vertical: 'masajistas' },
  },
  {
    path: 'agenda-para-masajistas/:city',
    loadComponent: () =>
      import('./features/vertical-landing/vertical-city-landing.page').then((m) => m.VerticalCityLandingPageComponent),
    data: { vertical: 'masajistas' },
  },
  {
    path: 'agenda-para-tatuadores',
    loadComponent: () => import('./features/vertical-landing/vertical-landing.page').then((m) => m.VerticalLandingPageComponent),
    data: { vertical: 'tatuadores' },
  },
  {
    path: 'agenda-para-tatuadores/:city',
    loadComponent: () =>
      import('./features/vertical-landing/vertical-city-landing.page').then((m) => m.VerticalCityLandingPageComponent),
    data: { vertical: 'tatuadores' },
  },
  {
    path: 'agenda-para-entrenadores-personales',
    loadComponent: () => import('./features/vertical-landing/vertical-landing.page').then((m) => m.VerticalLandingPageComponent),
    data: { vertical: 'entrenadores_personales' },
  },
  {
    path: 'agenda-para-entrenadores-personales/:city',
    loadComponent: () =>
      import('./features/vertical-landing/vertical-city-landing.page').then((m) => m.VerticalCityLandingPageComponent),
    data: { vertical: 'entrenadores_personales' },
  },
  {
    path: 'agenda-para-peluquerias-caninas',
    loadComponent: () => import('./features/vertical-landing/vertical-landing.page').then((m) => m.VerticalLandingPageComponent),
    data: { vertical: 'peluquerias_caninas' },
  },
  {
    path: 'agenda-para-peluquerias-caninas/:city',
    loadComponent: () =>
      import('./features/vertical-landing/vertical-city-landing.page').then((m) => m.VerticalCityLandingPageComponent),
    data: { vertical: 'peluquerias_caninas' },
  },
  {
    path: 'onboarding',
    canActivate: [authGuard],
    loadComponent: () => import('./features/onboarding/onboarding.page').then((m) => m.OnboardingPageComponent),
    title: 'Configura tu negocio — Agendia',
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./features/shell/shell.component').then((m) => m.ShellComponent),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.page').then((m) => m.DashboardPageComponent),
        title: 'Dashboard — Agendia',
      },
      {
        path: 'estadisticas',
        loadComponent: () => import('./features/stats/stats.page').then((m) => m.StatsPageComponent),
        title: 'Estadísticas — Agendia',
      },
      {
        path: 'agenda',
        loadComponent: () => import('./features/agenda/agenda.page').then((m) => m.AgendaPageComponent),
        title: 'Agenda — Agendia',
      },
      {
        path: 'servicios',
        loadComponent: () => import('./features/services/services.page').then((m) => m.ServicesPageComponent),
        title: 'Servicios — Agendia',
      },
      {
        path: 'profesionales',
        loadComponent: () => import('./features/staff/staff.page').then((m) => m.StaffPageComponent),
        title: 'Profesionales — Agendia',
      },
      {
        path: 'clientes',
        loadComponent: () => import('./features/customers/customers.page').then((m) => m.CustomersPageComponent),
        title: 'Clientes — Agendia',
      },
      {
        path: 'citas',
        loadComponent: () => import('./features/appointments/appointments.page').then((m) => m.AppointmentsPageComponent),
        title: 'Citas — Agendia',
      },
      {
        path: 'configuracion',
        loadComponent: () => import('./features/settings/settings.page').then((m) => m.SettingsPageComponent),
        title: 'Configuración — Agendia',
      },
      {
        path: 'workflows',
        loadComponent: () => import('./features/workflows/workflows.page').then((m) => m.WorkflowsPageComponent),
        title: 'Workflows — Agendia',
      },
      {
        path: 'notificaciones',
        loadComponent: () => import('./features/notifications/notifications.page').then((m) => m.NotificationsPageComponent),
        title: 'Notificaciones — Agendia',
      },
      {
        path: 'equipo',
        loadComponent: () => import('./features/team/team.page').then((m) => m.TeamPageComponent),
        title: 'Equipo — Agendia',
      },
      {
        path: 'webhooks',
        loadComponent: () => import('./features/webhooks/webhooks.page').then((m) => m.WebhooksPageComponent),
        title: 'Webhooks — Agendia',
      },
      {
        path: 'ubicaciones',
        loadComponent: () => import('./features/locations/locations.page').then((m) => m.LocationsPageComponent),
        title: 'Ubicaciones — Agendia',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
