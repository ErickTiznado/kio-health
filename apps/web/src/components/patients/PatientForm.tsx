import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { patientSchema, type PatientFormValues } from '../../schemas/patients.schema';
import type { Patient } from '../../types/patients.types';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';

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

  const inputClass = "mt-1.5 block w-full rounded-xl border-gray-200 dark:border-slate-700 shadow-sm focus:border-kio focus:ring-kio focus:ring-2 focus:ring-opacity-50 text-sm font-medium text-kanji dark:text-white transition-all duration-200 bg-gray-50/50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 focus:bg-white dark:focus:bg-slate-700 py-2.5 px-3.5 placeholder:text-gray-400 dark:placeholder:text-slate-500 placeholder:font-normal";
  const labelClass = "block text-[11px] font-bold text-gray-600 dark:text-slate-400 opacity-70 uppercase tracking-wider ml-1";

  // Date input specific styling for branding
  // accent-kio forces the browser's native picker to use the brand color
  const dateInputClass = `${inputClass} uppercase accent-kio [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer`;

  return (
    <form id="patient-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full max-h-[75vh]">
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto px-1 py-2 space-y-6">
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Nombre Completo <span className="text-rose-500">*</span></label>
            <input
              {...register('fullName')}
              className={inputClass}
              placeholder="Ej. Juan Pérez"
            />
            {errors.fullName && <p className="mt-1.5 text-xs text-rose-600 font-bold ml-1">{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                {...register('contactPhone')}
                className={inputClass}
                placeholder="+52..."
              />
              {errors.contactPhone && <p className="mt-1.5 text-xs text-rose-600 font-bold ml-1">{errors.contactPhone.message}</p>}
            </div>

            <div>
              <label className={labelClass}>Fecha de Nacimiento</label>
              <input
                type="date"
                {...register('dateOfBirth')}
                className={dateInputClass}
                lang="es-MX" // Hint for browser date picker locale
              />
              {errors.dateOfBirth && <p className="mt-1.5 text-xs text-rose-600 font-bold ml-1">{errors.dateOfBirth.message}</p>}
            </div>
          </div>

          <div>
            <label className={labelClass}>Diagnóstico</label>
            <textarea
              {...register('diagnosis')}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Diagnóstico preliminar o confirmado..."
            />
          </div>

          <div>
            <label className={labelClass}>Contexto Clínico</label>
            <textarea
              {...register('clinicalContext')}
              rows={3}
              className={`${inputClass} resize-none`}
              placeholder="Antecedentes relevantes, motivo de consulta..."
            />
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 pt-5 mt-5">
          <h3 className="text-xs font-bold text-kanji dark:text-white mb-4 flex items-center gap-2 uppercase tracking-wide">
            <ShieldAlert size={14} className="text-gray-400 dark:text-slate-500" />
            Contacto de Emergencia
          </h3>
          <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-2 sm:gap-x-4">
            <div className="sm:col-span-2">
              <label className={labelClass}>Nombre</label>
              <input
                {...register('emergencyContact.name')}
                className={inputClass}
                placeholder="Nombre del contacto"
              />
              {errors.emergencyContact?.name && (
                <p className="mt-1.5 text-xs text-rose-600 font-bold ml-1">{errors.emergencyContact.name.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Teléfono</label>
              <input
                {...register('emergencyContact.phone')}
                className={inputClass}
                placeholder="Teléfono directo"
              />
              {errors.emergencyContact?.phone && (
                <p className="mt-1.5 text-xs text-rose-600 font-bold ml-1">{errors.emergencyContact.phone.message}</p>
              )}
            </div>
            <div>
              <label className={labelClass}>Relación</label>
              <input
                {...register('emergencyContact.relation')}
                className={inputClass}
                placeholder="Ej. Madre, Pareja..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer Action Bar */}
      <div className="flex justify-end gap-3 pt-5 border-t border-gray-100 dark:border-slate-800 mt-auto bg-white dark:bg-slate-900 sticky bottom-0 z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-xs font-bold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl hover:text-gray-800 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-600 focus:outline-none transition-all"
        >
          Cancelar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02, boxShadow: "0 8px 20px -5px rgba(124, 58, 237, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 text-xs font-bold text-white dark:text-slate-900 bg-kanji dark:bg-kio hover:bg-[#7c3aed] border border-transparent rounded-xl shadow-md shadow-kio/20 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Guardando...' : 'Guardar Expediente'}
        </motion.button>
      </div>
    </form>
  );
}
