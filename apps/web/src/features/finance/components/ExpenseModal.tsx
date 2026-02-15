import { useForm } from 'react-hook-form';
import { useCreateTransaction } from '../api/useFinanceSummary';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExpenseForm {
  amount: number;
  category: string;
  description: string;
  date: string;
}

export function ExpenseModal({ isOpen, onClose }: ExpenseModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ExpenseForm>();
  const createMutation = useCreateTransaction();

  const onSubmit = async (data: ExpenseForm) => {
    try {
      await createMutation.mutateAsync({
        type: 'EXPENSE',
        amount: Number(data.amount),
        category: data.category,
        description: data.description,
        date: data.date,
      });
      reset();
      onClose();
      toast.success('Gasto registrado');
    } catch (error) {
      console.error('Failed to create expense', error);
      toast.error('Error al registrar gasto');
    }
  };

  const inputClass = "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800 text-kanji dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all placeholder:text-gray-400 dark:placeholder:text-slate-500";
  const labelClass = "block text-[11px] font-bold text-gray-600 dark:text-slate-400 opacity-70 uppercase tracking-wider mb-1.5 ml-1";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm" 
            aria-hidden="true" 
            onClick={onClose}
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.5, bounce: 0 }}
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl z-10 relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                <h2 className="text-xl font-bold text-kanji dark:text-kio tracking-tight">Registrar Gasto</h2>
                <button 
                    onClick={onClose} 
                    className="p-2 -mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
            
            <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div>
                    <label className={labelClass}>Monto</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 font-bold">$</span>
                        <input 
                            type="number" 
                            step="0.01"
                            {...register('amount', { required: 'Monto requerido', min: 0 })}
                            className={`${inputClass} pl-8 font-mono font-bold text-lg`}
                            placeholder="0.00"
                            autoFocus
                        />
                    </div>
                    {errors.amount && <p className="text-xs text-rose-500 font-bold mt-1 ml-1">{errors.amount.message}</p>}
                </div>

                <div>
                    <label className={labelClass}>Categoría</label>
                    <select 
                        {...register('category', { required: 'Categoría requerida' })}
                        className={`${inputClass} appearance-none`}
                    >
                        <option value="">Seleccionar...</option>
                        <option value="Rent">Renta</option>
                        <option value="Services">Servicios (Luz, Agua, Internet)</option>
                        <option value="Materials">Materiales / Insumos</option>
                        <option value="Equipment">Equipo</option>
                        <option value="Software">Software / Suscripciones</option>
                        <option value="Other">Otro</option>
                    </select>
                    {errors.category && <p className="text-xs text-rose-500 font-bold mt-1 ml-1">{errors.category.message}</p>}
                </div>

                <div>
                    <label className={labelClass}>Fecha</label>
                    <input 
                        type="date" 
                        {...register('date', { required: 'Fecha requerida' })}
                        defaultValue={new Date().toISOString().split('T')[0]}
                        className={`${inputClass} uppercase accent-kio [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer`}
                    />
                </div>

                <div>
                    <label className={labelClass}>Descripción</label>
                    <textarea 
                        {...register('description')}
                        className={`${inputClass} resize-none`}
                        rows={3}
                        placeholder="Detalles del gasto..."
                    />
                </div>

                <div className="pt-4">
                    <motion.button 
                        whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(139, 92, 246, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        type="submit" 
                        disabled={createMutation.isPending}
                        className="w-full bg-kio hover:bg-kanji text-white font-bold py-3.5 rounded-xl shadow-lg shadow-kio/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                        {createMutation.isPending ? 'Guardando...' : 'Registrar Gasto'}
                    </motion.button>
                </div>
                </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
