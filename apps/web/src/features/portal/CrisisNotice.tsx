import { useEffect, useRef } from 'react';
import { HeartHandshake, PhoneCall } from 'lucide-react';

interface CrisisNoticeProps {
  clinicianName: string;
  onClose: () => void;
}

/**
 * Pantalla de recursos tras un auto-reporte con señal de crisis (ítem 9 del
 * PHQ-9 > 0 o puntaje severo). El clínico ya fue notificado por email.
 *
 * Jerarquía deliberada: lo primero y más grande es qué hacer ahora mismo, no
 * el agradecimiento. Quien ve esta pantalla puede estar en un mal momento, en
 * un móvil y con prisa; el acuse de recibo va después.
 *
 * El texto de recursos no se edita ni se completa con teléfonos concretos: la
 * interfaz no sabe en qué país está el paciente y no puede afirmar un número.
 */
export function CrisisNotice({ clinicianName, onClose }: CrisisNoticeProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Esta tarjeta se monta entera al cambiar de estado. Una región `aria-live`
  // insertada en el DOM junto con su contenido no se anuncia de forma fiable
  // (solo se anuncian cambios DENTRO de una región ya presente), y el botón
  // Likert que tenía el foco se desmonta, dejando el foco en <body>.
  // `role="alert"` sí se anuncia al insertarse, y el foco aterriza aquí.
  useEffect(() => {
    cardRef.current?.focus();
  }, []);

  return (
    <div
      ref={cardRef}
      role="alert"
      tabIndex={-1}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-6 space-y-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-kanji-deep dark:focus-visible:ring-kio"
    >
      {/* Lo que importa ahora: el recurso de ayuda, primero y en cuerpo grande */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="w-11 h-11 rounded-xl bg-secondary dark:bg-slate-800 flex items-center justify-center shrink-0">
            <PhoneCall
              aria-hidden="true"
              className="w-5 h-5 text-kanji-deep dark:text-kio"
            />
          </span>
          <h2 className="text-lg font-bold text-text dark:text-white leading-snug">
            Si necesitas apoyo ahora mismo
          </h2>
        </div>
        <p className="text-base text-text dark:text-slate-100 leading-relaxed">
          Contacta a tu profesional directamente, acude al servicio de urgencias
          más cercano, o llama a la línea de atención en crisis de tu país. No
          tienes que pasar por esto en soledad.
        </p>
      </div>

      <div className="border-t border-border dark:border-slate-800 pt-5 space-y-2">
        <p className="flex items-center gap-2 text-sm font-bold text-text dark:text-white">
          <HeartHandshake
            aria-hidden="true"
            className="w-4 h-4 text-kanji-deep dark:text-kio shrink-0"
          />
          Gracias por responder con honestidad
        </p>
        <p className="text-sm text-text/70 dark:text-slate-400 leading-relaxed">
          Tus respuestas ya fueron enviadas y{' '}
          <strong className="text-text dark:text-white font-bold">
            {clinicianName}
          </strong>{' '}
          fue notificado para acompañarte lo antes posible.
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full min-h-11 py-3 rounded-xl bg-kanji-deep text-white text-sm font-bold hover:bg-kanji-deep/90 active:scale-[0.99] transition-all duration-150"
      >
        Entendido
      </button>
    </div>
  );
}
