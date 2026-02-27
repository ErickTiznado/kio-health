import { useState, useEffect } from 'react';
import { useUpsertClinicalScale } from '../../hooks/use-session';
import type { ClinicalScale, ScaleRiskLevel } from '../../types/appointments.types';

interface ScalesTabProps {
  appointmentId: string;
  initialData?: ClinicalScale[];
}

const PHQ9_QUESTIONS = [
  'Poco interés o placer en hacer las cosas',
  'Sentirse triste, deprimido/a o sin esperanza',
  'Dificultad para quedarse o permanecer dormido/a, o dormir demasiado',
  'Sentirse cansado/a o tener poca energía',
  'Tener poco apetito o comer en exceso',
  'Sentirse mal consigo mismo/a o sentirse un fracasado/a',
  'Dificultad para concentrarse en las cosas',
  'Moverse o hablar lentamente, o lo contrario: estar muy inquieto/a',
  'Pensar que estaría mejor muerto/a o que se haría daño',
];

const GAD7_QUESTIONS = [
  'Sentirse nervioso/a, ansioso/a o al límite',
  'No poder dejar de preocuparse o controlar la preocupación',
  'Preocuparse demasiado por diferentes cosas',
  'Dificultad para relajarse',
  'Estar tan inquieto/a que es difícil permanecer sentado/a',
  'Molestarse o irritarse fácilmente',
  'Sentir miedo, como si algo terrible fuera a ocurrir',
];

const ANSWER_LABELS = ['Nunca', 'Varios días', 'Más de la mitad', 'Casi siempre'];

function computeRisk(scaleType: 'PHQ9' | 'GAD7', scores: number[]): ScaleRiskLevel {
  const total = scores.reduce((a, b) => a + b, 0);
  if (scaleType === 'PHQ9') {
    if (total <= 4) return 'MINIMAL';
    if (total <= 9) return 'MILD';
    if (total <= 14) return 'MODERATE';
    if (total <= 19) return 'MODERATELY_SEVERE';
    return 'SEVERE';
  } else {
    if (total <= 4) return 'MINIMAL';
    if (total <= 9) return 'MILD';
    if (total <= 14) return 'MODERATE';
    return 'SEVERE';
  }
}

const RISK_LABELS: Record<ScaleRiskLevel, string> = {
  MINIMAL: 'Mínimo',
  MILD: 'Leve',
  MODERATE: 'Moderado',
  MODERATELY_SEVERE: 'Moderado-Severo',
  SEVERE: 'Severo',
};

const RISK_COLORS: Record<ScaleRiskLevel, string> = {
  MINIMAL: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  MILD: 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  MODERATE: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  MODERATELY_SEVERE: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  SEVERE: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};

interface ScaleCardProps {
  title: string;
  subtitle: string;
  scaleType: 'PHQ9' | 'GAD7';
  questions: string[];
  scores: number[];
  maxScore: number;
  onScoreChange: (idx: number, val: number) => void;
  onSave: () => void;
  isSaving: boolean;
}

