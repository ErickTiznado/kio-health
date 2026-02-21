import {
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  CheckSquare,
  FileDown,
  Copy,
  PenTool,
  LayoutTemplate,
  Type
} from 'lucide-react';
import { NoteTemplateType } from '../../../types/appointments.types';

interface EditorToolboxProps {
  onTemplateChange: (type: NoteTemplateType) => void;
  onExport: () => void;
  onCopy: () => void;
  currentTemplate: NoteTemplateType;
}

export function EditorToolbox({ onTemplateChange, onExport, onCopy, currentTemplate }: EditorToolboxProps) {

  const handleDragStart = (e: React.DragEvent, tool: any) => {
    e.dataTransfer.setData('text/plain', tool.value);
    e.dataTransfer.setData('block-type', tool.type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const tools = [
    { icon: Heading1, label: 'Título Grande', value: '# ', type: 'h1', color: 'text-blue-500' },
    { icon: Heading2, label: 'Subtítulo', value: '## ', type: 'h2', color: 'text-blue-400' },
    { icon: Type, label: 'Texto', value: '', type: 'paragraph', color: 'text-gray-500' },
    { icon: List, label: 'Lista Puntos', value: '- ', type: 'bullet-list', color: 'text-indigo-500' },
    { icon: ListOrdered, label: 'Lista Num.', value: '1. ', type: 'number-list', color: 'text-indigo-400' },
    { icon: CheckSquare, label: 'Tarea', value: '- [ ] ', type: 'check-list', color: 'text-emerald-500' },
    { icon: Quote, label: 'Cita', value: '> ', type: 'quote', color: 'text-amber-500' },
  ];

  return (
    <div className="w-64 h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 flex flex-col overflow-y-auto">
      <div className="p-4 border-b border-gray-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-4">Bloques</h3>

        <div className="grid grid-cols-2 gap-2">
          {tools.map((tool) => (
            <div
              key={tool.label}
              draggable
              onDragStart={(e) => handleDragStart(e, tool)}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-gray-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 border border-transparent hover:border-gray-200 dark:hover:border-slate-600 hover:shadow-md transition-all cursor-grab active:cursor-grabbing group"
            >
              <tool.icon size={20} className={`${tool.color} mb-2 group-hover:scale-110 transition-transform`} />
              <span className="text-[10px] font-bold text-gray-600 dark:text-slate-300 text-center">{tool.label}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-3">Arrastra para insertar</p>
      </div>

      <div className="p-4 border-b border-gray-100 dark:border-slate-800">
        <h3 className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Plantillas</h3>
        <div className="space-y-2">
          <button
            onClick={() => onTemplateChange(NoteTemplateType.FREE)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTemplate === NoteTemplateType.FREE
              ? 'bg-kio/10 text-kanji dark:text-kio border border-kio/20'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
          >
            <PenTool size={16} />
            Nota Libre
          </button>
          <button
            onClick={() => onTemplateChange(NoteTemplateType.SOAP)}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${currentTemplate === NoteTemplateType.SOAP
              ? 'bg-kio/10 text-kanji dark:text-kio border border-kio/20'
              : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
              }`}
          >
            <LayoutTemplate size={16} />
            SOAP Estándar
          </button>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
        <button
          onClick={onCopy}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors border border-gray-200 dark:border-slate-700 hover:border-gray-300"
        >
          <Copy size={16} />
          <span className="text-sm font-bold">Copiar Todo</span>
        </button>
        <button
          onClick={onExport}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-white bg-kanji hover:bg-kio transition-colors shadow-sm"
        >
          <FileDown size={16} />
          <span className="text-sm font-bold">Exportar PDF</span>
        </button>
      </div>
    </div>
  );
}
