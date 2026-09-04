import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  usePatients,
  useCreatePatient,
  useArchivePatient,
  useUnarchivePatient,
} from '../hooks/use-patients';
import { useDebounce } from '../hooks/use-debounce';
import { PatientsTable } from '../components/patients/PatientsTable';
import { PatientModal } from '../components/patients/PatientModal';
import type { Patient, PatientsSort } from '../types/patients.types';
import type { PatientFormValues } from '../schemas/patients.schema';
import { ChevronLeft, ChevronRight, Plus, Search, X } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { confirmAction } from '../lib/confirm-action';

type TabId = 'ALL' | 'ACTIVE' | 'RISK' | 'BALANCE' | 'ARCHIVED';

const TABS: { id: TabId; label: string }[] = [
  { id: 'ALL', label: 'Todos' },
  { id: 'ACTIVE', label: 'Activos' },
  { id: 'RISK', label: 'Con riesgo' },
  // `pendingBalance` es el único campo consultable que no está cifrado y el
  // único filtro legítimamente financiero de esta vista. Hasta ahora vivía sólo
  // como un badge en la fila, sin orden ni filtro.
  { id: 'BALANCE', label: 'Con saldo' },
  { id: 'ARCHIVED', label: 'Archivados' },
];

/**
 * Consulta que corresponde a cada pestaña. Los cuatro filtros son AND en el
 * servidor y `meta.total` ya viene filtrado, así que aquí no queda nada que
 * recortar en cliente.
 *
 * DEFINICIÓN DE "CON RIESGO" — decisión, no descuido: la pestaña **no** envía
 * `status`, de modo que el backend aplica su defecto (`status != ARCHIVED`) y
 * coincide exactamente con `getActiveRiskFlagsCount()`, que es lo que cuenta el
 * badge del dashboard. Antes esta pestaña pedía `status=ACTIVE`: con el filtro
 * en cliente la diferencia era invisible, pero con el filtro en servidor el
 * badge del dashboard y las filas de esta lista habrían discrepado en cuanto un
 * paciente con bandera activa dejara de estar en `ACTIVE`. Una sola definición:
 * **paciente no archivado con bandera activa**. La misma regla se aplica a "Con
 * saldo", que tampoco envía `status`.
 */
const TAB_QUERY: Record<
  TabId,
  {
    status?: 'ACTIVE' | 'ARCHIVED';
    riskFlag?: boolean;
    hasBalance?: boolean;
    sort?: PatientsSort;
  }
> = {
  ALL: {},
  ACTIVE: { status: 'ACTIVE' },
  RISK: { riskFlag: true },
  // `sort: 'balance'` sólo es válido junto a `hasBalance: true`; el backend
  // responde 400 en cualquier otra combinación en vez de prometer un orden que
  // no puede dar.
  BALANCE: { hasBalance: true, sort: 'balance' },
  ARCHIVED: { status: 'ARCHIVED' },
};

/**
 * Tamaño de página normal. Antes esta vista pedía 500 registros para poder
 * filtrar en cliente; cada uno se descifra en servidor, así que era trabajo
 * criptográfico proporcional a la cartera entera en cada pulsación de pestaña.
 */
const PAGE_SIZE = 25;

/**
 * El patrón de pestañas se declara completo o no se declara. Antes había
 * `role="tablist"` y `role="tab"` sin `aria-controls`, sin `role="tabpanel"` y
 * sin navegación por flechas: un lector de pantalla anunciaba «pestaña 3 de 5»,
 * el usuario pulsaba flecha derecha y no ocurría nada, y al activar una pestaña
 * no había panel que anunciar. Un widget que dice ser tabs y no se comporta
 * como tabs es peor para tecnología asistiva que cinco botones sin rol.
 */
const TABPANEL_ID = 'patients-tabpanel';
const tabId = (id: TabId) => `patients-tab-${id}`;

