import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  FileImage,
  FileText,
  File,
  Eye,
  Download,
  Trash2,
  FolderOpen,
  Loader2,
  X,
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePatientDocuments, useDeleteDocument, useDocumentBlob } from '../../hooks/use-patients';
import { fetchDocumentBlob } from '../../lib/patients.api';
import { confirmAction } from '../../lib/confirm-action';
import { WidgetError } from '../widgets/WidgetError';
import type { PatientDocument } from '../../types/patients.types';

const CATEGORY_LABELS: Record<string, string> = {
  referencia: 'Referencia',
  laboratorio: 'Laboratorio',
  receta: 'Receta',
  otro: 'Otro',
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function mimeIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType === 'application/pdf') return FileText;
  return File;
}

interface PreviewProps {
  patientId: string;
  doc: PatientDocument;
  onClose: () => void;
}

function DocumentPreview({ patientId, doc, onClose }: PreviewProps) {
  const { data: blob, isLoading } = useDocumentBlob(patientId, doc.id, true);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const id = setTimeout(() => setObjectUrl(url), 0);
    return () => {
      clearTimeout(id);
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownloadFromPreview = () => {
    if (!objectUrl) return;
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = doc.originalName;
    a.click();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 p-4 backdrop-blur-sm dark:bg-black/60"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Vista previa de ${doc.originalName}`}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3 dark:border-slate-800">
          <p className="min-w-0 flex-1 truncate text-sm font-bold text-text dark:text-slate-200">{doc.originalName}</p>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={handleDownloadFromPreview}
              disabled={!objectUrl}
              aria-label={`Descargar ${doc.originalName}`}
              className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-kanji-deep disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-kio"
            >
              <Download size={16} aria-hidden="true" />
            </button>
            <button
              onClick={onClose}
              aria-label="Cerrar vista previa"
              className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-text dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="flex min-h-[400px] flex-1 items-center justify-center overflow-auto bg-secondary p-4 dark:bg-slate-950">
          {isLoading || !objectUrl ? (
            <span className="flex flex-col items-center gap-2 text-slate-600 dark:text-slate-400">
              <Loader2 size={28} aria-hidden="true" className="animate-spin" />
              <span className="text-xs font-medium">Cargando documento…</span>
            </span>
          ) : doc.mimeType.startsWith('image/') ? (
            <img src={objectUrl} alt={doc.originalName} className="max-h-full max-w-full rounded-md object-contain" />
          ) : (
            <iframe src={objectUrl} title={doc.originalName} className="h-[600px] w-full rounded-md border-0" />
          )}
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  patientId: string;
  doc: PatientDocument;
  onDelete: (doc: PatientDocument) => void;
}

function DocumentRow({ patientId, doc, onDelete }: RowProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const Icon = mimeIcon(doc.mimeType);
  const isDocx = doc.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const canPreview = !isDocx;

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const blob = await fetchDocumentBlob(patientId, doc.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Error al descargar el documento');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      {/* Las acciones son siempre visibles. Vivían en `opacity-0
          group-hover:opacity-100`, es decir: inalcanzables en táctil. */}
      <li className="flex items-center gap-3 rounded-xl p-2.5 transition-colors duration-150 hover:bg-secondary dark:hover:bg-slate-800/50">
        <span
          aria-hidden="true"
          className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-cruz/50 dark:bg-slate-800"
        >
          <Icon size={16} className="text-kanji-deep dark:text-kio" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-text dark:text-slate-200">{doc.originalName}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
              {formatBytes(doc.fileSize)}
            </span>
            <span aria-hidden="true" className="text-xs text-slate-600 dark:text-slate-400">
              ·
            </span>
            <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
              {format(new Date(doc.createdAt), 'd MMM yyyy', { locale: es })}
            </span>
            {doc.category && (
              <span className="rounded-full bg-cruz/60 px-2 py-0.5 text-[11px] font-bold text-kanji-deep dark:bg-slate-700 dark:text-kio">
                {CATEGORY_LABELS[doc.category] ?? doc.category}
              </span>
            )}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {canPreview && (
            <button
              onClick={() => setShowPreview(true)}
              aria-label={`Vista previa de ${doc.originalName}`}
              className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-white hover:text-kanji-deep dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-kio"
            >
              <Eye size={16} aria-hidden="true" />
            </button>
          )}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            aria-label={`Descargar ${doc.originalName}`}
            className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-white hover:text-kanji-deep disabled:opacity-50 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-kio"
          >
            {isDownloading ? (
              <Loader2 size={16} aria-hidden="true" className="animate-spin" />
            ) : (
              <Download size={16} aria-hidden="true" />
            )}
          </button>
          <button
            onClick={() => onDelete(doc)}
            aria-label={`Eliminar ${doc.originalName}`}
            className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </li>

      {showPreview && (
        <DocumentPreview patientId={patientId} doc={doc} onClose={() => setShowPreview(false)} />
      )}
    </>
  );
}

interface Props {
  patientId: string;
}

export function DocumentViewer({ patientId }: Props) {
  const { data: documents = [], isLoading, isError, refetch } = usePatientDocuments(patientId);
  const deleteMutation = useDeleteDocument(patientId);

  // El doble clic "Eliminar → Confirmar" no explicaba qué se iba a borrar y no
  // se cancelaba al pulsar fuera. `confirmAction` es el patrón del sistema.
  const handleDelete = async (doc: PatientDocument) => {
    const confirmed = await confirmAction({
      title: '¿Eliminar documento?',
      description: `«${doc.originalName}» se eliminará del expediente de forma permanente.`,
      confirmLabel: 'Sí, eliminar',
      cancelLabel: 'Cancelar',
      variant: 'danger',
    });
    if (!confirmed) return;
    deleteMutation.mutate(doc.id, {
      onSuccess: () => toast.success('Documento eliminado'),
      onError: () => toast.error('Error al eliminar el documento'),
    });
  };

  const heading = (
    <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
      Documentos{!isLoading && !isError ? ` (${documents.length})` : ''}
    </h3>
  );

  // El error se comprueba antes que el vacío: "sin documentos" ante un fallo de
  // red es una afirmación falsa sobre el expediente.
  if (isError) {
    return (
      <div>
        {heading}
        <WidgetError what="los documentos de este paciente" onRetry={() => refetch()} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        {heading}
        <div className="flex items-center justify-center gap-2 py-10 text-slate-600 dark:text-slate-400" aria-busy="true">
          <Loader2 size={20} aria-hidden="true" className="animate-spin" />
          <span className="text-xs font-medium">Cargando documentos…</span>
        </div>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div>
        {heading}
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-secondary text-kanji-deep dark:bg-slate-800 dark:text-kio">
            <FolderOpen size={22} aria-hidden="true" />
          </span>
          <p className="text-sm font-bold text-text dark:text-slate-200">Sin documentos</p>
          <p className="mt-1 max-w-xs text-xs font-medium text-slate-600 dark:text-slate-400">
            Sube el primero con el formulario de arriba: referencias, laboratorios o recetas.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {heading}
      <ul className="space-y-1">
        {documents.map((doc) => (
          <DocumentRow key={doc.id} patientId={patientId} doc={doc} onDelete={handleDelete} />
        ))}
      </ul>
    </div>
  );
}
