import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { X, Search, Calendar, User, FileText, Banknote, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { createAppointment } from '../../../lib/appointments.api';
import { usePatients } from '../../../hooks/use-patients';
import { useDebounce } from '../../../hooks/use-debounce';
import type { AppointmentType } from '../../../types/appointments.types';
import { useAuthStore } from '../../../stores/auth.store';

interface ScheduleAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: Date | null;
    isRescheduleMode?: boolean;
    onConfirm?: (date: Date, duration?: number) => void;
}

export function ScheduleAppointmentModal({ isOpen, onClose, initialDate, isRescheduleMode, onConfirm }: ScheduleAppointmentModalProps) {
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    
    const defaultDuration = user?.profile?.sessionDefaultDuration || 50;
    const defaultPrice = user?.profile?.sessionDefaultPrice || 0;
    const currency = user?.profile?.currency || 'USD';

    // Form State
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState<string>(String(defaultDuration));
    const [type, setType] = useState<AppointmentType>('CONSULTATION');
    const [reason, setReason] = useState('');
    const [price, setPrice] = useState<string>(String(defaultPrice));

    const debouncedSearch = useDebounce(patientSearch, 300);

    // Initialize form when opening
    useEffect(() => {
        if (isOpen && initialDate) {
            setStartTime(format(initialDate, "yyyy-MM-dd'T'HH:mm"));
            setPatientSearch('');
            setSelectedPatientId(null);
            setDuration(String(defaultDuration));
            setType('CONSULTATION');
            setReason('');
            setPrice(String(defaultPrice));
        }
    }, [isOpen, initialDate, defaultDuration, defaultPrice]);

    // Patient Search Query
    const { data: patientsData, isLoading: isLoadingPatients } = usePatients(1, debouncedSearch, 5);
    const patients = patientsData?.data || [];

    // Create Mutation
    const createMutation = useMutation({
        mutationFn: createAppointment,
        onSuccess: () => {
            toast.success('Cita agendada correctamente');
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            onClose();
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Error al agendar cita';
            toast.error(message);
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!startTime) {
            toast.error('Selecciona fecha y hora');
            return;
        }

        const parsedDate = parseISO(startTime);

        if (isRescheduleMode && onConfirm) {
            onConfirm(parsedDate, Number(duration));
            return;
        }

        if (!selectedPatientId) {
            toast.error('Selecciona un paciente');
            return;
        }

        createMutation.mutate({
            patientId: selectedPatientId,
            startTime: parsedDate.toISOString(),
            type,
            reason,
            price: price !== '' ? parseFloat(price) : undefined,
            duration: Number(duration),
        });
    };

    const handlePatientSelect = (patient: { id: string; fullName: string }) => {
        setSelectedPatientId(patient.id);
        setPatientSearch(patient.fullName);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[24px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] border border-gray-100 dark:border-slate-800">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            {isRescheduleMode ? 'Reagendar Cita' : 'Agendar Nueva Cita'}
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                            {isRescheduleMode ? 'Selecciona la nueva fecha y hora' : 'Completa los datos de la sesión'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 transition-colors bg-gray-50 dark:bg-slate-800/50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto custom-scrollbar">
                    <form onSubmit={handleSubmit} className="space-y-8">

                        {/* Patient Search */}
                        {!isRescheduleMode && (
                            <div className="space-y-2 relative">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <User size={14} /> Paciente
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-3.5 text-gray-400 dark:text-slate-500" size={18} />
                                    <input
                                        type="text"
                                        value={patientSearch}
                                        onChange={(e) => {
                                            setPatientSearch(e.target.value);
                                            if (selectedPatientId) setSelectedPatientId(null);
                                        }}
                                        placeholder="Buscar paciente por nombre..."
                                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-slate-800/50 border rounded-xl text-sm font-medium focus:ring-2 focus:border-[var(--color-kanji)] outline-none transition-all ${
                                            selectedPatientId 
                                                ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-200' 
                                                : 'border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white focus:ring-[var(--color-kanji)]/20'
                                        }`}
                                        autoFocus={!isRescheduleMode}
                                    />
                                    {isLoadingPatients && (
                                        <div className="absolute right-4 top-3.5">
                                            <Loader2 size={18} className="animate-spin text-gray-400 dark:text-slate-500" />
                                        </div>
                                    )}
                                </div>

                                {/* Dropdown Results */}
                                {debouncedSearch && !selectedPatientId && patients.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl max-h-60 overflow-y-auto py-2">
                                        {patients.map((patient) => (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => handlePatientSelect(patient)}
                                                className="w-full text-left px-5 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors border-b border-gray-50 dark:border-slate-700/50 last:border-0"
                                            >
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">{patient.fullName}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {debouncedSearch && !isLoadingPatients && !selectedPatientId && patients.length === 0 && (
                                    <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl p-6 text-center">
                                        <p className="text-sm text-gray-500 dark:text-slate-400">No se encontraron pacientes.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Date & Time and Duration Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Calendar size={14} /> Fecha y Hora
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <Clock size={14} /> Duración
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={duration}
                                        onChange={(e) => setDuration(e.target.value)}
                                        min="1"
                                        step="5"
                                        className="w-full pl-4 pr-16 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all"
                                    />
                                    <span className="absolute right-4 top-3 text-gray-400 dark:text-slate-500 text-xs font-bold pointer-events-none mt-0.5">MIN</span>
                                </div>
                            </div>
                        </div>

                        {!isRescheduleMode && (
                            <>
                                {/* Type and Price Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <FileText size={14} /> Tipo de Cita
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={type}
                                                onChange={(e) => setType(e.target.value as AppointmentType)}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all appearance-none cursor-pointer"
                                            >
                                                <option value="CONSULTATION">Consulta</option>
                                                <option value="EVALUATION">Evaluación</option>
                                                <option value="FOLLOW_UP">Seguimiento</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Banknote size={14} /> Precio de la Sesión
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-3 text-gray-400 dark:text-slate-500 text-sm font-medium">$</span>
                                            <input
                                                type="number"
                                                value={price}
                                                onChange={(e) => setPrice(e.target.value)}
                                                min="0"
                                                step="0.01"
                                                className="w-full pl-8 pr-16 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all"
                                            />
                                            <span className="absolute right-4 top-3.5 text-gray-400 dark:text-slate-500 text-xs font-bold pointer-events-none">{currency}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                        Motivo (Opcional)
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Detalles adicionales sobre la sesión..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all resize-none placeholder:text-gray-400"
                                    />
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={createMutation.isPending || (!isRescheduleMode && !selectedPatientId) || !startTime}
                                className="w-full bg-kanji dark:bg-kio text-white dark:text-slate-900 py-3.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {createMutation.isPending ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        {isRescheduleMode ? 'Reagendando...' : 'Agendando...'}
                                    </>
                                ) : (
                                    isRescheduleMode ? 'Confirmar Cambio' : 'Confirmar Cita'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}