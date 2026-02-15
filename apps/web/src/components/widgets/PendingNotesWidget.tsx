import { AlertCircle, ArrowRight, CheckCircle2, History } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PendingNotesWidgetProps {
  count: number;
}

export function PendingNotesWidget({ count }: PendingNotesWidgetProps) {
  const navigate = useNavigate();
  const hasPending = count > 0;

  // Configuration for visual states
  const theme = hasPending ? {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    title: 'text-amber-950 dark:text-amber-100',
    subtitle: 'text-amber-800/60 dark:text-amber-200/60',
    iconBg: 'bg-white dark:bg-amber-900/40 text-amber-500 dark:text-amber-400',
    number: 'text-amber-950 dark:text-amber-50',
    button: 'bg-white dark:bg-amber-900/40 text-amber-950 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/60',
    accent: 'bg-amber-100/50 dark:bg-amber-600/10'
  } : {
    bg: 'bg-emerald-50 dark:bg-emerald-950/20',
    title: 'text-emerald-950 dark:text-emerald-100',
    subtitle: 'text-emerald-800/60 dark:text-emerald-200/60',
    iconBg: 'bg-white dark:bg-emerald-900/40 text-emerald-500 dark:text-emerald-400',
    number: 'text-emerald-950 dark:text-emerald-50',
    button: 'bg-white dark:bg-emerald-900/40 text-emerald-950 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/60',
    accent: 'bg-emerald-100/50 dark:bg-emerald-600/10'
  };

  return (
    <div className="p-4 lg:p-6 bg-bg padding-2 rounded-[40px] rounded-br-none rounded-bl-none rounded-tr-none transition-colors duration-200">
      <div className={`${theme.bg} rounded-3xl p-4 lg:p-6 relative overflow-hidden flex flex-col justify-between h-full transition-all duration-300`}>

        {/* 1. Encabezado: Título y Subtítulo + Icono Flotante */}
        <div className="flex justify-between items-start z-10 relative">
          <div>
             <h3 className={`${theme.title} font-bold text-sm transition-colors`}>
               {hasPending ? 'Notas Pendientes' : 'Todo al día'}
             </h3>
             <p className={`${theme.subtitle} text-[10px] font-medium mt-1 transition-colors`}>
               {hasPending ? 'Requieren tu revisión' : 'No hay notas pendientes'}
             </p>
          </div>
          
          <div className={`p-2 rounded-full ${theme.iconBg} transition-all`}>
             {hasPending ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          </div>
        </div>

        {/* 2. Cuerpo: Número Gigante y Botón de Acción */}
        <div className="flex items-end justify-between mt-6 z-10 relative">
           {/* Número grande alineado a la base */}
           <span className={`text-6xl font-black ${theme.number} tracking-tighter leading-none -ml-1 transition-colors`}>
             {count}
           </span>
           
           {/* Botón de Acción */}
           <button 
             onClick={() => navigate(hasPending ? '/agenda' : '/bitacora')} // Navigate to where action is needed
             className={`${theme.button} py-2.5 px-5 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all flex items-center gap-2 hover:scale-105 active:scale-95`}
           >
             {hasPending ? (
               <>Resolver <ArrowRight size={12} /></>
             ) : (
               <>Historial <History size={12} /></>
             )}
           </button>
        </div>

        {/* 3. Decoración de fondo */}
        <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${theme.accent} rounded-full blur-3xl pointer-events-none transition-colors duration-500`}></div>
      </div>  
    </div>
  );
}
