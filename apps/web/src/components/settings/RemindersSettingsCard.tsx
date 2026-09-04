import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Loader2,
  XCircle,
} from 'lucide-react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';

const LEAD_OPTIONS = [
  { value: 12, label: '12 horas antes' },
  { value: 24, label: '24 horas antes' },
  { value: 48, label: '48 horas antes' },
];

const SECOND_TOUCH_OPTIONS = [
  { value: 'off', label: 'Desactivado' },
  { value: '2', label: '2 horas antes' },
  { value: '3', label: '3 horas antes' },
];

interface ReminderValues {
  enabled: boolean;
  leadHours: number;
  secondTouch: string;
}

/**
 * Lo que sabemos que está guardado en el servidor. `undefined` no significa
 * "apagado" ni "por defecto": significa que no lo sabemos.
 */
type KnownReminders = Partial<ReminderValues>;

/**
 * Valores que pintan los controles cuando no hay nada confirmado. Existen para
 * que los `select` tengan algo que renderizar, NO para afirmar que eso es lo
 * que el clínico tiene configurado — de eso se encarga `*Unknown` más abajo.
 */
const FALLBACK: ReminderValues = { enabled: true, leadHours: 24, secondTouch: 'off' };

interface ReminderFieldsSource {
  remindersEnabled?: boolean;
  reminderLeadHours?: number;
  reminderSecondLeadHours?: number | null;
}

/**
 * Traduce la forma del servidor a la del formulario, distinguiendo los dos
 * "vacíos" que aquí no son lo mismo: `reminderSecondLeadHours: null` es el
 * segundo toque desactivado (un dato), y `undefined` es un campo que la
 * respuesta no trajo (ausencia de dato).
 */
function readReminders(source: ReminderFieldsSource | null | undefined): KnownReminders {
  if (!source) return {};
  return {
    enabled:
      typeof source.remindersEnabled === 'boolean' ? source.remindersEnabled : undefined,
    leadHours:
      typeof source.reminderLeadHours === 'number' ? source.reminderLeadHours : undefined,
    secondTouch:
      source.reminderSecondLeadHours === undefined
        ? undefined
        : source.reminderSecondLeadHours === null
          ? 'off'
          : String(source.reminderSecondLeadHours),
  };
}

/**
 * Configuración de recordatorios por email al paciente.
 * Guarda vía PATCH /users/profile (mismos campos que ClinicianProfile).
 */
