import { useAuthStore } from '../stores/auth.store';

export interface RecentPatientEntry {
  id: string;
  timestamp: number;
}

const LEGACY_STORAGE_KEY = 'kio_recent_patients';
const STORAGE_PREFIX = 'kio_recent_patients:';
const MAX_RECENT_PATIENTS = 4;

/**
 * Recent patients are scoped to the signed-in clinician.
 *
 * The list used to live under one shared key, so on a shared consulting-room
 * machine the next clinician to sign in saw the previous one's patients — names
 * of people who are not their own, on the main screen. Namespacing by user id
 * keeps each clinician's trail to themselves; `clearRecentPatients` wipes it on
 * logout so the device keeps nothing after the session ends.
 */
function storageKey(): string | null {
  const userId = useAuthStore.getState().user?.id;
  return userId ? `${STORAGE_PREFIX}${userId}` : null;
}

export const getRecentPatientsFromStorage = (): RecentPatientEntry[] => {
  const key = storageKey();
  if (!key) return [];
  try {
    // One-time cleanup of the shared pre-namespacing key.
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to parse recent patients from localStorage', error);
    return [];
  }
};

export const addRecentPatientToStorage = (patientId: string): void => {
  const key = storageKey();
  if (!key) return;
  try {
    const current = getRecentPatientsFromStorage();
    const now = Date.now();

    // Remove existing entry for this patient
    const filtered = current.filter((p) => p.id !== patientId);

    // Add new entry to the beginning
    const updated = [{ id: patientId, timestamp: now }, ...filtered];

    // Keep only the last MAX_RECENT_PATIENTS
    const trimmed = updated.slice(0, MAX_RECENT_PATIENTS);

    localStorage.setItem(key, JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save recent patient to localStorage', error);
  }
};

/** Drop the current clinician's trail. Call on logout. */
export const clearRecentPatients = (): void => {
  try {
    const key = storageKey();
    if (key) localStorage.removeItem(key);
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
};
