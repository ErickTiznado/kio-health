import { type FC, useState } from 'react';
import { useAddendums } from '../../../hooks/use-addendums';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { FilePlus, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { MarkdownPreview } from '../../ui/MarkdownPreview';

interface AddendumListProps {
  appointmentId: string;
}

export const AddendumList: FC<AddendumListProps> = ({ appointmentId }) => {
  const { data: addendumsData } = useAddendums(appointmentId);
  const [isExpanded, setIsExpanded] = useState(false);

  const addendums = addendumsData || [];

  if (addendums.length === 0) return null;

  return (
    <div className="mt-3 border-t border-gray-100 dark:border-slate-800 pt-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-1.5 text-xs font-bold text-gray-500 hover:text-kio dark:text-slate-400 dark:hover:text-kio transition-colors"
      >
        <FilePlus size={14} />
        {addendums.length} {addendums.length === 1 ? 'Anexo' : 'Anexos'} adjuntos
        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3">
          {addendums.map((addendum: any) => (
            <div
              key={addendum.id}
              className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3 border border-gray-200 dark:border-slate-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 rounded-full uppercase">
                    {addendum.type === 'CORRECTION' ? 'Corrección' : 'Anexo'}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">
                    {format(new Date(addendum.createdAt), "d MMM yyyy, HH:mm", { locale: es })}
                  </span>
                </div>
                {addendum.privateNotes && (
                  <Lock size={12} className="text-amber-400" title="Contiene notas privadas" />
                )}
              </div>
              <div className="text-sm text-gray-700 dark:text-slate-300">
                <MarkdownPreview content={addendum.content} />
              </div>
              {addendum.privateNotes && (
                <div className="mt-2 pt-2 border-t border-amber-100 dark:border-amber-900/30">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                    <Lock size={10} /> Notas Privadas
                  </p>
                  <div className="text-sm text-gray-600 dark:text-slate-400">
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
