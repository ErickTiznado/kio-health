import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '../hooks/use-patients';
import { addRecentPatientToStorage } from '../lib/recent-patients.storage';
import {
    ArrowLeft,
    Phone,
    MessageCircle,
    FileClock,
    User,
    AlertTriangle,
    CreditCard,
    Calendar,
    Edit,
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { TimelineContainer } from '../components/patient/timeline/TimelineContainer';
import { MoodChart } from '../components/patient/insights/MoodChart';
import { TasksWidget } from '../components/patient/tasks/TasksWidget';
import { motion, AnimatePresence } from 'framer-motion';

const TABS = [
    { id: 'history', label: 'Historia Clínica', icon: FileClock },
    { id: 'info', label: 'Información General', icon: User },
];

export default function PatientDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: patient, isLoading, error } = usePatient(id || '');
    const [activeTab, setActiveTab] = useState('history');

    useEffect(() => {
        if (patient?.id) {
            addRecentPatientToStorage(patient.id);
        }
    }, [patient?.id]);

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

    const getInitials = (name: string) => {
        return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
    };

    return (
        <DashboardLayout>
            <div className="flex flex-col h-[calc(100vh-64px)] -m-6 bg-bg dark:bg-slate-950 overflow-hidden">

                {/* Sticky Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-[var(--color-cruz)] dark:border-slate-800 shadow-sm"
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
                                <button className="p-2 text-gray-400 dark:text-slate-500 hover:text-[var(--color-kanji)] dark:hover:text-white rounded-full hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                    <Edit size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Patient Info Row */}
                        <div className="flex items-center gap-6 mb-6">
                            <motion.div
                                layoutId={`avatar-${patient.id}`}
                                className="w-16 h-16 rounded-2xl bg-[var(--color-kanji)] text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-kio/20"
                            >
                                {getInitials(patient.fullName)}
                            </motion.div>

                            <div>
                                <h1 className="text-3xl font-bold text-[var(--color-kanji)] dark:text-white tracking-tight flex items-center gap-3">
                                    {patient.fullName}
                                    <span className={`text-xs px-2.5 py-1 rounded-full border ${patient.status === 'ACTIVE'
                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                            : 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700'
                                        }`}>
                                        {patient.status === 'ACTIVE' ? 'Activo' : patient.status === 'WAITLIST' ? 'Espera' : 'Archivado'}
                                    </span>
                                </h1>
                                <div className="flex items-center gap-4 mt-1 text-sm text-[var(--color-text)] dark:text-slate-400 opacity-60">
                                    {patient.diagnosis && (
                                        <span className="flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500"></span>
                                            {patient.diagnosis}
                                        </span>
                                    )}
                                    {Number(patient.totalDebt) > 0 && (
                                        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-900/30 px-2 py-0.5 rounded-md">
                                            Deuda: ${Number(patient.totalDebt)}
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
                        {activeTab === 'history' ? (
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
                        ) : (
                            <motion.div
                                key="info"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6"
                            >
                                {/* Left Column: Profile & Contacts */}
                                <div className="space-y-6">
                                    {/* Personal Info Card */}
                                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-[var(--color-cruz)] dark:border-slate-800">
                                        <h3 className="text-lg font-bold text-[var(--color-kanji)] dark:text-white mb-4 flex items-center gap-2">
                                            <User size={18} />
                                            Datos Personales
                                        </h3>
                                        <dl className="space-y-4">
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Fecha de Nacimiento</dt>
                                                <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1">
                                                    {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'No registrada'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Teléfono</dt>
                                                <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1">{patient.contactPhone || 'No registrado'}</dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Diagnóstico</dt>
                                                <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1 bg-gray-50 dark:bg-slate-800 p-2 rounded-lg border border-gray-100 dark:border-slate-700">
                                                    {patient.diagnosis || 'Sin diagnóstico'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">Contexto Clínico</dt>
                                                <dd className="text-sm text-gray-600 dark:text-slate-400 mt-1 leading-relaxed">
                                                    {patient.clinicalContext || 'Sin contexto registrado.'}
                                                </dd>
                                            </div>
                                        </dl>
                                    </div>

                                    {/* Emergency Contact */}
                                    {patient.emergencyContact && (
                                        <div className="bg-rose-50 dark:bg-rose-900/20 p-6 rounded-2xl border border-rose-100 dark:border-rose-800">
                                            <h3 className="text-sm font-bold text-rose-800 dark:text-rose-300 mb-3 flex items-center gap-2">
                                                <AlertTriangle size={16} />
                                                Contacto de Emergencia
                                            </h3>
                                            <div className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
                                                <p><span className="font-semibold">{patient.emergencyContact.name}</span> ({patient.emergencyContact.relation || 'Relación no esp.'})</p>
                                                <a href={`tel:${patient.emergencyContact.phone}`} className="flex items-center gap-2 hover:underline mt-1 font-medium">
                                                    <Phone size={14} />
                                                    {patient.emergencyContact.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Middle/Right Column: Charts & Tasks */}
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <MoodChart patientId={patient.id} />
                                        <div className="h-full">
                                            <TasksWidget patientId={patient.id} />
                                        </div>
                                    </div>

                                    {/* Payment History */}
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-[var(--color-cruz)] dark:border-slate-800 overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50/50 dark:bg-slate-800/50">
                                            <h3 className="font-bold text-[var(--color-kanji)] dark:text-white flex items-center gap-2">
                                                <CreditCard size={18} />
                                                Historial de Pagos
                                            </h3>
                                            <span className="text-xs font-bold text-gray-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-gray-200 dark:border-slate-700">
                                                Últimas 5 sesiones
                                            </span>
                                        </div>
                                        <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                            {patient.appointments && patient.appointments.length > 0 ? (
                                                patient.appointments.slice(0, 5).map((app) => (
                                                    <div key={app.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-500 dark:text-slate-400">
                                                                <Calendar size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">
                                                                    {new Date(app.startTime).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' })}
                                                                </p>
                                                                <p className="text-xs text-gray-400 dark:text-slate-500">
                                                                    {app.paymentMethod ? app.paymentMethod.toLowerCase() : 'Sin método'} · ${app.price}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${app.paymentStatus === 'PAID'
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                                                : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                                                            }`}>
                                                            {app.paymentStatus === 'PAID' ? 'Pagado' : 'Pendiente'}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-400 dark:text-slate-500 text-sm">
                                                    No hay historial de pagos registrado.
                                                </div>
                                            )}
                                        </div>
                                        {patient.appointments && patient.appointments.length > 5 && (
                                            <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800/50 text-center border-t border-gray-100 dark:border-slate-800">
                                                <button className="text-xs font-bold text-[var(--color-kanji)] dark:text-kio hover:underline">
                                                    Ver todo el historial
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </DashboardLayout>
    );
}
