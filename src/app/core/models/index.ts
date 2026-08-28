export interface User {
  id: string;
  email: string;
  fullName: string;
  emailVerified?: boolean;
}

export type MembershipRole = 'OWNER' | 'ADMIN' | 'STAFF';

export interface BusinessSummary {
  id: string;
  name: string;
  slug: string;
  role: MembershipRole;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
  businesses: BusinessSummary[];
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  vertical: string | null;
  logoUrl: string | null;
  description: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  timezone: string;
  currency: string;
  language: string;
  minBookingNoticeMinutes: number;
  maxBookingHorizonDays: number;
  cancellationPolicy: string | null;
  whatsappPhoneNumberId?: string | null;
  whatsappConnected?: boolean;
  isPublished: boolean;
}

export interface Service {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  durationMin: number;
  price: string;
  category: string | null;
  imageUrl: string | null;
  isActive: boolean;
  depositEnabled?: boolean;
  depositType?: 'FIXED' | 'PERCENTAGE' | null;
  depositAmount?: string | null;
  staff?: { staff: Staff }[];
}

export interface Staff {
  id: string;
  businessId: string;
  fullName: string;
  photoUrl: string | null;
  isActive: boolean;
  locationId?: string | null;
  location?: { id: string; name: string } | null;
  services?: { service: Service }[];
}

export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'COMPLETED'
  | 'RESCHEDULED'
  | 'NO_SHOW';

export interface Customer {
  id: string;
  businessId: string;
  fullName: string;
  phone: string | null;
  email: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Appointment {
  id: string;
  businessId: string;
  customerId: string;
  serviceId: string;
  staffId: string;
  startsAt: string;
  endsAt: string;
  status: AppointmentStatus;
  notes: string | null;
  rescheduledFromId?: string | null;
  customer?: Customer;
  service?: Service;
  staff?: Staff;
}

// --- Workflows ---

export type WorkflowTriggerType =
  | 'APPOINTMENT_CREATED'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_MODIFIED'
  | 'APPOINTMENT_COMPLETED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_INACTIVE';

export type WorkflowActionType =
  | 'SEND_WHATSAPP'
  | 'SEND_EMAIL'
  | 'CALL_WEBHOOK'
  | 'WAIT'
  | 'CHANGE_STATUS'
  | 'CREATE_TASK';

export type WorkflowRunStatus = 'PENDING' | 'RUNNING' | 'WAITING' | 'COMPLETED' | 'FAILED';

export interface WorkflowTrigger {
  id: string;
  type: WorkflowTriggerType;
  conditions: Record<string, unknown> | null;
}

export interface WorkflowAction {
  id: string;
  order: number;
  type: WorkflowActionType;
  config: Record<string, unknown>;
}

export interface Workflow {
  id: string;
  businessId: string;
  name: string;
  isActive: boolean;
  triggers: WorkflowTrigger[];
  actions: WorkflowAction[];
}

export interface WorkflowRun {
  id: string;
  workflowId: string;
  status: WorkflowRunStatus;
  currentStep: number;
  attempts: number;
  lastError: string | null;
  startedAt: string;
  finishedAt: string | null;
}

// --- Mensajes / notificaciones ---

export type MessageChannel = 'WHATSAPP' | 'EMAIL' | 'SMS';
export type MessageStatus = 'QUEUED' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Message {
  id: string;
  businessId: string;
  customerId: string | null;
  channel: MessageChannel;
  template: string;
  status: MessageStatus;
  providerId: string | null;
  error: string | null;
  createdAt: string;
  payload?: { text?: string; simulated?: boolean };
}
