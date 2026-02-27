import { useState, useRef, useEffect } from 'react';
import type { Patient } from '../../types/patients.types';
import { MoreVertical, Edit, FileText, Trash2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PatientsTableProps {
  patients: Patient[];
  isLoading: boolean;
  onEdit: (patient: Patient) => void;
  onArchive: (patient: Patient) => void;
  onView: (patient: Patient) => void;
}

const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

const translateStatus = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'Activo';
    case 'WAITLIST':
      return 'Espera';
    case 'ARCHIVED':
      return 'Archivado';
    default:
      return status;
  }
};

const translateStatusColor = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-600/20 dark:ring-emerald-500/20';
    case 'WAITLIST':
      return 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-600/20 dark:ring-amber-500/20';
    default:
      return 'bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 ring-1 ring-gray-200 dark:ring-slate-700';
  }
};

function ActionMenu({ patient, onEdit, onArchive, onView }: {
  patient: Patient;
  onEdit: (p: Patient) => void;
  onArchive: (p: Patient) => void;
  onView: (p: Patient) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2 text-gray-400 hover:text-kanji dark:hover:text-kio rounded-full transition-colors opacity-0 group-hover:opacity-100 duration-200 hover:bg-gray-100 dark:hover:bg-slate-800"
      >
        <MoreVertical size={18} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.1, ease: "easeOut" }}
            className="absolute right-0 top-full mt-2 w-48 bg-surface dark:bg-slate-900 rounded-xl shadow-xl border border-gray-100 dark:border-slate-800 z-50 py-2 overflow-hidden ring-1 ring-black/5"
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(patient);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors font-medium"
            >
              <Edit size={16} className="text-gray-400 dark:text-slate-500" />
              Editar
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView(patient);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 flex items-center gap-3 transition-colors font-medium"
            >
              <FileText size={16} className="text-gray-400 dark:text-slate-500" />
              Ver Expediente
            </button>
            <div className="h-px bg-gray-100 dark:bg-slate-800 my-1 mx-4"></div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onArchive(patient);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center gap-3 transition-colors font-medium"
            >
              <Trash2 size={16} className="text-rose-400" />
              Archivar
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PatientsTable({ patients, isLoading, onEdit, onArchive, onView }: PatientsTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 bg-surface dark:bg-slate-900 animate-pulse rounded-2xl border border-gray-100 dark:border-slate-800"></div>
        ))}
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 text-center"
      >
        <div className="w-16 h-16 bg-gray-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-gray-300 dark:text-slate-600">
          <FileText size={32} />
        </div>
        <h3 className="text-lg font-bold text-kanji dark:text-kio">Sin pacientes</h3>
        <p className="text-gray-500 dark:text-slate-400 opacity-60 mt-1 max-w-sm">
          No hay expedientes en esta categoría. Comienza añadiendo un nuevo paciente.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Table Header - Sutil y Minimalista */}
      <div className="grid grid-cols-[2fr_1fr_1fr_48px] px-6 py-2 text-xs font-bold text-gray-500 dark:text-slate-500 opacity-50 uppercase tracking-widest">
        <div>Paciente</div>
        <div>Estado</div>
        <div>Próxima Cita</div>
        <div></div>
      </div>

      <AnimatePresence mode="popLayout">
        {patients.map((patient, index) => (
          <motion.div
            key={patient.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.4, delay: index * 0.05, ease: "easeOut" }}
            className="group bg-surface dark:bg-slate-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all border border-transparent dark:border-slate-800 hover:border-kio/40 dark:hover:border-kio/40 cursor-pointer flex items-center justify-between"
            onClick={() => onView(patient)}
          >
            {/* Columns Grid */}
            <div className="grid grid-cols-[2fr_1fr_1fr_48px] items-center w-full gap-4">

              {/* Name & Avatar */}
              <div className="flex items-center gap-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-12 h-12 rounded-full bg-kanji dark:bg-kio flex items-center justify-center text-white dark:text-slate-900 font-bold text-sm shadow-md shadow-kio/20"
                >
                  {getInitials(patient.fullName)}
                </motion.div>
                <div className="flex flex-col">
                  <span className="font-bold text-kanji dark:text-kio text-base leading-tight">{patient.fullName}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-sm text-gray-500 dark:text-slate-400 font-medium">
                      {patient.contactPhone || 'Sin contacto'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wide ${translateStatusColor(
                    patient.status
                  )}`}
                >
                  {translateStatus(patient.status)}
                </span>
              </div>

              {/* Next Appointment */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 font-medium">
                {patient.appointments && patient.appointments.length > 0 ? (
                  <>
                    <Calendar size={14} className="text-kanji dark:text-kio opacity-60" />
                    <span className="text-kanji dark:text-kio">
                      {new Date(patient.appointments[0].startTime).toLocaleDateString('es-MX', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                    <span className="text-gray-300 dark:text-slate-600 mx-1">|</span>
                    <span className="text-gray-500 dark:text-slate-500">
                      {new Date(patient.appointments[0].startTime).toLocaleTimeString('es-MX', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400 dark:text-slate-600 italic font-normal text-xs">Sin agendar</span>
                )}
              </div>

              {/* Action Menu */}
              <div className="flex justify-end">
                <ActionMenu
                  patient={patient}
                  onEdit={onEdit}
                  onArchive={onArchive}
                  onView={onView}
                />
              </div>

            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
