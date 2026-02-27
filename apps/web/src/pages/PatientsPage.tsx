import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients, useCreatePatient, useUpdatePatient, useArchivePatient } from '../hooks/use-patients';
import { useDebounce } from '../hooks/use-debounce';
import { PatientsTable } from '../components/patients/PatientsTable';
import { PatientModal } from '../components/patients/PatientModal';
import type { Patient } from '../types/patients.types';
import type { PatientFormValues } from '../schemas/patients.schema';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion } from 'framer-motion';
import { confirmAction } from '../lib/confirm-action';

const TABS = [
  { id: 'ALL', label: 'Todos' },
  { id: 'ACTIVE', label: 'Activos' },
  { id: 'WAITLIST', label: 'Lista de Espera' },
  { id: 'ARCHIVED', label: 'Archivados' },
];

export default function PatientsPage() {
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const debouncedSearch = useDebounce(search, 500);
  
  const { data, isLoading } = usePatients(1, debouncedSearch);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();
  const archivePatientMutation = useArchivePatient();

  const handleCreate = (data: PatientFormValues) => {
    createPatientMutation.mutate(data, {
      onSuccess: () => {
        setIsModalOpen(false);
      },
    });
  };

  const handleUpdate = (data: PatientFormValues) => {
    if (!editingPatient) return;
    updatePatientMutation.mutate({ id: editingPatient.id, data }, {
      onSuccess: () => {
        setIsModalOpen(false);
        setEditingPatient(null);
      },
    });
  };

  const handleSubmit = (data: PatientFormValues) => {
     if (editingPatient) {
        handleUpdate(data);
     } else {
        handleCreate(data);
     }
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

  const openCreateModal = () => {
    setEditingPatient(null);
    setIsModalOpen(true);
  };

  const openEditModal = (patient: Patient) => {
    setEditingPatient(patient);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPatient(null);
  };

  const filteredPatients = (data?.data || []).filter(patient => {
    const status = patient.status;
    if (activeTab === 'ALL') return status !== 'ARCHIVED';
    return status === activeTab;
  });

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6">
        
        {/* Header Block - Fijo y unificado */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-30 bg-surface/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 shadow-sm"
        >
          {/* Top Bar: Título y Acciones */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-8 pt-6 pb-4">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <h1 className="text-2xl font-bold text-kanji dark:text-kio tracking-tight">Pacientes</h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 opacity-60 font-medium">
                {isLoading ? 'Cargando...' : `${filteredPatients.length} expedientes encontrados`}
              </p>
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto bg-surface dark:bg-slate-800 p-1.5 rounded-full shadow-sm border border-gray-200 dark:border-slate-700">
               {/* Search Bar Integrada */}
               <div className="relative flex-1 sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2 bg-transparent border-none text-sm text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-0 outline-none"
                  />
               </div>

              {/* Separator */}
              <div className="h-6 w-px bg-gray-200 dark:bg-slate-700 hidden sm:block"></div>

              {/* Primary Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreateModal}
                className="bg-kio hover:bg-kanji text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg shadow-kio/20 transition-all flex items-center gap-2 whitespace-nowrap"
              >
                <Plus size={16} />
                Nuevo
              </motion.button>
            </div>
          </div>

          {/* Tabs Bar - Integrada en el Header */}
          <div className="px-8 flex items-center gap-8 w-full overflow-x-auto no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-kanji dark:text-kio'
                      : 'text-gray-500 dark:text-slate-400 opacity-60 hover:opacity-100 hover:text-kanji dark:hover:text-kio'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-kanji dark:bg-kio rounded-t-full" 
                      initial={false}
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              ))}
          </div>
        </motion.div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 px-8 py-6 overflow-y-auto">
          <PatientsTable
            patients={filteredPatients}
            isLoading={isLoading}
            onEdit={openEditModal}
            onArchive={handleArchive}
            onView={(patient) => navigate(`/patients/${patient.id}`)}
          />
        </div>

        <PatientModal 
          isOpen={isModalOpen}
          onClose={closeModal}
          initialData={editingPatient}
          onSubmit={handleSubmit}
          isLoading={createPatientMutation.isPending || updatePatientMutation.isPending}
        />
      </div>
    </DashboardLayout>
  );
}
