import { AppointmentStatus } from '../../core/models';
import { BadgeTone } from './badge/badge.component';

export const APPOINTMENT_STATUS_LABEL: Record<AppointmentStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
  COMPLETED: 'Completada',
  RESCHEDULED: 'Reprogramada',
  NO_SHOW: 'No-show',
};

export const APPOINTMENT_STATUS_TONE: Record<AppointmentStatus, BadgeTone> = {
  PENDING: 'warning',
  CONFIRMED: 'success',
  CANCELLED: 'danger',
  COMPLETED: 'neutral',
  RESCHEDULED: 'primary',
  NO_SHOW: 'danger',
};
