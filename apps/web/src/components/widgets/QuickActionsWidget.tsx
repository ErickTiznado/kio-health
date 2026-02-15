import { useState } from 'react';
import { UserPlus, CalendarPlus } from 'lucide-react';
import { PatientModal } from '../patients/PatientModal';
import { ScheduleAppointmentModal } from '../../features/calendar/components/ScheduleAppointmentModal';
import { useCreatePatient } from '../../hooks/use-patients';
import type { PatientFormValues } from '../../schemas/patients.schema';

export function QuickActionsWidget() {
   const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
   const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
   
   const createPatientMutation = useCreatePatient();

   const handleCreatePatient = (data: PatientFormValues) => {
      createPatientMutation.mutate(data, {
         onSuccess: () => {
            setIsPatientModalOpen(false);
         },
      });
   };

   return (
      <>
         <div className="flex flex-col gap-4 w-full">
            <button 
               onClick={() => setIsPatientModalOpen(true)}
               className="w-full bg-white dark:bg-slate-900 p-4 h-[72px] rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center gap-4 text-gray-500 dark:text-kio hover:text-kio dark:hover:text-kio hover:border-kio dark:hover:border-kio hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-all shadow-sm group cursor-pointer"
            >
               <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 flex items-center justify-center transition-colors">
                  <UserPlus size={20} className="group-hover:text-kio dark:group-hover:text-kio" />
               </div>
               <div className="flex flex-col items-start">
                  <span className="text-sm font-black uppercase text-gray-800 dark:text-white group-hover:text-kio dark:group-hover:text-kio">Nuevo Paciente</span>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-kanji">Registrar ingreso</span>
               </div>
            </button>

            <button 
               onClick={() => setIsAppointmentModalOpen(true)}
               className="w-full bg-white dark:bg-slate-900 p-4 h-[72px] rounded-2xl border border-gray-100 dark:border-slate-800 flex items-center gap-4 text-gray-500 dark:text-kio hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all shadow-sm group cursor-pointer"
            >
               <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-slate-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 flex items-center justify-center transition-colors">
                  <CalendarPlus size={20} className="group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
               </div>
               <div className="flex flex-col items-start">
                  <span className="text-sm font-black uppercase text-gray-800 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400">Agendar Cita</span>
                  <span className="text-[10px] font-medium text-gray-400 dark:text-kanji">Programar sesión</span>
               </div>
            </button>
         </div>

         <PatientModal 
            isOpen={isPatientModalOpen} 
            onClose={() => setIsPatientModalOpen(false)} 
            onSubmit={handleCreatePatient}
            isLoading={createPatientMutation.isPending}
         />

         <ScheduleAppointmentModal
            isOpen={isAppointmentModalOpen}
            onClose={() => setIsAppointmentModalOpen(false)}
            initialDate={new Date()}
            isRescheduleMode={false}
         />
      </>
   );
}
