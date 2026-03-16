import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '../stores/auth.store';
import { completeProfile } from '../lib/auth.api';
import { toast } from 'sonner';
import { BrainCircuit, BadgeCheck, Settings2, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

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

const SESSION_DURATIONS = [25, 45, 50, 60, 90];

type FormData = {
  licenseNumber: string;
  currency: string;
  sessionDefaultDuration: number;
  sessionDefaultPrice: number;
};

const STEPS = [
  { id: 1, label: 'Especialidad', icon: BrainCircuit },
  { id: 2, label: 'Práctica', icon: BadgeCheck },
  { id: 3, label: 'Sesiones', icon: Settings2 },
];

export function OnboardingPage() {
  const navigate = useNavigate();
  const { user, logout, fetchCurrentUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      licenseNumber: '',
      currency: 'USD',
      sessionDefaultDuration: 50,
      sessionDefaultPrice: 0,
    },
  });

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  const onSubmit = handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await completeProfile({
        type: 'PSYCHOLOGIST',
        licenseNumber: data.licenseNumber || undefined,
        currency: data.currency,
        sessionDefaultDuration: Number(data.sessionDefaultDuration),
        sessionDefaultPrice: Number(data.sessionDefaultPrice),
      });
      await fetchCurrentUser();
      toast.success('¡Perfil completado! Bienvenido a Kio Health.');
      navigate('/dashboard', { replace: true });
    } catch {
      toast.error('No se pudo guardar el perfil. Intenta de nuevo.');
      setIsSubmitting(false);
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-bg via-bg to-kio/5 dark:from-slate-950 dark:via-slate-950 dark:to-kio/10 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-kio to-kanji rounded-2xl mb-4 shadow-lg shadow-kio/20">
            <span className="text-white font-bold text-xl">K</span>
          </div>
          <h1 className="text-2xl font-bold text-kanji dark:text-white">Configura tu perfil</h1>
          <p className="text-text/60 dark:text-slate-400 text-sm mt-1">
            Hola, <strong>{user?.email}</strong> — solo necesitamos unos datos para empezar.
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-0 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    step > s.id
                      ? 'bg-kio text-white'
                      : step === s.id
                        ? 'bg-kio/15 dark:bg-kio/25 text-kio ring-2 ring-kio'
                        : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-500'
                  }`}
                >
                  {step > s.id ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <s.icon size={16} />
                  )}
                </div>
                <span className={`text-xs font-medium ${step === s.id ? 'text-kio' : 'text-text/40 dark:text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-16 h-px mx-2 mb-5 transition-colors ${step > s.id ? 'bg-kio' : 'bg-gray-200 dark:bg-slate-700'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-cruz dark:border-slate-800 shadow-xl p-8">

          <form onSubmit={onSubmit}>

            {/* Step 1: Especialidad */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-kanji dark:text-white mb-1">¿Cuál es tu especialidad?</h2>
                  <p className="text-sm text-text/60 dark:text-slate-400">
                    Esto determina las herramientas y plantillas disponibles en tu cuenta.
                  </p>
                </div>

                {/* Solo PSYCHOLOGIST por ahora */}
                <button
                  type="button"
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border-2 border-kio bg-kio/5 dark:bg-kio/10 text-left transition-all"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-kio to-kanji rounded-xl flex items-center justify-center shrink-0">
                    <BrainCircuit size={22} className="text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-kanji dark:text-white">Psicólogo/a</p>
                    <p className="text-xs text-text/60 dark:text-slate-400 mt-0.5">
                      Notas SOAP, evaluaciones PHQ-9 / GAD-7, seguimiento emocional
                    </p>
                  </div>
                  <div className="ml-auto shrink-0">
                    <div className="w-5 h-5 rounded-full border-2 border-kio flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-kio" />
                    </div>
                  </div>
                </button>

                <p className="text-xs text-text/40 dark:text-slate-500 text-center">
                  Más especialidades próximamente
                </p>
              </div>
            )}

            {/* Step 2: Datos de práctica */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-kanji dark:text-white mb-1">Datos de tu práctica</h2>
                  <p className="text-sm text-text/60 dark:text-slate-400">
                    Puedes actualizar esto más tarde en Configuración.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-kanji dark:text-slate-200 mb-1.5">
                      Número de colegiatura / licencia
                      <span className="text-text/40 dark:text-slate-500 font-normal ml-1">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. PSI-12345"
                      {...register('licenseNumber')}
                      className="w-full px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text/30 dark:placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kanji dark:text-slate-200 mb-1.5">
                      Moneda de trabajo
                    </label>
                    <select
                      {...register('currency', { required: true })}
                      className="w-full px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c.code} value={c.code}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Configuración de sesiones */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-kanji dark:text-white mb-1">Configuración de sesiones</h2>
                  <p className="text-sm text-text/60 dark:text-slate-400">
                    Valores por defecto al agendar citas. Ajustables por sesión.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-kanji dark:text-slate-200 mb-2">
                      Duración por defecto (minutos)
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {SESSION_DURATIONS.map((dur) => (
                        <label key={dur} className="cursor-pointer">
                          <input
                            type="radio"
                            value={dur}
                            {...register('sessionDefaultDuration', { required: true })}
                            className="sr-only"
                          />
                          <span
                            className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                              Number(watch('sessionDefaultDuration')) === dur
                                ? 'border-kio bg-kio/10 dark:bg-kio/20 text-kio'
                                : 'border-cruz dark:border-slate-700 text-text/60 dark:text-slate-400 hover:border-kio/50'
                            }`}
                          >
                            {dur} min
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-kanji dark:text-slate-200 mb-1.5">
                      Precio por defecto ({watch('currency') || 'USD'})
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text/40 dark:text-slate-500 text-sm font-medium">
                        {watch('currency') || 'USD'}
                      </span>
                      <input
                        type="number"
                        min={0}
                        step={0.01}
                        placeholder="0.00"
                        {...register('sessionDefaultPrice', { required: true, min: 0 })}
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50 placeholder:text-text/30"
                      />
                    </div>
                    {errors.sessionDefaultPrice && (
                      <p className="text-xs text-red-500 mt-1">Ingresa un precio válido</p>
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
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-text/60 dark:text-slate-400 hover:text-kanji dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <ChevronLeft size={16} />
                  Atrás
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={() => setStep((s) => s + 1)}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-kio text-white rounded-xl text-sm font-semibold hover:bg-kio/90 transition-colors"
                >
                  Continuar
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-5 py-2.5 bg-kio text-white rounded-xl text-sm font-semibold hover:bg-kio/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      Empezar
                      <ChevronRight size={16} />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={handleLogout}
            className="text-text/40 dark:text-slate-600 hover:text-text/70 dark:hover:text-slate-400 text-xs font-medium transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}
