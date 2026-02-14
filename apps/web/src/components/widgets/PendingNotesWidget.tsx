import { AlertCircle, ArrowRight } from 'lucide-react';

interface PendingNotesWidgetProps {
  count: number;
}

export function PendingNotesWidget({ count }: PendingNotesWidgetProps) {
  return (
    <div className="p-6 bg-bg padding-2 rounded-[40px] rounded-br-none rounded-bl-none rounded-tr-none">
      <div className="bg-amber-50 rounded-3xl p-6 border border-amber-100 relative overflow-hidden flex flex-col justify-between h-full shadow-[10px_10px_20px_0_rgba(0,0,0,0.1)]">

        {/* 1. Encabezado: Título y Subtítulo + Icono Flotante */}
        <div className="flex justify-between items-start z-10 relative">
          <div>
             <h3 className="text-amber-950 font-bold text-sm">Notas Pendientes</h3>
             <p className="text-amber-700/60 text-[10px] font-medium mt-1">Requieren tu revisión</p>
          </div>
          
          {/* Icono en círculo blanco para resaltar sobre el crema */}
          <div className="p-2 bg-white rounded-full text-amber-500 shadow-sm border border-amber-50">
             <AlertCircle size={18} />
          </div>
        </div>

        {/* 2. Cuerpo: Número Gigante y Botón de Acción */}
        <div className="flex items-end justify-between mt-6 z-10 relative">
           {/* Número grande alineado a la base */}
           <span className="text-6xl font-black text-amber-950 tracking-tighter leading-none -ml-1">
             {count}
           </span>
           
           {/* Botón adaptado al tema: Blanco con texto oscuro para contraste limpio */}
           <button className="bg-white text-amber-950 py-2.5 px-5 rounded-xl font-bold text-[10px] uppercase tracking-wider shadow-sm border border-amber-100 hover:bg-amber-100 hover:scale-105 transition-all flex items-center gap-2">
             Resolver <ArrowRight size={12} />
           </button>
        </div>

        {/* 3. Decoración de fondo (Opcional, para profundidad) */}
        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-amber-100/50 rounded-full blur-3xl pointer-events-none"></div>
      </div>  
    </div>
  );
}