export function RemindersSettingsCard() {
  const { user, fetchCurrentUser } = useAuthStore();

  /**
   * Hay dos fuentes de verdad posibles y ninguna está garantizada:
   *
   * 1. `auth.store.user.profile`. Hoy el `select` de `GET /auth/me` y el de
   *    `login` NO incluyen los tres campos de recordatorios, así que llegan
   *    `undefined`. La tarjeta se comportaba como si `undefined` fuese "el
   *    valor por defecto": pintaba el interruptor encendido a alguien que
   *    tenía los recordatorios apagados, y al guardar mandaba SIEMPRE los tres
   *    campos, de modo que quien solo quería apagar el aviso sobrescribía su
   *    lead de 48 h con las 24 h que la tarjeta se había inventado.
   *
   * 2. La respuesta de `PATCH /users/profile`, que sí devuelve la fila
   *    completa del perfil. Es la verdad más reciente que existe para estos
   *    campos, así que manda sobre el perfil del store (que puede ir un
   *    `fetchCurrentUser` por detrás, y que hoy ni siquiera los trae).
   *
   * Cuando ninguna de las dos sabe un campo, la tarjeta lo dice en pantalla en
   * vez de rellenarlo con un valor plausible, y ese campo no se envía salvo que
   * el usuario lo elija a mano.
   */
  const [saved, setSaved] = useState<KnownReminders>({});
  const fromProfile = readReminders(user?.profile);
  const known: KnownReminders = {
    enabled: saved.enabled ?? fromProfile.enabled,
    leadHours: saved.leadHours ?? fromProfile.leadHours,
    secondTouch: saved.secondTouch ?? fromProfile.secondTouch,
  };

  /** Solo los campos que el usuario ha tocado en esta pantalla. */
  const [draft, setDraft] = useState<KnownReminders>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toggleRef = useRef<HTMLInputElement>(null);

  const values: ReminderValues = {
    enabled: draft.enabled ?? known.enabled ?? FALLBACK.enabled,
    leadHours: draft.leadHours ?? known.leadHours ?? FALLBACK.leadHours,
    secondTouch: draft.secondTouch ?? known.secondTouch ?? FALLBACK.secondTouch,
  };

  const enabledUnknown = draft.enabled === undefined && known.enabled === undefined;
  const leadUnknown = draft.leadHours === undefined && known.leadHours === undefined;
  const secondUnknown = draft.secondTouch === undefined && known.secondTouch === undefined;
  const anyUnknown = enabledUnknown || leadUnknown || secondUnknown;

  // Un campo viaja solo si el usuario lo tocó y difiere de lo confirmado. Si no
  // hay nada confirmado, tocarlo cuenta como cambio: es la única forma de fijar
  // un valor que no podemos leer.
  const changed = {
    enabled: draft.enabled !== undefined && draft.enabled !== known.enabled,
    leadHours: draft.leadHours !== undefined && draft.leadHours !== known.leadHours,
    secondTouch:
      draft.secondTouch !== undefined && draft.secondTouch !== known.secondTouch,
  };
  const isDirty = changed.enabled || changed.leadHours || changed.secondTouch;

  const update = (patch: KnownReminders) => setDraft((prev) => ({ ...prev, ...patch }));

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    [],
  );

  // `indeterminate` es el mecanismo nativo para "ni marcado ni sin marcar": el
  // lector de pantalla anuncia el estado mixto en lugar de afirmar "desactivado"
  // sobre un dato que no tenemos.
  useEffect(() => {
    if (toggleRef.current) toggleRef.current.indeterminate = enabledUnknown;
  }, [enabledUnknown]);

  const mutation = useMutation({
    mutationFn: async (payload: ReminderFieldsSource) => {
      const response = await api.patch<ReminderFieldsSource>('/users/profile', payload);
      return response.data;
    },
    onSuccess: (data) => {
      // La respuesta del PATCH es lo realmente escrito. Importa además porque
      // el servidor aplica una regla de coherencia propia (si el segundo toque
      // no queda por debajo del principal lo desactiva), y así la tarjeta pinta
      // lo que quedó guardado y no lo que pedimos.
      setSaved((prev) => {
        const next = readReminders(data);
        return {
          enabled: next.enabled ?? prev.enabled,
          leadHours: next.leadHours ?? prev.leadHours,
          secondTouch: next.secondTouch ?? prev.secondTouch,
        };
      });
      setDraft({});
      setSuccessMessage('Preferencias de recordatorios guardadas');
      void fetchCurrentUser();
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const handleSave = () => {
    const payload: ReminderFieldsSource = {};
    if (changed.enabled) payload.remindersEnabled = values.enabled;
    if (changed.leadHours) payload.reminderLeadHours = values.leadHours;
    if (changed.secondTouch) {
      payload.reminderSecondLeadHours =
        values.secondTouch === 'off' ? null : parseInt(values.secondTouch, 10);
    }
    if (Object.keys(payload).length === 0) return;
    setSuccessMessage(null);
    mutation.mutate(payload);
  };

  const selectClass =
    'w-full pl-4 pr-10 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const noticeId = 'recordatorios-sin-confirmar';
  const describedBy = anyUnknown ? noticeId : undefined;

  const toggleStateLabel = enabledUnknown
    ? 'Sin confirmar'
    : values.enabled
      ? 'Activados'
      : 'Desactivados';

  return (
    <section
      id="recordatorios"
      aria-labelledby="recordatorios-title"
      className="scroll-mt-24 bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden"
    >
      <div className="border-b border-cruz dark:border-slate-800 px-6 py-5">
        <h2
          id="recordatorios-title"
          className="text-lg font-semibold text-kanji dark:text-white flex items-center gap-2"
        >
          <BellRing size={18} aria-hidden="true" />
          Recordatorios a pacientes
        </h2>
        <p className="text-sm text-text/60 dark:text-slate-400 mt-1">
          Emails automáticos donde el paciente puede confirmar, cancelar o
          pedir un cambio de horario
        </p>
      </div>

      <div className="p-6 space-y-6">
        {anyUnknown && (
          <p
            id={noticeId}
            role="status"
            className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
          >
            <AlertTriangle size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span>
              No pudimos leer tu configuración actual de recordatorios, así que
              los campos marcados como «sin confirmar» no dicen lo que tus
              pacientes reciben hoy. Solo se guardará lo que cambies aquí; lo
              demás queda como está.
            </span>
          </p>
        )}

        {/* Toggle */}
        <label className="flex items-center justify-between gap-4 min-h-11 cursor-pointer">
          <div>
            <p className="text-sm font-medium text-kanji dark:text-slate-300">
              Enviar recordatorios por email
            </p>
            <p className="text-xs text-text/50 dark:text-slate-500 mt-0.5">
              Solo a pacientes con correo de contacto registrado
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            {/* El estado en palabras, no solo en la posición del interruptor. */}
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                enabledUnknown
                  ? 'text-amber-700 dark:text-amber-300'
                  : 'text-text/50 dark:text-slate-500'
              }`}
            >
              {toggleStateLabel}
            </span>
            <input
              ref={toggleRef}
              type="checkbox"
              checked={values.enabled && !enabledUnknown}
              aria-describedby={describedBy}
              onChange={(e) => update({ enabled: e.target.checked })}
              className="sr-only peer"
            />
            <span
              className={`relative w-11 h-6 shrink-0 rounded-full transition-colors duration-150 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-5 after:h-5 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-focus-visible:ring-2 peer-focus-visible:ring-kio/50 ${
                enabledUnknown
                  ? 'bg-amber-200 dark:bg-amber-900/50 after:translate-x-2.5'
                  : values.enabled
                    ? 'bg-kio after:translate-x-5'
                    : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          </div>
        </label>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lead principal */}
          <div className="space-y-2">
            <label
              htmlFor="reminderLeadHours"
              className="block text-sm font-medium text-kanji dark:text-slate-300"
            >
              Recordatorio principal
            </label>
            <select
              id="reminderLeadHours"
              value={leadUnknown ? '' : String(values.leadHours)}
              disabled={!values.enabled}
              aria-describedby={describedBy}
              onChange={(e) => {
                if (e.target.value === '') return;
                update({ leadHours: parseInt(e.target.value, 10) });
              }}
              className={selectClass}
            >
              {leadUnknown && <option value="">Sin confirmar</option>}
              {LEAD_OPTIONS.map((opt) => (
                <option key={opt.value} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Segundo toque */}
          <div className="space-y-2">
            <label
              htmlFor="reminderSecondTouch"
              className="block text-sm font-medium text-kanji dark:text-slate-300"
            >
              Segundo recordatorio
            </label>
            <select
              id="reminderSecondTouch"
              value={secondUnknown ? '' : values.secondTouch}
              disabled={!values.enabled}
              aria-describedby={describedBy}
              onChange={(e) => {
                if (e.target.value === '') return;
                update({ secondTouch: e.target.value });
              }}
              className={selectClass}
            >
              {secondUnknown && <option value="">Sin confirmar</option>}
              {SECOND_TOUCH_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-xs text-text/50 dark:text-slate-500">
          Las citas agendadas para el mismo día reciben un recordatorio
          inmediato ("Tu cita es hoy") si faltan al menos 60 minutos.
        </p>

        {successMessage && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">{successMessage}</p>
          </div>
        )}

        {mutation.isError && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400">
            <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium">
              Error al guardar las preferencias. Intenta de nuevo.
            </p>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={mutation.isPending || !isDirty}
            className="w-full sm:w-auto flex min-h-11 items-center justify-center gap-2 px-8 py-3 bg-kanji-deep text-white font-bold rounded-xl shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                Guardando…
              </>
            ) : (
              'Guardar recordatorios'
            )}
          </button>
          {/* Cada tarjeta de Ajustes guarda lo suyo. */}
          <p className="text-xs text-text/50 dark:text-slate-500">
            {isDirty
              ? 'Tienes cambios sin guardar en esta tarjeta.'
              : 'Solo guarda esta tarjeta. Preferencias de sesión se guarda aparte.'}
          </p>
        </div>
      </div>
    </section>
  );
}
