export interface RecentPatientEntry {
  id: string;
  timestamp: number;
}

const STORAGE_KEY = 'kio_recent_patients';
const MAX_RECENT_PATIENTS = 4;

export const getRecentPatientsFromStorage = (): RecentPatientEntry[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse recent patients from localStorage', error);
    return [];
  }
};

export const addRecentPatientToStorage = (patientId: string): void => {
  try {
    const current = getRecentPatientsFromStorage();
    const now = Date.now();

    // Remove existing entry for this patient
    const filtered = current.filter((p) => p.id !== patientId);

    // Add new entry to the beginning
    const updated = [{ id: patientId, timestamp: now }, ...filtered];

    // Keep only the last MAX_RECENT_PATIENTS
    const trimmed = updated.slice(0, MAX_RECENT_PATIENTS);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save recent patient to localStorage', error);
  }
};
