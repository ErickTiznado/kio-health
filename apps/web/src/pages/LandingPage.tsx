import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  FileLock2,
  Loader2,
  Lock,
  Mail,
  NotebookPen,
  ScrollText,
  ShieldCheck,
  Wallet,
} from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';
import { useIsDark } from '../hooks/use-is-dark';
import { requestBetaAccess } from '../lib/beta.api';

// Las capturas son del producto real, tomadas con la cuenta de desarrollo.
// Los nombres, diagnósticos y notas que aparecen son datos sembrados, no
// pacientes reales — por eso el visor lo dice en pantalla.
const SHOT_W = 2000;
const SHOT_H = 1250;

interface Step {
  id: string;
  label: string;
  title: string;
  body: string;
  shot: string;
  alt: string;
  icon: typeof CalendarDays;
}

const STEPS: Step[] = [
  {
    id: 'agenda',
    label: 'Agenda',
    title: 'La semana, sin reconstruirla cada mañana',
    body: 'Vista de semana y de día, estado de cada cita y la línea de la hora actual. Las citas canceladas siguen visibles, tachadas, en vez de desaparecer del registro.',
    shot: 'agenda',
    alt: 'Agenda semanal de Kio Health con citas de lunes a domingo, cada una con hora, paciente y motivo.',
    icon: CalendarDays,
  },
  {
    id: 'sesion',
    label: 'Sesión',
    title: 'Lo que necesitas saber, antes de abrir la puerta',
    body: 'Diagnóstico, medicación y alergias del paciente a la izquierda; objetivo de la sesión y escalas clínicas a la derecha. Sin buscar en otra pantalla mientras el paciente entra.',
    shot: 'session',
    alt: 'Pantalla de preparación de sesión con diagnóstico, alergias, medicación, estado de ánimo y escalas clínicas.',
    icon: NotebookPen,
  },
  {
    id: 'nota',
    label: 'Nota clínica',
    title: 'La historia completa, cifrada',
    body: 'Notas en formato SOAP o libre, con etiquetas, anexos y exportación a PDF. El contenido de cada nota se guarda cifrado: ni la base de datos lo lee en claro.',
    shot: 'patient',
    alt: 'Historia clínica de un paciente con notas SOAP fechadas, etiquetas y opción de anexo.',
    icon: ScrollText,
  },
  {
    id: 'cobro',
    label: 'Cobro',
    title: 'El dinero cuadra sin una hoja de cálculo aparte',
    body: 'Ingresos, gastos y utilidad del mes, flujo de caja diario y desglose por método de pago. El cobro se cierra en la misma sesión que lo generó.',
    shot: 'finance',
    alt: 'Panel de finanzas con ingresos, gastos, utilidad, gráfico de flujo de caja e ingresos por método de pago.',
    icon: Wallet,
  },
];

/* ────────────────────────────────────────────────────────────────────────
   Formulario de lista de espera
   ──────────────────────────────────────────────────────────────────────── */

const waitlistSchema = z.object({
  email: z.string().min(1, 'Escribe tu correo').email('Ese correo no es válido'),
  fullName: z.string().max(120).optional(),
  practiceKind: z.enum(['INDIVIDUAL', 'CLINICA', 'OTRO']).optional(),
});

type WaitlistValues = z.infer<typeof waitlistSchema>;

