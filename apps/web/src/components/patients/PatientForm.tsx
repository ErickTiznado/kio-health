import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormValues } from '../../schemas/patients.schema';
import type { Patient } from '../../types/patients.types';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { DatePicker } from '../ui/DatePicker';
import { format } from 'date-fns';

/**
 * ESTADO: hoy este componente NO se monta en ninguna ruta. `PatientModal` monta
 * `WizardPatientForm`; el único otro consumo de `PatientFormValues` es el tipo,
 * no este formulario. Verificado con búsqueda sobre todo `apps/web/src`.
 *
 * Se conserva porque retirarlo es una decisión de producto —¿vuelve un alta
 * plana de "captura rápida" al lado del asistente de 3 pasos, o el asistente es
 * el único camino?— y esa decisión no se toma dentro de un barrido cosmético.
 * Queda registrada para quien la tome.
 *
 * Mientras se conserve, hay que tratarlo como código vivo: ya divergió del
 * asistente (aquí faltan `medicacionActual`, `alergias` y `treatmentGoals`, que
 * `patientSchema` sí admite) y es una segunda ruta de escritura a los mismos
 * campos. Cualquier tope nuevo en `patients.schema.ts` tiene que tener aquí su
 * mensaje de error visible, o el submit se bloquea en silencio.
 */
