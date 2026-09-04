import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Loader2 } from 'lucide-react';
import {
  questionsFor,
  ANSWER_LABELS,
  SCALE_TITLES,
  SCALE_INTRO,
} from '../../lib/scales.constants';

interface ScaleFormRunnerProps {
  scaleType: 'PHQ9' | 'GAD7';
  isSubmitting: boolean;
  onSubmit: (scores: number[]) => void;
  onCancel: () => void;
}

/**
 * Auto-reporte del paciente: una pregunta por pantalla, Likert 0-3.
 * Al responder la última pregunta se envía automáticamente.
 *
 * El progreso nunca queda solo en la barra: "n de N" es texto visible, porque
 * la barra es color sobre color y no la ve quien usa lector de pantalla.
 */
export function ScaleFormRunner({
  scaleType,
  isSubmitting,
  onSubmit,
  onCancel,
}: ScaleFormRunnerProps) {
  const questions = questionsFor(scaleType);
  const [answers, setAnswers] = useState<(number | null)[]>(
    Array<number | null>(questions.length).fill(null),
  );
  const [current, setCurrent] = useState(0);

  const progress = Math.round((current / questions.length) * 100);

  const handleAnswer = (value: number) => {
    const next = [...answers];
    next[current] = value;
    setAnswers(next);

    if (current < questions.length - 1) {
      setCurrent(current + 1);
    } else {
      onSubmit(next.map((v) => v ?? 0));
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-6 space-y-5">
      {/* Header + progreso */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => (current > 0 ? setCurrent(current - 1) : onCancel())}
            className="inline-flex items-center gap-1 min-h-11 -ml-2 px-2 rounded-xl text-sm font-semibold text-text/70 dark:text-slate-400 hover:text-kanji-deep dark:hover:text-white transition-colors"
          >
            <ArrowLeft aria-hidden="true" size={14} />
            {current > 0 ? 'Anterior' : 'Salir'}
          </button>
          <span className="text-sm font-semibold text-text/70 dark:text-slate-400">
            {current + 1} de {questions.length}
          </span>
        </div>
        <h2 className="text-sm font-bold text-kanji-deep dark:text-white">
          {SCALE_TITLES[scaleType]}
        </h2>
        {/*
          `aria-valuenow` mide lo mismo que el relleno: preguntas ya
          respondidas, no la pregunta en curso. Con `current + 1` un lector de
          pantalla anunciaba 100% en la última pregunta, aún sin responder,
          mientras la barra mostraba 89%.
        */}
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={questions.length}
          aria-valuenow={current}
          aria-valuetext={`Pregunta ${current + 1} de ${questions.length}`}
          className="h-1.5 rounded-full bg-cruz/60 dark:bg-slate-800 overflow-hidden"
        >
          <div
            className="h-full bg-kanji-deep dark:bg-kio rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-text/70 dark:text-slate-400 leading-relaxed">
          {SCALE_INTRO}
        </p>
      </div>

      {/* Pregunta actual */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.18 }}
          className="space-y-4"
        >
          <p className="text-base font-semibold text-text dark:text-white leading-snug min-h-[3rem]">
            {questions[current]}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {ANSWER_LABELS.map((label, value) => (
              <button
                key={value}
                type="button"
                disabled={isSubmitting}
                aria-pressed={answers[current] === value}
                onClick={() => handleAnswer(value)}
                className={`w-full min-h-11 px-4 py-3.5 rounded-xl border text-left text-sm font-semibold transition-all active:scale-[0.99] disabled:opacity-60 ${
                  answers[current] === value
                    ? 'border-kanji-deep dark:border-kio bg-kio-light dark:bg-kio/20 text-kanji-deep dark:text-kio'
                    : 'border-border dark:border-slate-700 bg-bg dark:bg-slate-800 text-text dark:text-slate-300 hover:border-kanji-deep/50 dark:hover:border-kio/50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {isSubmitting && current === questions.length - 1 && (
            <div
              aria-live="polite"
              className="flex items-center justify-center gap-2 text-sm text-text/70 dark:text-slate-400"
            >
              <Loader2 aria-hidden="true" size={15} className="animate-spin" />{' '}
              Enviando respuestas…
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
