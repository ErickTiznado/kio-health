import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import type { Patient } from '../../types/patients.types';
import { MoreVertical, Edit, FileText, Archive, RotateCcw, UserPlus, SearchX } from 'lucide-react';
import { RiskFlagBadge } from '../patient/RiskFlagBadge';
import { WidgetError } from '../widgets/WidgetError';

interface PatientsTableProps {
  patients: Patient[];
  isLoading: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /** True cuando hay búsqueda o filtro activo: cambia el empty state. */
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onCreate?: () => void;
  onEdit: (patient: Patient) => void;
  onArchive: (patient: Patient) => void;
  onUnarchive: (patient: Patient) => void;
  onView: (patient: Patient) => void;
}

/**
 * Una sola plantilla de rejilla para el encabezado y para cada fila. Antes el
 * encabezado usaba `px-6` y las filas `p-4`, así que las columnas nunca
 * llegaban a alinearse.
 *
 * NO HAY COLUMNA DE "PRÓXIMA CITA" — y su ausencia es deliberada. `GET
 * /patients` (`PatientsService.findAll`, en sus dos caminos: el normal y
 * `findAllByBalanceDesc`) hace `include: { riskFlag: true }` y nunca incluye
 * `appointments`, así que `patient.appointments` llega SIEMPRE `undefined`.
 * Mientras existió, la columna pintaba «Sin agendar» —y el plegado móvil «Sin
 * cita agendada»— en el 100% de las filas: un psicólogo abría Pacientes y leía
 * que ninguno de sus pacientes tenía cita. Es el Don't literal de DESIGN.md,
 * «no afirmar un hecho clínico que la interfaz no puede sostener». Para
 * devolverla hace falta que el endpoint de listado traiga la cita SIGUIENTE
 * (`where: { status: 'SCHEDULED', startTime: { gte: ahora } }`,
 * `orderBy: { startTime: 'asc' }`, `take: 1`) — y no el `include` de
 * `findOne`, que ordena `startTime: 'desc'` y da la cita más RECIENTE.
 */
const ROW_GRID =
  'grid grid-cols-[minmax(0,1fr)_44px] sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_44px] items-center gap-x-4 px-4 sm:px-5';

const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const currency = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

const STATUS_LABEL: Record<string, string> = { ACTIVE: 'Activo', ARCHIVED: 'Archivado' };

const MENU_WIDTH = 208;
// 3 ítems de 44px + separador + padding vertical del panel.
const MENU_HEIGHT = 160;

const STATUS_STYLE: Record<string, string> = {
  ACTIVE:
    'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
  ARCHIVED:
    'bg-secondary text-text-secondary ring-1 ring-border dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
};

const BALANCE_STYLE =
  'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25';