function ScaleCard({
  title,
  subtitle,
  scaleType,
  questions,
  scores,
  maxScore,
  onScoreChange,
  onSave,
  isSaving,
}: ScaleCardProps) {
  const total = scores.reduce((a, b) => a + b, 0);
  const risk = computeRisk(scaleType, scores);
  const progressPct = Math.round((total / maxScore) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
          </div>
          <div className="text-right shrink-0">
            <div className="text-3xl font-black text-kanji dark:text-kio">{total}</div>
            <div className="text-xs text-gray-400 dark:text-slate-500">/ {maxScore}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3 h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-kio rounded-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Risk badge */}
        <div className="mt-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${RISK_COLORS[risk]}`}>
            {RISK_LABELS[risk]}
          </span>
        </div>
      </div>

      {/* Questions */}
      <div className="px-6 py-4 flex-1 space-y-4 overflow-y-auto">
        {questions.map((question, idx) => (
          <div key={idx}>
            <p className="text-sm text-gray-700 dark:text-slate-300 mb-2 leading-snug">
              <span className="font-semibold text-gray-400 dark:text-slate-500 mr-1">{idx + 1}.</span>
              {question}
            </p>
            <div className="grid grid-cols-4 gap-1.5">
              {ANSWER_LABELS.map((label, val) => (
                <button
                  key={val}
                  onClick={() => onScoreChange(idx, val)}
                  className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition-all text-center leading-tight ${
                    scores[idx] === val
                      ? 'bg-kio text-white border-kio shadow-sm shadow-kio/30'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-kio/50 hover:text-kio dark:hover:text-kio'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="px-6 pb-6 pt-4 border-t border-gray-100 dark:border-slate-800">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full py-2.5 bg-kio hover:bg-kanji disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-sm shadow-kio/20"
        >
          {isSaving ? 'Guardando...' : `Guardar ${scaleType === 'PHQ9' ? 'PHQ-9' : 'GAD-7'} · ${total}/${maxScore}`}
        </button>
      </div>
    </div>
  );
}

export function ScalesTab({ appointmentId, initialData }: ScalesTabProps) {
  const [activeScale, setActiveScale] = useState<'PHQ9' | 'GAD7'>('PHQ9');
  const [phq9Scores, setPhq9Scores] = useState<number[]>(Array(9).fill(0));
  const [gad7Scores, setGad7Scores] = useState<number[]>(Array(7).fill(0));
  const { mutate: upsertScale, isPending: isPendingPhq9 } = useUpsertClinicalScale();
  const { mutate: upsertScaleGad7, isPending: isPendingGad7 } = useUpsertClinicalScale();

  useEffect(() => {
    if (!initialData) return;
    const phq9 = initialData.find((s) => s.scaleType === 'PHQ9');
    const gad7 = initialData.find((s) => s.scaleType === 'GAD7');
    if (phq9) setPhq9Scores(phq9.scores);
    if (gad7) setGad7Scores(gad7.scores);
  }, [initialData]);

  const handleScoreChange = (
    setter: React.Dispatch<React.SetStateAction<number[]>>,
    idx: number,
    val: number,
  ) => {
    setter((prev) => {
      const next = [...prev];
      next[idx] = val;
      return next;
    });
  };

  const phq9Total = phq9Scores.reduce((a, b) => a + b, 0);
  const gad7Total = gad7Scores.reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-4">
      {/* Scale tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(['PHQ9', 'GAD7'] as const).map((scale) => {
          const total = scale === 'PHQ9' ? phq9Total : gad7Total;
          const max = scale === 'PHQ9' ? 27 : 21;
          const label = scale === 'PHQ9' ? 'PHQ-9' : 'GAD-7';
          const saved = initialData?.some((s) => s.scaleType === scale);
          return (
            <button
              key={scale}
              onClick={() => setActiveScale(scale)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                activeScale === scale
                  ? 'bg-white dark:bg-slate-900 text-kanji dark:text-kio shadow-sm'
                  : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
              }`}
            >
              {label}
              <span className={`text-xs px-1.5 py-0.5 rounded font-bold ${
                activeScale === scale
                  ? 'bg-kio/10 text-kio'
                  : 'bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-slate-400'
              }`}>
                {total}/{max}
              </span>
              {saved && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Guardado" />
              )}
            </button>
          );
        })}
      </div>

      {/* Active scale card */}
      {activeScale === 'PHQ9' ? (
        <ScaleCard
          title="PHQ-9"
          subtitle="Cuestionario de Salud del Paciente — Depresión"
          scaleType="PHQ9"
          questions={PHQ9_QUESTIONS}
          scores={phq9Scores}
          maxScore={27}
          onScoreChange={(idx, val) => handleScoreChange(setPhq9Scores, idx, val)}
          onSave={() => upsertScale({ appointmentId, data: { scaleType: 'PHQ9', scores: phq9Scores } })}
          isSaving={isPendingPhq9}
        />
      ) : (
        <ScaleCard
          title="GAD-7"
          subtitle="Escala de Ansiedad Generalizada"
          scaleType="GAD7"
          questions={GAD7_QUESTIONS}
          scores={gad7Scores}
          maxScore={21}
          onScoreChange={(idx, val) => handleScoreChange(setGad7Scores, idx, val)}
          onSave={() => upsertScaleGad7({ appointmentId, data: { scaleType: 'GAD7', scores: gad7Scores } })}
          isSaving={isPendingGad7}
        />
      )}
    </div>
  );
}
