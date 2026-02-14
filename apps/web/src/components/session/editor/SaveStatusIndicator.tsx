import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface SaveStatusIndicatorProps {
  status: 'idle' | 'loading' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error?: string | null;
}

export function SaveStatusIndicator({ status, lastSaved, error }: SaveStatusIndicatorProps) {
  if (status === 'error') {
    return (
      <div className="flex items-center gap-1.5 text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200 animate-pulse" title={error || ''}>
        <AlertCircle size={14} />
        <span className="text-xs font-bold">Error al guardar</span>
      </div>
    );
  }

  if (status === 'saving') {
    return (
      <div className="flex items-center gap-1.5 text-gray-500">
        <Loader2 size={14} className="animate-spin" />
        <span className="text-xs">Guardando...</span>
      </div>
    );
  }

  if (status === 'saved' && lastSaved) {
    return (
      <div className="flex items-center gap-1.5 text-emerald-600 transition-opacity duration-500">
        <CheckCircle2 size={14} />
        <span className="text-xs">
          Guardado {format(lastSaved, 'HH:mm')}
        </span>
      </div>
    );
  }

  return null;
}
