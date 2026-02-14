import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SessionLayout } from '../components/session/SessionLayout';
import { PatientContextPanel } from '../components/session/PatientContextPanel';
import { EditorContainer } from '../components/session/editor/EditorContainer';
import { SessionCheckoutModal } from '../components/session/SessionCheckoutModal';
import { useSessionSnapshot, useStartSession, useMarkNoShow } from '../hooks/use-session';
import { toast } from 'sonner';

/**
 * Clinical Session Page — Deep Work environment.
 */
export function SessionPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const { data: sessionContext, isLoading } = useSessionSnapshot(appointmentId || '');
  const { mutate: startSession } = useStartSession();
  const { mutate: markNoShow } = useMarkNoShow();

  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (sessionContext?.appointment.status === 'IN_PROGRESS') {
      const startTime = new Date(sessionContext.appointment.startTime).getTime();
      
      const updateTimer = () => {
        const now = Date.now();
        const diff = Math.max(0, Math.floor((now - startTime) / 1000));
        
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        
        setElapsedTime(
          [hours, minutes, seconds]
            .map((unit) => String(unit).padStart(2, '0'))
            .join(':')
        );
      };

      updateTimer();
      intervalId = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('00:00:00');
    }

    return () => clearInterval(intervalId);
  }, [sessionContext?.appointment.status, sessionContext?.appointment.startTime]);

  if (isLoading || !sessionContext) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const { appointment, patient, totalBalance, lastVisit, sessionNumber } = sessionContext;

  const handleStartSession = () => {
    if (appointmentId) {
      startSession(appointmentId);
    }
  };


  const handleFinishSession = () => {
    setIsCheckoutOpen(true);
  };

  const handleNoShow = () => {
    if (confirm('¿Marcar cita como No Asistió?')) {
        markNoShow(appointmentId!, {
            onSuccess: () => {
                toast.success('Cita marcada como No Asistió');
                navigate('/agenda');
            },
            onError: () => {
                toast.error('Error al marcar como No Asistió');
            }
        });
    }
  };

  // Calculate age from DOB
  const age = patient.dateOfBirth
    ? new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()
    : undefined;

  // Mock data for panels until we implement full history fetching
  const mockPsychContext = {
    diagnosis: patient.diagnosis || 'Sin diagnóstico',
    clinicalContext: patient.clinicalContext || 'Sin contexto registrado',
    treatmentGoals: [],
    totalSessions: 0,
  };

  return (
    <>
      <SessionLayout
        patientId={patient.id}
        patientName={patient.fullName}
        patientAge={age}
        sessionNumber={sessionNumber}
        elapsedTime={elapsedTime}
        totalBalance={totalBalance}
        lastVisit={lastVisit}
        status={appointment.status}
        onStartSession={handleStartSession}
        onFinishSession={handleFinishSession}
        onNoShow={handleNoShow} 
      >
        <div className="grid grid-cols-[30%_70%] h-full">
          {/* Left — Patient Context */}
          <PatientContextPanel
            patientId={patient.id}
            patientName={patient.fullName}
            patientAge={age || 0}
            clinicianType="PSYCHOLOGIST" // Dynamic later
            psychContext={mockPsychContext}
            sessionHistory={[]} // Fetch real history later
          />

          {/* Right — Role-specific panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full">
            <EditorContainer appointmentId={appointment.id} patientId={patient.id} />
          </div>
        </div>
      </SessionLayout>

      <SessionCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        appointmentId={appointmentId ?? ''}
        price={appointment.price}
        patientName={patient.fullName}
      />
    </>
  );
}
