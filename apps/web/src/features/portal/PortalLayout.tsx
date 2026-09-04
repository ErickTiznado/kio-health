import type { ReactNode } from 'react';

interface PortalLayoutProps {
  children: ReactNode;
}

/**
 * Chrome mínimo del portal del paciente — sin sidebar ni navegación del
 * clínico. Una columna, táctil, centrado en el contenido.
 *
 * La tinta secundaria del portal es `text-text/70` en claro y `slate-400` en
 * oscuro: por debajo de eso (text/40–/50, slate-500/600) el texto no llega a
 * 4.5:1 y este es el único sitio del producto que se lee en un móvil, con
 * prisa y sin haberlo usado nunca.
 */
export function PortalLayout({ children }: PortalLayoutProps) {
  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950 flex flex-col">
      <header className="bg-white dark:bg-slate-900 border-b border-cruz dark:border-slate-800">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-3">
          <img
            src="/LogoFavi.png"
            alt="Kio Health"
            className="h-8 w-8 object-contain"
          />
          <div>
            <p className="text-sm font-bold text-kanji-deep dark:text-white leading-tight">
              Kio Health
            </p>
            <p className="text-[11px] text-text/70 dark:text-slate-400">
              Portal del paciente
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto px-5 py-6">
        {children}
      </main>

      <footer className="py-6 px-5 text-center">
        <p className="text-[11px] text-text/70 dark:text-slate-400">
          Tus datos están protegidos — solo tu profesional puede ver tus
          respuestas.
        </p>
      </footer>
    </div>
  );
}
