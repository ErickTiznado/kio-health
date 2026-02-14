import { UserPlus, CalendarPlus } from 'lucide-react';

export function QuickActionsWidget() {
   return (
      <div className="flex flex-col gap-4 w-full">
         <button className="w-full bg-white p-4 h-[72px] rounded-2xl border border-gray-100 flex items-center gap-4 text-gray-500 hover:text-kio hover:border-kio hover:bg-purple-50 transition-all shadow-sm group">
            <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
               <UserPlus size={20} className="group-hover:text-kio" />
            </div>
            <div className="flex flex-col items-start">
               <span className="text-sm font-black uppercase text-gray-800 group-hover:text-kio">Nuevo Paciente</span>
               <span className="text-[10px] font-medium text-gray-400">Registrar ingreso</span>
            </div>
         </button>

         <button className="w-full bg-white p-4 h-[72px] rounded-2xl border border-gray-100 flex items-center gap-4 text-gray-500 hover:text-emerald-600 hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm group">
            <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
               <CalendarPlus size={20} className="group-hover:text-emerald-600" />
            </div>
            <div className="flex flex-col items-start">
               <span className="text-sm font-black uppercase text-gray-800 group-hover:text-emerald-700">Agendar Cita</span>
               <span className="text-[10px] font-medium text-gray-400">Programar sesión</span>
            </div>
         </button>
      </div>
   );
}
