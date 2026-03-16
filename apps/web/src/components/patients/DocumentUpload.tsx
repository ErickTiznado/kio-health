import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileText } from 'lucide-react';
import { useUploadDocument } from '../../hooks/use-patients';
import type { DocumentCategory } from '../../types/patients.types';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  referencia: 'Referencia',
  laboratorio: 'Laboratorio',
  receta: 'Receta',
  otro: 'Otro',
};

interface Props {
  patientId: string;
}

export function DocumentUpload({ patientId }: Props) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [category, setCategory] = useState<DocumentCategory | ''>('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument(patientId);

  const validateAndSetFile = (file: File) => {
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      toast.error('Tipo de archivo no permitido. Usa JPG, PNG, WebP, PDF o DOCX.');
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast.error('El archivo supera el límite de 10 MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) validateAndSetFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    uploadMutation.mutate(
      { file: selectedFile, category: category || undefined },
      {
        onSuccess: () => {
          toast.success('Documento subido correctamente');
          setSelectedFile(null);
          setCategory('');
        },
        onError: () => {
          toast.error('Error al subir el documento');
        },
      },
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-[var(--color-kanji)] dark:text-white uppercase tracking-wider">
        Subir documento
      </h3>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
          isDragging
            ? 'border-[var(--color-kanji)] bg-[var(--color-cruz)]/20 dark:bg-kio/10'
            : 'border-gray-200 dark:border-slate-700 hover:border-[var(--color-kanji)] dark:hover:border-kio'
        }`}
      >
        <Upload size={24} className="mx-auto mb-2 text-gray-400 dark:text-slate-500" />
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Arrastra un archivo o <span className="text-[var(--color-kanji)] dark:text-kio font-medium">haz clic</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">JPG, PNG, WebP, PDF, DOCX — máx. 10 MB</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.docx"
          onChange={handleInputChange}
        />
      </div>

      {/* Selected file preview */}
      {selectedFile && (
        <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-100 dark:border-slate-700">
          <FileText size={18} className="text-[var(--color-kanji)] dark:text-kio shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-700 dark:text-slate-300 truncate">{selectedFile.name}</p>
            <p className="text-xs text-gray-400 dark:text-slate-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={() => setSelectedFile(null)}
            className="p-1 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Category selector */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value as DocumentCategory | '')}
        className="w-full text-sm border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/40"
      >
        <option value="">Sin categoría</option>
        {(Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((cat) => (
          <option key={cat} value={cat}>{CATEGORY_LABELS[cat]}</option>
        ))}
      </select>

      <button
        onClick={handleSubmit}
        disabled={!selectedFile || uploadMutation.isPending}
        className="w-full py-2 px-4 rounded-lg bg-[var(--color-kanji)] dark:bg-kio text-white dark:text-slate-900 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {uploadMutation.isPending ? 'Subiendo...' : 'Subir documento'}
      </button>
    </div>
  );
}
