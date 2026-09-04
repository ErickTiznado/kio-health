import { useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Building2,
  User,
  NotebookPen,
  Paperclip,
  LogIn,
  Activity,
  UserCog,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { WidgetError } from '../components/widgets/WidgetError';
import { useAuthStore } from '../stores/auth.store';
import { useMyAccessLogs, useClinicAccessLogs } from '../hooks/use-access-logs';

/** Peso visual de cada acción: no es lo mismo abrir un expediente que ver el dashboard. */
type ActionWeight = 'record' | 'routine' | 'alert';

interface ActionGroup {
  /** Etiqueta del <optgroup> en el filtro. */
  label: string;
  icon: typeof User;
  weight: ActionWeight;
  /** [valor del enum, etiqueta legible], ya ordenadas. */
  actions: [string, string][];
}

/**
 * El filtro tenía 21 opciones planas, sin ordenar y mezclando accesos a
 * expediente con eventos de autenticación. Agrupadas, el listado dice además
 * qué categorías de dato registra el producto.
 */
const ACTION_GROUPS: ActionGroup[] = [
  {
    label: 'Expediente',
    icon: User,
    weight: 'record',
    actions: [
      ['VIEW_SESSION_CONTEXT', 'Abrir sesión'],
      ['ARCHIVE_PATIENT', 'Archivar paciente'],
      ['CREATE_PATIENT', 'Crear paciente'],
      ['UNARCHIVE_PATIENT', 'Desarchivar paciente'],
      ['UPDATE_PATIENT', 'Editar paciente'],
      ['LIST_PATIENTS', 'Listar pacientes'],
      ['VIEW_PROFILE', 'Ver expediente'],
      ['VIEW_MOOD_HISTORY', 'Ver historial de ánimo'],
      ['VIEW_TIMELINE', 'Ver historia clínica'],
    ],
  },
  {
    label: 'Notas clínicas',
    icon: NotebookPen,
    weight: 'record',
    actions: [
      ['CREATE_ADDENDUM', 'Crear anexo'],
      ['UPSERT_PSYCH_NOTE', 'Editar nota clínica'],
      ['VIEW_LAST_NOTE', 'Ver última nota'],
      ['VIEW_PSYCH_NOTE', 'Ver nota clínica'],
    ],
  },
  {
    label: 'Documentos',
    icon: Paperclip,
    weight: 'record',
    actions: [
      ['DELETE_DOCUMENT', 'Eliminar documento'],
      ['EXPORT_PDF', 'Exportar PDF'],
      ['UPLOAD_DOCUMENT', 'Subir documento'],
      ['VIEW_DOCUMENT', 'Ver documento'],
    ],
  },
  {
    label: 'Cuenta',
    icon: LogIn,
    weight: 'routine',
    actions: [
      ['LOGIN_SUCCESS', 'Inicio de sesión'],
      ['LOGIN_FAILED', 'Inicio de sesión fallido'],
      ['PASSWORD_RESET_REQUESTED', 'Solicitud de cambio de contraseña'],
      ['VIEW_DASHBOARD', 'Ver panel'],
    ],
  },
];

interface ActionMeta {
  label: string;
  icon: typeof User;
  weight: ActionWeight;
}

const ACTION_META: Record<string, ActionMeta> = {};
for (const group of ACTION_GROUPS) {
  for (const [value, label] of group.actions) {
    ACTION_META[value] = {
      label,
      icon: group.icon,
      // Un intento de entrada fallido no es un evento de cuenta más: es lo
      // único de esta pantalla sobre lo que hay que reaccionar.
      weight: value === 'LOGIN_FAILED' ? 'alert' : group.weight,
    };
  }
}

const WEIGHT_CHIP: Record<ActionWeight, string> = {
  record:
    'bg-kio/10 dark:bg-kio/15 text-kanji-deep dark:text-kio font-semibold border border-cruz dark:border-kio/20',
  routine:
    'bg-gray-100 dark:bg-slate-800 text-text/60 dark:text-slate-400 font-medium border border-transparent',
  alert:
    'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-500/30',
};

const PAGE_LIMIT = 25;

/**
 * Registro de accesos (audit trail). Vista personal para todo clínico;
 * los OWNER/ADMIN de clínica pueden alternar a la vista de toda la clínica.
 */
export function AccessLogPage() {
  const { user } = useAuthStore();
  const isClinicAdmin =
    user?.clinicRole === 'OWNER' || user?.clinicRole === 'ADMIN';

  const [scope, setScope] = useState<'mine' | 'clinic'>('mine');
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const query = {
    page,
    limit: PAGE_LIMIT,
    ...(actionFilter ? { action: actionFilter } : {}),
    ...(from ? { from } : {}),
    ...(to ? { to } : {}),
  };

  const mine = useMyAccessLogs(query, scope === 'mine');
  const clinic = useClinicAccessLogs(query, scope === 'clinic' && isClinicAdmin);
  const active = scope === 'clinic' ? clinic : mine;
  const logs = active.data?.data ?? [];
  const meta = active.data?.meta;

  /**
   * Inicio del mes en hora local, enviado como instante. El servidor filtra con
   * `new Date(from)`: un "YYYY-MM-01" pelado se leería en UTC y arrastraría las
   * últimas horas del mes anterior a un recuento que dice "este mes".
   */
  const monthStart = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  }, []);

  // Dos consultas de una fila: solo nos interesa `meta.total` (y el evento más
  // reciente). No hay endpoint de agregados, así que la franja se arma con el
  // mismo listado paginado.
  const monthQuery = { from: monthStart, page: 1, limit: 1 };
  const failedQuery = {
    from: monthStart,
    action: 'LOGIN_FAILED',
    page: 1,
    limit: 1,
  };

  const mineMonth = useMyAccessLogs(monthQuery, scope === 'mine');
  const clinicMonth = useClinicAccessLogs(
    monthQuery,
    scope === 'clinic' && isClinicAdmin,
  );
  const mineFailed = useMyAccessLogs(failedQuery, scope === 'mine');
  const clinicFailed = useClinicAccessLogs(
    failedQuery,
    scope === 'clinic' && isClinicAdmin,
  );

  const monthSummary = scope === 'clinic' ? clinicMonth : mineMonth;
  const failedSummary = scope === 'clinic' ? clinicFailed : mineFailed;
  const lastEvent = monthSummary.data?.data[0] ?? null;

  /**
   * `null` mientras no haya respuesta, para que ninguna frase de la franja
   * afirme el vacío antes de tiempo: "ninguno en agosto" es un hecho de
   * seguridad, y durante el primer segundo de carga no lo sabemos.
   */
  const failedTotal = failedSummary.data?.meta.total ?? null;

  const inputClass =
    'min-h-11 px-3 py-2 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-sm text-kanji dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50';

  const monthLabel = format(new Date(), 'MMMM', { locale: es });

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-kio/10 dark:bg-kio/20 rounded-xl">
              {/* kanji-deep, no kio: el lavanda como tinta sobre lino mide
                  2.2:1 y este icono es la marca de la página. */}
              <ShieldCheck
                className="w-6 h-6 text-kanji-deep dark:text-kio"
                aria-hidden="true"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-kanji dark:text-white">
                Registro de accesos
              </h1>
              <p className="text-text/60 dark:text-slate-400 text-sm mt-0.5">
                Quién accedió a qué expediente y cuándo
              </p>
            </div>
          </div>

          {/* Scope toggle — solo admins de clínica */}
          {isClinicAdmin && (
            <div className="flex rounded-xl border border-cruz dark:border-slate-700 overflow-hidden">
              <button
                type="button"
                onClick={() => { setScope('mine'); setPage(1); }}
                aria-pressed={scope === 'mine'}
                className={`flex min-h-11 items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                  scope === 'mine'
                    ? 'bg-kanji-deep text-white'
                    : 'bg-surface dark:bg-slate-900 text-text/60 dark:text-slate-400 hover:text-kanji dark:hover:text-white'
                }`}
              >
                <User size={14} aria-hidden="true" /> Mi consulta
              </button>
              <button
                type="button"
                onClick={() => { setScope('clinic'); setPage(1); }}
                aria-pressed={scope === 'clinic'}
                className={`flex min-h-11 items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-colors duration-150 ${
                  scope === 'clinic'
                    ? 'bg-kanji-deep text-white'
                    : 'bg-surface dark:bg-slate-900 text-text/60 dark:text-slate-400 hover:text-kanji dark:hover:text-white'
                }`}
              >
                <Building2 size={14} aria-hidden="true" /> Toda la clínica
              </button>
            </div>
          )}
        </div>

        {/* Divulgación recíproca del alcance */}
        <p className="mb-4 text-xs text-text/50 dark:text-slate-500 bg-bg/60 dark:bg-slate-800/60 border border-cruz dark:border-slate-800 rounded-xl px-4 py-2.5">
          {scope === 'clinic' ? (
            <>
              Como administrador ves los accesos a expedientes de pacientes de
              toda la clínica y los eventos de inicio de sesión de los miembros.
              Los miembros pueden ver este mismo registro para sus pacientes.
            </>
          ) : (
            <>
              Aquí queda registrado cada acceso a los expedientes de tus
              pacientes, venga de quien venga, junto con tus propios eventos de
              inicio de sesión. Nadie consulta un expediente sin dejar rastro.
            </>
          )}
        </p>

        {/* Resumen del mes */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <SummaryTile
            label={`Eventos en ${monthLabel}`}
            isLoading={monthSummary.isLoading}
            isError={monthSummary.isError}
            value={
              monthSummary.data
                ? monthSummary.data.meta.total.toLocaleString('es-MX')
                : null
            }
            hint={
              scope === 'clinic'
                ? 'Accesos y eventos de toda la clínica'
                : 'Accesos a tus expedientes y tus eventos'
            }
            icon={Activity}
          />
          <SummaryTile
            label={`Inicios de sesión fallidos en ${monthLabel}`}
            isLoading={failedSummary.isLoading}
            isError={failedSummary.isError}
            value={failedTotal === null ? null : failedTotal.toLocaleString('es-MX')}
            hint={
              failedTotal === null
                ? null
                : failedTotal > 0
                  ? 'Revisa si alguno no fue tuyo'
                  : `Ninguno en ${monthLabel}`
            }
            icon={ShieldAlert}
            alert={failedTotal !== null && failedTotal > 0}
          />
          {/* La etiqueta dice "en {mes}" porque la consulta va acotada a
              `from: monthStart`: "último evento registrado" a secas se leería
              como "nunca se registró nada" habiendo eventos del mes anterior. */}
          <SummaryTile
            label={`Último evento en ${monthLabel}`}
            isLoading={monthSummary.isLoading}
            isError={monthSummary.isError}
            value={
              monthSummary.data
                ? lastEvent
                  ? format(parseISO(lastEvent.createdAt), "d 'de' MMM, HH:mm", {
                      locale: es,
                    })
                  : 'Sin eventos'
                : null
            }
            hint={
              monthSummary.data
                ? (lastEvent?.user?.email ?? `Nada registrado en ${monthLabel}`)
                : null
            }
            icon={UserCog}
          />
        </div>

        {/* Filtros */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            aria-label="Filtrar por tipo de acción"
            className={inputClass + ' cursor-pointer'}
          >
            <option value="">Todas las acciones</option>
            {ACTION_GROUPS.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.actions.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <input
            type="date"
            value={from}
            onChange={(e) => { setFrom(e.target.value); setPage(1); }}
            className={inputClass}
            aria-label="Desde"
          />
          <span className="text-xs text-text/40 dark:text-slate-500" aria-hidden="true">→</span>
          <input
            type="date"
            value={to}
            onChange={(e) => { setTo(e.target.value); setPage(1); }}
            className={inputClass}
            aria-label="Hasta"
          />
          {(actionFilter || from || to) && (
            <button
              type="button"
              onClick={() => { setActionFilter(''); setFrom(''); setTo(''); setPage(1); }}
              className="min-h-11 px-2 text-sm font-semibold text-kanji-deep dark:text-kio hover:text-kanji transition-colors duration-150"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {/* Tabla */}
        <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden">
          {/* El error se comprueba antes que el vacío: "sin registros" ante un
              fallo afirma que nadie tocó el expediente, y aquí eso es
              exactamente lo contrario de lo que la pantalla existe para probar. */}
          {active.isError ? (
            <div className="p-4">
              <WidgetError
                what="el registro de accesos"
                onRetry={() => void active.refetch()}
              />
            </div>
          ) : active.isLoading ? (
            <div role="status" className="flex items-center justify-center h-48">
              <Loader2
                className="w-6 h-6 animate-spin text-kanji-deep dark:text-kio"
                aria-hidden="true"
              />
              <span className="sr-only">Cargando el registro de accesos…</span>
            </div>
          ) : logs.length === 0 ? (
            <p className="text-sm text-text/50 dark:text-slate-500 py-12 text-center">
              Sin registros para los filtros seleccionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-bg/50 dark:bg-slate-800/50 text-left">
                    <th className="px-4 py-3 text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider">Fecha</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider">Usuario</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider">Acción</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider">Paciente</th>
                    <th className="px-4 py-3 text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider">IP de origen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cruz dark:divide-slate-800">
                  {logs.map((log) => {
                    const action = ACTION_META[log.action];
                    const weight = action?.weight ?? 'routine';
                    const ActionIcon = action?.icon ?? Activity;
                    return (
                      <tr
                        key={log.id}
                        className="hover:bg-bg/40 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-2.5 whitespace-nowrap text-text/70 dark:text-slate-400">
                          {format(parseISO(log.createdAt), 'dd/MM/yyyy HH:mm')}
                        </td>
                        <td className="px-4 py-2.5 font-medium text-kanji dark:text-white">
                          {log.user?.email ?? (
                            <span className="italic text-text/40 dark:text-slate-500">
                              desconocido
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2.5">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${WEIGHT_CHIP[weight]}`}
                          >
                            <ActionIcon size={13} aria-hidden="true" />
                            {action?.label ?? log.action}
                          </span>
                        </td>
                        <td
                          className={`px-4 py-2.5 ${
                            log.patient
                              ? 'font-medium text-kanji dark:text-white'
                              : 'text-text/40 dark:text-slate-500'
                          }`}
                        >
                          {log.patient?.fullName ?? '—'}
                        </td>
                        <td className="px-4 py-2.5 text-xs text-text/50 dark:text-slate-500 whitespace-nowrap">
                          {log.ipAddress ?? '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Paginación */}
          {!active.isError && meta && meta.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-cruz dark:border-slate-800">
              <p className="text-xs text-text/50 dark:text-slate-500">
                {meta.total} registros · página {meta.page} de {meta.totalPages}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  aria-label="Página anterior"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-bg dark:hover:bg-slate-800 text-text/60 dark:text-slate-400 disabled:opacity-40 transition-colors duration-150"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  aria-label="Página siguiente"
                  className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg hover:bg-bg dark:hover:bg-slate-800 text-text/60 dark:text-slate-400 disabled:opacity-40 transition-colors duration-150"
                >
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

interface SummaryTileProps {
  label: string;
  /** `null` mientras no haya dato: la franja nunca inventa un cero. */
  value: string | null;
  /**
   * `null` cuando la frase depende de un dato que aún no llegó. Un hint que
   * describe el tile ("Accesos a tus expedientes") puede pintarse siempre; uno
   * que afirma el resultado ("Ninguno en agosto") solo con `data` en mano.
   */
  hint: string | null;
  icon: typeof User;
  isLoading: boolean;
  isError: boolean;
  alert?: boolean;
}

/**
 * Una cifra del mes. Ante un fallo dice "no disponible", nunca "0": afirmar
 * cero accesos fallidos cuando la petición se cayó es la misma mentira que un
 * empty state pintado sobre un error. Y mientras carga no dice nada sobre el
 * resultado — ni en la cifra ni en el pie: el pie se renderizaba siempre y
 * declaraba el vacío durante el primer segundo de cada visita.
 */
function SummaryTile({
  label,
  value,
  hint,
  icon: Icon,
  isLoading,
  isError,
  alert = false,
}: SummaryTileProps) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        alert
          ? 'border-rose-200 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/10'
          : 'border-cruz bg-surface dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      {/* Dos líneas de alto fijo: las etiquetas cualificadas por mes wrapean a
          distinta altura y, sin esto, las tres cifras de la franja quedaban a
          alturas distintas. */}
      <div className="flex min-h-8 items-center gap-2">
        <Icon
          size={15}
          aria-hidden="true"
          className={`shrink-0 ${alert ? 'text-rose-600 dark:text-rose-400' : 'text-text/40 dark:text-slate-500'}`}
        />
        <p className="text-[11px] font-bold uppercase tracking-wider text-text/50 dark:text-slate-500">
          {label}
        </p>
      </div>

      {isError ? (
        <p className="mt-2 text-sm font-bold text-amber-700 dark:text-amber-300">
          No disponible
        </p>
      ) : isLoading || value === null ? (
        <div className="mt-2 h-7 w-20 rounded-md bg-cruz/40 dark:bg-slate-800" />
      ) : (
        <p
          className={`mt-1 text-2xl font-bold ${
            alert ? 'text-rose-700 dark:text-rose-300' : 'text-kanji dark:text-white'
          }`}
        >
          {value}
        </p>
      )}

      {isError ? (
        <p className="mt-1 text-xs text-text/50 dark:text-slate-500 truncate">
          Vuelve a cargar la página para reintentarlo.
        </p>
      ) : hint === null ? (
        // Misma altura que la línea de texto, para que la franja no salte
        // cuando llega el dato.
        <div className="mt-1 flex h-4 items-center" aria-hidden="true">
          <div className="h-2.5 w-28 rounded-full bg-cruz/40 dark:bg-slate-800" />
        </div>
      ) : (
        <p className="mt-1 text-xs text-text/50 dark:text-slate-500 truncate">
          {hint}
        </p>
      )}
    </div>
  );
}
