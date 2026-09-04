import { useRef, useState } from 'react';
import { toast } from 'sonner';
import { Upload, X, FileText, ShieldAlert } from 'lucide-react';
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
      <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
        Subir documento
      </h3>

      {/* El manejo de almacenamiento se declara ANTES del selector, no después
          de subir: los documentos van a un bucket privado con enlaces
          temporales, no a la capa de cifrado de campo (AES-GCM) que protege
          diagnóstico, notas y contacto. Es una asimetría real y el clínico no
          tenía forma de percibirla. */}
      <p className="flex items-start gap-2.5 rounded-xl border border-border bg-secondary px-3.5 py-3 text-xs font-medium leading-relaxed text-text dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        <ShieldAlert size={15} aria-hidden="true" className="mt-0.5 shrink-0 text-slate-600 dark:text-slate-400" />
        <span>
          Los archivos se guardan en almacenamiento privado y sólo se abren con enlaces
          temporales. A diferencia del diagnóstico o las notas, <strong className="font-bold">no pasan
          por el cifrado de campo del expediente</strong>: sube sólo lo necesario.
        </span>
      </p>

      {/* Zona de arrastre. Es un botón real: se alcanza con tabulador y responde
          a Enter y a Espacio, no sólo a Enter. */}
      <button
        type="button"
        aria-label="Elegir un archivo para subir al expediente"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`w-full rounded-2xl border-2 border-dashed p-6 text-center transition-colors duration-150 ${
          isDragging
            ? 'border-kanji-deep bg-cruz/25 dark:border-kio dark:bg-kio/10'
            : 'border-border hover:border-kanji-deep dark:border-slate-700 dark:hover:border-kio'
        }`}
      >
        <Upload size={22} aria-hidden="true" className="mx-auto mb-2 text-slate-600 dark:text-slate-400" />
        <span className="block text-sm font-medium text-text dark:text-slate-300">
          Arrastra un archivo o{' '}
          <span className="font-bold text-kanji-deep dark:text-kio">haz clic para elegirlo</span>
        </span>
        <span className="mt-1 block text-xs font-medium text-slate-600 dark:text-slate-400">
          JPG, PNG, WebP, PDF o DOCX — máx. 10 MB
        </span>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".jpg,.jpeg,.png,.webp,.pdf,.docx"
          onChange={handleInputChange}
        />
      </button>

      {/* Archivo seleccionado */}
      {selectedFile && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-secondary p-2.5 dark:border-slate-700 dark:bg-slate-800">
          <FileText size={18} aria-hidden="true" className="shrink-0 text-kanji-deep dark:text-kio" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-text dark:text-slate-200">{selectedFile.name}</p>
            <p className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
              {(selectedFile.size / 1024).toFixed(1)} KB
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            aria-label={`Quitar ${selectedFile.name}`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-white hover:text-rose-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-rose-400"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Categoría */}
      <div>
        <label
          htmlFor="document-category"
          className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400"
        >
          Categoría
        </label>
        <select
          id="document-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as DocumentCategory | '')}
          className="h-11 w-full rounded-xl border border-border bg-white px-3 text-sm font-medium text-text focus:border-kio focus:outline-none focus:ring-2 focus:ring-kio/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          <option value="">Sin categoría</option>
          {(Object.keys(CATEGORY_LABELS) as DocumentCategory[]).map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_LABELS[cat]}
            </option>
          ))}
        </select>
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedFile || uploadMutation.isPending}
        className="min-h-11 w-full rounded-xl bg-kanji-deep px-4 text-sm font-bold text-white shadow-sm shadow-kio/20 transition-colors duration-150 hover:bg-kanji hover:shadow-md hover:shadow-kio/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
      >
        {uploadMutation.isPending ? 'Subiendo…' : 'Subir documento'}
      </button>
    </div>
  );
}
