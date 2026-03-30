import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpsertClinicalScale } from '../../hooks/use-session';
import type { ClinicalScale, ScaleRiskLevel } from '../../types/appointments.types';

interface ScalesTabProps {
  appointmentId: string;
  initialData?: ClinicalScale[];
}

const PHQ9_QUESTIONS = [
  'Poco interés o placer en hacer las cosas',
  'Sentirse triste, deprimido/a o sin esperanza',
  'Dificultad para quedarse dormido/a, o dormir demasiado',
  'Sentirse cansado/a o con poca energía',
  'Poco apetito o comer en exceso',
  'Sentirse mal consigo mismo/a o como un fracasado/a',
  'Dificultad para concentrarse en las cosas',
  'Moverse o hablar lentamente, o estar muy inquieto/a',
  'Pensar que estaría mejor muerto/a o en hacerse daño',
];

const GAD7_QUESTIONS = [
  'Sentirse nervioso/a, ansioso/a o al límite',
  'No poder dejar de preocuparse',
  'Preocuparse demasiado por diferentes cosas',
  'Dificultad para relajarse',
  'Tan inquieto/a que es difícil permanecer sentado/a',
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

const RISK_META: Record<ScaleRiskLevel, { label: string; bar: string; text: string }> = {
  MINIMAL:          { label: 'Mínimo',       bar: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
  MILD:             { label: 'Leve',          bar: 'bg-yellow-400',  text: 'text-yellow-600 dark:text-yellow-400' },
  MODERATE:         { label: 'Moderado',      bar: 'bg-amber-400',   text: 'text-amber-600 dark:text-amber-400'   },
  MODERATELY_SEVERE:{ label: 'Mod. Severo',   bar: 'bg-orange-400',  text: 'text-orange-600 dark:text-orange-400' },
  SEVERE:           { label: 'Severo',        bar: 'bg-rose-500',    text: 'text-rose-600 dark:text-rose-400'     },
};

interface ScaleViewProps {
  title: string;
  subtitle: string;
  scaleType: 'PHQ9' | 'GAD7';
  questions: string[];
  scores: number[];
  maxScore: number;
  saved: boolean;
  isSaving: boolean;
  onScoreChange: (idx: number, val: number) => void;
  onSave: () => void;
}

function ScaleView({
  title,
  subtitle,
  scaleType,
  questions,
  scores,
  maxScore,
  saved,
  isSaving,
  onScoreChange,
  onSave,
}: ScaleViewProps) {
  const total = scores.reduce((a, b) => a + b, 0);
  const risk = computeRisk(scaleType, scores);
  const meta = RISK_META[risk];
  const pct = Math.round((total / maxScore) * 100);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-5"
    >
      {/* ── Score header ── */}
      <div className="flex items-end justify-between">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-baseline gap-1.5">
          {saved && (
            <span className="text-[10px] font-bold text-emerald-500 mb-0.5">guardado</span>
          )}
          <span className={`text-3xl font-black tabular-nums ${meta.text}`}>{total}</span>
          <span className="text-sm text-gray-300 dark:text-slate-600 font-medium">/{maxScore}</span>
          <span className={`text-xs font-bold ml-1 ${meta.text}`}>{meta.label}</span>
        </div>
      </div>

      {/* Progress track */}
      <div className="h-px bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${meta.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>

      {/* ── Questions — single unified card ── */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        {questions.map((question, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: idx * 0.03, duration: 0.2 }}
          >
            {idx > 0 && (
              <div className="h-px bg-gray-100 dark:bg-slate-800 mx-5" />
            )}
            <div className="px-5 py-4 flex items-center gap-6">
              {/* Question */}
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="text-[11px] font-bold text-gray-300 dark:text-slate-600 tabular-nums mt-0.5 w-4 shrink-0 text-right">
                  {idx + 1}
                </span>
                <p className="text-sm text-gray-700 dark:text-slate-200 leading-snug">{question}</p>
              </div>

              {/* Segmented answer selector */}
              <div className="flex items-center gap-px shrink-0 bg-gray-100 dark:bg-slate-800 rounded-lg p-0.5">
                {ANSWER_LABELS.map((label, val) => (
                  <button
                    key={val}
                    onClick={() => onScoreChange(idx, val)}
                    title={label}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 whitespace-nowrap ${
                      scores[idx] === val
                        ? 'bg-kio text-white shadow-sm'
                        : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700'
                    }`}
                  >
                    {val === 0 ? 'Nunca' : val === 1 ? 'Varios' : val === 2 ? 'Mitad' : 'Siempre'}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Save ── */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full py-3 bg-kio hover:bg-kanji disabled:opacity-60 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-kio/20 active:scale-95"
      >
        {isSaving ? 'Guardando…' : `Guardar ${title} · ${total}/${maxScore}`}
      </button>
    </motion.div>
  );
}

export function ScalesTab({ appointmentId, initialData }: ScalesTabProps) {
  const [activeScale, setActiveScale] = useState<'PHQ9' | 'GAD7'>('PHQ9');
  const [phq9Scores, setPhq9Scores] = useState<number[]>(Array(9).fill(0));
  const [gad7Scores, setGad7Scores] = useState<number[]>(Array(7).fill(0));
  const { mutate: upsertPhq9, isPending: isPendingPhq9 } = useUpsertClinicalScale();
  const { mutate: upsertGad7, isPending: isPendingGad7 } = useUpsertClinicalScale();

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
  const phq9Saved = !!initialData?.some((s) => s.scaleType === 'PHQ9');
  const gad7Saved = !!initialData?.some((s) => s.scaleType === 'GAD7');

  return (
    <div className="flex flex-col gap-5">
      {/* ── Tab switcher ── */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit">
        {(['PHQ9', 'GAD7'] as const).map((scale) => {
          const total = scale === 'PHQ9' ? phq9Total : gad7Total;
          const max = scale === 'PHQ9' ? 27 : 21;
          const label = scale === 'PHQ9' ? 'PHQ-9' : 'GAD-7';
          const saved = scale === 'PHQ9' ? phq9Saved : gad7Saved;
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

      {/* ── Scale content ── */}
      <AnimatePresence mode="wait">
        {activeScale === 'PHQ9' ? (
          <motion.div
            key="phq9"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
          >
            <ScaleView
              title="PHQ-9"
              subtitle="Cuestionario de Salud del Paciente — Depresión"
              scaleType="PHQ9"
              questions={PHQ9_QUESTIONS}
              scores={phq9Scores}
              maxScore={27}
              saved={phq9Saved}
              isSaving={isPendingPhq9}
              onScoreChange={(idx, val) => handleScoreChange(setPhq9Scores, idx, val)}
              onSave={() => upsertPhq9({ appointmentId, data: { scaleType: 'PHQ9', scores: phq9Scores } })}
            />
          </motion.div>
        ) : (
          <motion.div
            key="gad7"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            <ScaleView
              title="GAD-7"
              subtitle="Escala de Ansiedad Generalizada"
              scaleType="GAD7"
              questions={GAD7_QUESTIONS}
              scores={gad7Scores}
              maxScore={21}
              saved={gad7Saved}
              isSaving={isPendingGad7}
              onScoreChange={(idx, val) => handleScoreChange(setGad7Scores, idx, val)}
              onSave={() => upsertGad7({ appointmentId, data: { scaleType: 'GAD7', scores: gad7Scores } })}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
