export interface VerticalConfig {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  businessNameSingular: string; // "barbería", "peluquería"...
  headline: string;
  headlineAccent: string;
  subheadline: string;
  exampleServiceName: string; // usado en el mockup de chat y la tarjeta flotante
  exampleServicePrice: string;
  exampleStaffName: string;
  painPointTitle: string;
  painPointBody: string;
}

// Un único motor SaaS; esto es SOLO contenido de marketing por vertical
// (sección 4 del brief: "NO crear nueve aplicaciones independientes").
export const VERTICAL_CONFIGS: Record<string, VerticalConfig> = {
  barberias: {
    slug: 'barberias',
    metaTitle: 'Agenda y WhatsApp para tu barbería — Agendia',
    metaDescription:
      'Gestiona las citas de tu barbería automáticamente por WhatsApp. Agenda online, recordatorios automáticos y página de reservas en minutos.',
    eyebrow: 'Hecho para barberías',
    businessNameSingular: 'barbería',
    headline: 'Gestiona las citas de tu barbería',
    headlineAccent: 'automáticamente por WhatsApp',
    subheadline:
      'Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme, recuerde y gestione las citas de tus clientes por ti.',
    exampleServiceName: 'Corte + barba',
    exampleServicePrice: '22',
    exampleStaffName: 'Joisner',
    painPointTitle: '¿Sigues confirmando citas una por una por WhatsApp?',
    painPointBody:
      'Entre cortes no tienes tiempo de contestar al momento, y cada minuto que tarda tu cliente en tener respuesta es una cita que se puede perder.',
  },
  peluquerias: {
    slug: 'peluquerias',
    metaTitle: 'Agenda y WhatsApp para tu peluquería — Agendia',
    metaDescription:
      'Gestiona las citas de tu peluquería automáticamente por WhatsApp. Agenda online, recordatorios automáticos y página de reservas en minutos.',
    eyebrow: 'Hecho para peluquerías',
    businessNameSingular: 'peluquería',
    headline: 'Gestiona las citas de tu peluquería',
    headlineAccent: 'automáticamente por WhatsApp',
    subheadline:
      'Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme, recuerde y gestione las citas de tus clientas por ti.',
    exampleServiceName: 'Corte y color',
    exampleServicePrice: '45',
    exampleStaffName: 'Ana',
    painPointTitle: '¿Se te acumulan los mensajes de WhatsApp sin contestar?',
    painPointBody:
      'Entre clienta y clienta es difícil estar pendiente del móvil, y cada mensaje sin responder es una cita que se puede ir a la competencia.',
  },
  manicuristas: {
    slug: 'manicuristas',
    metaTitle: 'Agenda y WhatsApp para tu estudio de manicura — Agendia',
    metaDescription:
      'Gestiona las citas de tu estudio de uñas automáticamente por WhatsApp. Agenda online, recordatorios automáticos y página de reservas en minutos.',
    eyebrow: 'Hecho para estudios de manicura',
    businessNameSingular: 'estudio de manicura',
    headline: 'Gestiona las citas de tu estudio de uñas',
    headlineAccent: 'automáticamente por WhatsApp',
    subheadline:
      'Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme, recuerde y gestione las citas de tus clientas por ti.',
    exampleServiceName: 'Manicura semipermanente',
    exampleServicePrice: '25',
    exampleStaffName: 'Laura',
    painPointTitle: '¿Un hueco cancelado se queda vacío hasta la próxima cita?',
    painPointBody:
      'Cuando alguien cancela a última hora, ese rato sin trabajar es dinero que no vuelve. Automatizar los recordatorios reduce los olvidos.',
  },
  lashes: {
    slug: 'lashes',
    metaTitle: 'Agenda y WhatsApp para tu estudio de pestañas — Agendia',
    metaDescription:
      'Gestiona las citas de tu estudio de lashes automáticamente por WhatsApp. Agenda online, recordatorios automáticos y página de reservas en minutos.',
    eyebrow: 'Hecho para estudios de lashes',
    businessNameSingular: 'estudio de pestañas',
    headline: 'Gestiona las citas de tu estudio de lashes',
    headlineAccent: 'automáticamente por WhatsApp',
    subheadline:
      'Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme, recuerde y gestione las citas de tus clientas por ti.',
    exampleServiceName: 'Extensión de pestañas',
    exampleServicePrice: '35',
    exampleStaffName: 'Sofía',
    painPointTitle: '¿Tus sesiones son largas y un no-show te descuadra el día?',
    painPointBody:
      'Una sesión de lashes ocupa mucho tiempo: un recordatorio automático 24h antes reduce los olvidos y protege tu agenda.',
  },
  masajistas: {
    slug: 'masajistas',
    metaTitle: 'Agenda y WhatsApp para tu centro de masajes — Agendia',
    metaDescription:
      'Gestiona las citas de tu centro de masajes automáticamente por WhatsApp. Agenda online, recordatorios automáticos y página de reservas en minutos.',
    eyebrow: 'Hecho para centros de masaje',
    businessNameSingular: 'centro de masajes',
    headline: 'Gestiona las citas de tu centro de masajes',
    headlineAccent: 'automáticamente por WhatsApp',
    subheadline:
      'Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme, recuerde y gestione las citas de tus clientes por ti.',
    exampleServiceName: 'Masaje relajante 60 min',
    exampleServicePrice: '40',
    exampleStaffName: 'Marta',
    painPointTitle: '¿Pierdes clientes por no contestar a tiempo?',
    painPointBody:
      'Cuando estás con un cliente no puedes mirar el móvil. Con Agendia, tu página de reservas sigue funcionando aunque tú no puedas contestar.',
  },
  tatuadores: {
    slug: 'tatuadores',
    metaTitle: 'Agenda y WhatsApp para tu estudio de tatuajes — Agendia',
    metaDescription:
      'Gestiona las citas de tu estudio de tatuajes automáticamente por WhatsApp. Agenda online, recordatorios automáticos y página de reservas en minutos.',
    eyebrow: 'Hecho para estudios de tatuaje',
    businessNameSingular: 'estudio de tatuajes',
    headline: 'Gestiona las citas de tu estudio de tatuajes',
    headlineAccent: 'automáticamente por WhatsApp',
    subheadline:
      'Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme, recuerde y gestione las citas de tus clientes por ti.',
    exampleServiceName: 'Sesión de tatuaje',
    exampleServicePrice: '80',
    exampleStaffName: 'Diego',
    painPointTitle: '¿Gestionas presupuestos y citas mezclados en el mismo chat?',
    painPointBody:
      'Con una agenda y un enlace de reservas propio, separas la conversación de presupuesto de la gestión real de la cita.',
  },
  entrenadores_personales: {
    slug: 'entrenadores_personales',
    metaTitle: 'Agenda y WhatsApp para entrenadores personales — Agendia',
    metaDescription:
      'Gestiona las sesiones de tus clientes automáticamente por WhatsApp. Agenda online, recordatorios automáticos y página de reservas en minutos.',
    eyebrow: 'Hecho para entrenadores personales',
    businessNameSingular: 'negocio de entrenamiento personal',
    headline: 'Gestiona las sesiones de tus clientes',
    headlineAccent: 'automáticamente por WhatsApp',
    subheadline:
      'Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme, recuerde y gestione las sesiones de tus clientes por ti.',
    exampleServiceName: 'Sesión de entrenamiento',
    exampleServicePrice: '30',
    exampleStaffName: 'Carlos',
    painPointTitle: '¿Pierdes sesiones por olvidos de última hora?',
    painPointBody:
      'Un recordatorio automático 24h antes reduce los no-shows y te ayuda a mantener tu agenda de sesiones siempre ocupada.',
  },
  peluquerias_caninas: {
    slug: 'peluquerias_caninas',
    metaTitle: 'Agenda y WhatsApp para tu peluquería canina — Agendia',
    metaDescription:
      'Gestiona las citas de tu peluquería canina automáticamente por WhatsApp. Agenda online, recordatorios automáticos y página de reservas en minutos.',
    eyebrow: 'Hecho para peluquerías caninas',
    businessNameSingular: 'peluquería canina',
    headline: 'Gestiona las citas de tu peluquería canina',
    headlineAccent: 'automáticamente por WhatsApp',
    subheadline:
      'Crea tu agenda online en minutos, comparte tu enlace de reservas y deja que Agendia confirme, recuerde y gestione las citas de tus clientes por ti.',
    exampleServiceName: 'Baño y corte',
    exampleServicePrice: '28',
    exampleStaffName: 'Elena',
    painPointTitle: '¿Se te olvida confirmar la cita del perro de mañana?',
    painPointBody:
      'Con recordatorios automáticos, tus clientes confirman solos y tú te ahorras las llamadas de última hora.',
  },
};

export const VERTICAL_LIST = Object.values(VERTICAL_CONFIGS);
