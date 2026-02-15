import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { User, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { toast } from 'sonner';

interface WaitlistPatient {
  id: string;
  fullName: string;
  contactPhone: string;
  updatedAt: string;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function WaitlistPanel() {
  const { data: waitlist = [], isLoading } = useQuery({
    queryKey: ['patients', 'waitlist'],
    queryFn: async () => {
      const { data } = await axios.get(`${API_URL}/patients`, {
        params: { status: 'WAITLIST', limit: 5 },
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });
      return data.data; // Assuming paginated response
    },
    staleTime: 1000 * 60 * 5,
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden flex flex-col h-full max-h-[400px]">
      <div className="p-4 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-amber-50/50 dark:bg-amber-900/10">
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2 text-sm">
          <User size={16} className="text-amber-500" />
          Lista de Espera
        </h3>
        <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-200 px-2 py-0.5 rounded-full">
          {waitlist.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {isLoading ? (
          <div className="flex justify-center p-4"><Loader2 className="animate-spin text-gray-300 dark:text-gray-600" /></div>
        ) : waitlist.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500 text-xs">
            No hay pacientes en espera.
          </div>
        ) : (
          waitlist.map((patient: WaitlistPatient) => (
            <div key={patient.id} className="group bg-gray-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-transparent dark:border-slate-700 hover:border-amber-200 dark:hover:border-amber-700 hover:shadow-sm rounded-lg p-3 transition-all cursor-pointer relative">
              <div className="flex justify-between items-start mb-1">
                <span className="font-bold text-gray-700 dark:text-gray-200 text-sm truncate max-w-[140px]">{patient.fullName}</span>
                <span className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                  Hace {format(new Date(patient.updatedAt), 'd MMM', { locale: es })}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-2 truncate">{patient.contactPhone}</p>
              
              <button 
                className="w-full bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-500 dark:hover:bg-amber-600 text-amber-700 dark:text-amber-200 hover:text-white text-[10px] font-bold py-1.5 rounded transition-colors flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 absolute bottom-2 left-2 right-2 width-auto"
                onClick={(e) => {
                    e.stopPropagation();
                    // Open Promote Modal logic here (TODO)
                    toast.info('Funcionalidad de promover paciente próximamente');
                }}
              >
                Promover a Cita <ArrowRight size={10} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
