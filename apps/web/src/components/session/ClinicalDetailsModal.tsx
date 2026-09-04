import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Target, Activity, Phone, Pill, Stethoscope } from 'lucide-react';

import type { PsychContext } from '../../types/appointments.types';

interface ClinicalDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  /**
   * Contexto clínico completo.
   *
   * El tipo declaraba solo tres campos mientras la página pasaba el objeto
   * entero, así que `emergencyContact`, `medicacionActual` y `alergias`
   * llegaban aquí y se descartaban en silencio — en un modal titulado
   * "Detalles clínicos".
   */
  psychContext: PsychContext;
}

export function ClinicalDetailsModal({
  isOpen,
  onClose,
  patientName,
  psychContext,
}: ClinicalDetailsModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // `onClose` llega como flecha en línea desde PatientContextPanel, así que
  // cambia en cada render del panel. Con el callback en las dependencias, el
  // efecto se remontaba mientras el modal estaba abierto y su
  // `closeButtonRef.current?.focus()` devolvía el foco a la X en mitad de la
  // lectura. El ref lo saca de las dependencias.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onCloseRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [isOpen]);

  const { emergencyContact, medicacionActual, alergias, treatmentGoals } = psychContext;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clinical-details-title"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm dark:bg-black/60"
            aria-hidden="true"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className="relative z-10 flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-slate-900"
          >
            {/* Encabezado */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-secondary px-6 py-4">
              <div className="min-w-0">
                <h2
                  id="clinical-details-title"
                  className="text-xl font-bold tracking-tight text-text"
                >
                  Detalles clínicos
                </h2>
                <p className="truncate text-sm font-medium text-text-secondary">
                  {patientName}
                  {psychContext.totalSessions !== undefined && (
                    <> · {psychContext.totalSessions} sesiones</>
                  )}
                </p>
              </div>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                aria-label="Cerrar los detalles clínicos"
                className="flex size-11 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-border hover:text-text"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="min-h-0 flex-1 space-y-7 overflow-y-auto p-6">
              {/* Diagnóstico */}
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-kanji-deep dark:text-kio">
                  <Activity size={16} aria-hidden="true" />
                  Diagnóstico actual
                </h3>
                <p className="rounded-md border border-cruz bg-cruz p-4 text-sm font-medium leading-relaxed text-kanji-deep dark:border-kio/20 dark:bg-kio/10 dark:text-kio">
                  {psychContext.diagnosis || 'Sin diagnóstico registrado.'}
                </p>
              </section>

              {/* Contexto clínico */}
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <FileText size={16} aria-hidden="true" />
                  Contexto clínico
                </h3>
                <p className="rounded-md border border-border bg-secondary p-4 text-sm font-medium leading-relaxed text-text">
                  {psychContext.clinicalContext || 'Sin contexto registrado.'}
                </p>
              </section>

              {/* Información médica */}
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-text-muted">
                  <Stethoscope size={16} aria-hidden="true" />
                  Información médica
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div
                    className={`rounded-md border p-3 text-sm ${
                      alergias
                        ? 'border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-900/40 dark:bg-orange-900/15 dark:text-orange-200'
                        : 'border-border bg-secondary text-text-secondary'
                    }`}
                  >
                    <span className="mb-1 flex items-center gap-2 font-bold">
                      <Stethoscope size={15} aria-hidden="true" />
                      Alergias
                    </span>
                    <p className="font-medium leading-relaxed">
                      {alergias || 'Sin alergias registradas'}
                    </p>
                  </div>

                  <div className="rounded-md border border-border bg-secondary p-3 text-sm text-text-secondary">
                    <span className="mb-1 flex items-center gap-2 font-bold">
                      <Pill size={15} aria-hidden="true" />
                      Medicación actual
                    </span>
                    <p className="font-medium leading-relaxed">
                      {medicacionActual || 'Sin medicación registrada'}
                    </p>
                  </div>
                </div>
              </section>

              {/* Contacto de emergencia */}
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  <Phone size={16} aria-hidden="true" />
                  Contacto de emergencia
                </h3>
                {emergencyContact ? (
                  <div className="rounded-md border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/40 dark:bg-rose-950/20">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-bold text-text">
                      {emergencyContact.name}
                      {emergencyContact.relation && (
                        <span className="rounded-xs bg-surface px-1.5 py-0.5 text-[11px] font-medium text-text-secondary">
                          {emergencyContact.relation}
                        </span>
                      )}
                    </p>
                    <a
                      href={`tel:${emergencyContact.phone}`}
                      className="mt-1 inline-flex min-h-11 items-center text-sm font-bold text-kanji-deep hover:underline dark:text-kio"
                    >
                      {emergencyContact.phone}
                    </a>
                  </div>
                ) : (
                  <p className="text-sm font-medium italic text-text-muted">
                    Sin contacto de emergencia registrado.
                  </p>
                )}
              </section>

              {/* Objetivos terapéuticos */}
              <section className="space-y-2">
                <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  <Target size={16} aria-hidden="true" />
                  Objetivos terapéuticos
                </h3>
                {treatmentGoals && treatmentGoals.length > 0 ? (
                  <ul className="grid gap-2">
                    {treatmentGoals.map((goal, idx) => (
                      <li
                        key={`${idx}-${goal}`}
                        className="flex gap-3 rounded-md border border-border bg-secondary p-3"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 size-1.5 shrink-0 rounded-full bg-emerald-500"
                        />
                        <span className="text-sm font-medium leading-relaxed text-text">{goal}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm font-medium italic text-text-muted">
                    Sin objetivos definidos.
                  </p>
                )}
              </section>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
