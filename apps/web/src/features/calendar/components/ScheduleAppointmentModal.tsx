import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import {
  X, Search, Calendar, User, FileText, Banknote, Loader2, Clock,
  UserPlus, ArrowLeft, ArrowRight, Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { createAppointment } from '../../../lib/appointments.api';
import { createPatient } from '../../../lib/patients.api';
import { usePatients } from '../../../hooks/use-patients';
import { useDebounce } from '../../../hooks/use-debounce';
import { useUpdateAppointment } from '../../../hooks/use-appointments';
import type { AppointmentType } from '../../../types/appointments.types';
import { useAuthStore } from '../../../stores/auth.store';
import { patientKeys } from '../../../lib/query-keys';
import { getErrorMessage } from '../../../lib/errors';
import { PhoneInput } from '../../../components/ui/PhoneInput';

interface ScheduleAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: Date | null;
    isRescheduleMode?: boolean;
    onConfirm?: (date: Date, duration?: number) => void;
    initialPatient?: { id: string; fullName: string };
    isEditMode?: boolean;
    initialData?: { id: string; type: AppointmentType; reason: string | null; price: string };
}

const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 40 : -40, opacity: 0 }),
};

export function ScheduleAppointmentModal({
    isOpen, onClose, initialDate, isRescheduleMode, onConfirm,
    initialPatient, isEditMode, initialData,
}: ScheduleAppointmentModalProps) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const updateMutation = useUpdateAppointment();

    const defaultDuration = user?.profile?.sessionDefaultDuration || 50;
    const defaultPrice = user?.profile?.sessionDefaultPrice || 0;
    const currency = user?.profile?.currency || 'USD';

    // Wizard step — only used in new appointment mode
    const [wizardStep, setWizardStep] = useState(1);
    const [direction, setDirection] = useState(0);

    // Form state
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState<string>(String(defaultDuration));
    const [type, setType] = useState<AppointmentType>('CONSULTATION');
    const [reason, setReason] = useState('');
    const [price, setPrice] = useState<string>(String(defaultPrice));

    // New patient mode
    const [patientMode, setPatientMode] = useState<'search' | 'new'>('search');
    const [newPatientName, setNewPatientName] = useState('');
    const [newPatientPhone, setNewPatientPhone] = useState('');
    const [newPatientEmail, setNewPatientEmail] = useState('');
    const wasNewPatient = useRef(false);

    const debouncedSearch = useDebounce(patientSearch, 300);

    const isNewMode = !isRescheduleMode && !isEditMode;
    const WIZARD_STEPS = isNewMode
        ? [{ label: 'Paciente' }, { label: 'Sesión' }]
        : [{ label: isRescheduleMode ? 'Nueva Fecha' : 'Detalles' }];

    useEffect(() => {
        if (!isOpen) return;
        setWizardStep(1);
        setDirection(0);
        if (isEditMode && initialData) {
            setType(initialData.type);
            setReason(initialData.reason ?? '');
            setPrice(initialData.price);
            return;
        }
        if (initialDate) {
            setStartTime(format(initialDate, "yyyy-MM-dd'T'HH:mm"));
            setDuration(String(defaultDuration));
            setType('CONSULTATION');
            setReason('');
            setPrice(String(defaultPrice));
            setPatientMode('search');
            setNewPatientName('');
            setNewPatientPhone('');
            setNewPatientEmail('');
            wasNewPatient.current = false;
            if (initialPatient) {
                setSelectedPatientId(initialPatient.id);
                setPatientSearch(initialPatient.fullName);
            } else {
                setPatientSearch('');
                setSelectedPatientId(null);
            }
        }
    }, [isOpen, isEditMode, initialData, initialDate, defaultDuration, defaultPrice, initialPatient]);

    const { data: patientsData, isLoading: isLoadingPatients } = usePatients(1, debouncedSearch, 'ACTIVE', 5);
    const patients = patientsData?.data || [];

    const createPatientMutation = useMutation({ mutationFn: createPatient });
    const createMutation = useMutation({
        mutationFn: createAppointment,
        onSuccess: () => {
            toast.success(wasNewPatient.current ? 'Paciente registrado y cita agendada' : 'Cita agendada correctamente');
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            onClose();
        },
        onError: (error: unknown) => toast.error(getErrorMessage(error, 'Error al agendar la cita')),
    });

    const handlePatientSelect = (patient: { id: string; fullName: string }) => {
        setSelectedPatientId(patient.id);
        setPatientSearch(patient.fullName);
    };

    const goToStep2 = () => {
        if (patientMode === 'search' && !selectedPatientId) {
            toast.error('Selecciona un paciente');
            return;
        }
        if (patientMode === 'new' && !newPatientName.trim()) {
            toast.error('Ingresa el nombre del paciente');
            return;
        }
        setDirection(1);
        setWizardStep(2);
    };

    const goToStep1 = () => { setDirection(-1); setWizardStep(1); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isEditMode && initialData) {
            updateMutation.mutate(
                { id: initialData.id, data: { type, reason: reason || null, price: price !== '' ? parseFloat(price) : undefined } },
                { onSuccess: onClose },
            );
            return;
        }

        if (!startTime) { toast.error('Selecciona fecha y hora'); return; }
        const parsedDate = parseISO(startTime);
        if (isRescheduleMode && onConfirm) { onConfirm(parsedDate, Number(duration)); return; }

        const numDuration = Number(duration);
        if (numDuration < 15 || numDuration > 90) { toast.error('La duración debe ser entre 15 y 90 minutos'); return; }

        let resolvedPatientId = selectedPatientId;
        if (patientMode === 'new') {
            if (!newPatientName.trim()) { toast.error('Ingresa el nombre del paciente'); return; }
            try {
                const newPatient = await createPatientMutation.mutateAsync({
                    fullName: newPatientName.trim(),
                    ...(newPatientPhone.trim() ? { contactPhone: newPatientPhone.trim() } : {}),
                    ...(newPatientEmail.trim() ? { contactEmail: newPatientEmail.trim() } : {}),
                });
                resolvedPatientId = newPatient.id;
                setSelectedPatientId(newPatient.id);
                setPatientSearch(newPatient.fullName);
                setPatientMode('search');
                wasNewPatient.current = true;
                queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
            } catch (err: unknown) {
                toast.error(getErrorMessage(err, 'Error al registrar paciente'));
                return;
            }
        }

        if (!resolvedPatientId) { toast.error('Selecciona un paciente'); return; }

        createMutation.mutate({
            patientId: resolvedPatientId,
            startTime: parsedDate.toISOString(),
            type,
            reason,
            price: price !== '' ? parseFloat(price) : undefined,
            duration: Number(duration),
        });
    };

    const isPending =
        updateMutation.isPending || createMutation.isPending || createPatientMutation.isPending;

    const inputClass =
        'w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/30 focus:border-kio transition-all';
    const labelClass =
        'block text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-1.5';

    const modalTitle = isEditMode ? 'Editar Cita' : isRescheduleMode ? 'Reagendar Cita' : 'Nueva Cita';
    const currentStepLabel = isNewMode
        ? (wizardStep === 1 ? 'Paciente' : 'Sesión')
        : WIZARD_STEPS[0].label;

    return (
        <AnimatePresence>
        {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gray-900/40 dark:bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: 'spring', duration: 0.5, bounce: 0 }}
                className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col min-h-[520px] max-h-[90vh] border border-gray-100 dark:border-slate-800 z-10"
            >
                {/* ── Header ───────────────────────────────────── */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-slate-800 shrink-0 rounded-t-3xl bg-white dark:bg-slate-900">
                    <img src="/LogoFavi.png" alt="Kio" className="h-7 w-7 object-contain shrink-0" />
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-kanji dark:text-white leading-tight">{modalTitle}</h2>
                        <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                            {currentStepLabel}
                            {isNewMode && ` · Paso ${wizardStep} de ${WIZARD_STEPS.length}`}
                        </p>
                    </div>
                    {/* Step pills — solo en modo nuevo */}
                    {isNewMode && (
                        <div className="flex items-center gap-1">
                            {WIZARD_STEPS.map((_, i) => (
                                <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${
                                    i === wizardStep - 1 ? 'w-6 bg-kio' : i < wizardStep - 1 ? 'w-3 bg-kio/40' : 'w-3 bg-gray-200 dark:bg-slate-700'
                                }`} />
                            ))}
                        </div>
                    )}
                    <button
                        type="button" onClick={onClose}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors shrink-0"
                    >
                        <X size={17} />
                    </button>
                </div>

                {/* ── Body ─────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 rounded-b-3xl overflow-hidden">
                    <div className="flex-1 overflow-y-auto px-6 pt-6 pb-2">
                        <AnimatePresence initial={false} custom={direction} mode="wait">

                            {/* ─ Step 1: Paciente (new mode) ─ */}
                            {isNewMode && wizardStep === 1 && (
                                <motion.div key="step-patient"
                                    custom={direction} variants={slideVariants}
                                    initial="enter" animate="center" exit="exit"
                                    transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } }}
                                    className="space-y-4 pb-4 min-h-[320px]"
                                >
                                    {/* Toggle: buscar vs nuevo */}
                                    <div className="flex items-center justify-between mb-1">
                                        <label className={labelClass + ' mb-0 flex items-center gap-2'}>
                                            <User size={13} /> Paciente
                                        </label>
                                        {patientMode === 'search' ? (
                                            <button type="button"
                                                onClick={() => { setPatientMode('new'); setNewPatientName(''); setNewPatientPhone(''); setNewPatientEmail(''); }}
                                                className="flex items-center gap-1 text-xs font-bold text-kio hover:text-kio/80 transition-colors"
                                            >
                                                <UserPlus size={13} /> Nuevo paciente
                                            </button>
                                        ) : (
                                            <button type="button"
                                                onClick={() => setPatientMode('search')}
                                                className="flex items-center gap-1 text-xs font-bold text-gray-400 dark:text-slate-500 hover:text-gray-600 transition-colors"
                                            >
                                                <ArrowLeft size={13} /> Buscar existente
                                            </button>
                                        )}
                                    </div>

                                    {patientMode === 'search' ? (
                                        <div className="relative">
                                            <Search className="absolute left-4 top-3.5 text-gray-400 dark:text-slate-500" size={16} />
                                            <input
                                                type="text" value={patientSearch}
                                                onChange={(e) => { setPatientSearch(e.target.value); if (selectedPatientId) setSelectedPatientId(null); }}
                                                onFocus={() => setIsSearchFocused(true)}
                                                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                                                placeholder="Buscar paciente por nombre..."
                                                autoFocus
                                                className={`${inputClass} pl-11 ${
                                                    selectedPatientId
                                                        ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200'
                                                        : ''
                                                }`}
                                            />
                                            {isLoadingPatients && (
                                                <Loader2 size={16} className="absolute right-4 top-3.5 animate-spin text-gray-400" />
                                            )}
                                            {/* Dropdown results */}
                                            {isSearchFocused && !selectedPatientId && patients.length > 0 && (
                                                <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl max-h-52 overflow-y-auto py-1.5">
                                                    {patients.map((patient) => (
                                                        <button key={patient.id} type="button"
                                                            onClick={() => handlePatientSelect(patient)}
                                                            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors text-sm font-semibold text-gray-900 dark:text-white"
                                                        >
                                                            {patient.fullName}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                            {/* No results */}
                                            {isSearchFocused && debouncedSearch && !isLoadingPatients && !selectedPatientId && patients.length === 0 && (
                                                <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl p-4">
                                                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-3">
                                                        Sin resultados para <span className="font-bold text-gray-600 dark:text-slate-300">"{debouncedSearch}"</span>
                                                    </p>
                                                    <button type="button"
                                                        onClick={() => { setNewPatientName(debouncedSearch); setPatientMode('new'); }}
                                                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-kio/10 hover:bg-kio/20 dark:bg-kio/20 dark:hover:bg-kio/30 text-kio font-bold text-sm rounded-xl transition-colors border border-kio/20"
                                                    >
                                                        <UserPlus size={14} />
                                                        Registrar "{debouncedSearch}" como nuevo
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="bg-kio/5 dark:bg-kio/10 border border-kio/20 rounded-xl p-4 space-y-3">
                                            <div>
                                                <label className={labelClass}>Nombre completo <span className="text-rose-400">*</span></label>
                                                <input type="text" value={newPatientName}
                                                    onChange={(e) => setNewPatientName(e.target.value)}
                                                    placeholder="Ej. Juan García" autoFocus className={inputClass}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Teléfono <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
                                                <PhoneInput
                                                    value={newPatientPhone}
                                                    onChange={setNewPatientPhone}
                                                />
                                            </div>
                                            <div>
                                                <label className={labelClass}>Email <span className="text-gray-400 font-normal normal-case">(para recordatorios)</span></label>
                                                <input type="email" value={newPatientEmail}
                                                    onChange={(e) => setNewPatientEmail(e.target.value)}
                                                    placeholder="paciente@email.com" className={inputClass}
                                                />
                                            </div>
                                            <p className="text-[11px] text-gray-400 dark:text-slate-500">
                                                El expediente completo se puede completar después desde la ficha del paciente.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* ─ Step 2: Detalles de la sesión (new mode) ─ */}
                            {isNewMode && wizardStep === 2 && (
                                <motion.div key="step-session"
                                    custom={direction} variants={slideVariants}
                                    initial="enter" animate="center" exit="exit"
                                    transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.15 } }}
                                    className="space-y-5 pb-4"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className={labelClass + ' flex items-center gap-1.5'}><Calendar size={12} /> Fecha y hora</label>
                                            <input type="datetime-local" value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className={inputClass} autoFocus required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClass + ' flex items-center gap-1.5'}><Clock size={12} /> Duración</label>
                                            <div className="relative">
                                                <input type="number" value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    min="15" max="90" step="1" className={`${inputClass} pr-14`}
                                                />
                                                <span className="absolute right-4 top-3.5 text-gray-400 text-xs font-bold pointer-events-none">MIN</span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className={labelClass + ' flex items-center gap-1.5'}><FileText size={12} /> Tipo</label>
                                            <div className="relative">
                                                <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)}
                                                    className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                                                >
                                                    <option value="CONSULTATION">Consulta</option>
                                                    <option value="EVALUATION">Evaluación</option>
                                                    <option value="FOLLOW_UP">Seguimiento</option>
                                                </select>
                                                <svg className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass + ' flex items-center gap-1.5'}><Banknote size={12} /> Precio</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-medium">$</span>
                                            <input type="number" value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                min="0" step="0.01" className={`${inputClass} pl-8 pr-16`}
                                            />
                                            <span className="absolute right-4 top-3.5 text-gray-400 text-xs font-bold pointer-events-none">{currency}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Motivo <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
                                        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                                            placeholder="Detalles adicionales sobre la sesión..."
                                            rows={2} className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* ─ Single-step: Reschedule ─ */}
                            {isRescheduleMode && (
                                <motion.div key="step-reschedule"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-5 pb-4"
                                >
                                    <div>
                                        <label className={labelClass + ' flex items-center gap-1.5'}><Calendar size={12} /> Nueva fecha y hora</label>
                                        <input type="datetime-local" value={startTime}
                                            onChange={(e) => setStartTime(e.target.value)}
                                            className={inputClass} autoFocus required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass + ' flex items-center gap-1.5'}><Clock size={12} /> Duración</label>
                                        <div className="relative">
                                            <input type="number" value={duration}
                                                onChange={(e) => setDuration(e.target.value)}
                                                min="15" max="90" step="1" className={`${inputClass} pr-14`}
                                            />
                                            <span className="absolute right-4 top-3.5 text-gray-400 text-xs font-bold pointer-events-none">MIN</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* ─ Single-step: Edit ─ */}
                            {isEditMode && (
                                <motion.div key="step-edit"
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-5 pb-4"
                                >
                                    <div>
                                        <label className={labelClass + ' flex items-center gap-1.5'}><FileText size={12} /> Tipo de cita</label>
                                        <div className="relative">
                                            <select value={type} onChange={(e) => setType(e.target.value as AppointmentType)}
                                                className={`${inputClass} appearance-none pr-8 cursor-pointer`}
                                            >
                                                <option value="CONSULTATION">Consulta</option>
                                                <option value="EVALUATION">Evaluación</option>
                                                <option value="FOLLOW_UP">Seguimiento</option>
                                            </select>
                                            <svg className="absolute right-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass + ' flex items-center gap-1.5'}><Banknote size={12} /> Precio</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3.5 text-gray-400 text-sm font-medium">$</span>
                                            <input type="number" value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                min="0" step="0.01" className={`${inputClass} pl-8 pr-16`}
                                            />
                                            <span className="absolute right-4 top-3.5 text-gray-400 text-xs font-bold pointer-events-none">{currency}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelClass}>Motivo <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
                                        <textarea value={reason} onChange={(e) => setReason(e.target.value)}
                                            placeholder="Detalles adicionales..." rows={2}
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* ── Footer nav ───────────────────────────────── */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-slate-800 shrink-0">
                        <button
                            type="button"
                            onClick={isNewMode && wizardStep === 2 ? goToStep1 : onClose}
                            className="flex items-center gap-1.5 text-sm font-semibold text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300 transition-colors px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800"
                        >
                            <ArrowLeft size={15} />
                            {isNewMode && wizardStep === 2 ? 'Anterior' : 'Cancelar'}
                        </button>

                        {/* Next button — step 1 in new mode */}
                        {isNewMode && wizardStep === 1 && (
                            <button type="button" onClick={goToStep2}
                                className="flex items-center gap-2 px-5 py-2.5 bg-kio text-white rounded-xl text-sm font-semibold hover:bg-kio/90 active:scale-95 transition-all shadow-sm shadow-kio/20"
                            >
                                Siguiente <ArrowRight size={15} />
                            </button>
                        )}

                        {/* Confirm button — step 2 or single-step modes */}
                        {(!isNewMode || wizardStep === 2) && (
                            <button type="submit" disabled={isPending}
                                className="flex items-center gap-2 px-5 py-2.5 bg-kio text-white rounded-xl text-sm font-semibold hover:bg-kio/90 active:scale-95 transition-all shadow-sm shadow-kio/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isPending ? (
                                    <><Loader2 size={15} className="animate-spin" /> Guardando...</>
                                ) : (
                                    <><Check size={15} /> {isEditMode ? 'Guardar Cambios' : isRescheduleMode ? 'Confirmar Cambio' : 'Confirmar Cita'}</>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </motion.div>
        </div>
        )}
        </AnimatePresence>
    );
}