// ── Menú de acciones ────────────────────────────────────────────────────────
// Se renderiza por portal (DESIGN.md → Dropdowns): el contenedor de la lista
// tiene `overflow-y-auto` y recortaba el menú de las últimas filas.
function ActionMenu({
  patient,
  onEdit,
  onArchive,
  onUnarchive,
  onView,
}: {
  patient: Patient;
  onEdit: (p: Patient) => void;
  onArchive: (p: Patient) => void;
  onUnarchive: (p: Patient) => void;
  onView: (p: Patient) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // La posición se calcula al abrir, no en un efecto: el menú vive en un portal
  // y su ancla es la fila, que puede estar en cualquier punto del scroll. Si no
  // cabe por debajo, se abre hacia arriba — las últimas filas de la lista son
  // justo donde el menú se salía de la ventana.
  const toggle = useCallback(() => {
    setIsOpen((open) => {
      if (open) return false;
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) {
        const fitsBelow = rect.bottom + 8 + MENU_HEIGHT <= window.innerHeight - 8;
        setCoords({
          top: fitsBelow
            ? rect.bottom + 8
            : Math.max(8, rect.top - 8 - MENU_HEIGHT),
          left: Math.max(8, Math.min(rect.right - MENU_WIDTH, window.innerWidth - MENU_WIDTH - 8)),
        });
      }
      return true;
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const close = () => setIsOpen(false);
    const onPointerDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (!menuRef.current?.contains(t) && !triggerRef.current?.contains(t)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [isOpen]);

  const item =
    'w-full text-left px-4 py-2.5 min-h-11 text-sm font-medium flex items-center gap-3 transition-colors duration-150';

  const run = (fn: (p: Patient) => void) => () => {
    setIsOpen(false);
    fn(patient);
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label={`Acciones de ${patient.fullName}`}
        onClick={toggle}
        className="relative z-10 grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-kanji dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-kio"
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={`Acciones de ${patient.fullName}`}
            style={{ top: coords.top, left: coords.left, width: MENU_WIDTH }}
            className="fixed z-50 overflow-hidden rounded-2xl border border-border bg-white py-2 shadow-xl shadow-black/10 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40"
          >
            <button
              role="menuitem"
              onClick={run(onView)}
              className={`${item} text-text hover:bg-secondary dark:text-slate-200 dark:hover:bg-slate-800`}
            >
              <FileText size={16} aria-hidden="true" className="text-slate-600 dark:text-slate-400" />
              Ver expediente
            </button>
            <button
              role="menuitem"
              onClick={run(onEdit)}
              className={`${item} text-text hover:bg-secondary dark:text-slate-200 dark:hover:bg-slate-800`}
            >
              <Edit size={16} aria-hidden="true" className="text-slate-600 dark:text-slate-400" />
              Editar perfil clínico
            </button>
            <div className="mx-4 my-1 h-px bg-border dark:bg-slate-800" role="separator" />
            {patient.status === 'ARCHIVED' ? (
              <button
                role="menuitem"
                onClick={run(onUnarchive)}
                className={`${item} text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20`}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Reactivar
              </button>
            ) : (
              <button
                role="menuitem"
                onClick={run(onArchive)}
                className={`${item} text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-900/20`}
              >
                <Archive size={16} aria-hidden="true" />
                Archivar
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

// ── Estados ─────────────────────────────────────────────────────────────────
function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {children}
    </div>
  );
}

function ColumnHeader() {
  return (
    <div
      className={`${ROW_GRID} border-b border-border bg-secondary/60 py-2.5 text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400`}
    >
      <div>Paciente</div>
      <div className="hidden sm:block">Estado</div>
      <div>
        <span className="sr-only">Acciones</span>
      </div>
    </div>
  );
}

function EmptyState({
  isFiltered,
  onClearFilters,
  onCreate,
}: {
  isFiltered?: boolean;
  onClearFilters?: () => void;
  onCreate?: () => void;
}) {
  const Icon = isFiltered ? SearchX : UserPlus;
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-secondary text-kanji dark:bg-slate-800 dark:text-kio">
        <Icon size={24} aria-hidden="true" />
      </span>
      <h3 className="text-base font-bold text-text dark:text-white">
        {isFiltered ? 'Ningún paciente coincide' : 'Aún no hay pacientes'}
      </h3>
      <p className="mt-1.5 max-w-sm text-sm font-medium text-slate-600 dark:text-slate-400">
        {isFiltered
          ? 'Prueba con otro nombre o quita los filtros para ver la lista completa.'
          : 'Crea el primer expediente para empezar a agendar sesiones y registrar notas.'}
      </p>
      {isFiltered
        ? onClearFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-5 text-sm font-bold text-text transition-colors duration-150 hover:border-kanji/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-kio/40"
            >
              Quitar filtros
            </button>
          )
        : onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-kanji-deep px-5 text-sm font-bold text-white shadow-sm shadow-kio/20 transition-colors duration-150 hover:bg-kanji hover:shadow-md hover:shadow-kio/20 dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
            >
              <UserPlus size={16} aria-hidden="true" />
              Nuevo paciente
            </button>
          )}
    </div>
  );
}

function LoadingRows() {
  return (
    <div aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando pacientes…</span>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className={`${ROW_GRID} border-b border-border py-4 last:border-b-0 dark:border-slate-800`}>
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-cruz/40 dark:bg-slate-800" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3.5 w-40 max-w-full animate-pulse rounded-xs bg-cruz/40 dark:bg-slate-800" />
              <div className="h-3 w-24 max-w-full animate-pulse rounded-xs bg-cruz/30 dark:bg-slate-800/70" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="h-5 w-20 animate-pulse rounded-full bg-cruz/40 dark:bg-slate-800" />
          </div>
          <div />
        </div>
      ))}
    </div>
  );
}

