import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Appointment } from '../../types/appointments.types';

// Placeholder components
const AppointmentPill = ({ appointment, onSelect }: any) => (
  <div onClick={() => onSelect(appointment)} className="bg-blue-100 p-2 rounded text-xs cursor-pointer mb-1">
    {appointment.patient?.fullName}
  </div>
);

interface DailyCalendarGridProps {
  selectedDay: Date;
  appointments: Appointment[];
  onSelectAppointment: (appointment: Appointment) => void;
  onSlotClick: (date: Date) => void;
  onReschedule?: (appointmentId: string, newStartTime: Date) => void;
}

const GRID_START_HOUR = 8;
const GRID_END_HOUR = 20;
const TOTAL_HOURS = GRID_END_HOUR - GRID_START_HOUR;

export function DailyCalendarGrid({ selectedDay, appointments, onSelectAppointment, onSlotClick }: DailyCalendarGridProps) {
  const hours = Array.from({ length: TOTAL_HOURS }, (_, i) => GRID_START_HOUR + i);

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-4 font-bold border-b text-center">
        {format(selectedDay, 'EEEE, d MMMM', { locale: es })}
      </div>
      <div className="relative flex-1">
         {hours.map(hour => {
           const hourDate = new Date(selectedDay);
           hourDate.setHours(hour, 0, 0, 0);

           const slotAppointments = appointments.filter(a => {
             const d = new Date(a.startTime);
             return d.getDate() === selectedDay.getDate() && 
                    d.getMonth() === selectedDay.getMonth() && 
                    d.getFullYear() === selectedDay.getFullYear() && 
                    d.getHours() === hour;
           });

           return (
             <div key={hour} className="flex border-b min-h-[5rem]">
               <div className="w-16 text-right pr-2 text-sm text-gray-500 pt-2">
                 {hour}:00
               </div>
               <div 
                 className="flex-1 p-1 hover:bg-gray-50 cursor-pointer"
                 onClick={() => onSlotClick(hourDate)}
               >
                  {slotAppointments.map(a => (
                    <AppointmentPill key={a.id} appointment={a} onSelect={onSelectAppointment} />
                  ))}
               </div>
             </div>
           );
         })}
      </div>
    </div>
  );
}
