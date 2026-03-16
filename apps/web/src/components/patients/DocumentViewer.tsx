import { useEffect, useState } from 'react';
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
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePatientDocuments, useDeleteDocument, useDocumentBlob } from '../../hooks/use-patients';
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
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [blob]);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-slate-800">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">{doc.originalName}</p>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 text-lg leading-none px-1">✕</button>
        </div>
        <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 dark:bg-slate-950 p-4 min-h-[400px]">
          {isLoading || !objectUrl ? (
            <Loader2 size={32} className="animate-spin text-gray-300 dark:text-slate-600" />
          ) : doc.mimeType.startsWith('image/') ? (
            <img src={objectUrl} alt={doc.originalName} className="max-w-full max-h-full object-contain rounded-lg" />
          ) : (
            <embed src={objectUrl} type="application/pdf" className="w-full h-[600px] rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
}

interface RowProps {
  patientId: string;
  doc: PatientDocument;
  deleteConfirmId: string | null;
  onDeleteClick: (id: string) => void;
  onDeleteConfirm: (id: string) => void;
}

function DocumentRow({ patientId, doc, deleteConfirmId, onDeleteClick, onDeleteConfirm }: RowProps) {
  const [showPreview, setShowPreview] = useState(false);
  const Icon = mimeIcon(doc.mimeType);
  const isDocx = doc.mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  const canPreview = !isDocx;

  const handleDownload = () => {
    const url = `/api/patients/${patientId}/documents/${doc.id}/file`;
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.originalName;
    a.click();
  };

  return (
    <>
      <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors group">
        <div className="w-9 h-9 rounded-lg bg-[var(--color-cruz)]/40 dark:bg-slate-800 flex items-center justify-center shrink-0">
          <Icon size={16} className="text-[var(--color-kanji)] dark:text-kio" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">{doc.originalName}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-gray-400 dark:text-slate-500">{formatBytes(doc.fileSize)}</span>
            <span className="text-xs text-gray-300 dark:text-slate-700">·</span>
            <span className="text-xs text-gray-400 dark:text-slate-500">
              {format(new Date(doc.createdAt), 'd MMM yyyy', { locale: es })}
            </span>
            {doc.category && (
              <>
                <span className="text-xs text-gray-300 dark:text-slate-700">·</span>
                <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-cruz)]/60 dark:bg-slate-700 text-[var(--color-kanji)] dark:text-kio font-medium">
                  {CATEGORY_LABELS[doc.category] ?? doc.category}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {canPreview ? (
            <button
              onClick={() => setShowPreview(true)}
              className="p-1.5 text-gray-400 hover:text-[var(--color-kanji)] dark:hover:text-kio rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Vista previa"
            >
              <Eye size={15} />
            </button>
          ) : (
            <button
              onClick={handleDownload}
              className="p-1.5 text-gray-400 hover:text-[var(--color-kanji)] dark:hover:text-kio rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Descargar"
            >
              <Download size={15} />
            </button>
          )}
          {deleteConfirmId === doc.id ? (
            <button
              onClick={() => onDeleteConfirm(doc.id)}
              className="px-2 py-1 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              Confirmar
            </button>
          ) : (
            <button
              onClick={() => onDeleteClick(doc.id)}
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
              title="Eliminar"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>

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
  const { data: documents = [], isLoading } = usePatientDocuments(patientId);
  const deleteMutation = useDeleteDocument(patientId);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setDeleteConfirmId(id);
  };

  const handleDeleteConfirm = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        toast.success('Documento eliminado');
        setDeleteConfirmId(null);
      },
      onError: () => {
        toast.error('Error al eliminar el documento');
        setDeleteConfirmId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 size={24} className="animate-spin text-gray-300 dark:text-slate-600" />
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <FolderOpen size={32} className="text-gray-300 dark:text-slate-600 mb-3" />
        <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">Sin documentos</p>
        <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">Sube el primer documento usando el formulario de arriba.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <h3 className="text-sm font-bold text-[var(--color-kanji)] dark:text-white uppercase tracking-wider mb-3">
        Documentos ({documents.length})
      </h3>
      {documents.map((doc) => (
        <DocumentRow
          key={doc.id}
          patientId={patientId}
          doc={doc}
          deleteConfirmId={deleteConfirmId}
          onDeleteClick={handleDeleteClick}
          onDeleteConfirm={handleDeleteConfirm}
        />
      ))}
    </div>
  );
}
