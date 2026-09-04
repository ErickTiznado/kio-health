import { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Building2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  LogIn,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth.store';
import { useAcceptInvitation, useRegisterFromInvitation } from '../hooks/use-clinics';
import { validateToken } from '../lib/clinics.api';
import { getErrorMessage } from '../lib/errors';
import type { ClinicRole, InvitationPreview } from '../types/clinic.types';

const ROLE_LABELS: Record<ClinicRole, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  MEMBER: 'Miembro',
};

/**
 * Mismo listón que `RegisterFromInvitationDto` en el backend (y que
 * `signupSchema`): 8 caracteres, una mayúscula y un dígito. Escrito aquí para
 * que el invitado vea el requisito antes de enviar, no como un 400 después.
 */
const registerSchema = z.object({
  fullName: z.string().trim().min(1, 'Tu nombre completo es requerido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/(?=.*[A-Z])/, 'Debe contener al menos una letra mayúscula')
    .regex(/(?=.*\d)/, 'Debe contener al menos un número'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

/** El código HTTP, cuando lo hay: 409 y 404 significan cosas distintas aquí. */
function httpStatus(error: unknown): number | null {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    return typeof status === 'number' ? status : null;
  }
  return null;
}

const PRIMARY_BUTTON =
  'inline-flex w-full min-h-11 items-center justify-center gap-2 rounded-xl bg-kanji-deep px-4 py-3 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100';

const FIELD_LABEL =
  'block text-[11px] font-bold uppercase tracking-wider text-text/50 dark:text-slate-500';

const FIELD_INPUT =
  'w-full min-h-11 rounded-xl border bg-bg px-4 py-2.5 text-sm font-medium text-kanji transition-colors duration-150 placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-kio/50 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500';

/**
 * Aceptación de una invitación a clínica (`/join/:token`).
 *
 * Esta pantalla era un callejón sin salida para el caso más común: rebotaba a
 * `/login` a cualquiera que no tuviera sesión, y quien no tiene cuenta en Kio
 * no puede iniciar sesión. Retirado el formulario de alta con contraseña del
 * propietario, el colega nuevo se quedaba sin ningún camino de entrada.
 *
 * `GET /clinics/join` devuelve ahora `hasAccount`, y es el interruptor: sin
 * cuenta se crea aquí mismo (`POST /clinics/join/register`, la contraseña la
 * elige y la conoce solo el invitado); con cuenta se inicia sesión y se canjea
 * (`POST /clinics/join`). El correo no se pide nunca: lo fija la invitación y
 * aquí solo se enseña.
 */
export default function InvitationAcceptPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  /**
   * El token es un secreto de un solo uso y de 48 horas: no entra en la caché
   * de React Query. Estado local, con una recarga explícita para el 409 de
   * "ya existe una cuenta con este correo", que deja la vista desactualizada.
   */
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [switchedToLogin, setSwitchedToLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const acceptMutation = useAcceptInvitation();
  const registerMutation = useRegisterFromInvitation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', password: '' },
  });

  const loadPreview = useCallback(async () => {
    if (!token) {
      setLoadError('Este enlace no lleva ningún token de invitación.');
      setIsValidating(false);
      return null;
    }
    setIsValidating(true);
    try {
      const data = await validateToken(token);
      setPreview(data);
      setLoadError(null);
      return data;
    } catch (error) {
      setPreview(null);
      setLoadError(
        getErrorMessage(error, 'Esta invitación no es válida o ya expiró.'),
      );
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [token]);

  useEffect(() => {
    void loadPreview();
  }, [loadPreview]);

  const onRegister = async (data: RegisterFormData) => {
    if (!token) return;
    setFormError(null);
    try {
      const result = await registerMutation.mutateAsync({
        token,
        fullName: data.fullName,
        password: data.password,
      });
      if (result.loggedIn) {
        // Esta cuenta nace con perfil clínico (se crea en la misma transacción
        // que la membresía), así que `/onboarding` le daría 409 al completar
        // perfil. Va siempre al panel.
        navigate('/dashboard', { replace: true });
      }
      // Si el alta funcionó pero el login no, la cuenta ya existe: se lo
      // decimos abajo en vez de invitarle a repetir un alta que daría 404.
    } catch (error) {
      const message = getErrorMessage(
        error,
        'No pudimos crear tu cuenta. Intenta de nuevo.',
      );
      const status = httpStatus(error);
      // Solo estos dos dicen que la vista está desactualizada: 409 porque ese
      // correo estrenó cuenta entre medias (o la invitación perdió la carrera
      // del canje), 404 porque el token dejó de valer. Un 400 o un 429 no
      // cambian el estado de la invitación, así que el formulario se queda.
      if (status === 409 || status === 404) {
        const refreshed = await loadPreview();
        if (refreshed?.hasAccount) {
          setSwitchedToLogin(true);
          setFormError(null);
          return;
        }
        if (!refreshed) return;
      }
      setFormError(message);
    }
  };

  const handleAccept = async () => {
    if (!token) return;
    setFormError(null);
    try {
      await acceptMutation.mutateAsync(token);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      setFormError(
        getErrorMessage(error, 'No pudimos aceptar la invitación. Intenta de nuevo.'),
      );
    }
  };

  const expiresLabel = preview
    ? format(parseISO(preview.expiresAt), "d 'de' MMMM 'a las' HH:mm", { locale: es })
    : null;

  const roleLabel = preview ? ROLE_LABELS[preview.invitedRole] : null;

  /**
   * `OWNER` no se puede canjear: el backend lo rechaza con 403 tanto al
   * aceptar como al registrarse. Una invitación antigua con ese rol sigue
   * viva en la base de datos, y ofrecer un botón que siempre falla sería
   * prometer algo que el producto no sostiene.
   */
  const roleIsGrantable = preview ? preview.invitedRole !== 'OWNER' : false;

  /**
   * Con sesión abierta, el único clínico al que el backend puede atar la
   * invitación es el de esa sesión: ofrecer "crea tu cuenta" aquí crearía una
   * segunda cuenta y tiraría la sesión activa. Por eso la sesión manda sobre
   * `hasAccount`, y se dice para qué correo se emitió el enlace.
   */
  const showRegisterForm = !isAuthenticated && preview !== null && !preview.hasAccount;
  const emailMismatch =
    isAuthenticated && preview !== null && !!user?.email && user.email !== preview.invitedEmail;

  const accountCreatedNotLoggedIn =
    registerMutation.isSuccess && registerMutation.data?.loggedIn === false;

  /**
   * El `navigate` a /dashboard va en el mismo tick que el éxito, pero el
   * render intermedio existe: sin este estado la tarjeta parpadeaba enseñando
   * de nuevo "Aceptar invitación" justo después de haberla aceptado.
   */
  const joined =
    acceptMutation.isSuccess ||
    (registerMutation.isSuccess && registerMutation.data?.loggedIn === true);

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-cruz bg-surface p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-kio/10 dark:bg-kio/20">
            <Building2
              className="h-8 w-8 text-kanji-deep dark:text-kio"
              aria-hidden="true"
            />
          </div>

          {isValidating ? (
            <>
              <Loader2 className="mb-4 h-8 w-8 animate-spin text-kanji-deep dark:text-kio" aria-hidden="true" />
              <p className="text-sm font-medium text-text/60 dark:text-slate-400">
                Validando invitación…
              </p>
            </>
          ) : loadError || !preview ? (
            /* El error va antes que cualquier otra cosa: decir "ya te uniste" o
               pintar un formulario sobre una petición fallida sería afirmar algo
               que no sabemos. */
            <div role="alert" className="flex flex-col items-center">
              <AlertCircle
                className="mb-4 h-8 w-8 text-rose-600 dark:text-rose-400"
                aria-hidden="true"
              />
              <h1 className="mb-2 text-xl font-bold text-kanji dark:text-white">
                Invitación no válida
              </h1>
              <p className="text-sm font-medium text-text/60 dark:text-slate-400">
                {loadError ?? 'Esta invitación no es válida o ya expiró.'}
              </p>
              <p className="mt-3 text-xs text-text/50 dark:text-slate-500">
                Los enlaces caducan a las 48 horas y solo sirven una vez. Pídele
                uno nuevo a quien te invitó.
              </p>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-xl font-bold text-kanji dark:text-white">
                Invitación a clínica
              </h1>
              <p className="mb-4 text-sm font-medium text-text/60 dark:text-slate-400">
                Te han invitado a unirte a{' '}
                <span className="font-bold text-kanji-deep dark:text-kio">
                  {preview.clinicName}
                </span>{' '}
                como{' '}
                <span className="font-bold text-kanji dark:text-white">{roleLabel}</span>.
              </p>

              {/* El correo es dato fijo de la invitación, no un campo. Visible
                  porque el invitado necesita saber con qué dirección entra. */}
              <dl className="mb-6 w-full space-y-2 rounded-xl border border-cruz bg-bg/60 px-4 py-3 text-left dark:border-slate-800 dark:bg-slate-800/50">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <dt className={FIELD_LABEL}>Correo</dt>
                  <dd className="min-w-0 truncate text-sm font-medium text-kanji dark:text-white">
                    {preview.invitedEmail}
                  </dd>
                </div>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <dt className={FIELD_LABEL}>Válida hasta</dt>
                  <dd className="text-sm font-medium text-kanji dark:text-white">
                    {expiresLabel}
                  </dd>
                </div>
              </dl>

              {!roleIsGrantable ? (
                <div
                  role="alert"
                  className="w-full rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-left dark:border-amber-800 dark:bg-amber-950/20"
                >
                  <p className="flex items-start gap-2 text-sm font-bold text-amber-950 dark:text-amber-100">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    Esta invitación no se puede canjear
                  </p>
                  <p className="mt-1 text-xs font-medium text-amber-900/80 dark:text-amber-200/80">
                    La propiedad de la clínica no se concede por invitación.
                    Pídele a quien te invitó un enlace como administrador o como
                    miembro.
                  </p>
                </div>
              ) : joined ? (
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 size={20} aria-hidden="true" />
                  <span className="text-sm font-bold">
                    Te has unido a {preview.clinicName}
                  </span>
                </div>
              ) : accountCreatedNotLoggedIn ? (
                /* El alta sí ocurrió; lo que falló fue abrir la sesión. Repetir
                   el alta daría 404 porque el token ya se canjeó, así que lo
                   honesto es mandarle a iniciar sesión. */
                <div className="w-full text-left">
                  <p className="flex items-start gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                    Tu cuenta ya está creada
                  </p>
                  <p className="mt-1 mb-4 text-sm font-medium text-text/60 dark:text-slate-400">
                    Ya formas parte de {preview.clinicName}, pero no pudimos
                    abrirte la sesión automáticamente. Entra con{' '}
                    <span className="font-bold text-kanji dark:text-white">
                      {preview.invitedEmail}
                    </span>{' '}
                    y la contraseña que acabas de elegir.
                  </p>
                  <Link to="/login" className={PRIMARY_BUTTON}>
                    <LogIn size={16} aria-hidden="true" />
                    Iniciar sesión
                  </Link>
                </div>
              ) : showRegisterForm ? (
                <form
                  onSubmit={(e) => {
                    void handleSubmit(onRegister)(e).catch(() => {});
                  }}
                  className="w-full space-y-4 text-left"
                >
                  <p className="text-sm font-medium text-text/60 dark:text-slate-400">
                    Aún no tienes cuenta en Kio. Créala aquí para entrar: la
                    contraseña la eliges tú y nadie más la conoce, tampoco quien
                    te invitó.
                  </p>

                  <div className="space-y-1.5">
                    <label htmlFor="fullName" className={FIELD_LABEL}>
                      Nombre completo
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      autoComplete="name"
                      placeholder="Ana Ruiz"
                      aria-invalid={errors.fullName ? 'true' : 'false'}
                      aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                      {...register('fullName')}
                      className={`${FIELD_INPUT} ${
                        errors.fullName
                          ? 'border-rose-400 dark:border-rose-500'
                          : 'border-cruz dark:border-slate-700'
                      }`}
                    />
                    {errors.fullName && (
                      <p
                        id="fullName-error"
                        className="text-xs font-medium text-rose-600 dark:text-rose-400"
                      >
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="password" className={FIELD_LABEL}>
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        placeholder="Mínimo 8 caracteres"
                        aria-invalid={errors.password ? 'true' : 'false'}
                        aria-describedby={
                          errors.password ? 'password-error' : 'password-hint'
                        }
                        {...register('password')}
                        className={`${FIELD_INPUT} pr-14 ${
                          errors.password
                            ? 'border-rose-400 dark:border-rose-500'
                            : 'border-cruz dark:border-slate-700'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        aria-label={
                          showPassword ? 'Ocultar la contraseña' : 'Mostrar la contraseña'
                        }
                        className="absolute inset-y-0 right-0 inline-flex min-h-11 min-w-11 items-center justify-center rounded-r-xl text-text/50 transition-colors duration-150 hover:text-kanji dark:text-slate-400 dark:hover:text-white"
                      >
                        {showPassword ? (
                          <EyeOff size={16} aria-hidden="true" />
                        ) : (
                          <Eye size={16} aria-hidden="true" />
                        )}
                      </button>
                    </div>
                    {errors.password ? (
                      <p
                        id="password-error"
                        className="text-xs font-medium text-rose-600 dark:text-rose-400"
                      >
                        {errors.password.message}
                      </p>
                    ) : (
                      <p
                        id="password-hint"
                        className="text-xs font-medium text-text/50 dark:text-slate-500"
                      >
                        Al menos 8 caracteres, con una mayúscula y un número.
                      </p>
                    )}
                  </div>

                  {formError && (
                    <p
                      role="alert"
                      className="text-sm font-medium text-rose-600 dark:text-rose-400"
                    >
                      {formError}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={registerMutation.isPending}
                    className={PRIMARY_BUTTON}
                  >
                    {registerMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Building2 size={16} aria-hidden="true" />
                    )}
                    Crear cuenta y unirme
                  </button>
                </form>
              ) : !isAuthenticated ? (
                /* Ya tiene cuenta: no se le ofrece crear otra. */
                <div className="w-full text-left">
                  {switchedToLogin && (
                    <p
                      role="alert"
                      className="mb-3 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
                    >
                      Ese correo ya tiene una cuenta en Kio, así que no hace falta
                      crear otra.
                    </p>
                  )}
                  <p className="mb-4 text-sm font-medium text-text/60 dark:text-slate-400">
                    Ya tienes cuenta en Kio. Inicia sesión con{' '}
                    <span className="font-bold text-kanji dark:text-white">
                      {preview.invitedEmail}
                    </span>{' '}
                    y vuelve a abrir este enlace para unirte. Sigue siendo válido
                    hasta el {expiresLabel}.
                  </p>
                  <Link
                    to={`/login?redirect=${encodeURIComponent(`/join/${token ?? ''}`)}`}
                    className={PRIMARY_BUTTON}
                  >
                    <LogIn size={16} aria-hidden="true" />
                    Iniciar sesión
                  </Link>
                </div>
              ) : (
                /* Con sesión abierta: canje directo contra el clínico de la
                   sesión, que es el único al que el backend puede atarlo. */
                <div className="w-full text-left">
                  {emailMismatch && (
                    <p
                      role="alert"
                      className="mb-3 rounded-xl border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
                    >
                      La invitación se emitió para {preview.invitedEmail} y tu
                      sesión es la de {user?.email}. Vas a unirte con esta sesión.
                      Si el enlace no es para ti, cierra sesión antes de aceptar.
                    </p>
                  )}

                  {formError && (
                    <p
                      role="alert"
                      className="mb-3 text-sm font-medium text-rose-600 dark:text-rose-400"
                    >
                      {formError}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={() => void handleAccept()}
                    disabled={acceptMutation.isPending}
                    className={PRIMARY_BUTTON}
                  >
                    {acceptMutation.isPending ? (
                      <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    ) : (
                      <Building2 size={16} aria-hidden="true" />
                    )}
                    Aceptar invitación
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
