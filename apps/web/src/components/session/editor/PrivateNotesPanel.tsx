import { Lock, ChevronRight, ChevronLeft, EyeOff } from 'lucide-react';
import TextareaAutosize from 'react-textarea-autosize';
import { useSettingsStore } from '../../../stores/settings.store';

interface PrivateNotesPanelProps {
  value: string;
  onChange: (val: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function PrivateNotesPanel({ value, onChange, isOpen, onToggle }: PrivateNotesPanelProps) {
  const { isDiscreteMode } = useSettingsStore();

  return (
    <div 
      className={`fixed right-0 top-[64px] bottom-0 z-30 flex transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-[300px]'
      }`}
    >
      {/* Toggle Tab */}
      <button
        onClick={onToggle}
        className="absolute left-[-28px] top-4 bg-amber-100 border-l border-t border-b border-amber-200 text-amber-800 p-1.5 rounded-l-lg shadow-sm hover:bg-amber-200 transition-colors flex flex-col items-center gap-1"
        title="Notas Privadas"
      >
        <Lock size={14} />
        {isOpen ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Panel Content */}
      <div className="w-[300px] h-full bg-amber-50/90 backdrop-blur-sm border-l border-amber-200 shadow-xl flex flex-col">
        <div className="p-4 border-b border-amber-200 flex items-center justify-between bg-amber-100/50">
          <div className="flex items-center gap-2 text-amber-900">
            <Lock size={16} />
            <h3 className="font-bold text-sm">Notas Privadas</h3>
          </div>
          <span className="text-[10px] uppercase font-bold text-amber-700/60 bg-amber-200/50 px-2 py-0.5 rounded-full flex items-center gap-1">
            <EyeOff size={10} />
            Encriptado
          </span>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          <TextareaAutosize
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full h-full bg-transparent resize-none outline-none text-amber-900 placeholder:text-amber-900/40 text-sm leading-relaxed ${isDiscreteMode ? 'blur-sm' : ''}`}
            placeholder="Estas notas son solo visibles para ti. Están encriptadas en la base de datos."
            minRows={10}
          />
        </div>
      </div>
    </div>
  );
}
