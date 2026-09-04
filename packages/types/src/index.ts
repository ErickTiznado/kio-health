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
  IN_PROGRESS = 'IN_PROGRESS',
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

export enum ReminderKind {
  PRIMARY = 'PRIMARY',
  SECOND_TOUCH = 'SECOND_TOUCH',
}

export enum CancelledBy {
  CLINICIAN = 'CLINICIAN',
  PATIENT = 'PATIENT',
}

export enum RecurrenceFrequency {
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  MONTHLY = 'MONTHLY',
}

export enum SeriesStatus {
  ACTIVE = 'ACTIVE',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
}

export enum ScaleAssignmentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ScaleSource {
  CLINICIAN = 'CLINICIAN',
  PATIENT = 'PATIENT',
}
