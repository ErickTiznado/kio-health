import { create } from 'zustand';
import { toast } from 'sonner';
import { fetchPsychNote, upsertPsychNote } from '../lib/appointments.api';
import type { PsychNote, CreatePsychNoteDto } from '../types/appointments.types';
import { capture } from '../lib/analytics';
import { toLengthBucket } from '../lib/analytics.events';

interface OfflineNotePayload {
  appointmentId: string;
  data: CreatePsychNoteDto;
  timestamp: number;
}

/* ── Búfer de respaldo de notas ───────────────────────────────────────────
 *
 * El cuerpo de una nota es dato clínico: el backend lo cifra con AES-256-GCM
 * y PRODUCT.md convierte esa confidencialidad en la promesa central del
 * producto. La versión anterior de este búfer lo escribía en claro en
 * `localStorage`, es decir en almacenamiento DURADERO: sobrevivía al cierre
 * del navegador, quedaba legible para cualquier XSS y para cualquiera que
 * abriera el mismo perfil en el ordenador compartido de la consulta.
 *
 * Ahora vive en memoria, espejado en `sessionStorage`: muere al cerrar la
 * pestaña. Ese límite es real y hay que decirlo tal cual en la interfaz — no
 * se puede prometer "se enviará cuando vuelva la conexión" a alguien que va a
 * cerrar el portátil.
 *
 * Lo que este búfer SÍ garantiza:
 *  - sobrevive a la navegación dentro de la app y a una recarga de la pestaña;
 *  - sobrevive a un cierre de sesión involuntario (token caducado), porque
 *    `auth.store.logout()` ya no lo purga por defecto;
 *  - se vacía en cuanto una escritura llega al servidor, y se reintenta al
 *    volver la conexión, al abrir cualquier sesión y desde el botón de
 *    reintento.
 *
 * Lo que NO garantiza: sobrevivir al cierre de la pestaña.
 */

/** Clave nueva: `sessionStorage`, muere al cerrar la pestaña. */
const QUEUE_KEY = 'kio_offline_notes';
/** Clave heredada: `localStorage`, en claro. Se adopta y se retira. */
const LEGACY_QUEUE_KEY = 'offline_notes_queue';

/** Fuente de verdad. `null` = todavía no se ha leído del almacenamiento. */
let memoryQueue: OfflineNotePayload[] | null = null;

/**
 * Cuándo aceptó el servidor por última vez una escritura de cada cita, en el
 * reloj de ESTE navegador (igual que `OfflineNotePayload.timestamp`, así que son
 * comparables). Solo se marca en escrituras confirmadas: nunca al dejar algo en
 * el búfer. Sirve para no subir desde la cola un payload que el servidor ya
 * superó — es decir, para que reintentar no pueda revertir la nota.
 */
const confirmedServerWrite = new Map<string, number>();

function parseQueue(raw: string | null): OfflineNotePayload[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as OfflineNotePayload[]) : [];
  } catch {
    return [];
  }
}

/**
 * Última entrada por cita, en orden de escritura.
 *
 * Ya NO caduca por antigüedad. El tope de 24 h anterior se justificaba con la
 * regla del backend, pero esa regla se cuenta desde el fin de la CITA y solo
 * bloquea si la nota ya existe (`appointments.service.ts:478-491`): eran dos
 * ventanas distintas, así que descartaba texto que el servidor todavía habría
 * aceptado. Ahora quien decide si un payload ya no tiene destino es el propio
 * servidor, y su rechazo se cuenta en voz alta (`syncOfflineNotes`).
 */
function normalize(entries: OfflineNotePayload[]): OfflineNotePayload[] {
  const byAppointment = new Map<string, OfflineNotePayload>();

  for (const entry of entries) {
    if (!entry?.appointmentId || !entry.data) continue;
    if (typeof entry.timestamp !== 'number') continue;
    const existing = byAppointment.get(entry.appointmentId);
    if (!existing || existing.timestamp <= entry.timestamp) {
      byAppointment.set(entry.appointmentId, entry);
    }
  }

  return [...byAppointment.values()].sort((a, b) => a.timestamp - b.timestamp);
}

function persistQueue(queue: OfflineNotePayload[]) {
  memoryQueue = queue;
  try {
    if (queue.length === 0) sessionStorage.removeItem(QUEUE_KEY);
    else sessionStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // sessionStorage puede estar bloqueado (modo privado, cuota). La cola en
    // memoria sigue siendo válida durante la vida de la pestaña: preferimos
    // eso a perder el texto por no poder escribirlo.
  }
}

