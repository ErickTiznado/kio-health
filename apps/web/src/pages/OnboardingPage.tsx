import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../stores/auth.store';
import { completeProfile } from '../lib/auth.api';
import { capture } from '../lib/analytics';
import type { OnboardingStepName } from '../lib/analytics.events';
import { toast } from 'sonner';
import {
  BrainCircuit,
  BadgeCheck,
  Settings2,
  Check,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Gift,
} from 'lucide-react';

const CURRENCIES = [
  { code: 'USD', label: 'USD — Dólar estadounidense' },
  { code: 'MXN', label: 'MXN — Peso mexicano' },
  { code: 'COP', label: 'COP — Peso colombiano' },
  { code: 'ARS', label: 'ARS — Peso argentino' },
  { code: 'PEN', label: 'PEN — Sol peruano' },
  { code: 'CLP', label: 'CLP — Peso chileno' },
  { code: 'BRL', label: 'BRL — Real brasileño' },
  { code: 'EUR', label: 'EUR — Euro' },
];

const COUNTRIES = [
  { code: 'SV', label: '🇸🇻 El Salvador', currency: 'USD' },
  { code: 'MX', label: '🇲🇽 México', currency: 'MXN' },
  { code: 'CO', label: '🇨🇴 Colombia', currency: 'COP' },
  { code: 'AR', label: '🇦🇷 Argentina', currency: 'ARS' },
  { code: 'PE', label: '🇵🇪 Perú', currency: 'PEN' },
  { code: 'CL', label: '🇨🇱 Chile', currency: 'CLP' },
  { code: 'BR', label: '🇧🇷 Brasil', currency: 'BRL' },
  { code: 'ES', label: '🇪🇸 España', currency: 'EUR' },
  { code: 'US', label: '🇺🇸 Estados Unidos', currency: 'USD' },
  { code: 'GT', label: '🇬🇹 Guatemala', currency: 'USD' },
  { code: 'HN', label: '🇭🇳 Honduras', currency: 'USD' },
  { code: 'NI', label: '🇳🇮 Nicaragua', currency: 'USD' },
  { code: 'CR', label: '🇨🇷 Costa Rica', currency: 'USD' },
  { code: 'PA', label: '🇵🇦 Panamá', currency: 'USD' },
  { code: 'EC', label: '🇪🇨 Ecuador', currency: 'USD' },
  { code: 'VE', label: '🇻🇪 Venezuela', currency: 'USD' },
  { code: 'DO', label: '🇩🇴 Rep. Dominicana', currency: 'USD' },
  { code: 'OTHER', label: '🌍 Otro', currency: 'USD' },
];

const VALID_CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [string, ...string[]];

const SESSION_DURATIONS = [25, 45, 50, 60, 90];

const onboardingSchema = z.object({
  licenseNumber: z.string().optional(),
  currency: z.enum(VALID_CURRENCY_CODES, { errorMap: () => ({ message: 'Selecciona una moneda válida' }) }),
  sessionDefaultDuration: z.coerce
    .number()
    .min(15, 'Mínimo 15 minutos')
    .max(180, 'Máximo 180 minutos'),
  sessionDefaultPrice: z.coerce
    .number()
    .min(0, 'El precio no puede ser negativo')
    .max(99999, 'El precio no puede superar 99,999'),
});

type FormData = z.infer<typeof onboardingSchema>;

const SESSION_STORAGE_KEY = 'kio-onboarding-draft';

function loadDraft(): Partial<FormData> {
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    // Validate draft with the schema (partial) — discard if invalid to avoid
    // a corrupted draft silently blocking form submission
    const result = onboardingSchema.partial().safeParse(parsed);
    return result.success ? result.data : {};
  } catch {
    return {};
  }
}

/**
 * Dos pasos, no tres. El antiguo paso 1 ("¿Cuál es tu especialidad?") era una
 * decisión falsa: un único botón ya seleccionado, imposible de deseleccionar,
 * seguido de "Continuar". El perfil siempre se crea como `PSYCHOLOGIST`, así
 * que el hecho se enuncia en la cabecera en vez de disfrazarse de elección.
 */
const STEPS = [
  { id: 1, label: 'Práctica', icon: BadgeCheck },
  { id: 2, label: 'Sesiones', icon: Settings2 },
];

const LAST_STEP = STEPS.length;

/** Nombre estable por paso: el número solo no sobrevive a un reordenamiento. */
const STEP_EVENT_NAMES: Record<number, OnboardingStepName> = {
  1: 'practica',
  2: 'sesiones',
};

