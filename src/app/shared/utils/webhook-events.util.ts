export const WEBHOOK_EVENT_LABELS: Record<string, string> = {
  'appointment.created': 'Cita creada',
  'appointment.confirmed': 'Cita confirmada',
  'appointment.cancelled': 'Cita cancelada',
  'appointment.rescheduled': 'Cita reprogramada',
  'appointment.completed': 'Cita completada',
  'customer.created': 'Cliente nuevo',
  'customer.updated': 'Cliente actualizado',
  'service.created': 'Servicio creado',
};

export const WEBHOOK_EVENT_NAMES = Object.keys(WEBHOOK_EVENT_LABELS);
