import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { DatePicker } from '../ui/DatePicker';
import { Check, AlertCircle, User, Phone, HeartPulse, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import { patientSchema, type PatientFormValues } from '../../schemas/patients.schema';
import type { Patient } from '../../types/patients.types';

interface WizardPatientFormProps {
  initialData?: Patient;
  onSubmit: (data: PatientFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const STEPS = [
  { id: 1, title: 'Identidad Fundamental', icon: User },
  { id: 2, title: 'Red de Contención', icon: HeartPulse },
  { id: 3, title: 'Escenario Clínico', icon: FileText },
];

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 50 : -50,
    opacity: 0,
  }),
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    zIndex: 0,
    x: direction < 0 ? 50 : -50,
    opacity: 0,
  }),
};

export function WizardPatientForm({ initialData, onSubmit, onCancel, isLoading }: WizardPatientFormProps) {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    mode: 'onChange',
    defaultValues: {
      fullName: initialData?.fullName || '',
      contactPhone: initialData?.contactPhone || '',
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
      diagnosis: initialData?.diagnosis || 'En proceso de evaluación', // Default value strategy
      clinicalContext: initialData?.clinicalContext || '',
      emergencyContact: {
        name: initialData?.emergencyContact?.name || '',
        phone: initialData?.emergencyContact?.phone || '',
        relation: initialData?.emergencyContact?.relation || '',
      },
    },
  });

  const diagnosisValue = watch('diagnosis');

  const nextStep = async () => {
    let fieldsToValidate: (keyof PatientFormValues)[] = [];

    if (step === 1) {
      fieldsToValidate = ['fullName', 'contactPhone', 'dateOfBirth'];
    } else if (step === 2) {
      // Validate nested fields manually or via trigger if schema supports path
      // Zod schema structure: emergencyContact is optional but if present fields are required.
      // We will trigger full validation but prevent move if specific errors exist
      const valid = await trigger('emergencyContact');
      if (!valid) return;
    }

    const valid = await trigger(fieldsToValidate);
    if (valid) {
      setDirection(1);
      setStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const inputBaseClass = "w-full bg-transparent border-b-2 border-gray-200 dark:border-slate-700 py-3 text-lg font-medium text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:border-kio transition-colors duration-300";
  const labelClass = "block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1";


  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full min-h-[450px]">

      {/* Progress Indicator */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-2">
          {STEPS.map((s) => (
            <div key={s.id} className="flex items-center">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${step >= s.id ? 'bg-kio scale-110' : 'bg-gray-200 dark:bg-slate-700'
                  }`}
              />
              {s.id < STEPS.length && (
                <div className={`w-8 h-0.5 mx-1 transition-all duration-500 ${step > s.id ? 'bg-kio' : 'bg-gray-200 dark:bg-slate-700'
                  }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-right">
          <span className="text-xs font-bold text-kio uppercase tracking-widest">
            Paso {step} de {STEPS.length}
          </span>
          <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">
            {STEPS[step - 1].title}
          </h4>
        </div>
      </div>

      {/* Steps Content */}
      <div className="flex-1 relative overflow-hidden px-1">
        <AnimatePresence initial={false} custom={direction} mode="wait">

          {/* STEP 1: IDENTIDAD FUNDAMENTAL */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute inset-0 flex flex-col gap-6"
            >
              <div className="group">
                <label className={labelClass}>Nombre Completo</label>
                <div className="relative">
                  <User size={20} className="absolute left-0 top-3.5 text-gray-400 dark:text-slate-600 group-focus-within:text-kio transition-colors" />
                  <input
                    {...register('fullName')}
                    className={`${inputBaseClass} pl-8`}
                    placeholder="Ej. Juan Pérez"
                    autoFocus
                  />
                </div>
                {errors.fullName && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.fullName.message}</p>}
              </div>

              <div className="group">
                <label className={labelClass}>Teléfono</label>
                <div className="relative">
                  <Phone size={20} className="absolute left-0 top-3.5 text-gray-400 dark:text-slate-600 group-focus-within:text-kio transition-colors" />
                  <input
                    {...register('contactPhone')}
                    className={`${inputBaseClass} pl-8`}
                    placeholder="+52..."
                  />
                </div>
                {errors.contactPhone && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.contactPhone.message}</p>}
              </div>

              <div className="group">
                <Controller
                  control={control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <DatePicker
                      label="Fecha de Nacimiento"
                      value={field.value}
                      onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                      error={errors.dateOfBirth?.message}
                    />
                  )}
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: RED DE CONTENCIÓN */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute inset-0 flex flex-col gap-6"
            >
              <div className="bg-blue-50 dark:bg-slate-800/50 p-4 rounded-xl border border-blue-100 dark:border-slate-700 mb-2 flex gap-3">
                <AlertCircle size={20} className="text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                  Esta información es vital para emergencias. Sepárala de los datos administrativos para darle la importancia que merece.
                </p>
              </div>

              <div className="group">
                <label className={labelClass}>Nombre del Contacto</label>
                <input
                  {...register('emergencyContact.name')}
                  className={inputBaseClass}
                  placeholder="Nombre completo"
                  autoFocus
                />
                {errors.emergencyContact?.name && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.emergencyContact.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="group">
                  <label className={labelClass}>Relación</label>
                  <input
                    {...register('emergencyContact.relation')}
                    className={inputBaseClass}
                    placeholder="Ej. Madre"
                  />
                </div>
                <div className="group">
                  <label className={labelClass}>Teléfono Directo</label>
                  <input
                    {...register('emergencyContact.phone')}
                    className={inputBaseClass}
                    placeholder="+52..."
                  />
                  {errors.emergencyContact?.phone && <p className="mt-1 text-xs text-rose-500 font-bold">{errors.emergencyContact.phone.message}</p>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: ESCENARIO CLÍNICO */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
              className="absolute inset-0 flex flex-col gap-6"
            >
              <div className="group">
                <label className={labelClass}>Diagnóstico Inicial</label>
                <div className="flex gap-3 mt-2 mb-4">
                  <button
                    type="button"
                    onClick={() => setValue('diagnosis', 'En proceso de evaluación')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${diagnosisValue === 'En proceso de evaluación'
                        ? 'bg-kio text-white border-kio shadow-md shadow-kio/20'
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-kio/50'
                      }`}
                  >
                    En proceso
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('diagnosis', '')}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${diagnosisValue !== 'En proceso de evaluación' && diagnosisValue !== ''
                        ? 'bg-white dark:bg-slate-800 text-kanji dark:text-white border-kio'
                        : 'bg-white dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-kio/50'
                      }`}
                  >
                    Especificar
                  </button>
                </div>

                <AnimatePresence>
                  {diagnosisValue !== 'En proceso de evaluación' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <textarea
                        {...register('diagnosis')}
                        rows={2}
                        className={`${inputBaseClass} resize-none border-b-2`}
                        placeholder="Escribe el diagnóstico preliminar..."
                        autoFocus
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

              <div className="group">
                <label className={labelClass}>Contexto Clínico / Motivo de Consulta</label>
                <textarea
                  {...register('clinicalContext')}
                  rows={4}
                  className={`${inputBaseClass} resize-none`}
                  placeholder="Describe brevemente el motivo de la visita..."
                />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-6 mt-auto">
        {step > 1 ? (
          <button
            type="button"
            onClick={prevStep}
            className="flex items-center gap-2 text-sm font-bold text-gray-500 dark:text-slate-400 hover:text-kanji dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={16} />
            Anterior
          </button>
        ) : (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-bold text-gray-400 dark:text-slate-500 hover:text-rose-500 transition-colors"
          >
            Cancelar
          </button>
        )}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={step === STEPS.length ? handleSubmit(onSubmit) : nextStep}
          disabled={isLoading}
          className="bg-kio hover:bg-[#7c3aed] text-white pl-5 pr-4 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-kio/30 flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            'Guardando...'
          ) : step === STEPS.length ? (
            <>Finalizar <Check size={18} /></>
          ) : (
            <>Siguiente <ArrowRight size={18} /></>
          )}
        </motion.button>
      </div>
    </form>
  );
}