// ── Fila ────────────────────────────────────────────────────────────────────
function PatientRow({
  patient,
  onEdit,
  onArchive,
  onUnarchive,
  onView,
}: {
  patient: Patient;
  onEdit: (p: Patient) => void;
  onArchive: (p: Patient) => void;
  onUnarchive: (p: Patient) => void;
  onView: (p: Patient) => void;
}) {
  const flags = patient.riskFlag?.flagTypes ?? [];
  const balance = patient.pendingBalance ?? 0;

  return (
    <li
      className={`${ROW_GRID} group relative border-b border-border py-3 transition-colors duration-150 last:border-b-0 hover:bg-secondary/50 focus-within:bg-secondary/50 dark:border-slate-800 dark:hover:bg-slate-800/40 dark:focus-within:bg-slate-800/40`}
    >
      {/* Paciente */}
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-kio to-kanji text-sm font-bold text-white ring-2 ring-white dark:ring-slate-900"
        >
          {getInitials(patient.fullName)}
        </span>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
            {/* Enlace estirado: toda la fila navega, pero sigue siendo un enlace
                real — enfocable, con menú contextual y "abrir en pestaña nueva". */}
            <Link
              to={`/patients/${patient.id}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                e.preventDefault();
                onView(patient);
              }}
              className="truncate text-sm font-bold text-text after:absolute after:inset-0 after:content-[''] dark:text-white"
            >
              {patient.fullName}
            </Link>
            {flags.length > 0 && <RiskFlagBadge flags={flags} size="sm" />}
          </div>
          <p className="mt-0.5 truncate text-xs font-medium text-slate-600 dark:text-slate-400">
            {patient.contactPhone || 'Sin teléfono registrado'}
          </p>
          {/* Bajo sm la columna de estado se pliega aquí en vez de desaparecer.
              El saldo pendiente venía quedándose fuera: en móvil el dato de
              deuda simplemente no existía. Sólo se pliega lo que el endpoint
              devuelve de verdad — ver el comentario de ROW_GRID. */}
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium sm:hidden">
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_STYLE[patient.status]}`}>
              {STATUS_LABEL[patient.status] ?? patient.status}
            </span>
            {balance > 0 && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${BALANCE_STYLE}`}>
                Debe {currency.format(balance)}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Estado */}
      <div className="hidden flex-wrap items-center gap-1.5 sm:flex">
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${STATUS_STYLE[patient.status]}`}
        >
          {STATUS_LABEL[patient.status] ?? patient.status}
        </span>
        {balance > 0 && (
          <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ${BALANCE_STYLE}`}>
            Debe {currency.format(balance)}
          </span>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end">
        <ActionMenu
          patient={patient}
          onEdit={onEdit}
          onArchive={onArchive}
          onUnarchive={onUnarchive}
          onView={onView}
        />
      </div>
    </li>
  );
}

// ── Export ──────────────────────────────────────────────────────────────────
export function PatientsTable({
  patients,
  isLoading,
  isError,
  onRetry,
  isFiltered,
  onClearFilters,
  onCreate,
  onEdit,
  onArchive,
  onUnarchive,
  onView,
}: PatientsTableProps) {
  // El error se comprueba ANTES que el vacío: decir "no hay pacientes" cuando
  // la petición falló es afirmar algo falso sobre un expediente clínico.
  if (isError) {
    return <WidgetError what="la lista de pacientes" onRetry={onRetry} />;
  }

  if (isLoading) {
    return (
      <TableShell>
        <ColumnHeader />
        <LoadingRows />
      </TableShell>
    );
  }

  if (patients.length === 0) {
    return (
      <TableShell>
        <EmptyState isFiltered={isFiltered} onClearFilters={onClearFilters} onCreate={onCreate} />
      </TableShell>
    );
  }

  return (
    <TableShell>
      <ColumnHeader />
      <ul>
        {patients.map((patient) => (
          <PatientRow
            key={patient.id}
            patient={patient}
            onEdit={onEdit}
            onArchive={onArchive}
            onUnarchive={onUnarchive}
            onView={onView}
          />
        ))}
      </ul>
    </TableShell>
  );
}
