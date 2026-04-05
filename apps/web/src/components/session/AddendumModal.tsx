import { type FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FilePlus } from 'lucide-react';
import { useCreateAddendum } from '../../hooks/use-addendums';
import { toast } from 'sonner';

interface AddendumModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
}

export const AddendumModal: FC<AddendumModalProps> = ({ isOpen, onClose, appointmentId }) => {
  const [content, setContent] = useState('');
  const [privateNotes, setPrivateNotes] = useState('');
  const createMutation = useCreateAddendum();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('El contenido del anexo es requerido');
      return;
    }

    createMutation.mutate(
      { appointmentId, content, privateNotes },
      {
        onSuccess: () => {
          toast.success('Anexo creado correctamente');
          setContent('');
          setPrivateNotes('');
          onClose();
        },
        onError: (err: unknown) => {
          const error = err as { response?: { data?: { message?: string } } };
          toast.error(error.response?.data?.message || 'Error al crear el anexo');
        },
      }
    );
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-xl bg-surface dark:bg-slate-900 rounded-2xl shadow-2xl border border-[var(--color-cruz)] dark:border-slate-800 overflow-hidden z-10"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-cruz)] dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
            <h2 className="text-lg font-bold text-[var(--color-kanji)] dark:text-white flex items-center gap-2">
              <FilePlus size={20} className="text-kio" />
              Agregar Anexo
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Contenido del anexo <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full min-h-[120px] p-3 text-sm bg-white dark:bg-slate-950 border border-[var(--color-cruz)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-kio focus:border-transparent outline-none transition-shadow resize-none text-gray-800 dark:text-slate-200"
                  placeholder="Información adicional, corrección o actualización..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-1">
                  Notas privadas (Solo visibles para ti)
                </label>
                <textarea
                  value={privateNotes}
                  onChange={(e) => setPrivateNotes(e.target.value)}
                  className="w-full min-h-[80px] p-3 text-sm bg-white dark:bg-slate-950 border border-[var(--color-cruz)] dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-kio focus:border-transparent outline-none transition-shadow resize-none text-gray-800 dark:text-slate-200"
                  placeholder="Observaciones confidenciales..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || !content.trim()}
                className="px-4 py-2 text-sm font-bold bg-[var(--color-kanji)] dark:bg-kio text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {createMutation.isPending ? 'Guardando...' : 'Guardar Anexo'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
