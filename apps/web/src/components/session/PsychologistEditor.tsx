import { useState, useEffect, useRef, type FC } from 'react';
import { useDebounce } from '../../hooks/use-debounce';
import { useUpdateNotes } from '../../hooks/use-session';

interface PsychologistEditorProps {
  appointmentId: string;
  initialNotes?: string;
}

export const PsychologistEditor: FC<PsychologistEditorProps> = ({ 
  appointmentId, 
  initialNotes = '' 
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const debouncedNotes = useDebounce(notes, 1000); // Auto-save after 1 second of inactivity
  const { mutate: saveNotes } = useUpdateNotes();
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render to avoid saving initial value immediately if it hasn't changed
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (debouncedNotes !== initialNotes) {
      saveNotes({ appointmentId, notes: debouncedNotes });
    }
  }, [debouncedNotes, appointmentId, saveNotes, initialNotes]);

  return (
    <div className="bg-gray-50 h-full p-6 flex flex-col">
       <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex-1 p-6">
         <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Notas de la Sesión</h2>
            <span className="text-xs text-gray-400">
              {notes !== debouncedNotes ? 'Escribiendo...' : 'Guardado'}
            </span>
         </div>
         <textarea 
           value={notes}
           onChange={(e) => setNotes(e.target.value)}
           className="w-full h-[calc(100%-3rem)] resize-none outline-none text-gray-700 leading-relaxed p-4 border border-gray-100 rounded-lg focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300 transition-all"
           placeholder="Escribe tus notas clínicas aquí... (Se guardarán automáticamente)"
         ></textarea>
       </div>
    </div>
  );
};
