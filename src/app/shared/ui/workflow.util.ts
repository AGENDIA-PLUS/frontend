import { MessageChannel, MessageStatus, WorkflowActionType, WorkflowTriggerType } from '../../core/models';
import { BadgeTone } from './badge/badge.component';

export const WORKFLOW_TRIGGER_LABEL: Record<WorkflowTriggerType, string> = {
  APPOINTMENT_CREATED: 'Nueva cita',
  APPOINTMENT_CONFIRMED: 'Cita confirmada',
  APPOINTMENT_CANCELLED: 'Cita cancelada',
  APPOINTMENT_MODIFIED: 'Cita modificada',
  APPOINTMENT_COMPLETED: 'Cita completada',
  CUSTOMER_CREATED: 'Nuevo cliente',
  CUSTOMER_INACTIVE: 'Cliente inactivo',
};

export const WORKFLOW_ACTION_LABEL: Record<WorkflowActionType, string> = {
  SEND_WHATSAPP: 'Enviar WhatsApp',
  SEND_EMAIL: 'Enviar Email',
  CALL_WEBHOOK: 'Llamar a un Webhook',
  WAIT: 'Esperar',
  CHANGE_STATUS: 'Cambiar estado de la cita',
  CREATE_TASK: 'Crear tarea',
};

export const MESSAGE_CHANNEL_LABEL: Record<MessageChannel, string> = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'Email',
  SMS: 'SMS',
};

export const MESSAGE_STATUS_LABEL: Record<MessageStatus, string> = {
  QUEUED: 'En cola',
  SENT: 'Enviado',
  DELIVERED: 'Entregado',
  READ: 'Leído',
  FAILED: 'Fallido',
};

export const MESSAGE_STATUS_TONE: Record<MessageStatus, BadgeTone> = {
  QUEUED: 'neutral',
  SENT: 'success',
  DELIVERED: 'success',
  READ: 'success',
  FAILED: 'danger',
};