function WaitlistForm({ id, compact = false }: { id: string; compact?: boolean }) {
  const [sent, setSent] = useState(false);
  const [failed, setFailed] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WaitlistValues>({ resolver: zodResolver(waitlistSchema) });

  const onSubmit = async (values: WaitlistValues) => {
    setFailed(null);
    try {
      await requestBetaAccess({
        email: values.email,
        fullName: values.fullName || undefined,
        practiceKind: values.practiceKind,
      });
      setSent(true);
    } catch (error) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      setFailed(
        status === 429
          ? 'Demasiados intentos seguidos. Prueba de nuevo en unos minutos.'
          : 'No pudimos registrar tu correo. Inténtalo otra vez en un momento.',
      );
    }
  };

  if (sent) {
    return (
      <div
        role="status"
        className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 dark:border-emerald-900/60 dark:bg-emerald-950/40"
      >
        <ShieldCheck
          size={20}
          className="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400"
        />
        <div>
          <p className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
            Estás en la lista
          </p>
          <p className="mt-1 text-sm font-medium text-emerald-800 dark:text-emerald-300">
            Te escribiremos a ese correo cuando abramos un hueco en la beta. No
            enviamos nada más.
          </p>
        </div>
      </div>
    );
  }

  const emailErrorId = `${id}-email-error`;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label
            htmlFor={`${id}-email`}
            className="sr-only"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <Mail
              size={18}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500"
            />
            <input
              id={`${id}-email`}
              type="email"
              autoComplete="email"
              placeholder="tu@consulta.com"
              aria-invalid={errors.email ? 'true' : undefined}
              aria-describedby={errors.email ? emailErrorId : undefined}
              className="w-full rounded-xl border border-gray-200 bg-white/80 py-3 pl-11 pr-4 text-sm font-medium text-text placeholder:text-gray-500 focus:border-kio focus:ring-2 focus:ring-kio/50 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
              {...register('email')}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl bg-kanji-deep px-6 py-3 text-sm font-bold text-white transition-all duration-150 hover:bg-kanji active:scale-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              Enviando
            </>
          ) : (
            <>
              Pedir acceso
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {!compact && (
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <label htmlFor={`${id}-name`} className="sr-only">
              Nombre (opcional)
            </label>
            <input
              id={`${id}-name`}
              type="text"
              autoComplete="name"
              placeholder="Nombre (opcional)"
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm font-medium text-text placeholder:text-gray-500 focus:border-kio focus:ring-2 focus:ring-kio/50 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400"
              {...register('fullName')}
            />
          </div>
          <div className="flex-1">
            <label htmlFor={`${id}-kind`} className="sr-only">
              Tipo de práctica (opcional)
            </label>
            <select
              id={`${id}-kind`}
              defaultValue=""
              className="w-full rounded-xl border border-gray-200 bg-white/80 px-4 py-3 text-sm font-medium text-text-secondary focus:border-kio focus:ring-2 focus:ring-kio/50 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              {...register('practiceKind')}
            >
              <option value="">Tipo de práctica (opcional)</option>
              <option value="INDIVIDUAL">Consulta privada</option>
              <option value="CLINICA">Clínica con varios profesionales</option>
              <option value="OTRO">Otro</option>
            </select>
          </div>
        </div>
      )}

      {errors.email && (
        <p
          id={emailErrorId}
          role="alert"
          className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          {errors.email.message}
        </p>
      )}
      {failed && (
        <p
          role="alert"
          className="mt-2 text-xs font-medium text-rose-600 dark:text-rose-400"
        >
          {failed}
        </p>
      )}
      <p className="mt-3 text-xs font-medium text-text-secondary">
        Solo guardamos tu correo para avisarte. Kio Health está en beta cerrada.
      </p>
    </form>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   El visor: la captura real que el visitante conduce
   ──────────────────────────────────────────────────────────────────────── */

const AUTO_ADVANCE_MS = 7000;

function Visor() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [interacted, setInteracted] = useState(false);
  const reduceMotion = useReducedMotion();
  const isDark = useIsDark();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    if (paused || interacted || reduceMotion) return;
    const timer = window.setTimeout(
      () => setActive((i) => (i + 1) % STEPS.length),
      AUTO_ADVANCE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, paused, interacted, reduceMotion]);

  // Flechas para moverse entre pasos, como espera un tablist.
  const onKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    event.preventDefault();
    setInteracted(true);
    setActive((i) => {
      const next =
        event.key === 'ArrowRight'
          ? (i + 1) % STEPS.length
          : (i - 1 + STEPS.length) % STEPS.length;
      tabRefs.current[next]?.focus();
      return next;
    });
  }, []);

  const step = STEPS[active];
  const theme = isDark ? 'dark' : 'light';

  return (
    <div
      // Sin `min-w-0` el hijo de 760px ensancha la columna de la rejilla y la
      // página entera desborda en horizontal en móvil.
      className="min-w-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      // En táctil no hay hover: sin esto la captura cambiaba sola mientras el
      // visitante la desplazaba con el dedo, y le reiniciaba el desplazamiento.
      // Quien ya está conduciendo el visor no necesita que avance solo.
      onTouchStart={() => setInteracted(true)}
    >
      {/* En móvil la captura se reduciría a un cuarto de su tamaño y el texto
          de la aplicación sería ilegible: por debajo de `sm` se muestra a
          tamaño usable y se desplaza en horizontal. */}
      {/* No es un tablist: el riel va visualmente ENTRE la captura y su texto,
          y un tabpanel no puede partirse en dos. Botones con `aria-pressed`
          sobre una región `live` describen lo que de verdad ocurre. */}
      <div
        id="visor-panel"
        aria-live="polite"
        className="overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200 bg-white shadow-sm shot-rail dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          className="relative w-[760px] max-w-none sm:w-full"
          style={{ aspectRatio: `${SHOT_W} / ${SHOT_H}` }}
        >
          <AnimatePresence mode="sync">
            <motion.img
              key={`${step.shot}-${theme}`}
              src={`/landing/${step.shot}-${theme}.webp`}
              alt={step.alt}
              width={SHOT_W}
              height={SHOT_H}
              // Las cuatro son la promesa central de la página: ninguna puede
              // llegar tarde ni quedarse como un recuadro vacío.
              loading="eager"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover object-top"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            />
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
        Captura real · datos de demostración
        <span className="sm:hidden"> · desliza para verla completa</span>
      </p>

      <div
        role="group"
        aria-label="Pasos del ciclo de una sesión"
        onKeyDown={onKeyDown}
        className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4"
      >
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const selected = i === active;
          return (
            <button
              key={s.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              aria-pressed={selected}
              aria-controls="visor-panel"
              onClick={() => {
                setActive(i);
                setInteracted(true);
              }}
              className={`flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-bold transition-all duration-150 ${
                selected
                  ? 'border-transparent bg-kio-light text-kanji-deep dark:bg-kio/10 dark:text-kio'
                  : 'border-gray-200 text-text-secondary hover:border-gray-300 hover:text-kanji dark:border-slate-800 dark:hover:border-slate-700 dark:hover:text-kio'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="mt-5 max-w-[68ch]">
        <h2 className="text-lg font-bold text-text">{step.title}</h2>
        <p className="mt-2 text-base font-medium leading-7 text-text-secondary">
          {step.body}
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Bloque de sección con captura
   ──────────────────────────────────────────────────────────────────────── */

function ShotSection({
  shot,
  alt,
  reversed = false,
  children,
}: {
  shot: string;
  alt: string;
  reversed?: boolean;
  children: React.ReactNode;
}) {
  const isDark = useIsDark();
  return (
    <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
      <div className={reversed ? 'lg:order-2' : undefined}>{children}</div>
      <div className={`min-w-0 ${reversed ? 'lg:order-1' : ''}`}>
        <div className="shot-rail overflow-x-auto overflow-y-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <img
            src={`/landing/${shot}-${isDark ? 'dark' : 'light'}.webp`}
            alt={alt}
            width={SHOT_W}
            height={SHOT_H}
            // Sin `lazy` y con descodificación síncrona: son la prueba del
            // producto, y un recuadro vacío bajo el pie «captura real» dice
            // justo lo contrario de lo que promete. Con `decoding="async"` la
            // imagen llegaba completa pero sin pintar. Pesan ~60 KB en WebP.
            decoding="sync"
            className="w-[760px] max-w-none sm:w-full"
          />
        </div>
        <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
          Captura real · datos de demostración
        </p>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Página
   ──────────────────────────────────────────────────────────────────────── */

export function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text dark:bg-slate-950 dark:text-slate-100">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold dark:focus:bg-slate-900"
      >
        Saltar al contenido
      </a>

      <header className="sticky top-0 z-40 border-b border-gray-200 bg-bg dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <span className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="h-8 w-8 object-contain"
            />
            {/* El propio logo.png ya dice «Kio»: el texto solo pone «Health»,
                igual que la cabecera de la aplicación. */}
            <span className="text-base font-bold">Health</span>
            <span className="sr-only">Kio Health</span>
          </span>
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            <Link
              to="/login"
              className="rounded-xl px-3 py-2 text-sm font-bold text-text-secondary transition-colors duration-150 hover:text-kanji-deep dark:hover:text-kio"
            >
              Iniciar sesión
            </Link>
            <a
              href="#lista-de-espera"
              className="hidden rounded-xl bg-kanji-deep px-4 py-2 text-sm font-bold text-white transition-all duration-150 hover:bg-kanji active:scale-95 sm:inline-block"
            >
              Pedir acceso
            </a>
          </div>
        </div>
      </header>

      <main id="contenido">
        {/* ── Primer viewport: el visor conduce la página ──────────────── */}
        <section className="mx-auto max-w-6xl px-4 pb-16 pt-12 sm:px-6 sm:pt-16">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
            <div className="min-w-0 self-center">
              <h1 className="max-w-[16ch] text-4xl font-bold leading-[1.08] tracking-[-0.03em] sm:text-5xl">
                Agenda, sesión, nota y cobro son{' '}
                <span className="text-kanji-deep dark:text-kio">
                  un solo recorrido
                </span>
              </h1>
              <p className="mt-5 max-w-[46ch] text-base font-medium leading-7 text-text-secondary">
                Kio Health es la plataforma de gestión clínica para psicólogos.
                Agendas, preparas la sesión, documentas y cobras en el mismo
                sitio — y lo que escribes sobre un paciente se guarda cifrado.
              </p>
              <div className="mt-7">
                <WaitlistForm id="hero" compact />
              </div>
              <p className="mt-6 flex items-center gap-2 text-xs font-medium text-text-secondary">
                <Lock size={14} aria-hidden="true" />
                Notas y datos de contacto cifrados con AES-256-GCM
              </p>
            </div>

            <div className="min-w-0 self-center">
              <Visor />
            </div>
          </div>
        </section>

        {/* ── Confidencialidad ─────────────────────────────────────────── */}
        <section className="border-t border-gray-200 dark:border-slate-800">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <ShotSection
              shot="patients"
              alt="Listado de pacientes de Kio Health mostrando nombre, estado y fecha de alta, sin campos clínicos."
            >
              <h2 className="text-2xl font-bold tracking-tight">
                El listado no puede buscar por diagnóstico. A propósito.
              </h2>
              <p className="mt-4 max-w-[62ch] text-base font-medium leading-7 text-text-secondary">
                El diagnóstico, el contexto clínico, el teléfono, el contacto de
                emergencia, la medicación, las alergias y el contenido de las
                notas se guardan cifrados con AES-256-GCM. Eso tiene una
                consecuencia que preferimos enseñar antes que esconder: si un
                dato está cifrado, la base de datos tampoco puede filtrarlo ni
                ordenarlo. El listado muestra lo que de verdad es consultable.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  {
                    icon: FileLock2,
                    text: 'Cifrado autenticado: una nota manipulada falla al descifrarse en vez de devolver basura.',
                  },
                  {
                    icon: ShieldCheck,
                    text: 'Cada consulta lleva la identidad del clínico: una ficha ajena no se devuelve, no es que se oculte.',
                  },
                  {
                    icon: ScrollText,
                    text: 'Registro de accesos: queda escrito quién abrió y exportó qué.',
                  },
                ].map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <Icon
                      size={18}
                      aria-hidden="true"
                      className="mt-0.5 shrink-0 text-kanji-deep dark:text-kio"
                    />
                    <span className="text-base font-medium leading-7 text-text-secondary">
                      {text}
                    </span>
                  </li>
                ))}
              </ul>
            </ShotSection>
          </div>
        </section>

        {/* ── El día ───────────────────────────────────────────────────── */}
        <section className="border-t border-gray-200 dark:border-slate-800">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <ShotSection
              reversed
              shot="dashboard"
              alt="Dashboard de Kio Health con la próxima sesión, disponibilidad del mes y agenda del día."
            >
              <h2 className="text-2xl font-bold tracking-tight">
                Quién entra ahora, y qué quedó pendiente
              </h2>
              <p className="mt-4 max-w-[62ch] text-base font-medium leading-7 text-text-secondary">
                La pantalla de inicio responde a la pregunta que se hace un
                psicólogo entre sesión y sesión: quién viene, dentro de cuánto y
                con qué contexto. Debajo, las notas sin cerrar y las banderas de
                riesgo abiertas, para que no se descubran una semana tarde.
              </p>
              <p className="mt-4 max-w-[62ch] text-base font-medium leading-7 text-text-secondary">
                Cuando una consulta falla, el widget lo dice y ofrece
                reintentar. No dice «agenda despejada»: afirmar que un día está
                libre cuando en realidad no se pudo leer sería mentir sobre la
                agenda de un paciente.
              </p>
            </ShotSection>
          </div>
        </section>

        {/* ── Hecho para psicología ────────────────────────────────────── */}
        <section className="border-t border-gray-200 dark:border-slate-800">
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="max-w-[62ch]">
              <h2 className="text-2xl font-bold tracking-tight">
                No es un CRM médico con las etiquetas cambiadas
              </h2>
              <p className="mt-4 text-base font-medium leading-7 text-text-secondary">
                El vocabulario y las piezas son las de la práctica clínica en
                psicología, no las de una consulta médica genérica.
              </p>
            </div>

            {/* Lista de definición, no seis tarjetas iguales: cada término
                pesa distinto y el texto manda sobre el contenedor. */}
            <dl className="mt-10 divide-y divide-gray-200 border-t border-gray-200 dark:divide-slate-800 dark:border-slate-800">
              {[
                {
                  title: 'Escalas clínicas',
                  body: 'Se aplican y se siguen dentro de la propia sesión, con el histórico del paciente al lado.',
                },
                {
                  title: 'Banderas de riesgo',
                  body: 'Marcadas sobre el paciente y visibles desde el inicio, no enterradas en una nota de hace tres meses.',
                },
                {
                  title: 'Addendums',
                  body: 'Una nota firmada no se reescribe: se le añade un anexo fechado, como exige el registro clínico.',
                },
                {
                  title: 'Portal de paciente',
                  body: 'El paciente confirma la cita y rellena escalas desde el móvil, por enlace, sin crear cuenta ni recordar contraseña.',
                },
                {
                  title: 'Clínicas y roles',
                  body: 'Varios profesionales bajo una misma clínica, con permisos de propietario, administrador y miembro.',
                },
                {
                  title: 'Series de citas',
                  body: 'La cita semanal se programa una vez y se gestiona como serie, no como veinte citas sueltas.',
                },
              ].map(({ title, body }) => (
                <div
                  key={title}
                  className="grid gap-1 py-5 sm:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] sm:gap-12"
                >
                  <dt className="text-base font-bold">{title}</dt>
                  <dd className="max-w-[64ch] text-base font-medium leading-7 text-text-secondary">
                    {body}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        {/* ── Cierre ───────────────────────────────────────────────────── */}
        <section
          id="lista-de-espera"
          className="scroll-mt-20 border-t border-gray-200 dark:border-slate-800"
        >
          <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
            <div className="rounded-2xl border border-gray-200 bg-white px-6 py-10 shadow-sm sm:px-10 dark:border-slate-800 dark:bg-slate-900">
              <div className="max-w-[52ch]">
                <h2 className="text-2xl font-bold tracking-tight">
                  Kio Health está en beta cerrada
                </h2>
                <p className="mt-4 text-base font-medium leading-7 text-text-secondary">
                  Todavía no abrimos el registro libre. Déjanos tu correo y te
                  avisamos cuando haya sitio. Si ya tienes una invitación,{' '}
                  <Link
                    to="/login"
                    className="font-bold text-kanji-deep underline underline-offset-4 dark:text-kio"
                  >
                    entra por aquí
                  </Link>
                  .
                </p>
              </div>
              <div className="mt-8 max-w-2xl">
                <WaitlistForm id="cierre" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 dark:border-slate-800">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span className="flex items-center gap-2 text-sm font-medium text-text-secondary">
            <img
              src="/logo.png"
              alt=""
              aria-hidden="true"
              className="h-6 w-6 object-contain"
            />
            Health
          </span>
          <p className="text-xs font-medium text-text-secondary">
            Las capturas son de la aplicación real, con datos de demostración.
            Ningún paciente real aparece en esta página.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-sm font-bold text-text-secondary transition-colors duration-150 hover:text-kanji-deep dark:hover:text-kio"
          >
            Iniciar sesión
            <ChevronRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