function loadQueue(): OfflineNotePayload[] {
  if (memoryQueue) return memoryQueue;

  let raw: string | null = null;
  try {
    raw = sessionStorage.getItem(QUEUE_KEY);
  } catch {
    raw = null;
  }
  const entries = parseQueue(raw);

  // Ruta de lectura compatible hacia atrás: una cola escrita por la versión
  // anterior sigue en `localStorage`. Se adopta —no se descarta— y solo
  // entonces se retira de ahí. El texto no se pierde; deja de estar en
  // almacenamiento duradero, que es exactamente el arreglo.
  let legacy: OfflineNotePayload[] = [];
  try {
    legacy = parseQueue(localStorage.getItem(LEGACY_QUEUE_KEY));
  } catch {
    legacy = [];
  }

  const normalized = normalize([...entries, ...legacy]);
  persistQueue(normalized);

  if (legacy.length > 0) {
    try {
      localStorage.removeItem(LEGACY_QUEUE_KEY);
    } catch {
      // Si no se puede limpiar, la cola queda duplicada pero íntegra.
    }
  }

  return normalized;
}

function enqueue(appointmentId: string, data: CreatePsychNoteDto): number {
  const rest = loadQueue().filter((q) => q.appointmentId !== appointmentId);
  const next = [...rest, { appointmentId, data, timestamp: Date.now() }];
  persistQueue(next);
  return next.length;
}

/**
 * Simétrica de `enqueue`: retira del búfer lo encolado para una cita.
 *
 * Se llama SIEMPRE que el servidor deja de necesitar esa entrada — al guardar
 * con éxito y al recibir un rechazo definitivo. Sin esto, una nota que falló
 * una vez quedaba encolada para siempre: la píldora "Sin sincronizar" mentía
 * indefinidamente y el botón de reintentar volvía a subir el payload viejo
 * ENCIMA de la versión buena, anunciando éxito.
 *
 * Lee el estado vivo en cada llamada (no una copia capturada antes de un
 * `await`), así que no pisa lo que se haya encolado mientras tanto. Con
 * `onlyIfTimestamp` retira solo esa versión exacta: si durante la subida se
 * encoló algo más nuevo para la misma cita, lo nuevo se queda.
 */
function dequeue(appointmentId: string, onlyIfTimestamp?: number): number {
  const next = loadQueue().filter(
    (q) =>
      q.appointmentId !== appointmentId ||
      (onlyIfTimestamp !== undefined && q.timestamp !== onlyIfTimestamp),
  );
  persistQueue(next);
  return next.length;
}

/** Cuántas notas siguen sin llegar al servidor. Lo consulta `auth.store`. */
export function countOfflineNotes(): number {
  return loadQueue().length;
}

/**
 * Borra el búfer de notas sin sincronizar de este navegador.
 *
 * NO se llama en cualquier cierre de sesión: `logout()` lo hace solo cuando el
 * cierre es deliberado Y no queda nada por enviar (ver `auth.store.ts`). Borrar
 * aquí es destruir texto clínico que no existe en ningún otro sitio.
 */
export function purgeOfflineNotes() {
  memoryQueue = [];
  confirmedServerWrite.clear();
  try {
    sessionStorage.removeItem(QUEUE_KEY);
  } catch {
    /* nada que hacer */
  }
  try {
    localStorage.removeItem(LEGACY_QUEUE_KEY);
  } catch {
    /* nada que hacer */
  }
}

/* ── Clasificación de fallos ──────────────────────────────────────────────
 *
 * Solo hay una pregunta que importa: ¿este mismo texto llegaría al servidor si
 * se reintentara? Si la respuesta es sí, el payload se conserva. Si es no, se
 * retira y se dice por qué.
 *
 * El 401 es el caso que antes se contestaba mal: caía en "4xx = rechazo
 * definitivo", así que una sesión caducada durante el autoguardado perdía la
 * nota y encima culpaba al servidor de haberla rechazado. El servidor nunca vio
 * el contenido; el mismo DTO se guarda sin problema tras reautenticarse.
 */
type Failure =
  | { kind: 'retryable' }
  | { kind: 'expired-session' }
  | { kind: 'rejected'; message: string };

