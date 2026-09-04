import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import {
  AlertCircle,
  ClipboardList,
  Loader2,
  RefreshCw,
  WifiOff,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePortalStore } from '../../stores/portal.store';
import {
  getPortalSession,
  getPortalAppointments,
  getPortalScaleAssignments,
  submitPortalScale,
  type PortalScaleAssignment,
} from '../../lib/portal.api';
import { PortalLayout } from '../../features/portal/PortalLayout';
import { AppointmentList } from '../../features/portal/AppointmentList';
import { ScaleFormRunner } from '../../features/portal/ScaleFormRunner';
import { CrisisNotice } from '../../features/portal/CrisisNotice';
import { SCALE_TITLES } from '../../lib/scales.constants';

/** Un enlace caducado (401/403) es un hecho; un fallo de red no lo es. */
function isAuthError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

/**
 * Aviso de fallo con reintento. El portal nunca dice "no tienes nada" sobre
 * una petición que falló: para un paciente, "no tienes citas" cuando la
 * petición se cayó es una afirmación falsa sobre su tratamiento.
 *
 * El icono es neutro (`AlertCircle`) a propósito: la interfaz no ha
 * comprobado la conectividad, así que no puede afirmar "fallo de red" —
 * un 500 o un 401 se pintarían igual. `WifiOff` queda reservado para el
 * único caso en que sí lo sabemos: `fetchStatus === 'paused'`.
 *
 * `onRetry` es opcional: cuando el fallo es 401/403 el reintento no puede
 * funcionar, y ofrecer un botón que no arregla nada es otra afirmación falsa.
 */
function PortalError({
  title,
  detail,
  onRetry,
}: {
  title: string;
  detail: string;
  onRetry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-6 space-y-3 text-center"
    >
      <AlertCircle
        aria-hidden="true"
        className="w-7 h-7 text-text/70 dark:text-slate-400 mx-auto"
      />
      <div className="space-y-1">
        <p className="text-sm font-bold text-text dark:text-white">{title}</p>
        <p className="text-sm text-text/70 dark:text-slate-400 leading-relaxed">
          {detail}
        </p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center justify-center gap-1.5 min-h-11 px-4 rounded-xl border border-border dark:border-slate-700 text-sm font-bold text-text dark:text-slate-300 hover:border-kanji-deep hover:text-kanji-deep dark:hover:border-kio dark:hover:text-kio transition-colors"
        >
          <RefreshCw aria-hidden="true" size={14} /> Reintentar
        </button>
      )}
    </div>
  );
}

/**
 * Espera de una petición clínica. `paused` es `fetchStatus === 'paused'`: con
 * el networkMode por defecto ('online') una query sin red se queda en
 * `status: 'pending'` + `fetchStatus: 'paused'` y NUNCA sale de ahí. Sin este
 * caso, un spinner infinito afirmaría que algo está en camino cuando la
 * petición ni siquiera salió del dispositivo.
 */
function PortalPending({ label, paused }: { label: string; paused: boolean }) {
  if (paused) {
    return (
      <div
        aria-live="polite"
        className="flex flex-col items-center justify-center gap-2 py-6 text-center"
      >
        <WifiOff
          aria-hidden="true"
          className="w-6 h-6 text-text/70 dark:text-slate-400"
        />
        <p className="text-sm text-text/70 dark:text-slate-400 leading-relaxed">
          Sin conexión. Lo intentaremos en cuanto vuelvas a tener red.
        </p>
      </div>
    );
  }

  return (
    <div
      aria-live="polite"
      className="flex items-center justify-center gap-2 h-24 text-sm text-text/70 dark:text-slate-400"
    >
      <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
      {label}
    </div>
  );
}

/**
 * Portal del paciente (v1, sin cuentas).
 *
 * Bootstrap: /p/:token guarda el token en sessionStorage y hace replace a /p
 * — el token no queda en la URL navegable ni en el historial.
 */
