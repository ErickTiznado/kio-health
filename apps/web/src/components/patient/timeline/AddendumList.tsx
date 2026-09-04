import { type FC, useState } from 'react';
import { useAddendums } from '../../../hooks/use-addendums';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FilePlus, ChevronDown, ChevronUp, Lock, AlertTriangle, RotateCw } from 'lucide-react';
import { MarkdownPreview } from '../../ui/MarkdownPreview';

interface AddendumListProps {
  appointmentId: string;
}

export const AddendumList: FC<AddendumListProps> = ({ appointmentId }) => {
  const { data: addendumsData, isError, refetch } = useAddendums(appointmentId);
  const [isExpanded, setIsExpanded] = useState(false);

  const addendums = addendumsData || [];

  // El error va ANTES que la ausencia. Sin esto, una petición fallida dejaba el
  // componente devolviendo `null` y la nota se leía como una nota sin anexos:
  // un anexo es una CORRECCIÓN de la nota clínica, así que ocultarlo en
  // silencio afirma sobre el expediente algo que la interfaz no comprobó.
  // Formato de una línea a propósito: hay una lista de éstas por cada nota de
  // la cronología, y el bloque de `WidgetError` repetido tantas veces taparía
  // el contenido que sí cargó.
  if (isError) {
    return (
      <div className="mt-3 border-t border-gray-100 pt-3 dark:border-slate-800">
        <p
          role="alert"
          className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium text-amber-900 dark:text-amber-200"
        >
          <AlertTriangle size={13} aria-hidden="true" className="shrink-0" />
          No pudimos comprobar si esta nota tiene anexos.
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-2 text-xs font-bold text-amber-950 transition-colors duration-150 hover:bg-amber-100 dark:text-amber-100 dark:hover:bg-amber-900/40"
          >
            <RotateCw size={12} aria-hidden="true" />
            Reintentar
          </button>
        </p>
      </div>
    );
  }

  if (addendums.length === 0) return null;

  return (
    <div className="mt-3 border-t border-gray-100 dark:border-slate-800 pt-3">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="flex min-h-11 items-center gap-1.5 text-xs font-bold text-slate-600 transition-colors duration-150 hover:text-kanji-deep dark:text-slate-400 dark:hover:text-kio"
      >
        <FilePlus size={14} aria-hidden="true" />
        {addendums.length} {addendums.length === 1 ? 'anexo adjunto' : 'anexos adjuntos'}
        {isExpanded ? (
          <ChevronUp size={14} aria-hidden="true" />
        ) : (
          <ChevronDown size={14} aria-hidden="true" />
        )}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {addendums.map((addendum) => (
            <div
              key={addendum.id}
              className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-200 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {/* Suelo tipográfico de 11px: era la etiqueta que distinguía
                      una corrección de un anexo, y estaba por debajo. */}
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full uppercase tracking-wider">
                    {addendum.type === 'CORRECTION' ? 'Corrección' : 'Anexo'}
                  </span>
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                    {format(new Date(addendum.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                  </span>
                </div>
                {addendum.privateNotes && (
                  <Lock
                    size={13}
                    role="img"
                    aria-label="Contiene notas privadas"
                    className="text-amber-600 dark:text-amber-400"
                  />
                )}
              </div>
              <div className="text-sm text-gray-700 dark:text-slate-300">
                <MarkdownPreview content={addendum.content} />
              </div>
              {addendum.privateNotes && (
                <div className="mt-2 pt-2 border-t border-amber-100 dark:border-amber-900/30">
                  <p className="text-xs font-bold text-amber-800 dark:text-amber-300 mb-1 flex items-center gap-1.5">
                    <Lock size={12} aria-hidden="true" /> Notas privadas
                  </p>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <MarkdownPreview content={addendum.privateNotes} />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
