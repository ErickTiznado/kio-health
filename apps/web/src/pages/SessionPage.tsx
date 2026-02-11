import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { SessionLayout } from '../components/session/SessionLayout';
import { PatientContextPanel } from '../components/session/PatientContextPanel';
import { PsychologistEditor } from '../components/session/PsychologistEditor';
import { NutritionistPanel } from '../components/session/NutritionistPanel';
import { SessionCheckoutModal } from '../components/session/SessionCheckoutModal';
import { useAuthStore } from '../stores/auth.store';

/* ── Mock data — replace with real API calls when backend is ready ── */

const MOCK_PATIENT = {
  name: 'María García López',
  age: 28,
};

/** Psychologist-specific patient context. */
const MOCK_PSYCH_CONTEXT = {
  diagnosis: 'Trastorno de Ansiedad Generalizada (F41.1)',
  treatmentGoals: [
    'Reducir episodios de ansiedad a ≤2 por semana',
    'Implementar rutina de mindfulness diaria',
    'Mejorar calidad de sueño (≥7h)',
  ],
  totalSessions: 8,
};

/** Nutritionist-specific patient context. */
const MOCK_NUTRI_CONTEXT = {
  currentWeight: 68,
  bmi: 24.2,
  nutritionalGoal: 'Recomposición corporal — déficit calórico moderado',
  totalSessions: 5,
};

const MOCK_SESSION_HISTORY = [
  {
    id: 'h1',
    date: '2026-02-03',
    type: 'Consulta de seguimiento',
    summary:
      'Paciente reporta mejoría significativa en niveles de ansiedad. Escala GAD-7 bajó de 14 a 9 puntos. Se continúa con plan terapéutico actual y se añaden ejercicios de respiración diafragmática.',
  },
  {
    id: 'h2',
    date: '2026-01-27',
    type: 'Consulta de seguimiento',
    summary:
      'Se revisaron objetivos terapéuticos. Paciente implementó técnicas de mindfulness con adherencia parcial. Se ajusta frecuencia de sesiones a quincenal.',
  },
  {
    id: 'h3',
    date: '2026-01-13',
    type: 'Evaluación inicial',
    summary:
      'Primera sesión. Se establece línea base: ansiedad moderada (GAD-7: 14), síntomas de estrés laboral. Se definen objetivos terapéuticos y plan de intervención CBT.',
  },
];

/**
 * Formats total elapsed seconds into HH:MM:SS.
 */
function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((unit) => String(unit).padStart(2, '0')).join(':');
}

/**
 * Clinical Session Page — Deep Work environment.
 * Reads the logged-in user's clinician type from the auth store and
 * renders role-specific UI for both the left context panel and right editor.
 */
export function SessionPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const user = useAuthStore((state) => state.user);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Auto-incrementing session timer
  useEffect(() => {
    const intervalId = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const elapsedTime = formatElapsedTime(elapsedSeconds);

  // Silence unused var — appointmentId will be used for real API fetching
  const _appointmentId = appointmentId;
  void _appointmentId;

  // Derive clinician type from the authenticated user's profile
  const clinicianType = user?.profile?.type ?? 'PSYCHOLOGIST';
  const isPsychologist = clinicianType === 'PSYCHOLOGIST';

  return (
    <>
      <SessionLayout
        patientName={MOCK_PATIENT.name}
        patientAge={MOCK_PATIENT.age}
        elapsedTime={elapsedTime}
        onFinishSession={() => setIsCheckoutOpen(true)}
      >
        <div className="grid grid-cols-[30%_70%] h-full">
          {/* Left — Patient Context (role-aware) */}
          <PatientContextPanel
            patientName={MOCK_PATIENT.name}
            patientAge={MOCK_PATIENT.age}
            clinicianType={clinicianType}
            psychContext={isPsychologist ? MOCK_PSYCH_CONTEXT : undefined}
            nutriContext={!isPsychologist ? MOCK_NUTRI_CONTEXT : undefined}
            sessionHistory={MOCK_SESSION_HISTORY}
          />

          {/* Right — Role-specific panel */}
          {isPsychologist ? <PsychologistEditor /> : <NutritionistPanel />}
        </div>
      </SessionLayout>

      {/* ── Checkout Modal (opens on "Finalizar Consulta") ── */}
      <SessionCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </>
  );
}
