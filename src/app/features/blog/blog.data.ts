export interface BlogSection {
  heading?: string;
  paragraphs: string[];
}

export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  publishedAt: string; // ISO date
  readingTimeMin: number;
  sections: BlogSection[];
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'reducir-no-shows-citas',
    title: 'Cómo reducir las ausencias sin avisar (no-shows) en tu negocio de citas',
    metaDescription:
      'Estrategias reales para reducir las citas a las que el cliente no se presenta: recordatorios automáticos, señal por adelantado, y cómo combinarlos bien.',
    excerpt:
      'Una cita perdida por una ausencia sin avisar es tiempo que no vuelve. Esto es lo que de verdad reduce los no-shows, y lo que no.',
    publishedAt: '2026-07-14',
    readingTimeMin: 6,
    sections: [
      {
        paragraphs: [
          'Un hueco vacío en la agenda por una ausencia sin avisar no es solo una cita perdida — es tiempo que ya no puedes vender de nuevo, porque normalmente te enteras demasiado tarde para llenarlo con otro cliente.',
          'La buena noticia es que el no-show casi nunca es mala fe: la mayoría de las veces el cliente simplemente se olvida, o algo le surge y no le da importancia a avisar porque no siente que haya nada en juego. Las dos palancas que de verdad funcionan atacan justo eso.',
        ],
      },
      {
        heading: '1. Recordatorios automáticos, en el canal correcto',
        paragraphs: [
          'Un recordatorio 24 horas antes reduce las ausencias de forma consistente — pero solo si llega por un canal que la persona realmente mira. Un email de recordatorio se pierde entre docenas de otros correos; un mensaje de WhatsApp se lee.',
          'Lo importante no es solo enviarlo, sino que el cliente pueda responder fácilmente si necesita cancelar o cambiar la hora — si cancelar cuesta una llamada de teléfono en horario de oficina, mucha gente simplemente no se presenta en vez de molestarse en avisar.',
        ],
      },
      {
        heading: '2. Una señal por adelantado, para citas de valor alto',
        paragraphs: [
          'Para servicios largos o caros (una sesión de tatuaje de varias horas, un tratamiento de varias sesiones), pedir una señal al reservar cambia la dinámica por completo: en cuanto hay dinero de por medio, la cita deja de sentirse "sin compromiso".',
          'No hace falta que sea el importe completo — con un 20-30% del precio del servicio suele bastar para que el cliente avise si no puede venir, en vez de simplemente no aparecer. Y si no se presenta, al menos el tiempo perdido no es del todo gratis para el negocio.',
        ],
      },
      {
        heading: 'Lo que NO suele funcionar',
        paragraphs: [
          'Las políticas de cancelación estrictas escritas en la web casi nunca se leen antes de reservar, así que no cambian el comportamiento — solo generan una discusión incómoda después del hecho.',
          'Tampoco ayuda mucho llamar por teléfono para confirmar manualmente: consume tiempo del negocio (justo lo que se quiere ahorrar) y, si no contestan, sigues sin saber si van a venir o no.',
        ],
      },
      {
        heading: 'La combinación que mejor funciona',
        paragraphs: [
          'En la práctica, la combinación más efectiva es recordatorio automático por WhatsApp 24h antes + señal por adelantado en los servicios de mayor valor. El recordatorio reduce los olvidos genuinos; la señal reduce las cancelaciones de última hora sin avisar.',
          'Automatizar ambas cosas es exactamente lo que evita que la solución termine costando más tiempo del que ahorra — un recordatorio manual o una llamada de confirmación cada día no escala cuando la agenda se llena.',
        ],
      },
    ],
  },
  {
    slug: 'whatsapp-business-vs-agendia',
    title: 'WhatsApp Business vs. un sistema de citas con WhatsApp integrado: ¿cuál necesitas?',
    metaDescription:
      'La app de WhatsApp Business es gratis, pero tiene límites reales para gestionar citas. Comparativa honesta de cuándo basta y cuándo se necesita algo más.',
    excerpt:
      'La app de WhatsApp Business es un buen punto de partida, pero tiene límites reales en cuanto el negocio crece. Aquí la diferencia sin exagerar ninguna de las dos.',
    publishedAt: '2026-07-28',
    readingTimeMin: 5,
    sections: [
      {
        paragraphs: [
          'Muchos negocios empiezan gestionando sus citas a mano, por WhatsApp Business normal: el cliente escribe, tú miras el hueco libre y respondes. Funciona bien al principio — el problema aparece cuando el volumen de mensajes crece.',
        ],
      },
      {
        heading: 'Lo que WhatsApp Business (la app gratuita) hace bien',
        paragraphs: [
          'Es gratis, no requiere ninguna configuración técnica, y las respuestas rápidas predefinidas ahorran algo de tiempo al escribir lo mismo una y otra vez. Para un negocio de una sola persona con pocas citas al día, puede ser suficiente durante bastante tiempo.',
        ],
      },
      {
        heading: 'Dónde empieza a quedarse corta',
        paragraphs: [
          'Cada reserva sigue exigiendo que una persona mire su calendario, compruebe la disponibilidad real y responda a mano — y eso no se puede hacer fuera de horario, así que los mensajes que llegan de noche o mientras estás atendiendo a otro cliente se acumulan sin respuesta.',
          'Tampoco hay recordatorios automáticos, ni una forma de que el cliente vea los huecos libres sin preguntarte primero, ni manera de cobrar una señal al reservar. Todo eso hay que hacerlo a mano, mensaje a mensaje.',
        ],
      },
      {
        heading: 'Qué añade un sistema de citas con WhatsApp integrado',
        paragraphs: [
          'La diferencia clave es que el cliente puede reservar sola, sin esperar a que alguien del negocio esté disponible para contestar — ve los huecos libres reales, elige uno, y la cita queda confirmada al momento, a cualquier hora.',
          'A partir de ahí, el recordatorio automático, la posibilidad de cobrar señal, y tener todas las citas organizadas en una agenda visual (en vez de dispersas en una conversación de chat) son la parte que de verdad ahorra tiempo cuando el volumen crece.',
        ],
      },
      {
        heading: 'Cómo decidir',
        paragraphs: [
          'Si gestionas pocas citas a la semana y tienes margen para responder rápido casi siempre, WhatsApp Business puede seguir siendo suficiente durante un tiempo.',
          'Si notas que se te acumulan mensajes sin responder, que pierdes reservas por tardar en contestar, o que dedicas más tiempo a coordinar horarios que a atender clientes, esa es la señal de que ya te está costando más tiempo del que debería — y ahí es donde automatizar la reserva y el recordatorio empieza a compensar de verdad.',
        ],
      },
    ],
  },
  {
    slug: 'como-elegir-software-citas',
    title: 'Cómo elegir un software de citas para tu negocio: guía práctica',
    metaDescription:
      'Qué mirar de verdad al elegir un sistema de reservas para tu negocio de servicios: lo esencial, lo que suma, y las preguntas que evitan sorpresas después.',
    excerpt:
      'No todos los sistemas de citas resuelven lo mismo. Esto es lo que de verdad importa mirar antes de decidirte por uno.',
    publishedAt: '2026-08-10',
    readingTimeMin: 7,
    sections: [
      {
        paragraphs: [
          'Hay muchas opciones de software de citas, y la mayoría prometen más o menos lo mismo en su web. La diferencia real se nota en el día a día, así que esto es lo que vale la pena comprobar antes de decidirte.',
        ],
      },
      {
        heading: 'Lo esencial: sin esto, no sirve para tu negocio',
        paragraphs: [
          '**Página de reservas propia**: el cliente tiene que poder reservar sin necesitar una app aparte, ni descargarse nada — un enlace que puedas compartir en Instagram, Google o WhatsApp es lo mínimo.',
          '**Disponibilidad real**: si tienes varios profesionales o varios servicios con duraciones distintas, el sistema tiene que calcular los huecos libres de verdad, no solo mostrar un calendario genérico donde luego hay que comprobar a mano si hay solape.',
          '**Recordatorios automáticos**: sin esto, sigues dependiendo de acordarte tú de avisar a cada cliente, que es exactamente el trabajo manual que se supone que el software debería quitarte.',
        ],
      },
      {
        heading: 'Lo que suma, según cómo sea tu negocio',
        paragraphs: [
          '**Automatización por WhatsApp**: si tus clientes ya te escriben por WhatsApp para reservar (la mayoría de negocios de servicios locales), que el propio sistema conteste y gestione la reserva ahí mismo ahorra muchísimo más que si solo tiene una web de reservas aislada.',
          '**Cobro de señal**: relevante sobre todo si tienes servicios largos o caros donde una ausencia sin avisar te cuesta de verdad tiempo y dinero — no tan necesario para servicios cortos y baratos donde el riesgo por cita es bajo.',
          '**Múltiples ubicaciones**: solo importa si de verdad gestionas más de una sede; si es tu caso, comprueba que cada profesional se pueda asignar a su sucursal, no que sea simplemente "una agenda más" sin distinción real de ubicación.',
        ],
      },
      {
        heading: 'Preguntas que evitan sorpresas después',
        paragraphs: [
          '¿El precio incluye WhatsApp de verdad, o es un añadido caro que se paga aparte? Muchos sistemas anuncian un precio bajo y luego cobran cada mensaje de WhatsApp por separado, sin dejarlo claro desde el principio.',
          '¿Hay límite de citas al mes, o de clientes? Un límite bajo en un plan barato puede parecer suficiente al probarlo, pero quedarte corto justo cuando el negocio empieza a crecer es un mal momento para tener que cambiar de sistema.',
          '¿Puedes exportar tus datos si algún día quieres cambiar de proveedor? Es una pregunta incómoda de hacer, pero la respuesta dice mucho sobre si el proveedor confía en su propio producto para retenerte.',
        ],
      },
      {
        heading: 'En resumen',
        paragraphs: [
          'Empieza por confirmar que resuelve lo esencial (reservas online reales, disponibilidad calculada de verdad, recordatorios automáticos) antes de dejarte llevar por funciones vistosas que quizá nunca uses. Y prueba el flujo completo de reserva tú mismo, como si fueras tu propio cliente, antes de decidir — es la forma más rápida de notar si de verdad es sencillo o solo lo parece en el marketing.',
        ],
      },
    ],
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
