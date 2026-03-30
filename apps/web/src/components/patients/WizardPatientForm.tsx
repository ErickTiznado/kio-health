import { useState, useRef } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { DatePicker } from '../ui/DatePicker';
import {
  X, User, HeartPulse, FileText, ArrowLeft, ArrowRight, Check, AlertCircle, Plus, Trash2,
} from 'lucide-react';
import { patientSchema, type PatientFormValues } from '../../schemas/patients.schema';
import type { Patient } from '../../types/patients.types';
import { PhoneInput } from '../ui/PhoneInput';

interface WizardPatientFormProps {
  initialData?: Patient;
  onSubmit: (data: PatientFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, label: 'Identidad', icon: User },
  { id: 2, label: 'Contacto', icon: HeartPulse },
  { id: 3, label: 'Clínico', icon: FileText },
];

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0 }),
};

export function WizardPatientForm({ initialData, onSubmit, onCancel, isLoading }: WizardPatientFormProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const {
    register, handleSubmit, trigger, control, watch, setValue,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: initialData?.fullName || '',
      contactPhone: initialData?.contactPhone || '',
      dateOfBirth: initialData?.dateOfBirth
        ? new Date(initialData.dateOfBirth).toISOString().split('T')[0]
        : '',
      diagnosis: initialData?.diagnosis || 'En proceso de evaluación',
      clinicalContext: initialData?.clinicalContext || '',
      treatmentGoals: initialData?.treatmentGoals || [],
      emergencyContact: {
        name: initialData?.emergencyContact?.name || '',
        phone: initialData?.emergencyContact?.phone || '',
        relation: initialData?.emergencyContact?.relation || '',
      },
    },
  });

  const diagnosisValue = watch('diagnosis');
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
    if (step === 1) valid = await trigger(['fullName', 'contactPhone', 'dateOfBirth']);
    // step 2 (emergency contact) is fully optional — always advance
    if (valid) { setDirection(1); setStep((s) => Math.min(s + 1, STEPS.length)); }
  };

  const prevStep = () => { setDirection(-1); setStep((s) => Math.max(s - 1, 1)); };

  const inputClass =
    'w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio transition-all';
  const labelClass = 'block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5';
  const errorClass = 'mt-1.5 text-xs text-rose-500 font-medium';

  return (
    <div className="flex flex-col h-full min-h-[540px] rounded-3xl overflow-hidden">
      {/* ── Header ───────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
        <img src="/LogoFavi.png" alt="Kio" className="h-7 w-7 object-contain shrink-0" />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-bold text-kanji dark:text-white leading-tight">
            {initialData ? 'Editar Paciente' : 'Nuevo Paciente'}
          </h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            {STEPS[step - 1].label} · Paso {step} de {STEPS.length}
          </p>
        </div>
        {/* Pill step indicator */}
        <div className="flex items-center gap-1">
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
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors shrink-0"
        >
          <X size={17} />
        </button>
      </div>

      {/* ── Steps ────────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1">
        <div className="flex-1 relative px-6 pt-6 pb-2 overflow-x-hidden overflow-y-auto">
          <AnimatePresence initial={false} custom={direction} mode="wait">

            {/* Step 1 — Identidad */}
            {step === 1 && (
              <motion.div
                key="s1"
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } }}
                className="flex flex-col gap-5"
              >
                <div>
                  <label className={labelClass}>Nombre Completo <span className="text-rose-400">*</span></label>
                  <input {...register('fullName')} className={inputClass} placeholder="Ej. Juan Pérez" autoFocus />
                  {errors.fullName && <p className={errorClass}>{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className={labelClass}>Teléfono</label>
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
                  <Controller
                    control={control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <>
                        <DatePicker
                          label="Fecha de Nacimiento"
                          value={field.value}
                          onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                          error={errors.dateOfBirth?.message}
                        />
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Formato: DD/MM/AAAA</p>
                      </>
                    )}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 2 — Contacto de emergencia */}
            {step === 2 && (
              <motion.div
                key="s2"
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } }}
                className="flex flex-col gap-5"
              >
                <div className="flex gap-3 p-3.5 bg-blue-50 dark:bg-slate-800/60 rounded-xl border border-blue-100 dark:border-slate-700">
                  <AlertCircle size={15} className="text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                    Datos para contacto de emergencia. Se mantienen separados del expediente clínico.
                  </p>
                </div>
                <div>
                  <label className={labelClass}>Nombre del Contacto</label>
                  <input {...register('emergencyContact.name')} className={inputClass} placeholder="Nombre completo" autoFocus />
                  {errors.emergencyContact?.name && <p className={errorClass}>{errors.emergencyContact.name.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Relación</label>
                    <input {...register('emergencyContact.relation')} className={inputClass} placeholder="Ej. Madre" />
                  </div>
                  <div>
                    <label className={labelClass}>Teléfono</label>
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

            {/* Step 3 — Escenario Clínico */}
            {step === 3 && (
              <motion.div
                key="s3"
                custom={direction}
                variants={slideVariants}
                initial="enter" animate="center" exit="exit"
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } }}
                className="flex flex-col gap-5"
              >
                <div>
                  <label className={labelClass}>Diagnóstico Inicial</label>
                  <div className="flex gap-2 mb-3">
                    <button
                      type="button"
                      onClick={() => setValue('diagnosis', 'En proceso de evaluación')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        diagnosisValue === 'En proceso de evaluación'
                          ? 'bg-kio text-white border-kio shadow-sm shadow-kio/20'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-kio/40'
                      }`}
                    >
                      En proceso
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue('diagnosis', '')}
                      className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        diagnosisValue !== 'En proceso de evaluación' && diagnosisValue !== ''
                          ? 'bg-gray-50 dark:bg-slate-800 text-kanji dark:text-white border-kio'
                          : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-kio/40'
                      }`}
                    >
                      Especificar
                    </button>
                  </div>
                  <AnimatePresence>
                    {diagnosisValue !== 'En proceso de evaluación' && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          {...register('diagnosis')} rows={2}
                          className={`${inputClass} resize-none`}
                          placeholder="Diagnóstico preliminar..." autoFocus
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  {diagnosisValue === 'En proceso de evaluación' && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 italic">
                      Se registrará como "En proceso de evaluación" temporalmente.
                    </p>
                  )}
                </div>
                <div>
                  <label className={labelClass}>Motivo de Consulta</label>
                  <textarea
                    {...register('clinicalContext')} rows={3}
                    className={`${inputClass} resize-none`}
                    placeholder="Describe brevemente el motivo de la visita..."
                  />
                </div>
                <div>
                  <label className={labelClass}>Objetivos de Tratamiento</label>
                  {treatmentGoals.length > 0 && (
                    <ul className="space-y-2 mb-2">
                      {treatmentGoals.map((goal, i) => (
                        <li key={i} className="flex items-start gap-2 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2">
                          <span className="mt-0.5 w-5 h-5 rounded-full bg-kio/10 dark:bg-kio/20 flex items-center justify-center text-[10px] font-bold text-kio shrink-0">{i + 1}</span>
                          <span className="flex-1 text-sm text-gray-700 dark:text-slate-300 leading-snug">{goal}</span>
                          <button type="button" onClick={() => removeGoal(i)} className="text-gray-300 hover:text-rose-400 dark:text-slate-600 dark:hover:text-rose-400 transition-colors shrink-0 mt-0.5">
                            <Trash2 size={14} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2">
                    <input
                      ref={goalInputRef}
                      type="text"
                      value={goalDraft}
                      onChange={(e) => setGoalDraft(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGoal(); } }}
                      placeholder="Ej. Reducir niveles de ansiedad..."
                      className={`${inputClass} flex-1`}
                    />
                    <button
                      type="button"
                      onClick={addGoal}
                      disabled={!goalDraft.trim()}
                      className="px-3 py-3 rounded-xl bg-kio/10 hover:bg-kio/20 dark:bg-kio/20 dark:hover:bg-kio/30 text-kio transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">Presiona Enter o el botón + para agregar</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* ── Footer nav ───────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={step > 1 ? prevStep : onCancel}
            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={15} />
            {step > 1 ? 'Anterior' : 'Cancelar'}
          </button>

          <button
            type={step === STEPS.length ? 'submit' : 'button'}
            onClick={step < STEPS.length ? nextStep : undefined}
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 bg-kio text-white rounded-xl text-sm font-semibold hover:bg-kio/90 active:scale-95 transition-all shadow-sm shadow-kio/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              'Guardando...'
            ) : step === STEPS.length ? (
              <><Check size={15} /> Guardar Paciente</>
            ) : (
              <>Siguiente <ArrowRight size={15} /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