export function PortalPage() {
  const { token: urlToken } = useParams<{ token?: string }>();
  const navigate = useNavigate();
  const { token, setToken } = usePortalStore();

  const [activeAssignment, setActiveAssignment] =
    useState<PortalScaleAssignment | null>(null);
  const [showCrisis, setShowCrisis] = useState(false);

  // Bootstrap del token desde la URL
  useEffect(() => {
    if (urlToken) {
      setToken(urlToken);
      navigate('/p', { replace: true });
    }
  }, [urlToken, setToken, navigate]);

  const hasToken = Boolean(token) && !urlToken;

  const session = useQuery({
    queryKey: ['portal', 'session'],
    queryFn: getPortalSession,
    enabled: hasToken,
    retry: false,
  });

  const appointments = useQuery({
    queryKey: ['portal', 'appointments'],
    queryFn: getPortalAppointments,
    enabled: hasToken && session.isSuccess,
  });

  const assignments = useQuery({
    queryKey: ['portal', 'scale-assignments'],
    queryFn: getPortalScaleAssignments,
    enabled: hasToken && session.isSuccess,
  });

  const queryClient = useQueryClient();
  const submitMutation = useMutation({
    mutationFn: ({ id, scores }: { id: string; scores: number[] }) =>
      submitPortalScale(id, scores),
    onSuccess: (result) => {
      setActiveAssignment(null);
      void queryClient.invalidateQueries({
        queryKey: ['portal', 'scale-assignments'],
      });
      if (result.crisis) {
        setShowCrisis(true);
      } else {
        toast.success('Respuestas enviadas. ¡Gracias!');
      }
    },
    onError: () => toast.error('No se pudieron enviar las respuestas.'),
  });

  // Cargando bootstrap o sesión.
  //
  // `isPending`, no `isLoading`: en React Query v5 `isLoading = isPending &&
  // isFetching`, así que con `navigator.onLine === false` la query queda en
  // 'pending' + 'paused' y `isLoading` es FALSE. Con `isLoading` esta guarda
  // se saltaba, `session.data` era undefined y el portal pintaba "Hola, " y
  // "no tienes citas" sobre una petición que jamás salió del dispositivo.
  if (urlToken || (hasToken && session.isPending)) {
    const paused = !urlToken && session.fetchStatus === 'paused';
    return (
      <PortalLayout>
        <div className="flex flex-col items-center justify-center gap-2 h-48 text-center">
          {paused ? (
            <>
              <WifiOff
                aria-hidden="true"
                className="w-6 h-6 text-text/70 dark:text-slate-400"
              />
              <p
                aria-live="polite"
                className="text-sm text-text/70 dark:text-slate-400 leading-relaxed max-w-xs"
              >
                Sin conexión. Abriremos tu portal en cuanto vuelvas a tener red.
              </p>
            </>
          ) : (
            <>
              <Loader2
                aria-hidden="true"
                className="w-6 h-6 animate-spin text-kanji-deep dark:text-kio"
              />
              <p
                aria-live="polite"
                className="text-sm text-text/70 dark:text-slate-400"
              >
                Abriendo tu portal…
              </p>
            </>
          )}
        </div>
      </PortalLayout>
    );
  }

  // Sin token, o token rechazado por el servidor
  if (!hasToken || (session.isError && isAuthError(session.error))) {
    return (
      <PortalLayout>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-8 text-center space-y-2">
          <p className="text-base font-bold text-kanji-deep dark:text-white">
            Enlace no válido o expirado
          </p>
          <p className="text-sm text-text/70 dark:text-slate-400">
            Pide a tu profesional que te envíe un nuevo enlace de acceso.
          </p>
        </div>
      </PortalLayout>
    );
  }

  // Falló la petición, pero el enlace puede seguir siendo válido: no lo damos
  // por caducado, que es una afirmación distinta.
  if (session.isError) {
    return (
      <PortalLayout>
        <PortalError
          title="No pudimos abrir tu portal"
          detail="No pudimos completar la petición. Tu enlace sigue siendo válido: inténtalo de nuevo en un momento."
          onRetry={() => void session.refetch()}
        />
      </PortalLayout>
    );
  }

  const data = session.data;
  // `isPending` cubre también el caso pausado (sin red): un cuestionario
  // clínico pendiente no puede desaparecer de la pantalla sin aviso.
  const showAssignmentsSection =
    assignments.isPending ||
    assignments.isError ||
    (assignments.data?.length ?? 0) > 0;

  return (
    <PortalLayout>
      <div className="space-y-6">
        {/* Saludo */}
        <div>
          <h1 className="text-xl font-bold text-kanji-deep dark:text-white">
            Hola, {data?.patientFirstName}
          </h1>
          <p className="text-sm text-text/70 dark:text-slate-400 mt-0.5">
            Espacio de acompañamiento con {data?.clinicianName}
          </p>
        </div>

        {showCrisis ? (
          <CrisisNotice
            clinicianName={data?.clinicianName ?? 'tu profesional'}
            onClose={() => setShowCrisis(false)}
          />
        ) : activeAssignment ? (
          <ScaleFormRunner
            scaleType={activeAssignment.scaleType}
            isSubmitting={submitMutation.isPending}
            onSubmit={(scores) =>
              submitMutation.mutate({ id: activeAssignment.id, scores })
            }
            onCancel={() => setActiveAssignment(null)}
          />
        ) : (
          <>
            {/* Cuestionarios pendientes */}
            {showAssignmentsSection && (
              <section className="space-y-3">
                <h2 className="text-xs font-bold text-text/70 dark:text-slate-400 uppercase tracking-wider">
                  Cuestionarios pendientes
                </h2>
                {assignments.isError ? (
                  isAuthError(assignments.error) ? (
                    <PortalError
                      title="Tu enlace de acceso caducó"
                      detail="Pide a tu profesional un enlace nuevo para ver tus cuestionarios pendientes."
                    />
                  ) : (
                    <PortalError
                      title="No pudimos cargar tus cuestionarios"
                      detail="Puede que tengas alguno pendiente. Inténtalo de nuevo en un momento."
                      onRetry={() => void assignments.refetch()}
                    />
                  )
                ) : assignments.isPending ? (
                  <PortalPending
                    label="Cargando tus cuestionarios…"
                    paused={assignments.fetchStatus === 'paused'}
                  />
                ) : (
                  assignments.data?.map((assignment) => (
                    <button
                      key={assignment.id}
                      type="button"
                      onClick={() => setActiveAssignment(assignment)}
                      className="w-full flex items-center gap-4 bg-white dark:bg-slate-900 border border-kanji-deep/30 dark:border-kio/30 rounded-2xl p-5 text-left shadow-sm hover:bg-secondary dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className="p-2.5 bg-kio-light dark:bg-kio/20 rounded-xl shrink-0">
                        <ClipboardList
                          aria-hidden="true"
                          className="w-5 h-5 text-kanji-deep dark:text-kio"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-text dark:text-white">
                          {SCALE_TITLES[assignment.scaleType]}
                        </p>
                        <p className="text-xs text-text/70 dark:text-slate-400 mt-0.5">
                          Toma menos de 3 minutos — tus respuestas ayudan a
                          preparar tu próxima sesión
                        </p>
                      </div>
                      <span className="text-sm font-bold text-kanji-deep dark:text-kio shrink-0">
                        Responder →
                      </span>
                    </button>
                  ))
                )}
              </section>
            )}

            {/* Próximas citas */}
            <section className="space-y-3">
              <h2 className="text-xs font-bold text-text/70 dark:text-slate-400 uppercase tracking-wider">
                Tus próximas citas
              </h2>
              {appointments.isError ? (
                isAuthError(appointments.error) ? (
                  <PortalError
                    title="Tu enlace de acceso caducó"
                    detail="Pide a tu profesional un enlace nuevo para ver tus próximas citas."
                  />
                ) : (
                  <PortalError
                    title="No pudimos cargar tus citas"
                    detail="No podemos confirmarte si tienes citas próximas. Inténtalo de nuevo."
                    onRetry={() => void appointments.refetch()}
                  />
                )
              ) : appointments.isPending ? (
                <PortalPending
                  label="Cargando tus citas…"
                  paused={appointments.fetchStatus === 'paused'}
                />
              ) : (
                <AppointmentList appointments={appointments.data ?? []} />
              )}
            </section>
          </>
        )}
      </div>
    </PortalLayout>
  );
}
