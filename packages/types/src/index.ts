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

export enum ScaleType {
  PHQ9 = 'PHQ9',
  GAD7 = 'GAD7',
}

export enum ScaleRiskLevel {
  MINIMAL = 'MINIMAL',
  MILD = 'MILD',
  MODERATE = 'MODERATE',
  MODERATELY_SEVERE = 'MODERATELY_SEVERE',
  SEVERE = 'SEVERE',
}
