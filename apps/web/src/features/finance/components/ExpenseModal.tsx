import { useForm } from 'react-hook-form';
import { useCreateTransaction } from '../api/useFinanceSummary';
import { X } from 'lucide-react';
import { toast } from 'sonner';

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-[24px] p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-200 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors">
          <X size={20} />
        </button>
        
        <h2 className="text-xl font-bold text-gray-900 mb-6">Registrar Gasto</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Monto</label>
            <input 
              type="number" 
              step="0.01"
              {...register('amount', { required: 'Monto requerido', min: 0 })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kio/20 focus:border-kio transition-all"
              placeholder="0.00"
            />
            {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Categoría</label>
            <select 
              {...register('category', { required: 'Categoría requerida' })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kio/20 focus:border-kio transition-all appearance-none bg-white"
            >
              <option value="">Seleccionar...</option>
              <option value="Rent">Renta</option>
              <option value="Services">Servicios (Luz, Agua, Internet)</option>
              <option value="Materials">Materiales / Insumos</option>
              <option value="Equipment">Equipo</option>
              <option value="Software">Software / Suscripciones</option>
              <option value="Other">Otro</option>
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Fecha</label>
            <input 
              type="date" 
              {...register('date', { required: 'Fecha requerida' })}
              defaultValue={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kio/20 focus:border-kio transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Descripción</label>
            <textarea 
              {...register('description')}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-kio/20 focus:border-kio transition-all resize-none"
              rows={3}
              placeholder="Detalles del gasto..."
            />
          </div>

          <button 
            type="submit" 
            disabled={createMutation.isPending}
            className="w-full bg-kio hover:bg-kanji text-white font-bold py-3.5 rounded-xl shadow-lg shadow-kio/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMutation.isPending ? 'Guardando...' : 'Registrar Gasto'}
          </button>
        </form>
      </div>
    </div>
  );
}