interface PatientFormProps {
  initialData?: Patient;
  onSubmit: (data: PatientFormValues) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PatientForm({ initialData, onSubmit, onCancel, isLoading }: PatientFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      fullName: initialData?.fullName || '',
      contactPhone: initialData?.contactPhone || '',
      dateOfBirth: initialData?.dateOfBirth ? new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
      diagnosis: initialData?.diagnosis || '',
      clinicalContext: initialData?.clinicalContext || '',
      emergencyContact: {
        name: initialData?.emergencyContact?.name || '',
        phone: initialData?.emergencyContact?.phone || '',
        relation: initialData?.emergencyContact?.relation || '',
      },
    },
  });

  // `min-h-11`: con `py-2.5` + `text-sm` el control medía 40px, por debajo del
  // suelo táctil de 44. El relleno del sistema (`py-2.5 px-3.5`) no cambia.
  const inputClass = "mt-1.5 block w-full min-h-11 rounded-xl border-gray-200 dark:border-slate-700 focus:border-kio focus:ring-kio focus:ring-2 focus:ring-opacity-50 text-sm font-medium text-text dark:text-white transition-colors duration-150 bg-gray-50/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 py-2.5 px-3.5 placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-normal";
  const labelClass = "block text-[11px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider ml-1";
  const errorClass = "mt-1.5 text-xs text-rose-700 dark:text-rose-400 font-bold ml-1";


  return (
    <form id="patient-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full max-h-[75vh]">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-6">
        <div className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="patient-form-full-name">
              Nombre completo <span className="text-rose-500">*</span>
            </label>
            <input
              id="patient-form-full-name"
              {...register('fullName')}
              className={inputClass}
              placeholder="Ej. Juan Pérez"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'patient-form-full-name-error' : undefined}
            />
            {errors.fullName && (
              <p id="patient-form-full-name-error" className={errorClass}>{errors.fullName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass} htmlFor="patient-form-phone">Teléfono</label>
              <input
                id="patient-form-phone"
                {...register('contactPhone')}
                className={inputClass}
                placeholder="+52..."
                aria-invalid={!!errors.contactPhone}
                aria-describedby={errors.contactPhone ? 'patient-form-phone-error' : undefined}
              />
              {errors.contactPhone && (
                <p id="patient-form-phone-error" className={errorClass}>{errors.contactPhone.message}</p>
              )}
            </div>

            <div>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DatePicker
                    label="Fecha de nacimiento"
                    value={field.value}
                    onChange={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                    error={errors.dateOfBirth?.message}
                    className="w-full"
                  />
                )}
              />
            </div>
          </div>

          {/* `patientSchema` limita diagnóstico a 500 y contexto clínico a
              4000 caracteres. Sin párrafo de error el usuario pulsaba "Guardar
              expediente" y no pasaba nada: el submit quedaba bloqueado sin
              mensaje ni foco. */}
          <div>
            <label className={labelClass} htmlFor="patient-form-diagnosis">Diagnóstico</label>
            <textarea
              id="patient-form-diagnosis"
              {...register('diagnosis')}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Diagnóstico preliminar o confirmado..."
              aria-invalid={!!errors.diagnosis}
              aria-describedby={errors.diagnosis ? 'patient-form-diagnosis-error' : undefined}
            />
            {errors.diagnosis && (
              <p id="patient-form-diagnosis-error" className={errorClass}>{errors.diagnosis.message}</p>
            )}
          </div>

          <div>
            <label className={labelClass} htmlFor="patient-form-clinical-context">Contexto clínico</label>
            <textarea
              id="patient-form-clinical-context"
              {...register('clinicalContext')}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Antecedentes relevantes, motivo de consulta..."
              aria-invalid={!!errors.clinicalContext}
              aria-describedby={errors.clinicalContext ? 'patient-form-clinical-context-error' : undefined}
            />
            {errors.clinicalContext && (
              <p id="patient-form-clinical-context-error" className={errorClass}>
                {errors.clinicalContext.message}
              </p>
            )}
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-5">
          <h3 className="text-[11px] font-bold text-kanji-deep dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wider">
            <ShieldAlert size={14} aria-hidden="true" className="text-slate-600 dark:text-slate-400" />
            Contacto de emergencia
          </h3>
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
            <div className="sm:col-span-2">
              <label className={labelClass} htmlFor="patient-form-ec-name">Nombre</label>
              <input
                id="patient-form-ec-name"
                {...register('emergencyContact.name')}
                className={inputClass}
                placeholder="Nombre del contacto"
                aria-invalid={!!errors.emergencyContact?.name}
                aria-describedby={errors.emergencyContact?.name ? 'patient-form-ec-name-error' : undefined}
              />
              {errors.emergencyContact?.name && (
                <p id="patient-form-ec-name-error" className={errorClass}>{errors.emergencyContact.name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="patient-form-ec-phone">Teléfono</label>
              <input
                id="patient-form-ec-phone"
                {...register('emergencyContact.phone')}
                className={inputClass}
                placeholder="Teléfono directo"
                aria-invalid={!!errors.emergencyContact?.phone}
                aria-describedby={errors.emergencyContact?.phone ? 'patient-form-ec-phone-error' : undefined}
              />
              {errors.emergencyContact?.phone && (
                <p id="patient-form-ec-phone-error" className={errorClass}>{errors.emergencyContact.phone.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass} htmlFor="patient-form-ec-relation">Relación</label>
              <input
                id="patient-form-ec-relation"
                {...register('emergencyContact.relation')}
                className={inputClass}
                placeholder="Ej. Madre, Pareja..."
                aria-invalid={!!errors.emergencyContact?.relation}
                aria-describedby={
                  errors.emergencyContact?.relation ? 'patient-form-ec-relation-error' : undefined
                }
              />
              {errors.emergencyContact?.relation && (
                <p id="patient-form-ec-relation-error" className={errorClass}>
                  {errors.emergencyContact.relation.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Action Bar */}
      <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-slate-800 mt-auto bg-white dark:bg-slate-900 sticky bottom-0 z-10">
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="inline-flex min-h-11 items-center rounded-xl border border-gray-200 bg-white px-5 text-xs font-bold text-slate-600 transition-colors duration-150 hover:border-gray-300 hover:text-text focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:text-white"
        >
          Cancelar
        </motion.button>
        {/* Sombra de marca en reposo a `shadow-sm`; la respuesta al puntero es
            el `hover:`. El violeta literal (#7c3aed / rgba 124,58,237) estaba
            fuera de la paleta. */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="inline-flex min-h-11 items-center rounded-xl border border-transparent bg-kanji-deep px-6 text-xs font-bold text-white shadow-sm shadow-kio/20 transition-colors duration-150 hover:bg-kanji hover:shadow-md hover:shadow-kio/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
        >
          {isLoading ? 'Guardando…' : 'Guardar expediente'}
        </motion.button>
      </div>
    </form>
  );
}
