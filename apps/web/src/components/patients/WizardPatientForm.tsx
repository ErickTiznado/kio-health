import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { DatePicker } from '../ui/DatePicker';
import {
  X, User, HeartPulse, FileText, ArrowLeft, ArrowRight, Check, AlertCircle, Plus, Trash2, ShieldCheck,
} from 'lucide-react';
import { patientSchema, type PatientFormValues } from '../../schemas/patients.schema';
import { PhoneInput } from '../ui/PhoneInput';

interface WizardPatientFormProps {
  onSubmit: (data: PatientFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
  /** Id del título, para que el diálogo contenedor pueda referenciarlo. */
  titleId?: string;
}

const PENDING_DIAGNOSIS = 'En proceso de evaluación';

const STEPS = [
  { id: 1, label: 'Identidad', icon: User },
  { id: 2, label: 'Contacto', icon: HeartPulse },
  { id: 3, label: 'Clínico', icon: FileText },
];

/**
 * En qué paso vive cada campo. Si el envío falla la validación, el asistente
 * salta al primer paso con error en vez de quedarse quieto en el paso 3 con el
 * mensaje fuera de pantalla.
 */
const FIELD_STEP: Record<string, number> = {
  fullName: 1,
  contactPhone: 1,
  contactEmail: 1,
  dateOfBirth: 1,
  emergencyContact: 2,
  diagnosis: 3,
  clinicalContext: 3,
  treatmentGoals: 3,
  medicacionActual: 3,
  alergias: 3,
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0 }),
};

/**
 * Asistente de ALTA de paciente. Deliberadamente no tiene modo edición: la
 * ficha existente se edita en "Perfil clínico", sección a sección. Antes había
 * dos modelos incompatibles para los mismos campos (este asistente de 3 pasos
 * con `patientSchema`, y el editor in-place con sus propios esquemas), y ambos
 * escribían `fullName`, `contactPhone`, `diagnosis` y `treatmentGoals`.
 */
