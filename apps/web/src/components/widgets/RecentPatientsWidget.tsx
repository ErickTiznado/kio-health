import { History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Patient {
  id: string;
  name: string;
  reason: string;
  time: string;
  color: string;
}

interface RecentPatientsWidgetProps {
  patients: Patient[];
}

export function RecentPatientsWidget({ patients }: RecentPatientsWidgetProps) {
  const navigate = useNavigate();

  return (
    <div className="col-span-12 lg:col-span-7 h-full">
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-slate-800 h-full flex flex-col transition-colors duration-200">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-3 text-lg transition-colors">
            <History size={24} className="text-gray-300 dark:text-kanji" /> Vistos Recientemente
          </h3>
        </div>

        {patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center bg-gray-50/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-gray-200 dark:border-slate-700 p-8 transition-colors">
            <div className="w-12 h-12 bg-gray-100 dark:bg-slate-700 rounded-2xl flex items-center justify-center mb-3 transition-colors">
              <History size={20} className="text-gray-400 dark:text-kanji" />
            </div>
            <p className="text-gray-500 dark:text-kio font-bold text-sm">No hay actividad reciente</p>
            <p className="text-gray-400 dark:text-kanji text-xs mt-1">Los pacientes atendidos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-min overflow-y-auto pr-1">
            {patients.map((p) => (
              <div 
                key={p.id} 
                onClick={() => navigate(`/patients/${p.id}`)}
                className="group relative p-5 rounded-3xl bg-gray-50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-gray-100 dark:hover:border-slate-700 hover:shadow-lg dark:hover:shadow-none hover:shadow-gray-100/50 transition-all duration-300 cursor-pointer"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    navigate(`/patients/${p.id}`);
                  }
                }}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between mb-3 relative z-10">
                  {/* Initials Avatar */}
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm transition-transform group-hover:scale-110 ${p.color}`}>
                    {p.name.charAt(0).toUpperCase()}
                  </div>
                  
                  {/* Time Badge */}
                  <span className="text-[10px] font-bold text-gray-400 dark:text-kio bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full shadow-sm border border-gray-100/50 dark:border-slate-700 whitespace-nowrap transition-colors">
                    {p.time}
                  </span>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <p className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-kanji dark:group-hover:text-kio transition-colors line-clamp-1 pr-6" title={p.name}>
                    {p.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-kio font-medium line-clamp-1 group-hover:text-gray-600 dark:group-hover:text-slate-300 transition-colors" title={p.reason}>
                    {p.reason}
                  </p>
                </div>


              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
