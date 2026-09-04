import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useTrial } from '../hooks/use-trial';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import { settingsSchema, type SettingsFormData } from '../schemas/settings.schema';
import { api } from '../lib/api';
import { confirmAction } from '../lib/confirm-action';
import { useCreateClinic, useLeaveClinic } from '../hooks/use-clinics';
import {
  Settings,
  CheckCircle2,
  XCircle,
  Mail,
  Shield,
  FileText,
  CreditCard,
  Clock,
  Loader2,
  Building2,
  ExternalLink,
  Compass,
  BellRing,
  Plug,
} from 'lucide-react';
import { useTourStore } from '../stores/tour.store';
import { RemindersSettingsCard } from '../components/settings/RemindersSettingsCard';

/**
 * Ajustes eran cinco regiones sin etiquetar en un solo scroll: nada decía que
 * "Mi clínica" o "Integraciones" existían bajo el pliegue. Este raíl de anclas
 * es el índice de la página.
 */
const SECTIONS = [
  { id: 'sesion', label: 'Sesión', icon: Clock },
  { id: 'recordatorios', label: 'Recordatorios', icon: BellRing },
  { id: 'clinica', label: 'Mi clínica', icon: Building2 },
  { id: 'integraciones', label: 'Integraciones', icon: Plug },
  { id: 'cuenta', label: 'Cuenta', icon: Shield },
  { id: 'ayuda', label: 'Ayuda', icon: Compass },
];

/** El enum crudo (`CLINICIAN`) se imprimía tal cual en "Rol del sistema". */
const SYSTEM_ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Administrador de la plataforma',
  CLINICIAN: 'Profesional clínico',
};

const CLINIC_ROLE_LABELS: Record<string, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  MEMBER: 'Miembro',
};

/** Botón destructivo del sistema: rose en reposo, relleno solo en hover. */
const DANGER_BUTTON =
  'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors duration-150 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 disabled:cursor-not-allowed';

