export enum UserRole {
  ADMIN = 'ADMIN',
  CLINICIAN = 'CLINICIAN',
}

export enum ClinicianType {
  PSYCHOLOGIST = 'PSYCHOLOGIST',
}

export enum PatientStatus {
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
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

export enum ClinicRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

export enum ClinicianPlan {
  INDIVIDUAL = 'INDIVIDUAL',
  CLINIC = 'CLINIC',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}
