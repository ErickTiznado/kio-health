import { useState, useEffect, type FC } from 'react';
import { Upload, FileText, X, Save } from 'lucide-react';
import { useUpsertMealPlan } from '../../hooks/use-session';
import { toast } from 'sonner';

interface MealPlanTabProps {
  appointmentId: string;
  initialData?: any;
}

export const MealPlanTab: FC<MealPlanTabProps> = ({ appointmentId, initialData }) => {
  const [planText, setPlanText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const { mutate: save, isPending } = useUpsertMealPlan();

  useEffect(() => {
    if (initialData) {
      if (initialData.content) setPlanText(initialData.content);
      if (initialData.fileName) setAttachedFileName(initialData.fileName);
    }
  }, [initialData]);

  const handleSave = () => {
    save({
      appointmentId,
      data: {
        content: planText,
        fileName: attachedFileName ?? undefined
        // TODO: Handle file upload to storage and get URL
      }
    }, {
      onSuccess: () => toast.success('Plan alimenticio guardado')
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => setIsDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFileName(file.name);
    }
  };

  const handleRemoveFile = () => setAttachedFileName(null);

  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 bg-kio hover:bg-kanji text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
        >
          <Save size={16} />
          {isPending ? 'Guardando...' : 'Guardar Plan'}
        </button>
      </div>

      {/* ── Diet Plan Textarea ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100/60 dark:border-slate-800 shadow-sm">
        <label
          htmlFor="meal-plan-text"
          className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3"
        >
          Plan Alimenticio
        </label>
        <textarea
          id="meal-plan-text"
          value={planText}
          onChange={(e) => setPlanText(e.target.value)}
          placeholder={`Escribe el plan alimenticio del paciente...

• Desayuno:
• Colación matutina:
• Comida:
• Colación vespertina:
• Cena:

Notas adicionales...`}
          className="w-full min-h-[40vh] text-base leading-8 text-gray-700 dark:text-slate-300 resize-none border-none outline-none bg-transparent placeholder:text-gray-300 dark:placeholder:text-slate-600 placeholder:leading-8"
          style={{ fontFamily: "'Roboto', sans-serif" }}
        />
      </div>

      {/* ── PDF Drop Zone ── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-gray-100/60 dark:border-slate-800 shadow-sm">
        <span className="block text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-3">
          Adjuntar Documento
        </span>

        {!attachedFileName ? (
          <label
            htmlFor="pdf-upload"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`
              flex flex-col items-center justify-center gap-3 py-10 rounded-2xl border-2 border-dashed cursor-pointer
              transition-all duration-200
              ${isDragOver
                ? 'border-kio bg-kio/5 scale-[1.01]'
                : 'border-gray-200 dark:border-slate-700 hover:border-kio/50 hover:bg-gray-50/50 dark:hover:bg-slate-800/50'
              }
            `}
          >
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
              <Upload
                size={20}
                className={isDragOver ? 'text-kanji dark:text-kio' : 'text-gray-400 dark:text-slate-500'}
              />
            </div>
            <div className="text-center">
              <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">
                Seleccionar o arrastrar
              </p>
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">
                PDF, DOC, DOCX — máx. 10 MB
              </p>
            </div>
            <input
              id="pdf-upload"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="hidden"
            />
          </label>
        ) : (
          <div className="flex items-center gap-3 bg-kio/5 dark:bg-kio/10 rounded-2xl px-5 py-4 border border-kio/20">
            <div className="w-10 h-10 rounded-xl bg-kio/20 flex items-center justify-center shrink-0">
              <FileText size={18} className="text-kanji dark:text-kio" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                {attachedFileName}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-slate-500">Listo para guardar</p>
            </div>
            <button
              type="button"
              onClick={handleRemoveFile}
              className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
              aria-label="Eliminar archivo"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
