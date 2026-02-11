import { useState, type FC } from 'react';
import { Bold, Italic, List, ListOrdered, FileText } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Right panel (70%) — Clean clinical note editor.
 * Pure white canvas with editable title, large textarea, and floating toolbar.
 */
export const ClinicalEditor: FC = () => {
  const todayLabel = format(new Date(), "d 'de' MMMM, yyyy", { locale: es });

  const [title, setTitle] = useState(`Nota de Evolución — ${todayLabel}`);
  const [noteContent, setNoteContent] = useState('');

  const TOOLBAR_BUTTONS = [
    { icon: <Bold size={15} />, label: 'Negrita', shortcut: 'Ctrl+B' },
    { icon: <Italic size={15} />, label: 'Cursiva', shortcut: 'Ctrl+I' },
    { icon: <List size={15} />, label: 'Lista', shortcut: 'Ctrl+U' },
    { icon: <ListOrdered size={15} />, label: 'Lista numerada', shortcut: 'Ctrl+O' },
  ] as const;

  return (
    <div className="h-full flex flex-col bg-white shadow-[-4px_0_24px_rgba(0,0,0,0.04)] relative">
      {/* ── Writing Canvas ── */}
      <div className="flex-1 overflow-y-auto px-10 py-8">
        {/* Editable Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-2xl font-bold text-gray-900 tracking-tight border-none outline-none bg-transparent placeholder:text-gray-300 mb-1"
          placeholder="Título de la nota..."
        />

        {/* Subtle date underline */}
        <div className="h-px bg-gradient-to-r from-kio/30 via-cruz/20 to-transparent mb-6" />

        {/* Rich Text Area (Simulated) */}
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Comienza a escribir tu nota clínica aquí...

• Motivo de consulta
• Evaluación del estado actual
• Intervenciones realizadas
• Plan de tratamiento
• Observaciones adicionales"
          className="w-full min-h-[60vh] text-base leading-8 text-gray-700 resize-none border-none outline-none bg-transparent placeholder:text-gray-300 placeholder:leading-8"
          style={{ fontFamily: "'Roboto', sans-serif" }}
        />
      </div>

      {/* ── Floating Toolbar ── */}
      <div className="sticky bottom-0 px-10 pb-5 pt-3">
        <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xl border border-gray-200/60 rounded-2xl shadow-lg shadow-gray-200/50 px-3 py-2 w-fit">
          {TOOLBAR_BUTTONS.map((button) => (
            <button
              key={button.label}
              type="button"
              title={`${button.label} (${button.shortcut})`}
              className="p-2.5 rounded-xl text-gray-400 hover:text-kanji hover:bg-kio-light transition-all duration-150"
            >
              {button.icon}
            </button>
          ))}

          {/* Divider */}
          <div className="w-px h-6 bg-gray-200 mx-1" />

          {/* Insert Template */}
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold text-kanji hover:bg-kio-light transition-all duration-150"
          >
            <FileText size={14} />
            Insertar Plantilla
          </button>
        </div>
      </div>
    </div>
  );
};
