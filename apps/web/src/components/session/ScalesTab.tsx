import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUpsertClinicalScale } from '../../hooks/use-session';
import type { ClinicalScale, ScaleRiskLevel } from '../../types/appointments.types';

interface ScalesTabProps {
  appointmentId: string;
  initialData?: ClinicalScale[];
  /** Hay respuestas contestadas que todavía no se han guardado. */
  onDirtyChange?: (dirty: boolean) => void;
}

import {
  PHQ9_QUESTIONS,
  GAD7_QUESTIONS,
  ANSWER_LABELS,
} from '../../lib/scales.constants';

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

/** Respuestas sin guardar respecto a lo que hay en el servidor. */
function isScaleDirty(current: number[], saved?: number[]): boolean {
  if (saved) return saved.length !== current.length || saved.some((v, i) => v !== current[i]);
  return current.some((v) => v > 0);
}

const RISK_META: Record<ScaleRiskLevel, { label: string; bar: string; text: string }> = {
  MINIMAL:          { label: 'Mínimo',       bar: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400' },
  MILD:             { label: 'Leve',          bar: 'bg-yellow-500',  text: 'text-yellow-700 dark:text-yellow-400' },
  MODERATE:         { label: 'Moderado',      bar: 'bg-amber-400',   text: 'text-amber-700 dark:text-amber-400'   },
  MODERATELY_SEVERE:{ label: 'Mod. severo',   bar: 'bg-orange-400',  text: 'text-orange-700 dark:text-orange-400' },
  SEVERE:           { label: 'Severo',        bar: 'bg-rose-500',    text: 'text-rose-700 dark:text-rose-400'     },
};

interface ScaleViewProps {
  title: string;
  subtitle: string;
  scaleType: 'PHQ9' | 'GAD7';
  questions: string[];
  scores: number[];
  maxScore: number;
  saved: boolean;
  isDirty: boolean;
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
  isDirty,
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
      {/* ── Puntuación ── */}
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-text">{title}</h3>
          <p className="mt-0.5 text-[11px] font-medium text-text-secondary">{subtitle}</p>
        </div>
        <div className="flex shrink-0 items-baseline gap-1.5">
          <span className={`text-3xl font-bold tabular-nums ${meta.text}`}>{total}</span>
          <span className="text-sm font-medium text-text-muted">/{maxScore}</span>
          <span className={`ml-1 text-xs font-bold ${meta.text}`}>{meta.label}</span>
        </div>
      </div>

      {/* Estado de guardado, en texto y no solo en un punto de color. */}
      <div className="-mt-3 flex items-center gap-2">
        {isDirty ? (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            Sin guardar
          </span>
        ) : saved ? (
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            Guardada
          </span>
        ) : (
          <span className="rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-bold text-text-secondary">
            Sin responder
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="h-px overflow-hidden rounded-full bg-border">
        <motion.div
          className={`h-full ${meta.bar}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>

      {/* ── Leyenda de respuestas ──
          Los botones son estrechos y antes mostraban recortes inventados
          ("Mitad" — ¿mitad de qué?) mientras el texto real de la escala vivía
          en un `title`, que en táctil no existe. Ahora el botón lleva el valor
          y el significado está aquí, visible siempre. */}
      <div className="rounded-md border border-border bg-secondary px-3 py-2">
        <p className="mb-1.5 text-[11px] font-bold uppercase tracking-wider text-text-muted">
          Frecuencia en las últimas 2 semanas
        </p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1">
          {ANSWER_LABELS.map((label, val) => (
            <div key={label} className="flex items-baseline gap-1.5">
              <dt className="text-[11px] font-bold tabular-nums text-text">{val}</dt>
              <dd className="truncate text-[11px] font-medium text-text-secondary">{label}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ── Preguntas ── */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
        {questions.map((question, idx) => (
          <div key={question}>
            {idx > 0 && <div className="mx-5 h-px bg-border" />}
            <div className="flex flex-col gap-3 px-5 py-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 w-4 shrink-0 text-right text-[11px] font-bold tabular-nums text-text-muted">
                  {idx + 1}
                </span>
                <p className="text-sm font-medium leading-snug text-text">{question}</p>
              </div>

              <div
                role="radiogroup"
                aria-label={`Respuesta a: ${question}`}
                className="flex items-center gap-px self-end rounded-lg bg-secondary p-0.5"
              >
                {ANSWER_LABELS.map((label, val) => (
                  <button
                    key={val}
                    type="button"
                    role="radio"
                    aria-checked={scores[idx] === val}
                    aria-label={`${val} — ${label}`}
                    onClick={() => onScoreChange(idx, val)}
                    className={`flex size-11 items-center justify-center rounded-md text-sm font-bold tabular-nums transition-colors duration-150 ${
                      scores[idx] === val
                        ? 'bg-kanji-deep text-white shadow-sm'
                        : 'text-text-secondary hover:bg-surface hover:text-text'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Guardar ── */}
      <button
        type="button"
        onClick={onSave}
        disabled={isSaving}
        className="flex min-h-11 w-full items-center justify-center rounded-xl bg-kanji-deep text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95 disabled:opacity-60"
      >
        {isSaving ? 'Guardando…' : `Guardar ${title} · ${total}/${maxScore}`}
      </button>
    </motion.div>
  );
}

export function ScalesTab({ appointmentId, initialData, onDirtyChange }: ScalesTabProps) {
  const [activeScale, setActiveScale] = useState<'PHQ9' | 'GAD7'>('PHQ9');
  const [phq9Scores, setPhq9Scores] = useState<number[]>(Array(9).fill(0));
  const [gad7Scores, setGad7Scores] = useState<number[]>(Array(7).fill(0));
  const { mutate: upsertPhq9, isPending: isPendingPhq9 } = useUpsertClinicalScale();
  const { mutate: upsertGad7, isPending: isPendingGad7 } = useUpsertClinicalScale();

  const savedPhq9 = initialData?.find((s) => s.scaleType === 'PHQ9')?.scores;
  const savedGad7 = initialData?.find((s) => s.scaleType === 'GAD7')?.scores;

  const phq9Dirty = isScaleDirty(phq9Scores, savedPhq9);
  const gad7Dirty = isScaleDirty(gad7Scores, savedGad7);
  const isDirty = phq9Dirty || gad7Dirty;

  // Hidratación en render (no en efecto): la variante con `setTimeout(…, 0)`
  // pintaba un fotograma con las escalas a cero antes de aplicar lo guardado.
  // Con respuestas sin guardar en pantalla NO se rehidrata: un refetch (volver
  // a la pestaña, por ejemplo) borraría lo que el clínico acaba de marcar.
  const [hydratedFrom, setHydratedFrom] = useState<ClinicalScale[] | null>(null);
  if (initialData && initialData !== hydratedFrom && !isDirty) {
    setHydratedFrom(initialData);
    if (savedPhq9) setPhq9Scores(savedPhq9);
    if (savedGad7) setGad7Scores(savedGad7);
  }

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Las escalas viven en el panel lateral y se desmontan al cambiar de pestaña.
  // Sin esto, el aviso de "sin guardar" se quedaría encendido para siempre.
  useEffect(() => () => onDirtyChange?.(false), [onDirtyChange]);

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
    <div className="flex flex-col gap-5">
      {/* ── Selector de escala ── */}
      <div className="flex w-fit gap-1 rounded-xl bg-secondary p-1">
        {(['PHQ9', 'GAD7'] as const).map((scale) => {
          const total = scale === 'PHQ9' ? phq9Total : gad7Total;
          const max = scale === 'PHQ9' ? 27 : 21;
          const label = scale === 'PHQ9' ? 'PHQ-9' : 'GAD-7';
          const dirty = scale === 'PHQ9' ? phq9Dirty : gad7Dirty;
          return (
            <button
              key={scale}
              type="button"
              aria-pressed={activeScale === scale}
              onClick={() => setActiveScale(scale)}
              className={`flex min-h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors ${
                activeScale === scale
                  ? 'bg-surface text-kanji-deep shadow-sm dark:text-kio'
                  : 'text-text-secondary hover:text-text'
              }`}
            >
              {label}
              <span
                className={`rounded-xs px-1.5 py-0.5 text-[11px] font-bold tabular-nums ${
                  activeScale === scale
                    ? 'bg-cruz text-kanji-deep dark:bg-kio/15 dark:text-kio'
                    : 'bg-border text-text-secondary'
                }`}
              >
                {total}/{max}
              </span>
              {dirty && (
                <>
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-500" />
                  <span className="sr-only">con respuestas sin guardar</span>
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Escala activa ── */}
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
              saved={Boolean(savedPhq9)}
              isDirty={phq9Dirty}
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
              saved={Boolean(savedGad7)}
              isDirty={gad7Dirty}
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
