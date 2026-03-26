export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: any) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  timeline: (id: string) => [...patientKeys.detail(id), 'timeline'] as const,
  moodHistory: (id: string) => [...patientKeys.detail(id), 'mood-history'] as const,
  lastNote: (id: string) => [...patientKeys.detail(id), 'last-note'] as const,
  scales: (id: string) => [...patientKeys.detail(id), 'scales'] as const,
  documents: (id: string) => [...patientKeys.detail(id), 'documents'] as const,
};

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: any) => [...appointmentKeys.lists(), filters] as const,
  details: () => [...appointmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentKeys.details(), id] as const,
  context: (id: string) => [...appointmentKeys.detail(id), 'context'] as const,
  notes: (id: string) => [...appointmentKeys.detail(id), 'notes'] as const,
  next: () => [...appointmentKeys.all, 'next'] as const,
  daySummary: (date: string) => [...appointmentKeys.all, 'day-summary', date] as const,
  pendingNotes: () => [...appointmentKeys.all, 'pending-notes'] as const,
  recentPatients: () => [...appointmentKeys.all, 'recent-patients'] as const,
};

export const taskKeys = {
  all: ['tasks'] as const,
  lists: () => [...taskKeys.all, 'list'] as const,
  list: (patientId: string) => [...taskKeys.lists(), patientId] as const,
};

export const clinicKeys = {
  all: ['clinic'] as const,
  mine: () => [...clinicKeys.all, 'mine'] as const,
  invitations: () => [...clinicKeys.all, 'invitations'] as const,
  patients: () => [...clinicKeys.all, 'patients'] as const,
  finance: (month: number, year: number) => [...clinicKeys.all, 'finance', month, year] as const,
};