/** 4xx que no son un juicio sobre el contenido, sino sobre el momento. */
const RETRYABLE_STATUSES = new Set([408, 425, 429]);

interface ErrorResponse {
  status?: number;
  data?: { message?: string | string[]; code?: string };
}

function serverMessage(data: ErrorResponse['data']): string | null {
  const message = data?.message;
  if (Array.isArray(message)) return message[0] || null;
  return message || null;
}

function classifyFailure(error: unknown): Failure {
  const response = (error as { response?: ErrorResponse }).response;
  const status = response?.status;

  // Sin respuesta: red caída, timeout de 15 s, servidor inalcanzable.
  if (!status) return { kind: 'retryable' };

  if (status === 401) return { kind: 'expired-session' };
  if (RETRYABLE_STATUSES.has(status)) return { kind: 'retryable' };

  // Prueba caducada: el servidor no rechaza la nota, rechaza el momento. Al
  // elegir plan, el mismo texto se guarda.
  if (status === 403 && response?.data?.code === 'TRIAL_EXPIRED') return { kind: 'retryable' };

  if (status >= 400 && status < 500) {
    return {
      kind: 'rejected',
      message: serverMessage(response?.data) || 'El servidor rechazó el guardado.',
    };
  }

  // 5xx: el servidor falló, no la nota.
  return { kind: 'retryable' };
}

/**
 * Guardado en vuelo. Vive fuera del estado de React porque no se pinta: sirve
 * para que un guardado forzado (Ctrl+S, botón de finalizar) ESPERE la petición
 * abierta en vez de lanzar un segundo `upsertPsychNote` con el mismo contenido
 * — dos escrituras concurrentes sobre la misma nota, sin orden garantizado, y
 * una sonda `session_note_saved` duplicada.
 */
let inFlightSave: { signature: string; promise: Promise<void> } | null = null;

interface NoteState {
  currentNote: PsychNote | null;
  status: 'idle' | 'loading' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  error: string | null;
  /**
   * La LECTURA de la nota falló. Separado de `status: 'error'` (que habla del
   * guardado) porque las consecuencias son opuestas: con un error de lectura no
   * se sabe si hay nota, así que ni se puede decir "sin nota escrita" ni se
   * puede dejar que el autoguardado escriba encima de lo que no se pudo leer.
   */
  loadError: string | null;
  /** Hay texto clínico escrito que todavía no llegó al servidor. */
  hasOfflineData: boolean;
  /** Cuántas notas están en esa situación. Se pinta en la barra del editor. */
  offlineCount: number;

  /**
   * Firma (`JSON.stringify`) del último DTO que sí se escribió. Vive en el
   * store y no en un ref del hook para que un guardado forzado desde fuera
   * (atajo, cierre de sesión) y el autoguardado con debounce compartan la
   * misma referencia y no se pisen.
   */
  lastSavedSignature: string | null;
  /** Lo último tecleado que el debounce aún no ha mandado. */
  pendingSave: { appointmentId: string; data: CreatePsychNoteDto } | null;

  fetchNote: (appointmentId: string) => Promise<void>;
  saveNote: (appointmentId: string, data: CreatePsychNoteDto) => Promise<void>;
  syncOfflineNotes: () => Promise<void>;
  refreshOfflineStatus: () => void;
  markSavedSignature: (signature: string) => void;
  setPendingSave: (pending: { appointmentId: string; data: CreatePsychNoteDto } | null) => void;
  /** Escribe ya lo que esté en vuelo. Devuelve `true` si quedó guardado. */
  flushPendingSave: () => Promise<boolean>;
  reset: () => void;
}

