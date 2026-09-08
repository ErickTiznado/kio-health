import { Lock, ShieldCheck } from 'lucide-react';

/**
 * Ilustraciones del producto para móvil.
 *
 * Las capturas de la landing son de una interfaz de 1440px. En un teléfono no
 * hay forma buena de enseñarlas: reducirlas deja el texto a 3px, recortarlas
 * esconde media pantalla y deslizarlas en horizontal es incómodo. Medido en un
 * móvil real, del ancho visible el 40% se iba en la barra lateral.
 *
 * Estas piezas no son capturas y no lo aparentan: no llevan barra lateral,
 * cabecera ni cromo de aplicación. Son el objeto del que habla cada paso —una
 * cita, una nota, un cobro— dibujado con los tokens del sistema a tamaño de
 * teléfono, donde sí se lee. Por eso no llevan el pie de «captura real»: no
 * afirman ser una fotografía del producto, sino su forma.
 *
 * Los nombres y cifras son de demostración, igual que en las capturas.
 */

const CARD =
  'rounded-lg border border-border bg-surface p-4 dark:border-slate-800 dark:bg-slate-900';
const LABEL =
  'text-[11px] font-bold uppercase tracking-wider text-text-secondary';

function Fila({
  hora,
  nombre,
  motivo,
  activa = false,
}: {
  hora: string;
  nombre: string;
  motivo: string;
  activa?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <span
        className={`shrink-0 rounded-xs px-2 py-1 text-[11px] font-bold tabular-nums ${
          activa
            ? 'bg-kanji-deep text-white dark:bg-kio dark:text-slate-950'
            : 'bg-secondary text-text-secondary dark:bg-slate-800'
        }`}
      >
        {hora}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-text">
          {nombre}
        </span>
        <span className="block truncate text-xs font-medium text-text-secondary">
          {motivo}
        </span>
      </span>
    </div>
  );
}

function Agenda() {
  return (
    <div className={CARD}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold text-text">Miércoles 12</span>
        <span className={LABEL}>3 citas</span>
      </div>
      <div className="mt-1 divide-y divide-border dark:divide-slate-800">
        <Fila hora="09:00" nombre="Alberta W." motivo="Sesión de seguimiento" />
        <Fila hora="11:30" nombre="Felipe D." motivo="Sesión de seguimiento" activa />
        <Fila hora="16:00" nombre="Miriam R." motivo="Cierre de fase" />
      </div>
      {/* La línea de la hora actual, que en la aplicación cruza la rejilla. */}
      <div className="mt-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-kanji-deep dark:bg-kio" />
        <span className="h-px flex-1 bg-kio" />
        <span className="text-[11px] font-bold text-kanji-deep dark:text-kio">ahora</span>
      </div>
    </div>
  );
}

function Sesion() {
  return (
    <div className={CARD}>
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-cruz text-sm font-bold text-kanji-deep dark:bg-kanji dark:text-white">
          AW
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-text">
            Alberta Wintheiser
          </span>
          <span className="block text-xs font-medium text-text-secondary">
            4.ª sesión · desde abril
          </span>
        </span>
      </div>
      <dl className="mt-4 space-y-3">
        <div>
          <dt className={LABEL}>Diagnóstico</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">
            Trastorno de ansiedad generalizada
          </dd>
        </div>
        <div>
          <dt className={LABEL}>Alergias</dt>
          <dd className="mt-0.5 text-sm font-medium text-text">
            Ninguna registrada
          </dd>
        </div>
      </dl>
      <div className="mt-4 border-t border-border pt-3 dark:border-slate-800">
        <span className={LABEL}>Estado de ánimo</span>
        <div className="mt-2 flex items-center gap-1.5">
          {Array.from({ length: 10 }, (_, i) => (
            <span
              key={i}
              className={`h-2 flex-1 rounded-full ${
                i < 6 ? 'bg-kio' : 'bg-secondary dark:bg-slate-800'
              }`}
            />
          ))}
          <span className="ml-1 text-xs font-bold tabular-nums text-text">
            6/10
          </span>
        </div>
      </div>
    </div>
  );
}

function Nota() {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between">
        <span className="rounded-xs bg-secondary px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary dark:bg-slate-800">
          SOAP
        </span>
        <span className="text-xs font-medium text-text-secondary">
          2 de agosto
        </span>
      </div>
      <p className="mt-3 text-sm font-medium leading-relaxed text-text">
        Refiere mejor descanso durante la semana. Practicó la respiración
        pautada en dos episodios de ansiedad y logró sostenerla…
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {['#sueño', '#exposición', '#tareas'].map((t) => (
          <span
            key={t}
            className="rounded-xs bg-secondary px-2 py-0.5 text-[11px] font-bold text-text-secondary dark:bg-slate-800"
          >
            {t}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-start gap-2 border-t border-border pt-3 dark:border-slate-800">
        <Lock size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-kanji-deep dark:text-kio" />
        <span className="text-xs font-medium text-text-secondary">
          Guardada cifrada. El buscador no entra aquí — a propósito.
        </span>
      </div>
    </div>
  );
}

function Cobro() {
  const filas = [
    { nombre: 'Felipe Daniel-Larkin', monto: '300.00', sesiones: '2 sesiones' },
    { nombre: 'Suzanne Jaskolski', monto: '150.00', sesiones: '1 sesión' },
    { nombre: 'Miriam Rutherford', monto: '150.00', sesiones: '1 sesión' },
  ];
  return (
    <div className={CARD}>
      <span className={LABEL}>Por cobrar</span>
      <p className="mt-1 text-2xl font-bold tabular-nums text-text">
        USD 600.00
      </p>
      <div className="mt-3 divide-y divide-border dark:divide-slate-800">
        {filas.map((f) => (
          <div key={f.nombre} className="flex items-baseline gap-3 py-2.5">
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-text">
                {f.nombre}
              </span>
              <span className="block text-xs font-medium text-text-secondary">
                {f.sesiones}
              </span>
            </span>
            <span className="shrink-0 text-sm font-bold tabular-nums text-text">
              {f.monto}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-2 border-t border-border pt-3 dark:border-slate-800">
        <ShieldCheck size={14} aria-hidden="true" className="shrink-0 text-kanji-deep dark:text-kio" />
        <span className="text-xs font-medium text-text-secondary">
          Cada cobro queda unido a la sesión que lo generó.
        </span>
      </div>
    </div>
  );
}

const POR_PASO: Record<string, () => React.JSX.Element> = {
  agenda: Agenda,
  sesion: Sesion,
  nota: Nota,
  cobro: Cobro,
};

/** Ilustración del paso indicado. Devuelve `null` si el paso no tiene una. */
export function StepVignette({ step }: { step: string }) {
  const Pieza = POR_PASO[step];
  return Pieza ? <Pieza /> : null;
}
