import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ChevronDown,
  Copy,
  Eye,
  EyeOff,
  FileDown,
  FilePlus,
  Gauge,
  LayoutTemplate,
  Lock,
  PanelRightClose,
  PanelRightOpen,
  PenTool,
  RotateCw,
  Target,
  UserRound,
} from 'lucide-react';
import { toast } from 'sonner';

import { useNoteStore } from '../../../stores/notes.store';
import { useAuthStore } from '../../../stores/auth.store';
import { useSettingsStore } from '../../../stores/settings.store';
import { useAutoSave } from '../../../hooks/use-auto-save';
import { useTagSuggestions } from '../../../hooks/use-appointments';
import { NoteTemplateType } from '../../../types/appointments.types';
import { api } from '../../../lib/api';
import { confirmAction } from '../../../lib/confirm-action';
import { capture } from '../../../lib/analytics';

import { MoodTracker } from './MoodTracker';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { SoapForm } from './SoapForm';
import { FreeForm } from './FreeForm';
import { TagInput } from './TagInput';
import { PatientContextPanel } from '../PatientContextPanel';
import { PrivateNoteField } from '../PrivateNoteField';
import { ScalesTab } from '../ScalesTab';
import { AddendumModal } from '../AddendumModal';
import type { ClinicalScale, NoteContent, PsychContext } from '../../../types/appointments.types';

interface EditorContainerProps {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientAge?: number;
  psychContext: PsychContext;
  clinicalScales?: ClinicalScale[];
  /** Nota cerrada por el estado de la cita: se lee, no se edita. */
  readOnly?: boolean;
  /**
   * Fin de la ventana de edición de 24h que impone el backend. Pasada esa hora
   * y con una nota ya creada, el servidor rechaza cualquier cambio.
   */
  editDeadline?: Date;
  onDirtyChange?: (dirty: boolean) => void;
  /** Atajo ⌘/Ctrl + Enter desde la superficie de escritura. */
  onRequestFinish?: () => void;
  /** Notifica si las escalas tienen respuestas sin guardar. */
  onScalesDirtyChange?: (dirty: boolean) => void;
}

type AsideTab = 'context' | 'scales' | 'prep';

const ASIDE_TABS: { id: AsideTab; label: string; icon: typeof UserRound }[] = [
  { id: 'context', label: 'Paciente', icon: UserRound },
  { id: 'scales', label: 'Escalas', icon: Activity },
  // La pestaña se llamaba "Sesión" dentro de una página que ya se llama Sesión:
  // no nombraba ni su contenido ni su propósito.
  { id: 'prep', label: 'Ánimo y etiquetas', icon: Gauge },
];

const ASIDE_STORAGE_KEY = 'session-aside-open';

