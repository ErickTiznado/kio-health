import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { X, Search, Calendar, User, FileText, Banknote, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { createAppointment } from '../../../lib/appointments.api';
import { usePatients } from '../../../hooks/use-patients';
import { useDebounce } from '../../../hooks/use-debounce';
import type { AppointmentType } from '../../../types/appointments.types';

interface ScheduleAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialDate: Date | null;
    isRescheduleMode?: boolean;
    onConfirm?: (date: Date) => void;
}

export function ScheduleAppointmentModal({ isOpen, onClose, initialDate, isRescheduleMode, onConfirm }: ScheduleAppointmentModalProps) {
    const queryClient = useQueryClient();

    // Form State
    const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
    const [patientSearch, setPatientSearch] = useState('');
    const [startTime, setStartTime] = useState('');
    const [type, setType] = useState<AppointmentType>('CONSULTATION');
    const [reason, setReason] = useState('');
    const [price, setPrice] = useState<string>(''); // string for input handling

    const debouncedSearch = useDebounce(patientSearch, 300);

    // Initialize form when opening
    useEffect(() => {
        if (isOpen && initialDate) {
            // Format date for datetime-local input: YYYY-MM-DDTHH:mm
            setStartTime(format(initialDate, "yyyy-MM-dd'T'HH:mm"));
            setPatientSearch('');
            setSelectedPatientId(null);
            setType('CONSULTATION');
            setReason('');
            setPrice(''); // Default via backend
        }
    }, [isOpen, initialDate]);

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

        if (isRescheduleMode && onConfirm) {
            onConfirm(new Date(startTime));
            return;
        }

        if (!selectedPatientId) {
            toast.error('Selecciona un paciente');
            return;
        }

        createMutation.mutate({
            patientId: selectedPatientId,
            startTime: new Date(startTime).toISOString(),
            type,
            reason,
            price: price ? parseFloat(price) : undefined,
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
                className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-center relative bg-gray-50/50">
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-gray-900">
                            {isRescheduleMode ? 'Reagendar Cita' : 'Agendar Nueva Cita'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {isRescheduleMode ? 'Selecciona la nueva fecha y hora' : 'Completa los datos de la sesión'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="absolute right-4 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Patient Search - Hide in Reschedule Mode */}
                        {!isRescheduleMode && (
                            <div className="space-y-1.5 relative">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <User size={14} /> Paciente
                                </label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        value={patientSearch}
                                        onChange={(e) => {
                                            setPatientSearch(e.target.value);
                                            if (selectedPatientId) setSelectedPatientId(null); // Clear selection on edit
                                        }}
                                        placeholder="Buscar paciente por nombre..."
                                        className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border rounded-xl text-sm font-medium focus:ring-2 focus:border-[var(--color-kanji)] outline-none transition-all ${selectedPatientId ? 'border-emerald-200 bg-emerald-50/30 text-emerald-900' : 'border-gray-200 text-gray-900 focus:ring-[var(--color-kanji)]/20'
                                            }`}
                                        autoFocus={!isRescheduleMode}
                                    />
                                    {isLoadingPatients && (
                                        <div className="absolute right-3 top-2.5">
                                            <Loader2 size={18} className="animate-spin text-gray-400" />
                                        </div>
                                    )}
                                </div>

                                {/* Dropdown Results */}
                                {debouncedSearch && !selectedPatientId && patients.length > 0 && (
                                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg max-h-60 overflow-y-auto py-1">
                                        {patients.map((patient) => (
                                            <button
                                                key={patient.id}
                                                type="button"
                                                onClick={() => handlePatientSelect(patient)}
                                                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex flex-col gap-0.5 transition-colors border-b border-gray-50 last:border-0"
                                            >
                                                <span className="text-sm font-bold text-gray-900">{patient.fullName}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {debouncedSearch && !isLoadingPatients && !selectedPatientId && patients.length === 0 && (
                                    <div className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg p-4 text-center">
                                        <p className="text-sm text-gray-500">No se encontraron pacientes.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Date & Time */}
                        <div className={`grid ${isRescheduleMode ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'} gap-5`}>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Calendar size={14} /> Fecha y Hora
                                </label>
                                <input
                                    type="datetime-local"
                                    value={startTime}
                                    onChange={(e) => setStartTime(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all"
                                    required
                                />
                            </div>

                            {!isRescheduleMode && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <FileText size={14} /> Tipo de Cita
                                    </label>
                                    <select
                                        value={type}
                                        onChange={(e) => setType(e.target.value as AppointmentType)}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all appearance-none"
                                    >
                                        <option value="CONSULTATION">Consulta</option>
                                        <option value="EVALUATION">Evaluación</option>
                                        <option value="FOLLOW_UP">Seguimiento</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {!isRescheduleMode && (
                            <>
                                {/* Reason */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        Motivo (Opcional)
                                    </label>
                                    <textarea
                                        value={reason}
                                        onChange={(e) => setReason(e.target.value)}
                                        placeholder="Escribe detalles sobre la sesión..."
                                        rows={3}
                                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all resize-none"
                                    />
                                </div>

                                {/* Price Override */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Banknote size={14} /> Precio (Opcional)
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-2.5 text-gray-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)} // Don't allow minus
                                            placeholder="Precio por defecto del perfil"
                                            min="0"
                                            step="0.01"
                                            className="w-full pl-8 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--color-kanji)]/20 focus:border-[var(--color-kanji)] transition-all placeholder:text-gray-400"
                                        />
                                        <span className="absolute right-4 top-2.5 text-gray-400 text-xs font-bold">USD</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={createMutation.isPending || (!isRescheduleMode && !selectedPatientId) || !startTime}
                            className="w-full bg-[var(--color-kanji)] text-white py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 hover:bg-opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
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
                    </form>
                </div>
            </div>
        </div>
    );
}
