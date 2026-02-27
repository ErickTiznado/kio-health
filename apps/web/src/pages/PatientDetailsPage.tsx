import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient, useUpdatePatient, usePatientScales, type ScaleHistoryPoint } from '../hooks/use-patients';
import { addRecentPatientToStorage } from '../lib/recent-patients.storage';
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    FileClock,
    User,
    AlertTriangle,
    Edit,
    BarChart2,
    Target,
    CalendarDays,
    Activity,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { TimelineContainer } from '../components/patient/timeline/TimelineContainer';
import { MoodChart } from '../components/patient/insights/MoodChart';
import { TasksWidget } from '../components/patient/tasks/TasksWidget';
import { PatientModal } from '../components/patients/PatientModal';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api';
import type { TimelineResponse, Patient } from '../types/patients.types';
import type { PatientFormValues } from '../schemas/patients.schema';

const TABS = [
    { id: 'history', label: 'Historia Clínica', icon: FileClock },
    { id: 'profile', label: 'Perfil Clínico', icon: User },
    { id: 'stats', label: 'Estadísticas', icon: BarChart2 },
];

export default function PatientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: patient, isLoading, error } = usePatient(id || '');
    const updatePatientMutation = useUpdatePatient();
    const [activeTab, setActiveTab] = useState('history');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        if (patient?.id) {
            addRecentPatientToStorage(patient.id);
        }
    }, [patient?.id]);

    const { data: scalesHistory = [] } = usePatientScales(id || '');

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

    const handleEditSubmit = (data: PatientFormValues) => {
        if (!patient) return;
        updatePatientMutation.mutate({ id: patient.id, data }, {
            onSuccess: () => setIsEditModalOpen(false),
        });
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col h-[calc(100vh-64px)] -m-6 bg-bg dark:bg-slate-950 p-8">
                    <div className="h-32 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse mb-8"></div>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="col-span-2 h-96 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                        <div className="h-96 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse"></div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !patient) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
                        <AlertTriangle size={32} className="text-red-500" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Error al cargar paciente</h2>
                    <p className="text-gray-500 dark:text-slate-400 mb-6">No se pudo encontrar la información solicitada.</p>
                    <button onClick={() => navigate('/patients')} className="text-[var(--color-kanji)] dark:text-kio hover:underline font-medium">
                        Volver a la lista
                    </button>
                </div>
            </DashboardLayout>
        );
    }

    const getInitials = (name: string) =>
        name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    const sinceDate = format(new Date(patient.createdAt), "MMM yyyy", { locale: es });

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 bg-bg dark:bg-slate-950 overflow-hidden">

                {/* Sticky Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-30 bg-surface/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[var(--color-cruz)] dark:border-slate-800 shadow-sm"
                >
                    <div className="px-8 pt-6 pb-2">
                        {/* Top Row: Back & Actions */}
                        <div className="flex justify-between items-start mb-4">
                            <button
                                onClick={() => navigate('/patients')}
                                className="flex items-center gap-2 text-sm text-[var(--color-text)] dark:text-slate-400 opacity-60 hover:opacity-100 transition-opacity group"
                            >
                                <div className="p-1 rounded-full bg-transparent group-hover:bg-gray-100 dark:group-hover:bg-slate-800 transition-colors">
                                    <ArrowLeft size={18} />
                                </div>
                                <span>Volver</span>
                            </button>

                            <div className="flex items-center gap-3">
                                {patient.contactPhone && (
                                    <>
                                        <a
                                            href={`https://wa.me/${patient.contactPhone.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-full transition-colors"
                                            title="WhatsApp"
                                        >
                                            <MessageCircle size={18} />
                                        </a>
                                        <a
                                            href={`tel:${patient.contactPhone}`}
                                            className="p-2 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full transition-colors"
                                            title="Llamar"
                                        >
                                            <Phone size={18} />
                                        </a>
                                    </>
                                )}
                                <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 mx-1"></div>
                                <button
                                    onClick={() => setIsEditModalOpen(true)}
                                    className="p-2 text-gray-400 dark:text-slate-500 hover:text-[var(--color-kanji)] dark:hover:text-white rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
                                    title="Editar expediente"
                                >
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Patient Info Row */}
                        <div className="flex items-center gap-6 mb-3">
                            <motion.div
                                layoutId={`avatar-${patient.id}`}
                                className="w-16 h-16 rounded-2xl bg-[var(--color-kanji)] text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-kio/20"
                            >
                                {getInitials(patient.fullName)}
                            </motion.div>

                            <div>
                                <h1 className="text-3xl font-bold text-[var(--color-kanji)] dark:text-white tracking-tight flex items-center gap-3">
                                    {patient.fullName}
                                    <StatusBadge status={patient.status} />
                                </h1>
                                <div className="flex items-center gap-4 mt-1.5 text-sm text-[var(--color-text)] dark:text-slate-400 flex-wrap">
                                    {patient.diagnosis && (
                                        <span className="opacity-60">{patient.diagnosis}</span>
                                    )}
                                    <span className="flex items-center gap-1.5 text-xs opacity-50">
                                        <CalendarDays size={13} />
                                        Desde {sinceDate}
                                    </span>
                                    {timelineMeta && timelineMeta.total > 0 && (
                                        <span className="flex items-center gap-1.5 text-xs opacity-50">
                                            <Activity size={13} />
                                            {timelineMeta.total} {timelineMeta.total === 1 ? 'sesión' : 'sesiones'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-8">
                            {TABS.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`pb-3 text-sm font-medium transition-all relative flex items-center gap-2 ${activeTab === tab.id
                                        ? 'text-[var(--color-kanji)] dark:text-kio'
                                        : 'text-[var(--color-text)] dark:text-slate-400 opacity-50 hover:opacity-100'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTabDetails"
                                            className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-kanji)] dark:bg-kio rounded-t-full"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-gray-50/50 dark:bg-slate-950 p-8">
                    <AnimatePresence mode="wait">

                        {/* TAB: Historia Clínica */}
                        {activeTab === 'history' && (
                            <motion.div
                                key="history"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-4xl mx-auto"
                            >
                                <TimelineContainer patientId={patient.id} />
                            </motion.div>
                        )}

                        {/* TAB: Perfil Clínico */}
                        {activeTab === 'profile' && (
                            <motion.div
                                key="profile"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6"
                            >
                                {/* Left: Goals + Tasks */}
                                <div className="space-y-6">
                                    {patient.treatmentGoals && patient.treatmentGoals.length > 0 ? (
                                        <div className="bg-surface dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-[var(--color-cruz)] dark:border-slate-800">
                                            <h3 className="text-lg font-bold text-[var(--color-kanji)] dark:text-white mb-4 flex items-center gap-2">
                                                <Target size={18} />
                                                Objetivos de Tratamiento
                                            </h3>
                                            <ul className="space-y-3">
                                                {patient.treatmentGoals.map((goal, i) => (
                                                    <li key={i} className="flex items-start gap-3">
                                                        <span className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-bg)] dark:bg-slate-800 border border-[var(--color-kanji)]/30 flex items-center justify-center text-[10px] font-bold text-[var(--color-kanji)] dark:text-kio shrink-0">
                                                            {i + 1}
                                                        </span>
                                                        <span className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{goal}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="bg-surface dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-dashed border-[var(--color-cruz)] dark:border-slate-700">
                                            <div className="flex items-center gap-2 mb-2 text-gray-400 dark:text-slate-500">
                                                <Target size={18} />
                                                <h3 className="text-sm font-bold">Objetivos de Tratamiento</h3>
                                            </div>
                                            <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
                                                No se han definido objetivos. Edita el expediente para agregarlos.
                                            </p>
                                        </div>
                                    )}

                                    <TasksWidget patientId={patient.id} />
                                </div>

                                {/* Right: Clinical + Personal */}
                                <div className="space-y-6">
                                    <div className="bg-surface dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-[var(--color-cruz)] dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-[var(--color-kanji)] dark:text-white mb-4">
                                            Escenario Clínico
                                        </h3>
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Diagnóstico</dt>
                                                <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg border border-gray-100 dark:border-slate-700">
                                                    {patient.diagnosis || 'Sin diagnóstico'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Contexto Clínico</dt>
                                                <dd className="text-sm text-gray-600 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">
                                                    {patient.clinicalContext || 'Sin contexto registrado.'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    <div className="bg-surface dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-[var(--color-cruz)] dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-[var(--color-kanji)] dark:text-white mb-4">
                                            Datos Personales
                                        </h3>
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Fecha de Nacimiento</dt>
                                                <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1">
                                                    {patient.dateOfBirth
                                                        ? new Date(patient.dateOfBirth).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
                                                        : 'No registrada'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Teléfono</dt>
                                                <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1">
                                                    {patient.contactPhone || 'No registrado'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Paciente desde</dt>
                                                <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1 capitalize">
                                                    {sinceDate}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    {patient.emergencyContact && (
                                        <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-800">
                                            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 mb-3 flex items-center gap-2">
                                                <AlertTriangle size={16} />
                                                Contacto de Emergencia
                                            </h3>
                                            <div className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
                                                <p>
                                                    <span className="font-semibold">{patient.emergencyContact.name}</span>
                                                    {' '}({patient.emergencyContact.relation || 'Relación no especificada'})
                                                </p>
                                                <a href={`tel:${patient.emergencyContact.phone}`} className="flex items-center gap-2 hover:underline mt-1 font-medium">
                                                    <Phone size={14} />
                                                    {patient.emergencyContact.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}

                        {/* TAB: Estadísticas */}
                        {activeTab === 'stats' && (
                            <motion.div
                                key="stats"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-5xl mx-auto space-y-6"
                            >
                                {timelineMeta && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                        <div className="bg-surface dark:bg-slate-900 rounded-2xl p-5 border border-[var(--color-cruz)] dark:border-slate-800 shadow-sm">
                                            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">Sesiones</p>
                                            <p className="text-3xl font-bold text-[var(--color-kanji)] dark:text-white">{timelineMeta.total}</p>
                                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">registradas en total</p>
                                        </div>
                                        <div className="bg-surface dark:bg-slate-900 rounded-2xl p-5 border border-[var(--color-cruz)] dark:border-slate-800 shadow-sm">
                                            <p className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-1">Inicio</p>
                                            <p className="text-2xl font-bold text-[var(--color-kanji)] dark:text-white capitalize">{sinceDate}</p>
                                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">primer registro</p>
                                        </div>
                                    </div>
                                )}

                                <MoodChart patientId={patient.id} />
                                <ScalesHistoryChart data={scalesHistory} />
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>

            <PatientModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                initialData={patient}
                onSubmit={handleEditSubmit}
                isLoading={updatePatientMutation.isPending}
            />
        </DashboardLayout>
    );
}

const RISK_LABELS: Record<string, string> = {
    MINIMAL: 'Mínimo',
    MILD: 'Leve',
    MODERATE: 'Moderado',
    MODERATELY_SEVERE: 'Mod. Severo',
    SEVERE: 'Severo',
};

const SCALE_MAX: Record<string, number> = { PHQ9: 27, GAD7: 21 };

function ScalesHistoryChart({ data }: { data: ScaleHistoryPoint[] }) {
    const phq9 = data.filter(d => d.scaleType === 'PHQ9');
    const gad7 = data.filter(d => d.scaleType === 'GAD7');

    if (data.length === 0) {
        return (
            <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-[var(--color-cruz)] dark:border-slate-800 shadow-sm p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                <BarChart2 size={28} className="text-gray-300 dark:text-slate-600 mb-3" />
                <p className="text-sm text-gray-400 dark:text-slate-500 font-medium">Sin escalas registradas</p>
                <p className="text-xs text-gray-400 dark:text-slate-600 mt-1">Los resultados de PHQ-9 y GAD-7 aparecerán aquí.</p>
            </div>
        );
    }

    return (
        <div className="bg-surface dark:bg-slate-900 rounded-2xl border border-[var(--color-cruz)] dark:border-slate-800 shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-bold text-[var(--color-kanji)] dark:text-white flex items-center gap-2">
                <BarChart2 size={18} />
                Evolución de Escalas Clínicas
            </h3>

            {[{ label: 'PHQ-9 — Depresión', key: 'PHQ9', color: '#8a72d1', points: phq9 }, { label: 'GAD-7 — Ansiedad', key: 'GAD7', color: '#ae93fe', points: gad7 }].map(({ label, key, color, points }) => (
                points.length > 0 && (
                    <div key={key}>
                        <div className="flex items-center justify-between mb-3">
                            <p className="text-sm font-bold text-gray-700 dark:text-slate-300">{label}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-2xl font-black" style={{ color }}>{points[points.length - 1].totalScore}</span>
                                <span className="text-xs text-gray-400 dark:text-slate-500">/ {SCALE_MAX[key]}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 font-semibold">
                                    {RISK_LABELS[points[points.length - 1].riskLevel]}
                                </span>
                            </div>
                        </div>
                        {points.length >= 2 ? (
                            <ResponsiveContainer width="100%" height={120}>
                                <LineChart data={points.map(p => ({ fecha: format(new Date(p.appointment.startTime), 'd MMM', { locale: es }), score: p.totalScore }))}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                                    <XAxis dataKey="fecha" tick={{ fontSize: 11 }} />
                                    <YAxis domain={[0, SCALE_MAX[key]]} tick={{ fontSize: 11 }} width={28} />
                                    <Tooltip />
                                    <Line type="monotone" dataKey="score" stroke={color} strokeWidth={2} dot={{ r: 4, fill: color }} />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-xs text-gray-400 dark:text-slate-500 italic">Solo 1 registro. Se necesitan al menos 2 para mostrar la evolución.</p>
                        )}
                    </div>
                )
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: Patient['status'] }) {
    const styles: Record<Patient['status'], string> = {
        ACTIVE: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
        WAITLIST: 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        ARCHIVED: 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700',
    };
    const labels: Record<Patient['status'], string> = {
        ACTIVE: 'Activo',
        WAITLIST: 'Lista de espera',
        ARCHIVED: 'Archivado',
    };
    return (
        <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${styles[status]}`}>
            {labels[status]}
        </span>
    );
}
