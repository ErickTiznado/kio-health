import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  isDiscreteMode: boolean;
  toggleDiscreteMode: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      isDiscreteMode: false,
      toggleDiscreteMode: () => set((state) => ({ isDiscreteMode: !state.isDiscreteMode })),
    }),
    {
      name: 'kio-settings',
    }
  )
);
