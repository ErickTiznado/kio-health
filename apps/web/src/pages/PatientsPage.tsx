import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatients, useCreatePatient, useUpdatePatient, useArchivePatient } from '../hooks/use-patients';
import { useDebounce } from '../hooks/use-debounce';
import { PatientsTable } from '../components/patients/PatientsTable';
import { PatientForm } from '../components/patients/PatientForm';
import type { Patient } from '../types/patients.types';
import type { PatientFormValues } from '../schemas/patients.schema';
import { Plus, Search } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { motion, AnimatePresence } from 'framer-motion';

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

  const handleArchive = (patient: Patient) => {
    if (confirm('¿Estás seguro de que deseas archivar a este paciente?')) {
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
      <div className="flex flex-col h-[calc(100vh-64px)] -m-6 bg-bg">
        
        {/* Header Block - Fijo y unificado */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-[var(--color-cruz)] shadow-sm"
        >
          {/* Top Bar: Título y Acciones */}
          <div className="flex flex-col sm:flex-row items-center justify-between px-8 pt-6 pb-4">
            <div className="flex flex-col gap-1 w-full sm:w-auto">
              <h1 className="text-2xl font-bold text-[var(--color-kanji)] tracking-tight">Pacientes</h1>
              <p className="text-sm text-[var(--color-text)] opacity-60 font-medium">
                {isLoading ? 'Cargando...' : `${filteredPatients.length} expedientes encontrados`}
              </p>
            </div>

            <div className="flex items-center gap-4 mt-4 sm:mt-0 w-full sm:w-auto bg-white p-1.5 rounded-full shadow-sm border border-[var(--color-cruz)]">
               {/* Search Bar Integrada */}
               <div className="relative flex-1 sm:w-64">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-[var(--color-text)] opacity-40" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="block w-full pl-11 pr-4 py-2 bg-transparent border-none text-sm text-[var(--color-text)] placeholder-gray-400 focus:ring-0 outline-none"
                  />
               </div>

              {/* Separator */}
              <div className="h-6 w-px bg-[var(--color-cruz)] hidden sm:block"></div>

              {/* Primary Action */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={openCreateModal}
                className="bg-kio hover:bg-[var(--color-kanji)] text-white px-5 py-2 rounded-full text-sm font-medium shadow-lg shadow-kio/20 transition-all flex items-center gap-2 whitespace-nowrap"
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
                      ? 'text-[var(--color-kanji)]'
                      : 'text-[var(--color-text)] opacity-60 hover:opacity-100 hover:text-[var(--color-kanji)]'
                  }`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 w-full h-[2px] bg-[var(--color-kanji)] rounded-t-full" 
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

        {/* Modal - Limpio y Centrado */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-labelledby="modal-title" role="dialog" aria-modal="true">
              {/* Overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm" 
                aria-hidden="true" 
                onClick={closeModal}
              ></motion.div>

              {/* Modal Content */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ type: "spring", duration: 0.5, bounce: 0 }}
                className="bg-white rounded-2xl px-8 pt-8 pb-8 text-left overflow-hidden shadow-2xl sm:max-w-lg sm:w-full z-10 relative"
              >
                <div className="text-left">
                  <h3 className="text-xl font-bold text-[var(--color-kanji)] mb-1" id="modal-title">
                    {editingPatient ? 'Editar Expediente' : 'Crear Expediente'}
                  </h3>
                  <p className="text-sm text-[var(--color-text)] opacity-60 mb-6">
                    {editingPatient ? 'Actualiza la información clínica.' : 'Ingresa los datos esenciales del nuevo paciente.'}
                  </p>
                  
                  <PatientForm
                    initialData={editingPatient || undefined}
                    onSubmit={editingPatient ? handleUpdate : handleCreate}
                    onCancel={closeModal}
                    isLoading={createPatientMutation.isPending || updatePatientMutation.isPending}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
