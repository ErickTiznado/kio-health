export enum UserRole {
  ADMIN = 'ADMIN',
  CLINICIAN = 'CLINICIAN',
}

export enum ClinicianType {
  PSYCHOLOGIST = 'PSYCHOLOGIST',
  NUTRITIONIST = 'NUTRITIONIST',
}

export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
  WAITLIST = 'WAITLIST',
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
}