export const useNoteStore = create<NoteState>((set, get) => ({
  currentNote: null,
  status: 'idle',
  lastSaved: null,
  error: null,
  loadError: null,
  hasOfflineData: false,
  offlineCount: 0,
  lastSavedSignature: null,
  pendingSave: null,

  fetchNote: async (appointmentId: string) => {
    set({ status: 'loading', error: null, loadError: null });
    try {
      // El backend devuelve `null` cuando la cita no tiene nota (200 con cuerpo
      // vacío): ausencia de nota NO es un error, y por eso un rechazo aquí sí
      // significa que no se pudo leer.
      const note = await fetchPsychNote(appointmentId);
      set({ currentNote: note || null, status: 'idle', loadError: null });
    } catch (error) {
      console.error('Failed to fetch note:', error);
      const message = 'No se pudo leer la nota de esta sesión.';
      toast.error(message, { id: 'note_load_failed' });
      // `loadError` en vez de tragar el fallo y volver a `idle`: así el editor
      // puede bloquear el autoguardado y el cierre de sesión puede decir "no se
      // pudo leer" en vez de afirmar "sin nota escrita en esta sesión".
      set({ currentNote: null, status: 'idle', loadError: message });
    }
  },

  saveNote: async (appointmentId: string, data: CreatePsychNoteDto) => {
    const signature = JSON.stringify(data);

    const run = (async () => {
      set({ status: 'saving', error: null });

      if (!navigator.onLine) {
        const count = enqueue(appointmentId, data);
        toast.info('Sin conexión. La nota queda en esta pestaña.', { id: 'offline_save' });
        set({
          status: 'saved',
          lastSaved: new Date(),
          lastSavedSignature: signature,
          pendingSave: null,
          hasOfflineData: true,
          offlineCount: count,
        });
        return;
      }

      try {
        const note = await upsertPsychNote(appointmentId, data);

        // Del contenido solo sale su tamaño en tramos. El texto de la nota es
        // dato clínico cifrado: ni la longitud exacta sale de aquí.
        capture('session_note_saved', {
          template_type: data.templateType,
          has_private_notes: Boolean(data.privateNotes),
          has_tags: Boolean(data.tags?.length),
          length_bucket: toLengthBucket(JSON.stringify(data.content ?? '').length),
        });

        // El servidor ya tiene esta cita al día: lo que quedara encolado para
        // ella es una versión ANTERIOR. Dejarlo ahí mantenía encendido el aviso
        // de "sin sincronizar" y convertía el botón de reintentar en un botón
        // de revertir.
        confirmedServerWrite.set(appointmentId, Date.now());
        const remaining = dequeue(appointmentId);

        set({
          currentNote: note,
          status: 'saved',
          lastSaved: new Date(),
          lastSavedSignature: signature,
          pendingSave: null,
          hasOfflineData: remaining > 0,
          offlineCount: remaining,
        });
        setTimeout(() => set((s) => (s.status === 'saved' ? { status: 'idle' } : {})), 3000);
      } catch (error) {
        console.error('Failed to save note:', error);
        const failure = classifyFailure(error);

        if (failure.kind === 'rejected') {
          // Rechazo real del servidor sobre esta nota (el caso vivo es la regla
          // de las 24 h, que bloquea la edición por integridad legal).
          // Reintentarlo desde la cola fallaría igual, así que tampoco se queda
          // encolado fingiendo que hay algo pendiente.
          const remaining = dequeue(appointmentId);
          toast.error(failure.message, { id: 'note_save_rejected' });
          set({
            status: 'error',
            error: failure.message,
            hasOfflineData: remaining > 0,
            offlineCount: remaining,
          });
          return;
        }

        // Recuperable: red, servidor caído o sesión caducada. El texto se
        // conserva en el búfer y se dice exactamente dónde queda.
        const count = enqueue(appointmentId, data);
        const message =
          failure.kind === 'expired-session'
            ? 'Tu sesión caducó. La nota queda en esta pestaña y se enviará al volver a entrar.'
            : 'No se pudo guardar en el servidor. La nota queda en esta pestaña.';
        toast.error(message, { id: 'note_save_buffered' });
        set({
          status: 'saved',
          error: null,
          lastSaved: new Date(),
          lastSavedSignature: signature,
          pendingSave: null,
          hasOfflineData: true,
          offlineCount: count,
        });
      }
    })();

    inFlightSave = { signature, promise: run };
    try {
      await run;
    } finally {
      if (inFlightSave?.promise === run) inFlightSave = null;
    }
  },

  syncOfflineNotes: async () => {
    const queue = loadQueue();

    if (queue.length === 0) {
      set({ hasOfflineData: false, offlineCount: 0 });
      return;
    }

    if (!navigator.onLine) {
      set({ hasOfflineData: true, offlineCount: queue.length });
      return;
    }

    let rejected = 0;
    let rejectedMessage = '';
    let sessionExpired = false;

    for (const item of queue) {
      // Guarda contra revertir: si el servidor ya aceptó algo para esta misma
      // cita DESPUÉS de encolarse este payload, subirlo ahora dejaría la nota en
      // una versión anterior — y encima anunciando éxito. `confirmedServerWrite`
      // solo se marca en escrituras confirmadas, nunca al guardar en el búfer,
      // así que no puede descartar lo que aún no llegó.
      const confirmed = confirmedServerWrite.get(item.appointmentId);
      if (confirmed !== undefined && confirmed > item.timestamp) {
        dequeue(item.appointmentId, item.timestamp);
        continue;
      }

      try {
        const note = await upsertPsychNote(item.appointmentId, item.data);
        confirmedServerWrite.set(item.appointmentId, Date.now());
        // Se retira una a una, contra el estado vivo. La variante anterior
        // capturaba la cola al principio y al terminar escribía `failed`
        // encima: lo que se hubiera encolado durante el bucle desaparecía.
        dequeue(item.appointmentId, item.timestamp);

        // Si es la nota abierta, la barra del editor tiene que dejar de decir
        // "sin sincronizar" y pasar a decir la verdad nueva: ya está guardada.
        if (get().currentNote?.appointmentId === item.appointmentId) {
          set({ currentNote: note || get().currentNote, lastSaved: new Date() });
        }
      } catch (error) {
        console.error(`Failed to sync note for appointment ${item.appointmentId}:`, error);
        const failure = classifyFailure(error);

        if (failure.kind === 'rejected') {
          dequeue(item.appointmentId, item.timestamp);
          rejected++;
          rejectedMessage = failure.message;
        } else if (failure.kind === 'expired-session') {
          // Sin sesión no hay nada que intentar con las siguientes: se paran
          // todas y se conservan.
          sessionExpired = true;
          break;
        }
        // Recuperable: se queda en la cola tal cual.
      }
    }

    const remaining = countOfflineNotes();
    set({ hasOfflineData: remaining > 0, offlineCount: remaining });

    if (rejected > 0) {
      toast.error(
        rejected === 1
          ? `El servidor rechazó una nota sin sincronizar: ${rejectedMessage}`
          : `El servidor rechazó ${rejected} notas sin sincronizar: ${rejectedMessage}`,
        { id: 'offline_rejected', duration: 12000 },
      );
    }

    if (sessionExpired) {
      toast.error(
        'Tu sesión caducó. Las notas siguen en esta pestaña; vuelve a entrar para enviarlas.',
        { id: 'offline_session_expired' },
      );
      return;
    }

    if (remaining === 0) {
      if (rejected === 0) {
        toast.success('Sincronización completada. Todas las notas están en el servidor.');
      }
      return;
    }

    toast.error(
      remaining === 1
        ? 'Una nota sigue sin sincronizarse. Se conserva en esta pestaña.'
        : `${remaining} notas siguen sin sincronizarse. Se conservan en esta pestaña.`,
    );
  },

  refreshOfflineStatus: () => {
    const count = countOfflineNotes();
    set({ hasOfflineData: count > 0, offlineCount: count });
  },

  markSavedSignature: (signature: string) => set({ lastSavedSignature: signature }),

  setPendingSave: (pending) => set({ pendingSave: pending }),

  flushPendingSave: async () => {
    // Si hay una petición abierta, esperarla ANTES de decidir. `isDirty` vale
    // `true` mientras el estado es 'saving', así que sin esto pulsar Ctrl+S o
    // Finalizar durante un guardado lanzaba un segundo `upsertPsychNote` con el
    // mismo contenido: dos escrituras concurrentes sobre la misma nota y una
    // sonda duplicada. Al resolverse, `lastSavedSignature` ya cubre el caso de
    // "era exactamente esto" y la comprobación de abajo corta sola.
    if (inFlightSave) {
      await inFlightSave.promise.catch(() => undefined);
    }

    const { pendingSave, lastSavedSignature, status } = get();
    if (!pendingSave) return status !== 'error';
    if (JSON.stringify(pendingSave.data) === lastSavedSignature) return status !== 'error';

    await get().saveNote(pendingSave.appointmentId, pendingSave.data);
    return get().status !== 'error';
  },

  // `hasOfflineData` / `offlineCount` NO se resetean: el búfer es del
  // navegador, no de la nota abierta. Vaciarlos aquí apagaría el aviso de
  // "sin sincronizar" al salir de la sesión, que es cuando más falta hace.
  reset: () =>
    set({
      currentNote: null,
      status: 'idle',
      lastSaved: null,
      error: null,
      loadError: null,
      lastSavedSignature: null,
      pendingSave: null,
    }),
}));