export function SettingsPage() {
  const trial = useTrial();
  const { user, fetchCurrentUser } = useAuthStore();
  const { resetTour, startTour } = useTourStore();
  const [clinicName, setClinicName] = useState('');
  const createClinicMutation = useCreateClinic();
  const leaveClinicMutation = useLeaveClinic();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isGoogleBusy, setIsGoogleBusy] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      currency: user?.profile?.currency || 'USD',
      sessionDefaultPrice: user?.profile?.sessionDefaultPrice || 0,
      sessionDefaultDuration: user?.profile?.sessionDefaultDuration || 50,
    },
  });

  const selectedCurrency = watch('currency') || user?.profile?.currency || 'USD';

  useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    [],
  );

  const updateProfileMutation = useMutation({
    mutationFn: async (data: SettingsFormData) => {
      const response = await api.patch('/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMessage('Preferencias de sesión guardadas');
      void fetchCurrentUser();
      if (successTimer.current) clearTimeout(successTimer.current);
      successTimer.current = setTimeout(() => setSuccessMessage(null), 3000);
    },
  });

  const onSubmit = (data: SettingsFormData) => {
    setSuccessMessage(null);
    updateProfileMutation.mutate(data);
  };

  const handleLeaveClinic = async () => {
    const confirmed = await confirmAction({
      title: '¿Abandonar la clínica?',
      description:
        'Perderás el acceso a la agenda y a los pacientes compartidos de la clínica. Tus propios pacientes y notas siguen siendo tuyos. Solo el propietario puede volver a invitarte.',
      confirmLabel: 'Abandonar clínica',
      variant: 'danger',
    });
    if (confirmed) leaveClinicMutation.mutate();
  };

  const handleDisconnectGoogle = async () => {
    const confirmed = await confirmAction({
      title: '¿Desconectar Google Calendar?',
      description:
        'Tus citas de Kio dejarán de sincronizarse con tu calendario de Google. Puedes volver a conectarlo cuando quieras.',
      confirmLabel: 'Desconectar',
      variant: 'danger',
    });
    if (!confirmed) return;

    setIsGoogleBusy(true);
    try {
      await api.delete('/integrations/google/disconnect');
      await fetchCurrentUser();
      toast.success('Google Calendar desconectado');
    } catch {
      // Antes esto moría en un console.error: el usuario no veía absolutamente
      // nada y creía que seguía conectado (o desconectado) sin saberlo.
      toast.error('No pudimos desconectar Google Calendar. Intenta de nuevo.');
    } finally {
      setIsGoogleBusy(false);
    }
  };

  const handleConnectGoogle = async () => {
    setIsGoogleBusy(true);
    try {
      const res = await api.get<{ url: string }>('/integrations/google/auth');
      window.location.href = res.data.url;
    } catch {
      toast.error('No pudimos iniciar la conexión con Google. Intenta de nuevo.');
      setIsGoogleBusy(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto pb-12">
        {/* Page Header */}
        <div className="mb-6 flex items-center space-x-3">
          <div className="p-2.5 bg-kio/10 dark:bg-kio/20 rounded-xl">
            {/* El púrpura legible sobre lino es kanji-deep; `kio` como tinta
                sobre claro mide 2.2:1. */}
            <Settings
              className="w-6 h-6 text-kanji-deep dark:text-kio"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-kanji dark:text-white">Configuración</h1>
            <p className="text-text/60 dark:text-slate-400 text-sm mt-0.5">
              Personaliza tu perfil y preferencias de sesión
            </p>
          </div>
        </div>

        {/* Índice de secciones */}
        <nav aria-label="Secciones de configuración" className="mb-8">
          <ul className="flex flex-wrap gap-2">
            {SECTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-cruz dark:border-slate-700 bg-surface dark:bg-slate-900 px-3 text-sm font-medium text-gray-600 dark:text-slate-300 transition-colors duration-150 hover:border-kio hover:text-kanji-deep dark:hover:text-white"
                >
                  <Icon size={15} aria-hidden="true" />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Settings Form */}
          <div className="lg:col-span-2 space-y-6">
            <section
              id="sesion"
              aria-labelledby="sesion-title"
              className="scroll-mt-24 bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="border-b border-cruz dark:border-slate-800 px-6 py-5">
                <h2
                  id="sesion-title"
                  className="text-lg font-semibold text-kanji dark:text-white flex items-center gap-2"
                >
                  <Clock size={18} aria-hidden="true" />
                  Preferencias de sesión
                </h2>
                <p className="text-sm text-text/60 dark:text-slate-400 mt-1">
                  Configura los valores predeterminados para tus nuevas citas
                </p>
              </div>

              <div className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Currency */}
                  <div className="space-y-2">
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-kanji dark:text-slate-300"
                    >
                      Moneda
                    </label>
                    <div className="relative">
                      <select
                        id="currency"
                        aria-invalid={errors.currency ? 'true' : 'false'}
                        aria-describedby={errors.currency ? 'currency-error' : undefined}
                        {...register('currency')}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all appearance-none cursor-pointer"
                      >
                        <option value="USD">USD - Dólar estadounidense</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="MXN">MXN - Peso mexicano</option>
                        <option value="COP">COP - Peso colombiano</option>
                        <option value="ARS">ARS - Peso argentino</option>
                        <option value="CLP">CLP - Peso chileno</option>
                        <option value="PEN">PEN - Sol peruano</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-text/40 dark:text-slate-500">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </div>
                    </div>
                    {errors.currency && (
                      <p
                        id="currency-error"
                        className="text-sm text-rose-600 dark:text-rose-400 font-medium"
                      >
                        {errors.currency.message}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Session Price */}
                    <div className="space-y-2">
                      <label
                        htmlFor="sessionDefaultPrice"
                        className="block text-sm font-medium text-kanji dark:text-slate-300"
                      >
                        Precio por sesión ({selectedCurrency})
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <CreditCard className="h-4 w-4 text-text/40 dark:text-slate-500" aria-hidden="true" />
                        </div>
                        <input
                          id="sessionDefaultPrice"
                          type="number"
                          step="0.01"
                          min="0"
                          aria-invalid={errors.sessionDefaultPrice ? 'true' : 'false'}
                          aria-describedby={
                            errors.sessionDefaultPrice ? 'sessionDefaultPrice-error' : undefined
                          }
                          {...register('sessionDefaultPrice', { valueAsNumber: true })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all"
                          placeholder="100.00"
                        />
                      </div>
                      {errors.sessionDefaultPrice && (
                        <p
                          id="sessionDefaultPrice-error"
                          className="text-sm text-rose-600 dark:text-rose-400 font-medium"
                        >
                          {errors.sessionDefaultPrice.message}
                        </p>
                      )}
                    </div>

                    {/* Session Duration */}
                    <div className="space-y-2">
                      <label
                        htmlFor="sessionDefaultDuration"
                        className="block text-sm font-medium text-kanji dark:text-slate-300"
                      >
                        Duración (minutos)
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <Clock className="h-4 w-4 text-text/40 dark:text-slate-500" aria-hidden="true" />
                        </div>
                        <input
                          id="sessionDefaultDuration"
                          type="number"
                          min="15"
                          max="180"
                          aria-invalid={errors.sessionDefaultDuration ? 'true' : 'false'}
                          aria-describedby={
                            errors.sessionDefaultDuration
                              ? 'sessionDefaultDuration-error'
                              : undefined
                          }
                          {...register('sessionDefaultDuration', { valueAsNumber: true })}
                          className="w-full pl-11 pr-4 py-3 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white placeholder:text-text/40 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:border-kio transition-all"
                          placeholder="50"
                        />
                      </div>
                      {errors.sessionDefaultDuration && (
                        <p
                          id="sessionDefaultDuration-error"
                          className="text-sm text-rose-600 dark:text-rose-400 font-medium"
                        >
                          {errors.sessionDefaultDuration.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Feedback Messages */}
                  {successMessage && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <p className="text-sm font-medium">{successMessage}</p>
                    </div>
                  )}

                  {updateProfileMutation.isError && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400">
                      <XCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
                      <p className="text-sm font-medium">Error al guardar la configuración. Intenta de nuevo.</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
                    <button
                      type="submit"
                      disabled={isSubmitting || updateProfileMutation.isPending}
                      className="w-full sm:w-auto flex min-h-11 items-center justify-center gap-2 px-8 py-3 bg-kanji-deep text-white font-bold rounded-xl shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 focus:outline-none focus:ring-2 focus:ring-kio/50 focus:ring-offset-2 dark:focus:ring-offset-slate-900 transition-all duration-150 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
                          Guardando…
                        </>
                      ) : (
                        'Guardar preferencias de sesión'
                      )}
                    </button>
                    {/* Cada tarjeta guarda lo suyo: quien cambiaba las dos y
                        pulsaba un solo botón perdía la otra sin aviso. */}
                    <p className="text-xs text-text/50 dark:text-slate-500">
                      Solo guarda esta tarjeta. Recordatorios se guarda aparte.
                    </p>
                  </div>
                </form>
              </div>
            </section>

            {/* Reminders Section */}
            <RemindersSettingsCard />

            {/* Clinic Section */}
            <section
              id="clinica"
              aria-labelledby="clinica-title"
              className="scroll-mt-24 bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="border-b border-cruz dark:border-slate-800 px-6 py-5">
                <h2
                  id="clinica-title"
                  className="text-lg font-semibold text-kanji dark:text-white flex items-center gap-2"
                >
                  <Building2 size={18} aria-hidden="true" />
                  Mi clínica
                </h2>
              </div>
              <div className="p-6">
                {/* Único caso cerrado: prueba terminada, sin plan de clínica y
                    sin pertenecer ya a una. `profile.plan` aparece solo como
                    salida (plan CLINIC abre la sección), no como el candado: lo
                    que cierra es `trial.isExpired`, y la tarjeta lleva su propio
                    enlace a /plan. Quien sigue en prueba ve la sección completa,
                    haya marcado lo que haya marcado en el onboarding. */}
                {trial.isExpired && user?.profile?.plan !== 'CLINIC' && !user?.clinicId ? (
                  <div className="flex items-start gap-4 p-4 rounded-xl border border-cruz dark:border-slate-700 bg-bg/50 dark:bg-slate-800/50">
                    <div className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-lg shrink-0">
                      <Building2 size={18} className="text-text/40 dark:text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-kanji dark:text-white mb-1">Clínicas y equipos</p>
                      <p className="text-sm text-text/60 dark:text-slate-400">
                        Tu prueba terminó. Elige un plan para crear una clínica e invitar a tu equipo.
                      </p>
                      <Link
                        to="/plan"
                        className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-kanji-deep px-4 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95"
                      >
                        Elegir plan
                      </Link>
                    </div>
                  </div>
                ) : !user?.clinicId ? (
                  <div className="space-y-3">
                    <p className="text-sm text-text/60 dark:text-slate-400">
                      No perteneces a ninguna clínica. Crea una para gestionar tu equipo.
                    </p>
                    <div className="flex gap-3">
                      <label htmlFor="clinicName" className="sr-only">
                        Nombre de tu clínica
                      </label>
                      <input
                        id="clinicName"
                        type="text"
                        value={clinicName}
                        onChange={(e) => setClinicName(e.target.value)}
                        placeholder="Nombre de tu clínica"
                        className="flex-1 min-h-11 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                      />
                      <button
                        type="button"
                        disabled={!clinicName.trim() || createClinicMutation.isPending}
                        onClick={() => createClinicMutation.mutate({ name: clinicName.trim() })}
                        className="flex min-h-11 items-center gap-2 px-4 py-2.5 bg-kanji-deep text-white rounded-xl text-sm font-bold shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 transition-all duration-150 active:scale-95 disabled:opacity-70"
                      >
                        {createClinicMutation.isPending ? (
                          <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                        ) : (
                          <Building2 size={14} aria-hidden="true" />
                        )}
                        Crear
                      </button>
                    </div>
                  </div>
                ) : user.clinicRole === 'MEMBER' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-text/60 dark:text-slate-400">
                      Perteneces a una clínica como{' '}
                      <span className="font-medium text-kanji dark:text-white">miembro</span>.
                    </p>
                    {/* Era un enlace de texto plano en la misma fila que la
                        prosa: un clic accidental y se perdía el acceso a la
                        clínica sin vuelta atrás. */}
                    <button
                      type="button"
                      onClick={() => void handleLeaveClinic()}
                      disabled={leaveClinicMutation.isPending}
                      className={DANGER_BUTTON}
                    >
                      {leaveClinicMutation.isPending && (
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      )}
                      Abandonar clínica
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-text/60 dark:text-slate-400">
                      Gestionas una clínica como{' '}
                      <span className="font-medium text-kanji dark:text-white">
                        {user.clinicRole === 'OWNER' ? 'propietario' : 'administrador'}
                      </span>
                      .
                    </p>
                    <Link
                      to="/clinic"
                      className="inline-flex min-h-11 items-center gap-1.5 px-3 rounded-lg text-sm font-medium text-kanji-deep dark:text-kio hover:bg-bg dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      Gestionar <ExternalLink size={13} aria-hidden="true" />
                    </Link>
                  </div>
                )}
              </div>
            </section>

            {/* Google Calendar Section */}
            <section
              id="integraciones"
              aria-labelledby="integraciones-title"
              className="scroll-mt-24 bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="border-b border-cruz dark:border-slate-800 px-6 py-5">
                <h2
                  id="integraciones-title"
                  className="text-lg font-semibold text-kanji dark:text-white flex items-center gap-2"
                >
                  <Plug size={18} aria-hidden="true" />
                  Integraciones
                </h2>
                <p className="text-sm text-text/60 dark:text-slate-400 mt-1">
                  Conecta herramientas externas para mejorar tu flujo de trabajo
                </p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl border border-cruz dark:border-slate-700 bg-bg/50 dark:bg-slate-800/50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-6 h-6" aria-hidden="true">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-kanji dark:text-white">Google Calendar</h3>
                      <p className="text-xs text-text/60 dark:text-slate-400">
                        {user?.profile?.googleIntegration
                          ? 'Sincronización activa. Tus citas se reflejarán automáticamente en tu calendario.'
                          : 'Sincroniza tus citas de Kio automáticamente.'}
                      </p>
                    </div>
                  </div>
                  {user?.profile?.googleIntegration ? (
                    <button
                      type="button"
                      onClick={() => void handleDisconnectGoogle()}
                      disabled={isGoogleBusy}
                      className={DANGER_BUTTON}
                    >
                      {isGoogleBusy && (
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      )}
                      Desconectar
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleConnectGoogle()}
                      disabled={isGoogleBusy}
                      className="inline-flex min-h-11 items-center gap-2 px-4 text-sm font-bold bg-kanji-deep text-white rounded-xl shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 transition-all duration-150 active:scale-95 disabled:opacity-70"
                    >
                      {isGoogleBusy && (
                        <Loader2 size={14} className="animate-spin" aria-hidden="true" />
                      )}
                      Conectar
                    </button>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar: cuenta y ayuda.
              "Ayuda" vivía en una card `lg:col-span-2` justo después de otra
              `lg:col-span-2` dentro de una retícula de 3, así que en `lg` se
              envolvía a una fila nueva y dejaba el sidebar pegajoso flotando
              junto a un hueco. */}
          <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
            <section
              id="cuenta"
              aria-labelledby="cuenta-title"
              className="scroll-mt-24 bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm overflow-hidden"
            >
              <div className="border-b border-cruz dark:border-slate-800 px-6 py-5 bg-bg/50 dark:bg-slate-800/50">
                <h2
                  id="cuenta-title"
                  className="text-lg font-semibold text-kanji dark:text-white"
                >
                  Información de cuenta
                </h2>
              </div>
              <div className="p-6">
                <ul className="space-y-5">
                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                      <Mail className="w-4 h-4 text-text/60 dark:text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Correo electrónico
                      </p>
                      <p className="text-sm font-medium text-kanji dark:text-white truncate">
                        {user?.email}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                      <Shield className="w-4 h-4 text-text/60 dark:text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Rol del sistema
                      </p>
                      <p className="text-sm font-medium text-kanji dark:text-white">
                        {(user?.role && SYSTEM_ROLE_LABELS[user.role]) ?? '—'}
                      </p>
                    </div>
                  </li>

                  {/* La fila anterior cableaba "Especialidad: Psicólogo", que es
                      falso para el personal de recepción que trabaja dentro del
                      modelo de roles de clínica. El rol de clínica sí es un dato
                      real, y solo se muestra si existe. */}
                  {user?.clinicId && user?.clinicRole && (
                    <li className="flex items-start gap-4">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                        <Building2 className="w-4 h-4 text-text/60 dark:text-slate-400" aria-hidden="true" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider mb-1">
                          Rol en la clínica
                        </p>
                        <p className="text-sm font-medium text-kanji dark:text-white">
                          {CLINIC_ROLE_LABELS[user.clinicRole] ?? user.clinicRole}
                        </p>
                      </div>
                    </li>
                  )}

                  <li className="flex items-start gap-4">
                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg shrink-0 mt-0.5">
                      <FileText className="w-4 h-4 text-text/60 dark:text-slate-400" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-text/50 dark:text-slate-500 uppercase tracking-wider mb-1">
                        Cédula profesional
                      </p>
                      <p className="text-sm font-medium text-kanji dark:text-white">
                        {user?.profile?.licenseNumber || (
                          <span className="text-text/40 dark:text-slate-500 italic">No especificada</span>
                        )}
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </section>

            {/* Help Section */}
            <section
              id="ayuda"
              aria-labelledby="ayuda-title"
              className="scroll-mt-24 bg-surface dark:bg-slate-900 rounded-2xl border border-cruz dark:border-slate-800 shadow-sm p-6"
            >
              <h2
                id="ayuda-title"
                className="font-semibold text-kanji dark:text-white mb-1"
              >
                Ayuda
              </h2>
              <p className="text-sm text-text/60 dark:text-slate-400 mb-4">
                ¿Quieres volver a conocer la plataforma?
              </p>
              <button
                type="button"
                onClick={() => { resetTour(); startTour(); }}
                className="flex min-h-11 items-center gap-2 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 text-sm font-medium text-gray-600 dark:text-slate-300 hover:border-kio hover:text-kanji-deep dark:hover:border-kio dark:hover:text-kio transition-colors duration-150"
              >
                <Compass
                  size={16}
                  className="text-kanji-deep dark:text-kio"
                  aria-hidden="true"
                />
                Ver el tutorial nuevamente
              </button>
            </section>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