/** Qué campo pertenece a qué paso, para saltar al primero que falló. */
const STEP_FIELDS: Record<number, string[]> = {
  1: ['currency', 'licenseNumber'],
  2: ['sessionDefaultDuration', 'sessionDefaultPrice'],
};

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, logout, fetchCurrentUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('SV');

  // loadDraft only once on mount — useRef prevents re-reading every render
  const draftRef = useRef(loadDraft());
  const draft = draftRef.current;

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      licenseNumber: draft.licenseNumber ?? '',
      currency: draft.currency ?? 'USD',
      sessionDefaultDuration: draft.sessionDefaultDuration ?? 50,
      sessionDefaultPrice: draft.sessionDefaultPrice ?? 0,
    },
  });

  // Registrar cada paso es lo que convierte "creo que el onboarding es largo"
  // en "el 60% se cae en el paso 2". El abandono se deduce: visto el paso N y
  // nunca `onboarding_completed`.
  useEffect(() => {
    capture('onboarding_step_viewed', { step, step_name: STEP_EVENT_NAMES[step] });
  }, [step]);

  // Persist form state to sessionStorage using subscription (avoids object-ref churn)
  useEffect(() => {
    const subscription = watch((values) => {
      try {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(values));
      } catch {
        // sessionStorage may be unavailable (private mode, quota exceeded)
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleLogout = async () => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    await logout();
    navigate('/login', { replace: true });
  };

  const onSubmit = handleSubmit(
    async (data) => {
      setIsSubmitting(true);
      try {
        await completeProfile({
          type: 'PSYCHOLOGIST',
          licenseNumber: data.licenseNumber || undefined,
          currency: data.currency,
          sessionDefaultDuration: Number(data.sessionDefaultDuration),
          sessionDefaultPrice: Number(data.sessionDefaultPrice),
        });
        capture('onboarding_completed', {
          currency: data.currency,
          has_license: Boolean(data.licenseNumber),
          session_duration_minutes: Number(data.sessionDefaultDuration),
          price_left_at_zero: Number(data.sessionDefaultPrice) === 0,
        });

        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        await fetchCurrentUser();
        toast.success('¡Perfil completado! Bienvenido a Kio Health.');
        navigate('/dashboard', { replace: true });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error desconocido';
        toast.error(`No se pudo guardar el perfil: ${msg}`);
        setIsSubmitting(false);
      }
    },
    // Called when Zod validation fails — go to the first step with an error
    (validationErrors) => {
      const fields = Object.keys(validationErrors);
      for (let s = 1; s <= LAST_STEP; s++) {
        if (STEP_FIELDS[s].some((f) => fields.includes(f))) {
          setStep(s);
          toast.error('Por favor completa todos los campos requeridos.');
          return;
        }
      }
      toast.error('Por favor completa todos los campos requeridos.');
    },
  );

  return (
    <div className="min-h-screen bg-bg dark:bg-slate-950 flex items-center justify-center px-4 py-8">
      <div className="max-w-lg w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-44 h-44 rounded-2xl mb-4 overflow-hidden">
            <img src="/logo.png" alt="Kio Health" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-kanji-deep dark:text-white">Configura tu perfil</h1>
          <p className="mt-1 text-sm font-medium text-text-secondary">
            Hola, <strong className="font-bold text-text dark:text-slate-200">{user?.fullName || user?.email?.split('@')[0]}</strong> — solo necesitamos unos datos para empezar.
          </p>

          <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-cruz bg-surface px-3.5 py-1.5 dark:border-slate-700 dark:bg-slate-900">
            <Gift size={14} className="text-kanji-deep dark:text-kio" aria-hidden="true" />
            <p className="text-xs font-bold tracking-wide text-kanji-deep dark:text-kio">
              15 días gratis · sin tarjeta
            </p>
          </div>

          {/* El tipo de cuenta no es una elección: se enuncia. */}
          <p className="mx-auto mt-3 flex max-w-sm items-start justify-center gap-1.5 text-xs font-medium text-text-secondary">
            <BrainCircuit size={14} className="mt-0.5 shrink-0 text-kanji-deep dark:text-kio" aria-hidden="true" />
            <span>
              Tu cuenta se configura como psicólogo/a: notas SOAP, escalas PHQ-9 y GAD-7 y
              seguimiento emocional.
            </span>
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  aria-current={step === s.id ? 'step' : undefined}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                    step > s.id
                      ? 'bg-kanji-deep text-white'
                      : step === s.id
                        ? 'bg-kio-light/40 dark:bg-kio/25 text-kanji-deep dark:text-kio ring-2 ring-kio'
                        : 'bg-secondary dark:bg-slate-800 text-text-secondary'
                  }`}
                >
                  {step > s.id ? (
                    <Check size={16} aria-hidden="true" />
                  ) : (
                    <s.icon size={16} aria-hidden="true" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    step === s.id
                      ? 'text-kanji-deep dark:text-kio'
                      : 'text-gray-600 dark:text-slate-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden="true"
                  className={`w-16 h-px mx-2 mb-5 transition-colors ${
                    step > s.id ? 'bg-kanji-deep dark:bg-kio' : 'bg-border dark:bg-slate-700'
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-6 sm:p-8">

          <form onSubmit={onSubmit}>

            {/* Paso 1: Datos de práctica */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-kanji-deep dark:text-white mb-1">Datos de tu práctica</h2>
                  <p className="text-sm font-medium text-text-secondary">
                    Puedes actualizar esto más tarde en Configuración.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="country"
                      className="block text-sm font-medium text-text dark:text-slate-200 mb-1.5"
                    >
                      País
                    </label>
                    <select
                      id="country"
                      value={selectedCountry}
                      onChange={(e) => {
                        setSelectedCountry(e.target.value);
                        const country = COUNTRIES.find((c) => c.code === e.target.value);
                        if (country) setValue('currency', country.currency);
                      }}
                      className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="licenseNumber"
                      className="block text-sm font-medium text-text dark:text-slate-200 mb-1.5"
                    >
                      Número de colegiatura / licencia
                      <span className="text-text-secondary font-normal ml-1">(opcional)</span>
                    </label>
                    <input
                      id="licenseNumber"
                      type="text"
                      placeholder="Ej. PSI-12345"
                      {...register('licenseNumber')}
                      className="w-full min-h-11 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text-muted dark:placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-text dark:text-slate-200 mb-1.5"
                    >
                      Moneda de trabajo
                    </label>
                    <select
                      id="currency"
                      aria-invalid={errors.currency ? true : undefined}
                      aria-describedby={errors.currency ? 'currency-error' : undefined}
                      {...register('currency', { required: true })}
                      className={`w-full min-h-11 px-4 py-2.5 rounded-xl border bg-bg dark:bg-slate-800 text-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50 ${
                        errors.currency ? 'border-red-400' : 'border-cruz dark:border-slate-700'
                      }`}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                    {errors.currency && (
                      <p id="currency-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                        {errors.currency.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Paso 2: Configuración de sesiones */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-kanji-deep dark:text-white mb-1">Configuración de sesiones</h2>
                  <p className="text-sm font-medium text-text-secondary">
                    Valores por defecto al agendar citas. Ajustables por sesión.
                  </p>
                </div>

                <div className="space-y-4">
                  <fieldset>
                    <legend className="block text-sm font-medium text-text dark:text-slate-200 mb-2">
                      Duración por defecto (minutos)
                    </legend>
                    <div
                      className="flex gap-2 flex-wrap"
                      aria-describedby={errors.sessionDefaultDuration ? 'duration-error' : undefined}
                    >
                      {SESSION_DURATIONS.map((dur) => (
                        <label key={dur} className="cursor-pointer">
                          <input
                            type="radio"
                            value={dur}
                            {...register('sessionDefaultDuration', { required: true })}
                            className="peer sr-only"
                          />
                          <span
                            className={`inline-flex min-h-11 items-center px-4 py-2 rounded-xl text-sm font-medium border-2 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-kio peer-focus-visible:ring-offset-2 dark:peer-focus-visible:ring-offset-slate-900 ${
                              Number(watch('sessionDefaultDuration')) === dur
                                ? 'border-kio bg-kio-light/40 dark:bg-kio/20 text-kanji-deep dark:text-kio'
                                : 'border-cruz dark:border-slate-700 text-text-secondary hover:border-kio/50'
                            }`}
                          >
                            {dur} min
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.sessionDefaultDuration && (
                      <p id="duration-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                        {errors.sessionDefaultDuration.message}
                      </p>
                    )}
                  </fieldset>

                  <div>
                    <label
                      htmlFor="sessionDefaultPrice"
                      className="block text-sm font-medium text-text dark:text-slate-200 mb-1.5"
                    >
                      Precio por defecto ({watch('currency') || 'USD'})
                    </label>
                    <div className="relative">
                      <span
                        aria-hidden="true"
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary text-sm font-medium"
                      >
                        {watch('currency') || 'USD'}
                      </span>
                      <input
                        id="sessionDefaultPrice"
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        aria-invalid={errors.sessionDefaultPrice ? true : undefined}
                        aria-describedby={errors.sessionDefaultPrice ? 'price-error' : undefined}
                        {...register('sessionDefaultPrice', { required: true, min: 0 })}
                        className={`w-full min-h-11 pl-14 pr-4 py-2.5 rounded-xl border bg-bg dark:bg-slate-800 text-text dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text-muted ${
                          errors.sessionDefaultPrice
                            ? 'border-red-400'
                            : 'border-cruz dark:border-slate-700'
                        }`}
                      />
                    </div>
                    {errors.sessionDefaultPrice && (
                      <p id="price-error" className="mt-1 text-xs font-medium text-red-600 dark:text-red-400">
                        {errors.sessionDefaultPrice.message ?? 'Ingresa un precio válido'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-cruz/60 dark:border-slate-800">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s - 1)}
                  className="flex min-h-11 items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-text dark:hover:text-white hover:bg-secondary dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  Atrás
                </button>
              ) : (
                <div />
              )}

              {step < LAST_STEP ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="flex min-h-11 items-center gap-1.5 px-5 py-2.5 bg-kanji-deep text-white rounded-xl text-sm font-bold shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 transition-colors duration-150"
                >
                  Continuar
                  <ChevronRight size={16} aria-hidden="true" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-11 items-center gap-2 px-5 py-2.5 bg-kanji-deep text-white rounded-xl text-sm font-bold shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 transition-colors duration-150 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Empezar
                      <ChevronRight size={16} aria-hidden="true" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex min-h-11 items-center rounded-xl px-3 text-xs font-medium text-text-secondary hover:text-text dark:hover:text-slate-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