export default function PatientsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');

  const initialTab: TabId = searchParams.get('flags') === 'true' ? 'RISK' : 'ALL';
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Tabulador roving: sólo la pestaña activa está en la secuencia de tabulación
  // (antes las cinco eran cinco paradas). Dentro del grupo se navega con
  // flechas, y por eso hace falta poder mover el foco a mano.
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /**
   * Activación MANUAL, no automática: las flechas mueven el foco y la
   * activación la hace Enter o Espacio, que el `<button>` nativo ya resuelve.
   * Es lo que recomienda la APG cuando cambiar de pestaña cuesta una petición
   * al servidor — con activación automática, recorrer las cinco pestañas con
   * la flecha lanzaría cinco consultas.
   */
  const handleTabKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = TABS.length - 1;
    let target: number | null = null;
    if (event.key === 'ArrowRight') target = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft') target = index === 0 ? last : index - 1;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = last;
    if (target === null) return;
    event.preventDefault();
    tabRefs.current[target]?.focus();
  };

  useEffect(() => {
    // Forma funcional: sólo tocamos `flags` y preservamos cualquier otro query
    // param presente en la URL (antes `setSearchParams({})` los borraba todos).
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (activeTab === 'RISK') {
          next.set('flags', 'true');
        } else {
          next.delete('flags');
        }
        return next;
      },
      { replace: true },
    );
  }, [activeTab, setSearchParams]);

  const debouncedSearch = useDebounce(search, 500);

  const [page, setPage] = useState(1);

  // Cambiar de pestaña o de búsqueda cambia el conjunto entero: quedarse en la
  // página 4 de la consulta anterior enseñaría una página vacía y la leeríamos
  // como "no hay pacientes".
  //
  // El ajuste ocurre DURANTE el render —el patrón que React documenta para
  // «resetear estado cuando cambia una clave»— y no en un `useEffect`: desde el
  // efecto, React alcanza a confirmar un render con la página vieja y la
  // consulta nueva, y `react-hooks/set-state-in-effect` lo marca como error de
  // lint. Aquí el render se descarta antes de confirmarse.
  const querySignature = JSON.stringify([activeTab, debouncedSearch]);
  const [seenSignature, setSeenSignature] = useState(querySignature);
  const isResettingPage = seenSignature !== querySignature;
  if (isResettingPage) {
    setSeenSignature(querySignature);
    setPage(1);
  }

  const { status, riskFlag, hasBalance, sort } = TAB_QUERY[activeTab];

  const { data, error, isFetching, isPlaceholderData, refetch } = usePatients(
    page,
    debouncedSearch,
    status,
    PAGE_SIZE,
    { riskFlag, hasBalance, sort },
  );

  // `usePatients` usa `placeholderData: previousData`, así que al cambiar de
  // búsqueda o de pestaña `isLoading` es false y `data` sigue siendo el
  // resultado ANTERIOR. Sin esto la lista mostraba el vacío de la consulta
  // previa —y, si la petición fallaba, lo seguía mostrando— en vez de decir que
  // estaba cargando o que había fallado.
  const isError = error != null;
  const isLoading = !isError && (isPlaceholderData || (isFetching && !data));

  const [isModalOpen, setIsModalOpen] = useState(false);

  const createPatientMutation = useCreatePatient();
  const archivePatientMutation = useArchivePatient();
  const unarchivePatientMutation = useUnarchivePatient();

  const handleCreate = (values: PatientFormValues) => {
    createPatientMutation.mutate(values, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const handleArchive = async (patient: Patient) => {
    const confirmed = await confirmAction({
      title: '¿Archivar paciente?',
      description: 'El paciente será movido a la lista de archivados. Podrás restaurarlo después.',
      confirmLabel: 'Sí, archivar',
      cancelLabel: 'Cancelar',
      variant: 'warning',
    });
    if (confirmed) {
      archivePatientMutation.mutate(patient.id);
    }
  };

  const handleUnarchive = async (patient: Patient) => {
    const confirmed = await confirmAction({
      title: '¿Activar paciente?',
      description: 'El paciente volverá a la lista de pacientes activos.',
      confirmLabel: 'Sí, activar',
      cancelLabel: 'Cancelar',
      variant: 'default',
    });
    if (confirmed) {
      unarchivePatientMutation.mutate(patient.id);
    }
  };

  const openCreateModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  // Un expediente existente se edita en "Perfil clínico", sección a sección: el
  // asistente de alta de 3 pasos ya no se reutiliza en modo edición. Eran dos
  // modelos incompatibles escribiendo los mismos campos con esquemas distintos.
  const openProfileEditor = (patient: Patient) =>
    navigate(`/patients/${patient.id}?tab=profile&focus=personal`);

  // El servidor ya devuelve exactamente las filas de la consulta: no queda
  // filtrado en cliente, y por tanto tampoco el aviso de "revisado sólo sobre
  // los primeros N". Ese aviso hoy sería falso, y decir "entre los primeros
  // 500" cuando ya no es cierto es la misma clase de afirmación insostenible
  // que venía a corregir.
  const visiblePatients = data?.data ?? [];

  const isFiltered = debouncedSearch.trim() !== '' || activeTab !== 'ALL';

  const clearFilters = () => {
    setSearch('');
    setActiveTab('ALL');
  };

  // `meta.total` es el total YA FILTRADO en servidor, no el de esta página: es
  // el único número que la cabecera puede afirmar. Antes se pintaba
  // `visiblePatients.length`, que era el recuento de lo que había cabido.
  const totalCount = data?.meta.total ?? 0;
  const lastPage = Math.max(1, data?.meta.lastPage ?? 1);
  const pageStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(page * PAGE_SIZE, totalCount);

  // Archivar al último paciente de la página final deja el cursor fuera del
  // conjunto. Sin este ajuste la vista pintaría "ningún paciente coincide"
  // sobre una lista que sí tiene pacientes, sólo que en páginas anteriores.
  //
  // Se ajusta en render por el mismo motivo que la reinicialización de arriba,
  // y se salta mientras esa reinicialización está en curso: en ese render
  // `lastPage` todavía describe el conjunto ANTERIOR, así que recortar contra
  // él movería el cursor a una página de una consulta que ya no es la vigente.
  if (!isResettingPage && !isError && !isLoading && page > lastPage) {
    setPage(lastPage);
  }

  // El subtítulo no afirma un recuento cuando la petición falló ni mientras
  // carga: en una superficie clínica un número inventado es peor que ninguno.
  const countLabel = isError
    ? 'No se pudo cargar la lista'
    : isLoading
      ? 'Cargando expedientes…'
      : totalCount === 1
        ? '1 expediente'
        : `${totalCount} expedientes`;

  // El orden por saldo lo resuelve el servidor sobre el conjunto completo, no
  // sobre la página, así que la vista puede afirmarlo entre páginas.
  const tabNote =
    !isError && !isLoading && activeTab === 'BALANCE' && totalCount > 0
      ? 'Ordenados de mayor saldo pendiente a menor.'
      : null;

  return (
    <DashboardLayout>
      <div className="-m-4 flex h-[calc(100vh-64px)] flex-col sm:-m-6">
        {/* Encabezado fijo */}
        <div className="relative z-30 border-b border-border bg-surface dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-col gap-4 px-4 pb-3 pt-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:pb-4 sm:pt-5 md:px-8 md:pt-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-kanji-deep dark:text-kio">Pacientes</h1>
              {/* Este párrafo va sobre `bg-surface`, que en claro es el lino
                  (#f5f3ef). Ahí `text-text-secondary` (#64748b) mide 4.29:1 y
                  no llega a AA para texto normal; slate-600 (#475569) mide
                  6.84:1 y sí. El placeholder del buscador, dos bloques más
                  abajo, sí puede quedarse en `text-text-secondary`: no está
                  sobre el lino sino sobre el `bg-white` del input, donde el
                  mismo color mide 4.76:1 — y DESIGN.md especifica
                  `gray-400`/`slate-500` para placeholder, que es aún más bajo.
                  El criterio es el mismo; lo que cambia es el fondo. */}
              <p className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-400">{countLabel}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-72 sm:flex-none">
                <label htmlFor="patient-search" className="sr-only">
                  Buscar paciente por nombre
                </label>
                <Search
                  size={17}
                  aria-hidden="true"
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary dark:text-slate-400"
                />
                <input
                  id="patient-search"
                  type="search"
                  placeholder="Buscar por nombre…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-xl border border-border bg-white pl-10 pr-11 text-sm font-medium text-text placeholder:font-normal placeholder:text-text-secondary focus:border-kio focus:outline-none focus:ring-2 focus:ring-kio/50 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
                {search && (
                  /* 44px reales: era un objetivo de 32px. Ocupa exactamente el
                     `pr-11` del input, así que el texto nunca queda debajo. */
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    aria-label="Limpiar búsqueda"
                    className="absolute right-0 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-text dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-white"
                  >
                    <X size={15} aria-hidden="true" />
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={openCreateModal}
                data-tour="tour-new-patient-btn"
                className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-xl bg-kanji-deep px-5 text-sm font-bold text-white shadow-sm shadow-kio/20 transition-colors duration-150 hover:bg-kanji hover:shadow-md hover:shadow-kio/20 active:scale-95 dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
              >
                <Plus size={16} aria-hidden="true" />
                Nuevo
              </button>
            </div>
          </div>

          {/* Pestañas */}
          <div
            role="tablist"
            aria-label="Filtrar pacientes por estado"
            className="no-scrollbar flex w-full items-center gap-6 overflow-x-auto px-4 sm:px-6 md:px-8"
          >
            {TABS.map((tab, index) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  id={tabId(tab.id)}
                  aria-selected={isActive}
                  aria-controls={TABPANEL_ID}
                  tabIndex={isActive ? 0 : -1}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative min-h-11 whitespace-nowrap pb-3 pt-2 text-sm font-bold transition-colors duration-150 ${
                    isActive
                      ? 'text-kanji-deep dark:text-kio'
                      : 'text-slate-600 hover:text-kanji-deep dark:text-slate-400 dark:hover:text-kio'
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-[2px] w-full rounded-t-full bg-kanji-deep dark:bg-kio"
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Contenido — es el panel de la pestaña activa. No lleva `tabIndex`
            propio: contiene elementos enfocables (la lista y la paginación),
            así que añadir una parada de tabulación aquí sólo duplicaría el
            recorrido. */}
        <div
          id={TABPANEL_ID}
          role="tabpanel"
          aria-labelledby={tabId(activeTab)}
          className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5 md:px-8 md:py-6"
        >
          {tabNote && (
            <p className="mb-3 text-xs font-medium text-slate-600 dark:text-slate-400">{tabNote}</p>
          )}

          <PatientsTable
            patients={visiblePatients}
            isLoading={isLoading}
            isError={isError}
            onRetry={() => refetch()}
            isFiltered={isFiltered}
            onClearFilters={clearFilters}
            onCreate={openCreateModal}
            onEdit={openProfileEditor}
            onArchive={handleArchive}
            onUnarchive={handleUnarchive}
            onView={(patient) => navigate(`/patients/${patient.id}`)}
          />

          {/* Paginación explícita. Con página de 25 registros la cabecera dice
              cuántos expedientes hay en total, así que la lista tiene que decir
              cuáles de ellos está enseñando y dar forma de llegar al resto:
              enseñar 25 de 80 sin decirlo se lee como que hay 25. */}
          {!isError && !isLoading && lastPage > 1 && (
            <nav
              aria-label="Paginación de la lista de pacientes"
              className="mt-4 flex flex-wrap items-center justify-between gap-3"
            >
              <p aria-live="polite" className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
                Mostrando {pageStart}–{pageEnd} de {totalCount}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1 || isFetching}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text transition-colors duration-150 hover:border-kanji/40 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-kio/40"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  Anterior
                </button>
                <span className="text-xs font-bold tabular-nums text-slate-600 dark:text-slate-400">
                  {page} / {lastPage}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                  disabled={page >= lastPage || isFetching}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border border-border bg-white px-4 text-sm font-bold text-text transition-colors duration-150 hover:border-kanji/40 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-kio/40"
                >
                  Siguiente
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              </div>
            </nav>
          )}
        </div>

        <PatientModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onSubmit={handleCreate}
          isLoading={createPatientMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
