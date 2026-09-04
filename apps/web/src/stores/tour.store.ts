import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  route: string;
  placement: 'top' | 'bottom' | 'left' | 'right';
  mobileCenter?: boolean;
}

/**
 * Four steps, all anchored on `/dashboard`.
 *
 * The previous nine-step version dragged the user through `/patients`,
 * `/agenda` and `/finance` mid-tour. The sidebar is part of the global layout,
 * so every target below is reachable without a single route change.
 */
export const TOUR_STEPS: TourStep[] = [
  {
    id: 'sidebar-dashboard',
    title: 'Tu panel principal',
    description: 'Un resumen de tu día: agenda de hoy, próxima cita, alertas y pacientes recientes.',
    route: '/dashboard',
    placement: 'right',
    mobileCenter: true,
  },
  {
    id: 'tour-next-appointment',
    title: 'Tu próxima cita',
    description: 'Muestra la siguiente sesión con acceso directo. El botón para entrar aparece 15 minutos antes.',
    route: '/dashboard',
    placement: 'bottom',
  },
  {
    id: 'sidebar-patients',
    title: 'Tus pacientes',
    description: 'El listado completo, con búsqueda y filtros. Los datos clínicos se guardan cifrados.',
    route: '/dashboard',
    placement: 'right',
    mobileCenter: true,
  },
  {
    id: 'tour-quick-actions',
    title: 'Acciones rápidas',
    description: 'Desde cualquier página puedes registrar un paciente o agendar una cita con un clic.',
    route: '/dashboard',
    placement: 'bottom',
  },
];

interface TourPersistedState {
  hasCompletedTour: boolean;
}

interface TourState extends TourPersistedState {
  isActive: boolean;
  currentStepIndex: number;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  resetTour: () => void;
}

export const useTourStore = create<TourState>()(
  persist(
    (set, get) => ({
      hasCompletedTour: false,
      isActive: false,
      currentStepIndex: 0,

      startTour: () => set({ isActive: true, currentStepIndex: 0 }),

      nextStep: () => {
        const { currentStepIndex } = get();
        const isLast = currentStepIndex === TOUR_STEPS.length - 1;
        if (isLast) {
          set({ isActive: false, hasCompletedTour: true, currentStepIndex: 0 });
        } else {
          set({ currentStepIndex: currentStepIndex + 1 });
        }
      },

      prevStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex > 0) {
          set({ currentStepIndex: currentStepIndex - 1 });
        }
      },

      skipTour: () => set({ isActive: false, hasCompletedTour: true, currentStepIndex: 0 }),

      resetTour: () => set({ hasCompletedTour: false, currentStepIndex: 0 }),
    }),
    {
      name: 'kio-tour',
      partialize: (state) => ({ hasCompletedTour: state.hasCompletedTour }),
    },
  ),
);
