import { MoreHorizontal } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

interface AvailabilityWidgetProps {
  days: Array<{
    day: number;
    density: string;
    status?: string;
    freeHours?: string[];
    appointmentCount?: number;
  }>;
}

export function AvailabilityWidget({ days }: AvailabilityWidgetProps) {
  return (
    <div className="flex-1 p-6 lg:p-8 xl:p-10">
      <div className="flex items-center justify-between mb-6 text-white">
        <h3 className="text-[10px] font-black uppercase tracking-widest">Disponibilidad</h3>
        <MoreHorizontal size={18} className="opacity-60" />
      </div>
      <div className="grid grid-cols-7 gap-2 lg:gap-3">
        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
          <div key={`${d}-${i}`} className="text-center text-[10px] font-black text-white/50">{d}</div>
        ))}
        {days.slice(0, 28).map((d, i) => {
          let bgClass = 'bg-white/20 text-white'; // Default (free/low) - more visible

          if (d.density === 'medium') bgClass = 'bg-purple-400 text-white';
          if (d.density === 'high') bgClass = 'bg-purple-600 text-white';
          if (d.density === 'full') bgClass = 'bg-[#a855f7] text-white';

          const appointments = d.appointmentCount ?? 0;
          const freeSlots = Math.max(0, 6 - appointments);

          return (
            <Tooltip
              key={i}
              triggerClassName="w-full h-full"
              content={
                <div className="w-max min-w-[120px] bg-gray-900 text-white text-[10px] rounded-2xl p-4 shadow-xl flex flex-col items-center gap-2">
                  <div className="font-bold tracking-widest uppercase text-[9px] text-white/70 pb-1 w-full text-center mb-1">{d.status}</div>

                  <div className="flex flex-col gap-2 w-full">
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-white/50 font-medium">Citas:</span>
                      <span className="font-black text-white">{appointments}</span>
                    </div>
                    <div className="flex justify-between items-center gap-4">
                      <span className="text-white/50 font-medium">Libres:</span>
                      <span className="font-black text-emerald-400">{freeSlots}</span>
                    </div>
                  </div>


                </div>
              }
            >
              <div className={`group relative aspect-square rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 cursor-default ${bgClass}`}>
                {d.day}
              </div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
