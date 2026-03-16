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

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'sidebar-dashboard',
    title: 'Tu panel principal',
    description: 'Aquí encuentras un resumen de tu día: próxima cita, agenda de hoy y pacientes recientes.',
    route: '/dashboard',
    placement: 'right',
  },
  {
    id: 'tour-next-appointment',
    title: 'Tu próxima cita',
    description: 'Este widget muestra en tiempo real tu próxima cita programada, con acceso directo a la sesión.',
    route: '/dashboard',
    placement: 'bottom',
  },
  {
    id: 'sidebar-patients',
    title: 'Gestión de pacientes',
    description: 'Accede al listado completo de tus pacientes, con búsqueda y filtros por estado.',
    route: '/patients',
    placement: 'right',
    mobileCenter: true,
  },
  {
    id: 'tour-new-patient-btn',
    title: 'Agregar un paciente nuevo',
    description: 'Con este botón puedes registrar un nuevo paciente en segundos. Sus datos quedan protegidos con cifrado.',
    route: '/patients',
    placement: 'bottom',
  },
  {
    id: 'sidebar-agenda',
    title: 'Tu agenda',
    description: 'Vista semanal y diaria de tus citas. Arrastra para reagendar, haz clic para ver detalles.',
    route: '/agenda',
    placement: 'right',
    mobileCenter: true,
  },
  {
    id: 'tour-schedule-btn',
    title: 'Agendar una cita',
    description: 'Crea una nueva cita eligiendo paciente, fecha y duración. También puedes hacer clic en cualquier slot del calendario.',
    route: '/agenda',
    placement: 'bottom',
  },
  {
    id: 'sidebar-finance',
    title: 'Control financiero',
    description: 'Registra pagos, revisa ingresos y exporta reportes para tu contabilidad.',
    route: '/finance',
    placement: 'right',
    mobileCenter: true,
  },
  {
    id: 'tour-quick-actions',
    title: 'Acciones rápidas',
    description: 'Desde cualquier página puedes agregar un paciente o agendar una cita con un solo clic.',
    route: '/dashboard',
    placement: 'bottom',
  },
  {
    id: 'sidebar-settings',
    title: 'Configuración',
    description: 'Ajusta tu moneda, duración y precio de sesión. También puedes crear o unirte a una clínica.',
    route: '/dashboard',
    placement: 'right',
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
