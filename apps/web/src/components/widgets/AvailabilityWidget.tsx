import { MoreHorizontal } from 'lucide-react';

interface AvailabilityWidgetProps {
  days: Array<{ 
    day: number; 
    density: string;
    status?: string;
    freeHours?: string[];
  }>;
}

export function AvailabilityWidget({ days }: AvailabilityWidgetProps) {
  return (
    <div className="flex-1 p-8 lg:p-10 bg-white/5">
      <div className="flex items-center justify-between mb-6 text-white/90">
        <h3 className="text-[10px] font-black uppercase tracking-widest">Disponibilidad</h3>
        <MoreHorizontal size={18} className="opacity-40" />
      </div>
      <div className="grid grid-cols-7 gap-3">
        {['L','M','M','J','V','S','D'].map((d, i) => (
           <div key={`${d}-${i}`} className="text-center text-[10px] font-bold text-white/30">{d}</div>
        ))}
        {days.slice(0, 28).map((d, i) => {
          let bgClass = 'bg-white/10 text-white/90'; // Default (free/low) - almost pure white
          
          if (d.density === 'medium') bgClass = 'bg-purple-500/40 text-white';
          if (d.density === 'high') bgClass = 'bg-purple-500/70 text-white';
          if (d.density === 'full') bgClass = 'bg-[#a855f7] text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]';

          return (
            <div key={i} className={`group relative aspect-square rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300 cursor-default ${bgClass}`}>
              {d.day}
              
              {/* ZEN TOOLTIP */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-max min-w-[100px] bg-black/60 backdrop-blur-xl text-white text-[10px] rounded-2xl p-3 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 pointer-events-none z-20 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col items-center">
                <div className="font-medium tracking-widest uppercase text-[9px] text-white/50 mb-1.5">{d.status}</div>
                
                <div className="flex flex-col gap-1 w-full">
                   {d.freeHours && d.freeHours.length > 0 ? (
                      d.freeHours.slice(0, 3).map(h => (
                        <div key={h} className="bg-white/5 rounded-md py-1 px-2 text-center text-white/90 font-medium tracking-tight hover:bg-white/10 transition-colors">
                          {h}
                        </div>
                      ))
                   ) : (
                      <div className="text-white/30 italic font-light py-1">Sin cupo</div>
                   )}
                   {d.freeHours && d.freeHours.length > 3 && (
                     <div className="text-white/40 text-[9px] mt-1 text-center font-light">+ {d.freeHours.length - 3} más</div>
                   )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