export function WizardPatientForm({
  onSubmit,
  onCancel,
  isLoading,
  titleId,
}: WizardPatientFormProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const {
    register, handleSubmit, trigger, control, watch, setValue, setError,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: '',
      contactPhone: '',
      contactEmail: '',
      dateOfBirth: '',
      diagnosis: PENDING_DIAGNOSIS,
      clinicalContext: '',
      treatmentGoals: [],
      medicacionActual: '',
      alergias: '',
      emergencyContact: { name: '', phone: '', relation: '' },
    },
  });

  const diagnosisValue = watch('diagnosis');
  // El modo es estado propio, no se deriva del valor. Derivarlo hacía que al
  // pulsar "Especificar" (que vacía el campo) ningún botón quedara marcado.
  const [diagnosisMode, setDiagnosisMode] = useState<'pending' | 'custom'>('pending');
  const treatmentGoals = watch('treatmentGoals') || [];
  const goalInputRef = useRef<HTMLInputElement>(null);
  const [goalDraft, setGoalDraft] = useState('');

  const addGoal = () => {
    const trimmed = goalDraft.trim();
    if (!trimmed) return;
    setValue('treatmentGoals', [...treatmentGoals, trimmed]);
    setGoalDraft('');
    goalInputRef.current?.focus();
  };

  const removeGoal = (index: number) => {
    setValue('treatmentGoals', treatmentGoals.filter((_, i) => i !== index));
  };

  const nextStep = async () => {
    let valid = true;
    if (step === 1) valid = await trigger(['fullName', 'contactPhone', 'contactEmail', 'dateOfBirth']);
    if (step === 2) valid = await trigger(['emergencyContact']);
    if (valid) { setDirection(1); setStep((s) => Math.min(s + 1, STEPS.length)); }
  };

  const prevStep = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  // El paso 3 no comprobaba nada antes de enviar: con "Especificar" marcado y el
  // campo vacío se creaba el expediente con un diagnóstico en blanco, justo
  // después de que el clínico dijera que iba a especificarlo.
  const submit = handleSubmit(
    (values) => {
      if (diagnosisMode === 'custom' && !(values.diagnosis ?? '').trim()) {
        setError('diagnosis', {
          type: 'manual',
          message: 'Escribe el diagnóstico o vuelve a «En proceso».',
        });
        setDirection(1);
        setStep(3);
        return;
      }
      onSubmit(values);
    },
    (formErrors) => {
      const steps = Object.keys(formErrors).map((field) => FIELD_STEP[field] ?? 3);
      const firstStep = steps.length > 0 ? Math.min(...steps) : step;
      setDirection(firstStep < step ? -1 : 1);
      setStep(firstStep);
    },
  );

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all duration-150';
  // La firma tipográfica del sistema: versalita de 11px. `text-gray-400` sobre
  // blanco mide 2.8:1 y no llegaba a AA para una etiqueta de campo.
  const labelClass =
    'block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-1.5';
  const errorClass = 'mt-1.5 text-xs text-rose-700 dark:text-rose-400 font-bold';
  const hintClass = 'text-xs font-medium text-slate-600 dark:text-slate-400 mt-1.5';

  return (
    <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-3xl">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border dark:border-slate-800 shrink-0">
        <img src="/LogoFavi.png" alt="" aria-hidden="true" className="h-7 w-7 object-contain shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 id={titleId} className="text-sm font-bold text-kanji-deep dark:text-white leading-tight">
            Nuevo paciente
          </h2>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mt-0.5">
            {STEPS[step - 1].label} · Paso {step} de {STEPS.length}
          </p>
        </div>
        {/* Pill step indicator */}
        <div className="flex items-center gap-1" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step} aria-label="Progreso del formulario">
          {STEPS.map((s, i) => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step - 1
                  ? 'w-6 bg-kio'
                  : i < step - 1
                  ? 'w-3 bg-kio/40'
                  : 'w-3 bg-gray-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Cerrar"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-text dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
        >
          <X size={17} aria-hidden="true" />
        </button>
      </div>

      {/* ── Steps ────────────────────────────────────── */}
      <form onSubmit={submit} className="flex flex-col flex-1">
        {/* Sin `AnimatePresence`: con `mode="wait"` la salida no resolvía y el paso
            anterior se quedaba montado — la cabecera decía "Paso 2 de 3" mientras
            seguían en pantalla los campos del paso 1. La entrada se anima igual,
            con `key={step}`, que es lo único que aporta aquí. */}
        <div className="flex-1 relative px-6 pt-6 pb-2 overflow-x-hidden overflow-y-auto">
          <div key={step}>

            {/* Step 1 — Identidad */}
            {step === 1 && (
              <motion.div
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } }}
                className="flex flex-col gap-5"
              >
                <div>
                  <label className={labelClass} htmlFor="wizard-full-name">
                    Nombre completo <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="wizard-full-name"
                    {...register('fullName')}
                    className={inputClass}
                    placeholder="Ej. Juan Pérez"
                    autoFocus
                    aria-invalid={!!errors.fullName}
                    aria-describedby={errors.fullName ? 'wizard-full-name-error' : undefined}
                  />
                  {errors.fullName && (
                    <p id="wizard-full-name-error" className={errorClass}>{errors.fullName.message}</p>
                  )}
                </div>
                {/* `PhoneInput` monta dos controles (prefijo + número) y no acepta
                    `id`, así que el nombre accesible se da al grupo. */}
                <div role="group" aria-labelledby="wizard-phone-label">
                  <span className={labelClass} id="wizard-phone-label">Teléfono</span>
                  <Controller
                    control={control}
                    name="contactPhone"
                    render={({ field }) => (
                      <PhoneInput value={field.value || ''} onChange={field.onChange} />
                    )}
                  />
                  {errors.contactPhone && <p className={errorClass}>{errors.contactPhone.message}</p>}
                </div>
                <div>
                  <label className={labelClass} htmlFor="wizard-email">
                    Email <span className="font-normal normal-case text-slate-600 dark:text-slate-400">(para recordatorios)</span>
                  </label>
                  <input
                    id="wizard-email"
                    {...register('contactEmail')}
                    type="email"
                    className={inputClass}
                    placeholder="paciente@email.com"
                    aria-invalid={!!errors.contactEmail}
                    aria-describedby={errors.contactEmail ? 'wizard-email-error' : undefined}
                  />
                  {errors.contactEmail && (
                    <p id="wizard-email-error" className={errorClass}>{errors.contactEmail.message}</p>
                  )}
                </div>
                <div>
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <>
                        <DatePicker
                          label="Fecha de nacimiento"
                          value={field.value}
                          onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          error={errors.dateOfBirth?.message}
                        />
                        <p className={hintClass}>Formato: DD/MM/AAAA</p>
                      </>
                    )}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2 — Contacto de emergencia */}
            {step === 2 && (
              <motion.div
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } }}
                className="flex flex-col gap-5"
              >
                <div className="flex gap-3 p-3.5 bg-cruz/30 dark:bg-slate-800/60 rounded-xl border border-cruz dark:border-slate-700">
                  <AlertCircle size={15} aria-hidden="true" className="text-kanji-deep dark:text-kio shrink-0 mt-0.5" />
                  <p className="text-xs font-medium text-text dark:text-slate-300 leading-relaxed">
                    Datos para contacto de emergencia. Se guardan cifrados, igual que el resto del expediente.
                  </p>
                </div>
                <div>
                  <label className={labelClass} htmlFor="wizard-ec-name">Nombre del contacto</label>
                  <input
                    id="wizard-ec-name"
                    {...register('emergencyContact.name')}
                    className={inputClass}
                    placeholder="Nombre completo"
                    autoFocus
                    aria-invalid={!!errors.emergencyContact?.name}
                    aria-describedby={errors.emergencyContact?.name ? 'wizard-ec-name-error' : undefined}
                  />
                  {errors.emergencyContact?.name && (
                    <p id="wizard-ec-name-error" className={errorClass}>{errors.emergencyContact.name.message}</p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass} htmlFor="wizard-ec-relation">Relación</label>
                    <input
                      id="wizard-ec-relation"
                      {...register('emergencyContact.relation')}
                      className={inputClass}
                      placeholder="Ej. Madre"
                      aria-invalid={!!errors.emergencyContact?.relation}
                      aria-describedby={errors.emergencyContact?.relation ? 'wizard-ec-relation-error' : undefined}
                    />
                    {errors.emergencyContact?.relation && (
                      <p id="wizard-ec-relation-error" className={errorClass}>{errors.emergencyContact.relation.message}</p>
                    )}
                  </div>
                  <div role="group" aria-labelledby="wizard-ec-phone-label">
                    <span className={labelClass} id="wizard-ec-phone-label">Teléfono</span>
                    <Controller
                      control={control}
                      name="emergencyContact.phone"
                      render={({ field }) => (
                        <PhoneInput value={field.value || ''} onChange={field.onChange} />
                      )}
                    />
                    {errors.emergencyContact?.phone && <p className={errorClass}>{errors.emergencyContact.phone.message}</p>}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Escenario clínico */}
            {step === 3 && (
              <motion.div
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } }}
                className="flex flex-col gap-5"
              >
                <div>
                  <span className={labelClass} id="diagnosis-label">
                    Diagnóstico inicial
                  </span>
                  <div className="flex gap-2 mb-3" role="radiogroup" aria-labelledby="diagnosis-label">
                    <button
                      type="button"
                      role="radio"
                      aria-checked={diagnosisMode === 'pending'}
                      onClick={() => {
                        setDiagnosisMode('pending');
                        setValue('diagnosis', PENDING_DIAGNOSIS, { shouldValidate: true });
                      }}
                      className={`flex-1 min-h-11 px-3 rounded-xl text-xs font-bold border transition-colors duration-150 ${
                        diagnosisMode === 'pending'
                          ? 'bg-kanji-deep text-white border-kanji-deep shadow-sm shadow-kio/20 dark:bg-kio dark:text-slate-900 dark:border-kio'
                          : 'bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-kio/40'
                      }`}
                    >
                      En proceso
                    </button>
                    <button
                      type="button"
                      role="radio"
                      aria-checked={diagnosisMode === 'custom'}
                      onClick={() => {
                        setDiagnosisMode('custom');
                        if (diagnosisValue === PENDING_DIAGNOSIS) setValue('diagnosis', '');
                      }}
                      className={`flex-1 min-h-11 px-3 rounded-xl text-xs font-bold border transition-colors duration-150 ${
                        diagnosisMode === 'custom'
                          ? 'bg-kanji-deep text-white border-kanji-deep shadow-sm shadow-kio/20 dark:bg-kio dark:text-slate-900 dark:border-kio'
                          : 'bg-gray-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-kio/40'
                      }`}
                    >
                      Especificar
                    </button>
                  </div>
                  {diagnosisMode === 'custom' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden"
                    >
                      <label className="sr-only" htmlFor="wizard-diagnosis">Diagnóstico</label>
                      <textarea
                        id="wizard-diagnosis"
                        {...register('diagnosis')} rows={2}
                        className={`${inputClass} resize-none`}
                        placeholder="Diagnóstico preliminar…" autoFocus
                        aria-invalid={!!errors.diagnosis}
                        aria-describedby={errors.diagnosis ? 'wizard-diagnosis-error' : undefined}
                      />
                    </motion.div>
                  )}
                  {errors.diagnosis && (
                    <p id="wizard-diagnosis-error" className={errorClass}>{errors.diagnosis.message}</p>
                  )}
                  {diagnosisMode === 'pending' && !errors.diagnosis && (
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                      Se registrará como «{PENDING_DIAGNOSIS}» hasta que lo actualices.
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass} htmlFor="wizard-clinical-context">Motivo de consulta</label>
                  <textarea
                    id="wizard-clinical-context"
                    {...register('clinicalContext')} rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Describe brevemente el motivo de la visita..."
                    aria-invalid={!!errors.clinicalContext}
                    aria-describedby={errors.clinicalContext ? 'wizard-clinical-context-error' : undefined}
                  />
                  {errors.clinicalContext && (
                    <p id="wizard-clinical-context-error" className={errorClass}>{errors.clinicalContext.message}</p>
                  )}
                </div>

                {/* Medicación y alergias: existían en el modelo y se leen en el
                    panel de sesión, pero no había dónde escribirlos. Sin este
                    par, la sesión mostraba "Sin alergias registradas" de forma
                    permanente, que se lee como una afirmación clínica. */}
                <div className="rounded-xl border border-border bg-secondary p-3.5 dark:border-slate-700 dark:bg-slate-800/60">
                  <div className="mb-3 flex items-start gap-2.5">
                    <ShieldCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-kanji-deep dark:text-kio" />
                    <p className="text-xs font-medium leading-relaxed text-text dark:text-slate-300">
                      Medicación y alergias se guardan cifradas y aparecen en el panel de sesión.
                      Por estar cifradas no se pueden buscar ni filtrar.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div>
                      <label className={labelClass} htmlFor="wizard-alergias">Alergias</label>
                      <textarea
                        id="wizard-alergias"
                        {...register('alergias')} rows={2}
                        className={`${inputClass} resize-none`}
                        placeholder="Ej. Penicilina, AINEs… Déjalo vacío si no se han preguntado."
                        aria-invalid={!!errors.alergias}
                        aria-describedby={errors.alergias ? 'wizard-alergias-error' : undefined}
                      />
                      {errors.alergias && (
                        <p id="wizard-alergias-error" className={errorClass}>{errors.alergias.message}</p>
                      )}
                    </div>
                    <div>
                      <label className={labelClass} htmlFor="wizard-medicacion">Medicación actual</label>
                      <textarea
                        id="wizard-medicacion"
                        {...register('medicacionActual')} rows={2}
                        className={`${inputClass} resize-none`}
                        placeholder="Fármaco, dosis y pauta. Ej. Sertralina 50 mg / día."
                        aria-invalid={!!errors.medicacionActual}
                        aria-describedby={errors.medicacionActual ? 'wizard-medicacion-error' : undefined}
                      />
                      {errors.medicacionActual && (
                        <p id="wizard-medicacion-error" className={errorClass}>{errors.medicacionActual.message}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className={labelClass} htmlFor="goal-draft">
                    Objetivos de tratamiento
                  </label>
                  {treatmentGoals.length > 0 && (
                    <ul className="space-y-2 mb-2">
                      {treatmentGoals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2">
                          <span aria-hidden="true" className="mt-1.5 w-5 h-5 rounded-full bg-cruz/60 dark:bg-kio/20 flex items-center justify-center text-[11px] font-bold text-kanji-deep dark:text-kio shrink-0">{i + 1}</span>
                          <span className="flex-1 py-1 text-sm font-medium text-text dark:text-slate-300 leading-snug">{goal}</span>
                          <button
                            type="button"
                            onClick={() => removeGoal(i)}
                            aria-label={`Quitar objetivo: ${goal}`}
                            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-text-secondary hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-400 transition-colors duration-150"
                          >
                            <Trash2 size={14} aria-hidden="true" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <input
                      id="goal-draft"
                      ref={goalInputRef}
                      type="text"
                      value={goalDraft}
                      onChange={(e) => setGoalDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal(); } }}
                      placeholder="Ej. Reducir niveles de ansiedad…"
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={addGoal}
                      disabled={!goalDraft.trim()}
                      aria-label="Agregar objetivo"
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cruz/50 hover:bg-cruz dark:bg-kio/20 dark:hover:bg-kio/30 text-kanji-deep dark:text-kio transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Plus size={16} aria-hidden="true" />
                    </button>
                  </div>
                  {errors.treatmentGoals ? (
                    <p className={errorClass}>{errors.treatmentGoals.message}</p>
                  ) : (
                    <p className={hintClass}>Presiona Enter o el botón + para agregar</p>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </div>

        {/* ── Footer nav ───────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={step > 1 ? prevStep : onCancel}
            className="flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-bold text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-text dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <ArrowLeft size={15} aria-hidden="true" />
            {step > 1 ? 'Anterior' : 'Cancelar'}
          </button>

          <button
            type={step === STEPS.length ? 'submit' : 'button'}
            onClick={step < STEPS.length ? nextStep : undefined}
            disabled={isLoading}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-kanji-deep px-5 text-sm font-bold text-white shadow-sm shadow-kio/20 transition-colors duration-150 hover:bg-kanji hover:shadow-md hover:shadow-kio/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
          >
            {isLoading ? (
              'Guardando…'
            ) : step === STEPS.length ? (
              <><Check size={15} aria-hidden="true" /> Guardar paciente</>
            ) : (
              <>Siguiente <ArrowRight size={15} aria-hidden="true" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