export function EditorContainer({
  appointmentId,
  patientId,
  patientName,
  patientAge,
  psychContext,
  clinicalScales,
  readOnly: statusLocked = false,
  editDeadline,
  onDirtyChange,
  onRequestFinish,
  onScalesDirtyChange,
}: EditorContainerProps) {
  const { currentNote, status, lastSaved, error, loadError, fetchNote, reset } = useNoteStore();
  const hasOfflineData = useNoteStore((s) => s.hasOfflineData);
  const offlineCount = useNoteStore((s) => s.offlineCount);
  const refreshOfflineStatus = useNoteStore((s) => s.refreshOfflineStatus);
  const syncOfflineNotes = useNoteStore((s) => s.syncOfflineNotes);
  const clinicianType = useAuthStore((s) => s.user?.profile?.type ?? 'PSYCHOLOGIST');
  const isDiscreteMode = useSettingsStore((s) => s.isDiscreteMode);
  const toggleDiscreteMode = useSettingsStore((s) => s.toggleDiscreteMode);
  const { data: tagSuggestions = [] } = useTagSuggestions();

  const [asideOpen, setAsideOpen] = useState(
    () => localStorage.getItem(ASIDE_STORAGE_KEY) !== 'false',
  );
  const [asideTab, setAsideTab] = useState<AsideTab>('context');
  const [templateType, setTemplateType] = useState<NoteTemplateType>(NoteTemplateType.FREE);
  const [content, setContent] = useState<NoteContent>({ body: '', sessionGoal: '' });
  const [moodRating, setMoodRating] = useState<number>(5);
  const [tags, setTags] = useState<string[]>([]);
  const [privateNotes, setPrivateNotes] = useState('');
  const [privateOpen, setPrivateOpen] = useState(false);
  const [hydratedFrom, setHydratedFrom] = useState<string | null>(null);
  const [isAddendumOpen, setIsAddendumOpen] = useState(false);
  const [scalesDirty, setScalesDirty] = useState(false);
  const [openedAt] = useState(() => Date.now());

  const handleScalesDirty = useCallback(
    (dirty: boolean) => {
      setScalesDirty(dirty);
      onScalesDirtyChange?.(dirty);
    },
    [onScalesDirtyChange],
  );

  // Clear store on unmount to avoid stale note bleeding into the next session
  useEffect(() => {
    return () => { reset(); };
  }, [reset]);

  // Arranque de la nota, en este orden a propósito:
  //
  //  1. contar lo que quedó sin sincronizar (la barra tiene que decirlo);
  //  2. INTENTAR ENVIARLO — abrir una sesión es el único disparador automático
  //     que existe además del evento `online`, y es el que devuelve al servidor
  //     lo que se quedó en el búfer por un 5xx o por una sesión caducada;
  //  3. y solo entonces leer del servidor. Al revés, la lectura traería la
  //     versión vieja y el editor se hidrataría con ella.
  useEffect(() => {
    if (!appointmentId) return;
    let cancelled = false;
    void (async () => {
      refreshOfflineStatus();
      await syncOfflineNotes();
      if (!cancelled) await fetchNote(appointmentId);
    })();
    return () => {
      cancelled = true;
    };
  }, [appointmentId, fetchNote, refreshOfflineStatus, syncOfflineNotes]);

  // Hidratación de la nota cargada en el estado del editor. Se hace en render y
  // no en un efecto: la variante anterior lo difería con `setTimeout(…, 0)` para
  // callar a `react-hooks/set-state-in-effect`, y en esa ventana podía pisar lo
  // que el clínico ya hubiera escrito. Una sola vez por cita: `currentNote`
  // cambia de referencia en cada guardado y rehidratar ahí borraría el tecleo.
  if (currentNote && hydratedFrom !== appointmentId) {
    setHydratedFrom(appointmentId);
    setTemplateType(currentNote.templateType);
    setContent(currentNote.content as NoteContent);
    if (currentNote.moodRating) setMoodRating(currentNote.moodRating);
    if (currentNote.tags) setTags(currentNote.tags);
    if (currentNote.privateNotes) {
      setPrivateNotes(currentNote.privateNotes);
      // Si ya hay notas privadas escritas, esconderlas tras un plegado sería
      // ocultar contenido existente.
      setPrivateOpen(true);
    }
  }

  // El servidor solo aplica el bloqueo de 24h si la nota ya existe: una nota
  // nunca escrita todavía se puede crear fuera de plazo. Se evalúa contra una
  // marca tomada al montar — cruzar el límite con la página abierta es un caso
  // que el rechazo del servidor ya cubre.
  const deadlinePassed = Boolean(
    editDeadline && currentNote && openedAt > editDeadline.getTime(),
  );
  const readOnly = statusLocked || deadlinePassed;

  // La lectura de la nota falló. No es lo mismo que "no hay nota": aquí NO se
  // sabe qué hay en el servidor, así que escribir sería redactar a ciegas sobre
  // un expediente existente y el primer autoguardado lo sustituiría por upsert.
  // Se corta la escritura —no la sesión— hasta poder leer.
  const loadFailed = Boolean(loadError) && !readOnly;
  const canWrite = !readOnly && !loadFailed;

  // SONDA: ¿la ventana de 24h es demasiado corta?
  // Este evento se dispara cuando alguien abre una nota que ya no puede tocar.
  // `deadline` frecuente significa que el candado legal está chocando con el
  // ritmo real de trabajo — documentar al día siguiente es lo normal, no la
  // excepción. Una vez por nota: el efecto depende de la cita, no del render.
  useEffect(() => {
    if (!readOnly) return;
    capture('session_note_locked_viewed', { reason: deadlinePassed ? 'deadline' : 'status' });
  }, [readOnly, deadlinePassed, appointmentId]);

  const { isDirty, saveNow } = useAutoSave({
    appointmentId,
    content,
    templateType,
    moodRating,
    privateNotes,
    tags,
    enabled: canWrite,
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  // Cerrar el panel desmonta las escalas, y las escalas no se autoguardan: sin
  // este aviso, ocultar la columna lateral tiraba nueve respuestas en silencio.
  const toggleAside = async () => {
    if (asideOpen && scalesDirty) {
      const confirmed = await confirmAction({
        title: '¿Cerrar el panel?',
        description:
          'Hay respuestas de escala sin guardar. Las escalas no se guardan solas: si cierras el panel se pierden.',
        confirmLabel: 'Cerrar de todas formas',
        cancelLabel: 'Volver a las escalas',
        variant: 'warning',
      });
      if (!confirmed) return;
    }
    setAsideOpen((open) => {
      localStorage.setItem(ASIDE_STORAGE_KEY, String(!open));
      return !open;
    });
  };

  const handleSaveShortcut = () => {
    if (!canWrite) return;
    void saveNow().then((ok) => {
      if (ok) toast.success('Nota guardada', { id: 'note_saved_shortcut' });
    });
  };

  const handleTemplateChange = async (type: NoteTemplateType) => {
    if (type === templateType) return;
    if (JSON.stringify(content).length > 40) {
      const confirmed = await confirmAction({
        title: '¿Cambiar plantilla?',
        description: 'Cambiar de plantilla podría alterar el contenido actual.',
        confirmLabel: 'Sí, cambiar',
        cancelLabel: 'Cancelar',
        variant: 'warning',
      });
      if (!confirmed) return;
    }
    setTemplateType(type);
    const sessionGoal = content.sessionGoal || '';

    if (type === NoteTemplateType.SOAP) {
      setContent({ s: '', o: '', a: '', p: '', sessionGoal });
    } else {
      setContent({ body: '', sessionGoal });
    }
  };

  const handleCopyStructure = () => {
    const textToCopy =
      templateType === NoteTemplateType.SOAP
        ? `S: ${content.s || ''}\n\nO: ${content.o || ''}\n\nA: ${content.a || ''}\n\nP: ${content.p || ''}`
        : content.body || '';
    navigator.clipboard.writeText(textToCopy);
    toast.success('Copiado al portapapeles');
  };

  const handleExportPdf = async () => {
    try {
      toast.info('Generando PDF...');
      const response = await api.get(`/appointments/${appointmentId}/export/pdf`, {
        params: { includePrivate: false },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `session-${appointmentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('PDF descargado');
    } catch {
      toast.error('Error al generar PDF');
    }
  };

  const templateButton = (type: NoteTemplateType, label: string, Icon: typeof PenTool) => (
    <button
      type="button"
      onClick={() => handleTemplateChange(type)}
      disabled={!canWrite}
      aria-pressed={templateType === type}
      className={`flex min-h-11 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        templateType === type
          ? 'bg-surface text-kanji-deep shadow-sm dark:text-kio'
          : 'text-text-secondary hover:text-text'
      }`}
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );

  const showPrivateSection = !readOnly || Boolean(privateNotes);

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-bg">
      {/* ── Barra de herramientas ── */}
      <div className="flex shrink-0 flex-wrap items-center gap-2 border-b border-border bg-surface px-4 py-1.5">
        {readOnly ? (
          <span className="flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-secondary px-3 text-xs font-bold text-text-secondary">
            <Lock size={14} aria-hidden="true" />
            {deadlinePassed
              ? 'Cerrada tras 24 h · solo lectura'
              : 'Nota cerrada · solo lectura'}
          </span>
        ) : (
          <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
            {templateButton(NoteTemplateType.FREE, 'Nota libre', PenTool)}
            {templateButton(NoteTemplateType.SOAP, 'SOAP', LayoutTemplate)}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {canWrite && (
            <SaveStatusIndicator
              status={status}
              lastSaved={lastSaved}
              error={error}
              hasOfflineData={hasOfflineData}
              offlineCount={offlineCount}
              onRetry={hasOfflineData ? () => void syncOfflineNotes() : handleSaveShortcut}
            />
          )}

          {readOnly && (
            <button
              type="button"
              onClick={() => setIsAddendumOpen(true)}
              className="flex min-h-11 items-center gap-1.5 rounded-lg bg-kanji-deep px-3 text-xs font-bold text-white transition-opacity hover:opacity-90"
            >
              <FilePlus size={16} aria-hidden="true" />
              Agregar anexo
            </button>
          )}

          {/* Modo discreto — hasta ahora solo existía en ajustes, es decir era
              inalcanzable en los dos segundos en que hace falta: el paciente
              todavía en la sala, mirando la pantalla desde su silla. */}
          <button
            type="button"
            onClick={toggleDiscreteMode}
            aria-pressed={isDiscreteMode}
            className={`flex min-h-11 items-center gap-1.5 rounded-lg border px-3 text-xs font-bold transition-colors ${
              isDiscreteMode
                ? 'border-kanji-deep bg-cruz text-kanji-deep dark:border-kio/40 dark:bg-kio/10 dark:text-kio'
                : 'border-border text-text-secondary hover:bg-secondary hover:text-text'
            }`}
          >
            {isDiscreteMode ? (
              <EyeOff size={16} aria-hidden="true" />
            ) : (
              <Eye size={16} aria-hidden="true" />
            )}
            <span className="hidden sm:inline">
              {isDiscreteMode ? 'Discreto activo' : 'Modo discreto'}
            </span>
            <span className="sr-only">
              {isDiscreteMode ? 'Desactivar modo discreto' : 'Activar modo discreto'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyStructure}
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold text-text-secondary transition-colors hover:bg-secondary hover:text-text"
          >
            <Copy size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Copiar</span>
            <span className="sr-only">Copiar el contenido de la nota al portapapeles</span>
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            className="flex min-h-11 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-bold text-text-secondary transition-colors hover:bg-secondary hover:text-text"
          >
            <FileDown size={16} aria-hidden="true" />
            <span className="hidden sm:inline">PDF</span>
            <span className="sr-only">Exportar la nota a PDF</span>
          </button>

          <button
            type="button"
            onClick={() => void toggleAside()}
            aria-expanded={asideOpen}
            aria-label={asideOpen ? 'Ocultar panel lateral' : 'Mostrar panel lateral'}
            className="flex size-11 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:bg-secondary hover:text-text"
          >
            {asideOpen ? (
              <PanelRightClose size={18} aria-hidden="true" />
            ) : (
              <PanelRightOpen size={18} aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* ── Lectura fallida ──
          Va ANTES que cualquier vacío y antes de la superficie de escritura:
          en un expediente clínico, "no se pudo leer" y "no hay nota" no pueden
          verse igual. Mientras esto esté en pantalla el editor no escribe. */}
      {loadFailed && (
        <div
          role="alert"
          className="flex shrink-0 flex-wrap items-center gap-3 border-b border-rose-200 bg-rose-50 px-4 py-3 dark:border-rose-800 dark:bg-rose-950/40"
        >
          <AlertCircle
            size={18}
            aria-hidden="true"
            className="shrink-0 text-rose-700 dark:text-rose-300"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-rose-700 dark:text-rose-200">
              No se pudo leer la nota de esta sesión
            </p>
            <p className="text-[11px] font-medium text-rose-700/90 dark:text-rose-300/90">
              La escritura queda detenida: si ya había una nota, escribir ahora la
              sustituiría por lo que se teclee aquí.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchNote(appointmentId)}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-rose-300 px-3 text-xs font-bold text-rose-700 transition-colors hover:bg-rose-100 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/40"
          >
            <RotateCw size={14} aria-hidden="true" />
            Reintentar la lectura
          </button>
        </div>
      )}

      {/* ── Área de trabajo ── */}
      <div className="flex min-h-0 flex-1">
        {/* Columna del editor */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Objetivo de la sesión — visible mientras se redacta, que es
              precisamente cuando sirve de guía. En una nota cerrada sin
              objetivo no hay nada que mostrar ni nada que invitar a escribir. */}
          {(!readOnly || content.sessionGoal) && (
          <div className="flex shrink-0 items-start gap-2 border-b border-border bg-surface px-4 py-2">
            <Target size={16} aria-hidden="true" className="mt-2 shrink-0 text-kanji-deep dark:text-kio" />
            <label htmlFor="session-goal" className="sr-only">
              Objetivo principal de la sesión
            </label>
            <textarea
              id="session-goal"
              rows={1}
              readOnly={!canWrite}
              value={content.sessionGoal || ''}
              onChange={(e) => setContent((prev) => ({ ...prev, sessionGoal: e.target.value }))}
              placeholder="Objetivo de la sesión — ¿qué buscas lograr en esta intervención?"
              className="min-h-11 flex-1 resize-none rounded-md bg-transparent px-2 py-1.5 text-sm text-text placeholder:text-text-muted focus:bg-secondary focus:outline-none read-only:cursor-default"
            />
          </div>
          )}

          <div className="min-h-0 flex-1 overflow-hidden p-4">
            {templateType === NoteTemplateType.SOAP ? (
              <SoapForm
                content={{
                  s: content.s ?? '',
                  o: content.o ?? '',
                  a: content.a ?? '',
                  p: content.p ?? '',
                }}
                onChange={(key, val) => setContent((prev) => ({ ...prev, [key]: val }))}
                readOnly={!canWrite}
                onSave={handleSaveShortcut}
                onFinish={onRequestFinish}
              />
            ) : (
              <FreeForm
                content={{ body: content.body ?? '' }}
                onChange={(val) => setContent((prev) => ({ ...prev, body: val }))}
                readOnly={!canWrite}
                onSave={handleSaveShortcut}
                onFinish={onRequestFinish}
              />
            )}
          </div>

          {/* ── Notas privadas ──
              El campo cifrado `PsychNote.privateNotes` era inalcanzable desde
              la superficie clínica principal: el hook de autoguardado lo
              aceptaba y este contenedor no lo pasaba nunca, así que solo se
              podía escribir desde el anexo, una vez cerrada la nota. */}
          {showPrivateSection && (
            <div className="shrink-0 border-t border-border bg-surface px-4 py-2">
              <button
                type="button"
                onClick={() => setPrivateOpen((open) => !open)}
                aria-expanded={privateOpen}
                aria-controls="session-private-notes"
                className="flex min-h-11 w-full items-center gap-2 rounded-md px-2 text-left text-text-secondary transition-colors hover:bg-secondary hover:text-text"
              >
                <Lock size={16} aria-hidden="true" />
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Notas privadas
                </span>
                {privateNotes.trim() && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-bold text-text-secondary">
                    con contenido
                  </span>
                )}
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`ml-auto transition-transform duration-150 ${privateOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {privateOpen && (
                <div id="session-private-notes" className="pb-1 pt-2">
                  <PrivateNoteField
                    id="session-private-notes-field"
                    value={privateNotes}
                    onChange={setPrivateNotes}
                    readOnly={!canWrite}
                    rows={3}
                  />
                </div>
              )}
            </div>
          )}

          {canWrite && (
            <p className="shrink-0 border-t border-border bg-surface px-4 py-1.5 text-[11px] font-medium text-text-muted">
              Se guarda solo · <kbd className="font-sans font-bold">Ctrl/⌘ S</kbd> guardar ahora ·{' '}
              <kbd className="font-sans font-bold">Ctrl/⌘ ⏎</kbd> cerrar la sesión
              {templateType === NoteTemplateType.SOAP && (
                <>
                  {' '}· <kbd className="font-sans font-bold">Alt ↑/↓</kbd> cambiar de sección
                </>
              )}
            </p>
          )}
        </div>

        {/* Panel lateral de referencia */}
        <AnimatePresence initial={false}>
          {asideOpen && (
            <motion.aside
              key="aside"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              aria-label="Contexto de la sesión"
              className="absolute inset-y-0 right-0 z-20 flex w-[min(22rem,100%)] flex-col border-l border-border bg-surface lg:static lg:z-auto"
            >
              <div role="tablist" className="flex shrink-0 border-b border-border">
                {ASIDE_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    role="tab"
                    type="button"
                    aria-selected={asideTab === tab.id}
                    onClick={() => setAsideTab(tab.id)}
                    className={`-mb-px flex min-h-11 flex-1 items-center justify-center gap-1.5 border-b-2 px-1 text-center text-[11px] font-bold leading-tight transition-colors ${
                      asideTab === tab.id
                        ? 'border-kanji-deep text-kanji-deep dark:border-kio dark:text-kio'
                        : 'border-transparent text-text-secondary hover:text-text'
                    }`}
                  >
                    <tab.icon size={15} aria-hidden="true" className="shrink-0" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Cada pestaña gestiona su propio desplazamiento: el panel de
                  paciente ancla el bloque de tareas al pie. */}
              <div className="min-h-0 flex-1 overflow-hidden">
                {asideTab === 'context' && (
                  <PatientContextPanel
                    patientId={patientId}
                    patientName={patientName}
                    patientAge={patientAge || 0}
                    clinicianType={clinicianType}
                    psychContext={psychContext}
                  />
                )}

                {/* Las escalas se ocultan, no se desmontan: son el único
                    contenido del panel con estado propio sin autoguardado.
                    Desmontarlas al cambiar de pestaña tiraba nueve respuestas
                    en silencio y dejaba al guard de salida sin nada que
                    proteger. */}
                <div className={asideTab === 'scales' ? 'h-full overflow-y-auto p-4' : 'hidden'}>
                  <ScalesTab
                    appointmentId={appointmentId}
                    initialData={clinicalScales}
                    onDirtyChange={handleScalesDirty}
                  />
                </div>

                {asideTab === 'prep' && (
                  <div className="h-full space-y-6 overflow-y-auto p-4">
                    <div>
                      <span className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        Estado de ánimo
                      </span>
                      <MoodTracker
                        value={moodRating}
                        onChange={setMoodRating}
                        label="Percepción inicial"
                      />
                    </div>

                    <div className="h-px bg-border" />

                    <div>
                      <span className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-text-muted">
                        Etiquetas
                      </span>
                      <TagInput tags={tags} onChange={setTags} suggestions={tagSuggestions} />
                    </div>
                  </div>
                )}
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <AddendumModal
        isOpen={isAddendumOpen}
        onClose={() => setIsAddendumOpen(false)}
        appointmentId={appointmentId}
      />
    </div>
  );
}
