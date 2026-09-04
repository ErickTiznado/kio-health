import { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { usePatient, usePatientScales, type ScaleHistoryPoint } from '../hooks/use-patients';
import { addRecentPatientToStorage } from '../lib/recent-patients.storage';
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    FileClock,
    User,
    Edit,
    BarChart2,
    CalendarDays,
    Activity,
    FolderOpen,
    SearchX,
    ShieldCheck,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { TimelineContainer } from '../components/patient/timeline/TimelineContainer';
import { MoodChart } from '../components/patient/insights/MoodChart';
import { AttendanceStatsCards } from '../components/patient/AttendanceStatsCards';
import { DocumentUpload } from '../components/patients/DocumentUpload';
import { DocumentViewer } from '../components/patients/DocumentViewer';
import {
    PatientProfileEditor,
    type ProfileSectionId,
} from '../components/patients/PatientProfileEditor';
import { PatientBalancePill } from '../components/patients/PatientBalancePill';
import { PatientContinuityActions } from '../components/patients/PatientContinuityActions';
import { RiskFlagBanner } from '../components/patient/RiskFlagBanner';
import { WidgetError } from '../components/widgets/WidgetError';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import type { TimelineResponse, Patient } from '../types/patients.types';

const TABS = [
    { id: 'history', label: 'Historia clínica', icon: FileClock },
    { id: 'profile', label: 'Perfil clínico', icon: User },
    { id: 'stats', label: 'Estadísticas', icon: BarChart2 },
    { id: 'documents', label: 'Documentos', icon: FolderOpen },
];

const getInitials = (name: string) =>
    name.trim().split(/\s+/).map(n => n[0]).slice(0, 2).join('').toUpperCase();

export default function PatientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { data: patient, isLoading, isError, error, refetch } = usePatient(id || '');
    const activeTab = searchParams.get('tab') ?? 'history';
    // El lápiz de la cabecera abre la sección correspondiente de "Perfil
    // clínico" en edición. Se consume una vez y se limpia de la URL, para que
    // recargar o compartir el enlace no vuelva a abrir un formulario.
    const focusParam = searchParams.get('focus');
    const focusSection: ProfileSectionId | null =
        focusParam === 'personal' || focusParam === 'clinical' ? focusParam : null;
    const clearFocusParam = () =>
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.delete('focus');
                return next;
            },
            { replace: true },
        );
    // Forma funcional: `setSearchParams({ tab })` borraba cualquier otro query
    // param de la URL (el mismo fallo que ya se había corregido en el listado).
    const setActiveTab = (tab: string) =>
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                next.set('tab', tab);
                return next;
            },
            { replace: true },
        );
    useEffect(() => {
        if (patient?.id) {
            addRecentPatientToStorage(patient.id);
        }
    }, [patient?.id]);

    const scales = usePatientScales(id || '');

    const { data: timelineMeta } = useQuery({
        queryKey: ['patient-timeline-meta', patient?.id],
        queryFn: async () => {
            const { data } = await api.get<TimelineResponse>(`/patients/${patient!.id}/timeline`, {
                params: { page: 1, limit: 1 },
            });
            return data.meta;
        },
        enabled: !!patient?.id,
    });

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="-m-4 flex h-[calc(100vh-64px)] flex-col p-4 sm:-m-6 sm:p-6 md:p-8" aria-busy="true">
                    <span className="sr-only">Cargando expediente…</span>
                    <div className="mb-8 h-32 animate-pulse rounded-2xl bg-cruz/30 dark:bg-slate-800" />
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="h-96 animate-pulse rounded-2xl bg-cruz/30 lg:col-span-2 dark:bg-slate-800" />
                        <div className="hidden h-96 animate-pulse rounded-2xl bg-cruz/30 lg:block dark:bg-slate-800" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Un 404 y una caída de red no son el mismo hecho: uno dice "este
    // expediente no existe", el otro "no pudimos leerlo". Confundirlos hacía
    // que un fallo de red pareciera un paciente borrado.
    if (isError || !patient) {
        const status = (error as { response?: { status?: number } } | null)?.response?.status;
        const isNotFound = status === 404 || status === 403;

        return (
            <DashboardLayout>
                <div className="mx-auto flex h-full max-w-md flex-col items-center justify-center px-4 text-center">
                    {isNotFound ? (
                        <>
                            <span className="mb-4 grid h-14 w-14 place-items-center rounded-full bg-secondary text-text-secondary dark:bg-slate-800 dark:text-slate-400">
                                <SearchX size={24} aria-hidden="true" />
                            </span>
                            <h2 className="text-xl font-bold text-text dark:text-white">Expediente no disponible</h2>
                            <p className="mt-1.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                                No existe o no está en tu lista de pacientes.
                            </p>
                        </>
                    ) : (
                        <WidgetError what="este expediente" onRetry={() => refetch()} className="text-left" />
                    )}
                    <button
                        type="button"
                        onClick={() => navigate('/patients')}
                        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-5 text-sm font-bold text-text transition-colors duration-150 hover:border-kanji/40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-kio/40"
                    >
                        <ArrowLeft size={16} aria-hidden="true" />
                        Volver a pacientes
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const sinceDate = format(new Date(patient.createdAt), 'MMM yyyy', { locale: es });

    return (
        <DashboardLayout>
            <div className="-m-4 flex h-[calc(100vh-64px)] flex-col overflow-hidden bg-bg sm:-m-6 dark:bg-slate-950">
                <RiskFlagBanner patientId={patient.id} />

                {/* Encabezado fijo */}
                <div className="sticky top-0 z-30 border-b border-border bg-surface dark:border-slate-800 dark:bg-slate-900">
                    <div className="px-4 pb-2 pt-4 sm:px-6 sm:pt-5 md:px-8 md:pt-6">
                        {/* Volver + acciones */}
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => navigate('/patients')}
                                className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 text-sm font-bold text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-text dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                            >
                                <ArrowLeft size={18} aria-hidden="true" />
                                Volver
                            </button>

                            <div className="flex items-center gap-1">
                                {patient.contactPhone && (
                                    <>
                                        <a
                                            href={`https://wa.me/${patient.contactPhone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            aria-label={`Escribir a ${patient.fullName} por WhatsApp`}
                                            className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-400 dark:hover:bg-emerald-900/25 dark:hover:text-emerald-400"
                                        >
                                            <MessageCircle size={18} aria-hidden="true" />
                                        </a>
                                        <a
                                            href={`tel:${patient.contactPhone}`}
                                            aria-label={`Llamar a ${patient.fullName}`}
                                            className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-kanji-deep dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-kio"
                                        >
                                            <Phone size={18} aria-hidden="true" />
                                        </a>
                                        <span aria-hidden="true" className="mx-1 h-6 w-px bg-border dark:bg-slate-700" />
                                    </>
                                )}
                                {/* Antes este lápiz abría el asistente de ALTA de 3 pasos
                                    sobre un paciente que ya existe, con un esquema Zod
                                    distinto del que usa "Perfil clínico" y escribiendo los
                                    mismos campos. Ahora lleva a la única superficie de
                                    edición del módulo. */}
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearchParams(
                                            (prev) => {
                                                const next = new URLSearchParams(prev);
                                                next.set('tab', 'profile');
                                                next.set('focus', 'personal');
                                                return next;
                                            },
                                            { replace: true },
                                        )
                                    }
                                    aria-label="Editar datos personales en el perfil clínico"
                                    className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-kanji-deep dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-kio"
                                >
                                    <Edit size={18} aria-hidden="true" />
                                </button>
                            </div>
                        </div>

                        {/* Identidad */}
                        <div className="mb-3 flex flex-wrap items-center gap-4 sm:gap-5">
                            <span
                                aria-hidden="true"
                                className="grid h-16 w-16 shrink-0 place-items-center rounded-full bg-gradient-to-br from-kio to-kanji text-xl font-bold text-white ring-2 ring-surface dark:ring-slate-900"
                            >
                                {getInitials(patient.fullName)}
                            </span>

                            {/* `basis-56` y no `flex-1` a secas: con `flex-basis: 0` este
                                bloque se comprime hasta cero antes de que la fila decida
                                envolver, y en móvil el nombre del paciente se estrujaba en
                                vez de que las acciones bajaran a su propia línea. */}
                            <div className="min-w-0 flex-1 basis-56">
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                    <h1 className="text-2xl font-bold tracking-tight text-text sm:text-3xl dark:text-white">
                                        {patient.fullName}
                                    </h1>
                                    <StatusBadge status={patient.status} />
                                    {/* El saldo pendiente vivía SOLO en Finanzas, y "Por
                                        cobrar" enlazaba aquí: se hacía clic en una deuda
                                        para aterrizar en la única pantalla que no sabía
                                        decirla. Ámbar porque es "pendiente", no peligro. */}
                                    <PatientBalancePill patientId={patient.id} patientName={patient.fullName} />
                                    {/* Principio 1 de PRODUCT.md: la confidencialidad se ve, no
                                        sólo se cumple. Abrir esta ficha ya escribió un
                                        VIEW_PROFILE en el registro de accesos y sus campos
                                        sensibles viajan cifrados; hasta ahora la cabecera no lo
                                        decía en ninguna parte. */}
                                    <Link
                                        to="/access-logs"
                                        className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-1 text-[11px] font-bold text-slate-600 underline-offset-4 transition-colors duration-150 hover:text-kanji-deep hover:underline dark:text-slate-400 dark:hover:text-kio"
                                    >
                                        <ShieldCheck size={15} aria-hidden="true" />
                                        Expediente cifrado · accesos registrados
                                    </Link>
                                </div>
                                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-slate-600 dark:text-slate-400">
                                    {patient.diagnosis && <span className="truncate">{patient.diagnosis}</span>}
                                    <span className="flex items-center gap-1.5 text-xs">
                                        <CalendarDays size={13} aria-hidden="true" />
                                        Desde {sinceDate}
                                    </span>
                                    {timelineMeta && timelineMeta.total > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs tabular-nums">
                                            <Activity size={13} aria-hidden="true" />
                                            {timelineMeta.total} {timelineMeta.total === 1 ? 'sesión' : 'sesiones'}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Continuidad: desde aquí se agenda la siguiente cita y se
                                entra a la sesión de hoy. Antes había que volver a la
                                agenda y buscar al mismo paciente otra vez. */}
                            <PatientContinuityActions patientId={patient.id} patientName={patient.fullName} />
                        </div>

                        {/* Pestañas */}
                        <div
                            role="tablist"
                            aria-label="Secciones del expediente"
                            className="no-scrollbar flex items-center gap-4 overflow-x-auto whitespace-nowrap sm:gap-6 md:gap-8"
                        >
                            {TABS.map((tab) => {
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        role="tab"
                                        aria-selected={isActive}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex min-h-11 items-center gap-2 pb-3 pt-2 text-sm font-bold transition-colors duration-150 ${
                                            isActive
                                                ? 'text-kanji-deep dark:text-kio'
                                                : 'text-slate-600 hover:text-kanji-deep dark:text-slate-400 dark:hover:text-kio'
                                        }`}
                                    >
                                        <tab.icon size={16} aria-hidden="true" />
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
                </div>

                {/* Contenido */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
                    {/* Sin `AnimatePresence`: se quedaba esperando una salida que nunca
                        resolvía y el panel anterior no se sustituía — la pestaña y la URL
                        cambiaban pero el contenido no. Un cross-fade entre pestañas de un
                        expediente no aporta nada que compense ese riesgo. */}
                    <div>
                            {activeTab === 'history' && (
                                <div className="mx-auto max-w-4xl">
                                    <TimelineContainer patientId={patient.id} />
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <PatientProfileEditor
                                    patient={patient}
                                    focusSection={focusSection}
                                    onFocusHandled={clearFocusParam}
                                />
                            )}

                            {activeTab === 'stats' && (
                                <div className="mx-auto max-w-5xl space-y-6">
                                    {/* Las tarjetas "Sesiones" e "Inicio" repetían literalmente
                                        los dos datos que ya están en el encabezado, dos veces en
                                        la misma pantalla. Aquí quedan sólo las que no están. */}
                                    <AttendanceStatsCards patientId={patient.id} />
                                    <MoodChart patientId={patient.id} />
                                    <ScalesHistoryChart
                                        data={scales.data ?? []}
                                        isLoading={scales.isLoading}
                                        isError={scales.isError}
                                        onRetry={() => scales.refetch()}
                                    />
                                </div>
                            )}

                            {activeTab === 'documents' && (
                                <div className="mx-auto max-w-3xl space-y-6">
                                    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <DocumentUpload patientId={patient.id} />
                                    </div>
                                    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                                        <DocumentViewer patientId={patient.id} />
                                    </div>
                                </div>
                            )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const RISK_LABELS: Record<string, string> = {
    MINIMAL: 'Mínimo',
    MILD: 'Leve',
    MODERATE: 'Moderado',
    MODERATELY_SEVERE: 'Mod. severo',
    SEVERE: 'Severo',
};

const SCALE_MAX: Record<string, number> = { PHQ9: 27, GAD7: 21 };

const CARD = 'rounded-2xl border border-border bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900';

function ScalesHistoryChart({
    data,
    isLoading,
    isError,
    onRetry,
}: {
    data: ScaleHistoryPoint[];
    isLoading?: boolean;
    isError?: boolean;
    onRetry?: () => void;
}) {
    // Igual que en el resto de superficies clínicas: el error va antes que el
    // vacío. "Sin escalas registradas" ante un 500 afirma algo que no sabemos.
    if (isError) {
        return <WidgetError what="el historial de escalas clínicas" onRetry={onRetry} />;
    }

    if (isLoading) {
        return (
            <div className={CARD} aria-busy="true">
                <div className="h-4 w-56 animate-pulse rounded-xs bg-cruz/40 dark:bg-slate-800" />
                <div className="mt-5 h-28 animate-pulse rounded-md bg-cruz/30 dark:bg-slate-800/70" />
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className={`${CARD} flex min-h-[200px] flex-col items-center justify-center text-center`}>
                <span className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-secondary text-kanji-deep dark:bg-slate-800 dark:text-kio">
                    <BarChart2 size={22} aria-hidden="true" />
                </span>
                <p className="text-sm font-bold text-text dark:text-slate-200">Sin escalas registradas</p>
                <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                    Los resultados de PHQ-9 y GAD-7 aparecerán aquí tras aplicarlos en sesión.
                </p>
            </div>
        );
    }

    const series = [
        { label: 'PHQ-9 — Depresión', key: 'PHQ9', color: '#5b46a8', points: data.filter(d => d.scaleType === 'PHQ9') },
        { label: 'GAD-7 — Ansiedad', key: 'GAD7', color: '#8a72d1', points: data.filter(d => d.scaleType === 'GAD7') },
    ];

    return (
        <div className={`${CARD} space-y-6`}>
            <h3 className="flex items-center gap-2 text-base font-bold text-text dark:text-white">
                <BarChart2 size={18} aria-hidden="true" className="text-kanji-deep dark:text-kio" />
                Evolución de escalas clínicas
            </h3>

            {series.map(({ label, key, color, points }) =>
                points.length > 0 ? (
                    <div key={key}>
                        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                            <p className="text-sm font-bold text-text dark:text-slate-200">{label}</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold tabular-nums text-kanji-deep dark:text-kio">
                                    {points[points.length - 1].totalScore}
                                </span>
                                <span className="text-xs font-medium tabular-nums text-slate-600 dark:text-slate-400">
                                    de {SCALE_MAX[key]}
                                </span>
                                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[11px] font-bold text-text dark:bg-slate-800 dark:text-slate-300">
                                    {RISK_LABELS[points[points.length - 1].riskLevel]}
                                </span>
                            </div>
                        </div>
                        {points.length >= 2 ? (
                            <ResponsiveContainer width="100%" height={130}>
                                <LineChart
                                    data={points.map(p => ({
                                        fecha: format(new Date(p.appointment.startTime), 'd MMM', { locale: es }),
                                        score: p.totalScore,
                                    }))}
                                    margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
                                >
                                    {/* La rejilla y el tooltip venían con los valores por defecto
                                        de Recharts: invisibles y en blanco puro en modo oscuro. */}
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                                    <XAxis
                                        dataKey="fecha"
                                        tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                                        stroke="var(--color-border)"
                                    />
                                    <YAxis
                                        domain={[0, SCALE_MAX[key]]}
                                        tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
                                        stroke="var(--color-border)"
                                        width={28}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: 'var(--color-border)' }}
                                        contentStyle={{
                                            backgroundColor: 'var(--color-tooltip-bg)',
                                            border: '1px solid var(--color-tooltip-border)',
                                            borderRadius: 14,
                                            fontSize: 12,
                                            fontWeight: 500,
                                            color: 'var(--color-text)',
                                        }}
                                        labelStyle={{ color: 'var(--color-text-secondary)' }}
                                        formatter={(value) => [`${value ?? '—'} de ${SCALE_MAX[key]}`, 'Puntaje']}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke={color}
                                        strokeWidth={2}
                                        dot={{ r: 4, fill: color }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                Sólo hay 1 registro. Se necesitan al menos 2 para dibujar la evolución.
                            </p>
                        )}
                    </div>
                ) : null,
            )}
        </div>
    );
}

function StatusBadge({ status }: { status: Patient['status'] }) {
    const styles: Record<Patient['status'], string> = {
        ACTIVE: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
        ARCHIVED: 'bg-secondary text-text-secondary ring-1 ring-border dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    };
    const labels: Record<Patient['status'], string> = {
        ACTIVE: 'Activo',
        ARCHIVED: 'Archivado',
    };
    return (
        <span className={`rounded-full px-3 py-1 text-[11px] font-bold tracking-wide ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
