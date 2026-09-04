import { useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { DashboardLayout } from '../components/DashboardLayout';
import { WidgetError } from '../components/widgets/WidgetError';
import { confirmAction } from '../lib/confirm-action';
import { useAuthStore } from '../stores/auth.store';
import {
  useMyClinic,
  useClinicInvitations,
  useClinicPatients,
  useCreateInvitation,
  useRevokeInvitation,
  useRemoveMember,
  useUpdateMemberRole,
} from '../hooks/use-clinics';
import type {
  ClinicPatient,
  ClinicRole,
  GrantableClinicRole,
  InvitationLink,
} from '../types/clinic.types';
import {
  Building2,
  Users,
  Mail,
  MailWarning,
  Copy,
  Trash2,
  Shield,
  ShieldCheck,
  Loader2,
  Check,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { ClinicFinanceTab } from '../features/clinic/ClinicFinanceTab';

type Tab = 'members' | 'invitations' | 'patients' | 'finance';

const ROLE_LABELS: Record<ClinicRole, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  MEMBER: 'Miembro',
};

/**
 * Los tres roles vivían en `purple-100` / `blue-100` / `gray-100`: una paleta
 * de tres acentos que no existe en DESIGN.md y que gastaba púrpura genérico
 * (no el de marca) en una etiqueta de metadato.
 *
 * Ahora la distinción se hace con el único acento del sistema y con relleno vs
 * contorno: propietario lleno de velo lavanda, administrador contorneado en el
 * mismo púrpura, miembro en el tag neutro. La tinta es siempre `kanji-deep`
 * sobre claro — `kio` como texto sobre lino mide 2.2:1. El color nunca es el
 * único portador: la etiqueta dice el rol con todas sus letras.
 */
const ROLE_BADGE: Record<ClinicRole, string> = {
  OWNER:
    'bg-kio/20 text-kanji-deep border border-transparent dark:bg-kio/15 dark:text-kio dark:border-kio/20',
  ADMIN:
    'bg-transparent text-kanji-deep border border-kanji-deep/40 dark:text-kio dark:border-kio/40',
  MEMBER:
    'bg-gray-100 text-gray-600 border border-transparent dark:bg-slate-800 dark:text-slate-400',
};

/**
 * Lo que concede tu propio rol, en segunda persona. Antes `isOwner` / `isAdmin`
 * solo servían para ocultar controles: un MEMBER veía una lista sin botones,
 * indistinguible de una página rota, y un ADMIN no sabía por qué podía quitar
 * miembros pero no cambiar roles.
 */
const ROLE_GRANTS: Record<ClinicRole, string> = {
  OWNER:
    'Invitas y quitas miembros, cambias roles, y ves el listado de pacientes y las finanzas de toda la clínica.',
  ADMIN:
    'Invitas y quitas miembros, y ves el listado de pacientes y las finanzas de la clínica. Los roles solo los cambia el propietario.',
  MEMBER:
    'Ves la clínica y quién la compone. Tus pacientes, tus notas y tus finanzas siguen siendo solo tuyos.',
};

/** Leyenda visible de los tres roles. No vive en un tooltip: en táctil no existe. */
const ROLE_LEGEND: { role: ClinicRole; grant: string }[] = [
  {
    role: 'OWNER',
    grant:
      'Creó la clínica. Único rol que puede cambiar roles. No se le puede quitar de la clínica, y no se concede: ni por invitación ni por cambio de rol.',
  },
  {
    role: 'ADMIN',
    grant:
      'Invita, revoca invitaciones y quita miembros. Ve el listado de pacientes y las finanzas de la clínica.',
  },
  {
    role: 'MEMBER',
    grant:
      'Trabaja con sus propios pacientes. No gestiona miembros ni ve las finanzas de los demás.',
  },
];

/** Botón destructivo del sistema: rose en reposo, relleno solo en hover. */
const DANGER_BUTTON =
  'inline-flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-rose-600 dark:text-rose-400 transition-colors duration-150 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 disabled:cursor-not-allowed';

export default function ClinicPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  /**
   * El enlace recién generado, en pantalla y no solo en el portapapeles: el
   * correo puede no haber salido (`emailSent: false`) y entonces pasarlo a mano
   * es el único camino. Guardamos también a quién se emitió, porque la lista de
   * pendientes se recarga de forma asíncrona.
   */
  const [lastInvitation, setLastInvitation] = useState<
    (InvitationLink & { email: string; role: GrantableClinicRole }) | null
  >(null);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const myRole = user?.clinicRole ?? null;
  const isOwner = myRole === 'OWNER';
  const isAdmin = myRole === 'OWNER' || myRole === 'ADMIN';

  const clinicQuery = useMyClinic();
  // Invitaciones, pacientes y finanzas exigen ClinicAdminGuard en el backend:
  // pedirlos como MEMBER solo produce 403 que la vista tendría que disfrazar.
  const invitationsQuery = useClinicInvitations(isAdmin);
  const patientsQuery = useClinicPatients(isAdmin);

  const clinic = clinicQuery.data;
  const invitations = invitationsQuery.data;
  const patients = patientsQuery.data;

  const createInvitationMutation = useCreateInvitation();
  const revokeInvitationMutation = useRevokeInvitation();
  const removeMemberMutation = useRemoveMember();
  const updateRoleMutation = useUpdateMemberRole();

  // Solo ADMIN y MEMBER: la propiedad no se concede por invitación, y el
  // backend lo rechaza tanto en el DTO como al canjear.
  const inviteForm = useForm<{ email: string; role: GrantableClinicRole }>({
    defaultValues: { email: '', role: 'MEMBER' },
  });

  useEffect(
    () => () => {
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    },
    [],
  );

  /**
   * Copia sin anunciar nada: quien llama decide cómo se cuenta el resultado.
   * `navigator.clipboard.writeText` exige activación reciente del usuario, así
   * que tras un viaje de red puede fallar sin que nada esté mal.
   */
  const copyLinkToClipboard = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(link);
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => setCopiedLink(null), 2000);
      return true;
    } catch {
      return false;
    }
  };

  /** Copiado que el usuario pidió con un clic: ahí sí, fallar es un error. */
  const handleCopyLink = async (link: string) => {
    const copied = await copyLinkToClipboard(link);
    if (copied) toast.success('Enlace copiado al portapapeles');
    else toast.error('No pudimos copiar el enlace. Selecciónalo y cópialo a mano.');
  };

  const submitInvitation = async (data: {
    email: string;
    role: GrantableClinicRole;
  }) => {
    const result = await createInvitationMutation.mutateAsync(data);
    setLastInvitation({ ...result, email: data.email, role: data.role });
    inviteForm.reset();
    /*
      El copiado automático es una comodidad, no la acción que se pidió: la
      invitación ya existe y queda pintada y seleccionable justo debajo. Que el
      portapapeles falle no puede anunciarse en rojo, porque un aviso de error
      tras una invitación correcta empuja a reintentar y a emitir una segunda
      invitación que nadie necesita. Un solo toast, y dice la verdad en las dos
      ramas.
    */
    const copied = await copyLinkToClipboard(result.link);
    if (copied) {
      toast.success('Invitación creada y enlace copiado al portapapeles');
    } else {
      toast.info('Invitación creada. Copia el enlace desde la tarjeta de abajo.');
    }
  };

  const handleRemoveMember = async (email: string, clinicianId: string) => {
    const confirmed = await confirmAction({
      title: `¿Quitar a ${email} de la clínica?`,
      description:
        'Perderá el acceso a la agenda y a los pacientes compartidos de la clínica. Sus propios pacientes y notas siguen siendo suyos. Puedes volver a invitarle después.',
      confirmLabel: 'Quitar de la clínica',
      variant: 'danger',
    });
    if (confirmed) removeMemberMutation.mutate(clinicianId);
  };

  const handleChangeRole = async (
    email: string,
    clinicianId: string,
    nextRole: GrantableClinicRole,
  ) => {
    const promoting = nextRole === 'ADMIN';
    const confirmed = await confirmAction({
      title: promoting
        ? `¿Hacer administrador a ${email}?`
        : `¿Pasar a ${email} a miembro?`,
      description: promoting
        ? 'Podrá invitar y quitar miembros, y ver el listado de pacientes y las finanzas de toda la clínica.'
        : 'Dejará de invitar y quitar miembros, y de ver el listado de pacientes y las finanzas de la clínica. Sus propios pacientes no cambian.',
      confirmLabel: promoting ? 'Hacer administrador' : 'Pasar a miembro',
      variant: promoting ? 'warning' : 'default',
    });
    if (confirmed) updateRoleMutation.mutate({ clinicianId, role: nextRole });
  };

  const handleRevokeInvitation = async (email: string, invitationId: string) => {
    const confirmed = await confirmAction({
      title: `¿Revocar la invitación de ${email}?`,
      description:
        'El enlace dejará de funcionar de inmediato. Si aún quieres que se una, tendrás que generar uno nuevo.',
      confirmLabel: 'Revocar invitación',
      variant: 'danger',
    });
    if (confirmed) revokeInvitationMutation.mutate(invitationId);
  };

  /**
   * Agrupa por el clínico del propio paciente, no al revés: iterar los miembros
   * y devolver `null` para los que no tenían pacientes pintaba una pestaña en
   * blanco, y escondía a los pacientes de un clínico que ya salió de la clínica.
   */
  const patientGroups = useMemo(() => {
    if (!patients) return [];
    const byClinician = new Map<string, ClinicPatient[]>();
    for (const patient of patients) {
      const list = byClinician.get(patient.clinicianId);
      if (list) list.push(patient);
      else byClinician.set(patient.clinicianId, [patient]);
    }

    const groups: { key: string; label: string; patients: ClinicPatient[] }[] = [];
    for (const member of clinic?.members ?? []) {
      const list = byClinician.get(member.clinicianId);
      if (!list) continue;
      groups.push({
        key: member.clinicianId,
        label: member.clinician.user.email,
        patients: list,
      });
      byClinician.delete(member.clinicianId);
    }
    for (const [clinicianId, list] of byClinician) {
      groups.push({
        key: clinicianId,
        label: 'Profesional que ya no pertenece a la clínica',
        patients: list,
      });
    }
    return groups;
  }, [patients, clinic]);

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'members', label: 'Miembros', icon: Users },
    // Invitaciones, pacientes y finanzas exigen ClinicAdminGuard.
    ...(isAdmin
      ? [
          { id: 'invitations' as Tab, label: 'Invitaciones', icon: Mail },
          { id: 'patients' as Tab, label: 'Pacientes', icon: Shield },
          { id: 'finance' as Tab, label: 'Finanzas', icon: TrendingUp },
        ]
      : []),
  ];

  // Sin clínica no hay nada que pedir al servidor: la vista lo dice en vez de
  // pintar una cabecera con "0 miembros" y tres pestañas vacías.
  if (!user?.clinicId) {
    return (
      <DashboardLayout>
        <div className="max-w-5xl mx-auto pb-12">
          <div className="rounded-2xl border border-cruz dark:border-slate-800 bg-surface dark:bg-slate-900 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-kio/10 dark:bg-kio/20 rounded-xl shrink-0">
                {/* `text-kio` sobre lino mide 2.2:1: el púrpura legible sobre
                    claro es kanji-deep, y el lavanda queda para el oscuro. */}
                <Building2
                  className="w-6 h-6 text-kanji-deep dark:text-kio"
                  aria-hidden="true"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-kanji dark:text-white">
                  No perteneces a ninguna clínica
                </h1>
                <p className="mt-1 text-sm text-text/60 dark:text-slate-400">
                  Crea una desde Configuración para invitar a tu equipo, o pídele al
                  propietario que te envíe su enlace de invitación.
                </p>
                <Link
                  to="/settings"
                  className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-kanji-deep px-4 text-sm font-bold text-white shadow-md shadow-kanji-deep/20 transition-all duration-150 hover:bg-kanji-deep/90 active:scale-95"
                >
                  Ir a configuración
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (clinicQuery.isLoading) {
    return (
      <DashboardLayout>
        <div role="status" className="flex items-center justify-center h-64">
          <Loader2
            className="w-8 h-8 animate-spin text-kanji-deep dark:text-kio"
            aria-hidden="true"
          />
          {/* Un spinner sin nombre accesible no anuncia nada: con lector de
              pantalla la página quedaba muda mientras cargaba. */}
          <span className="sr-only">Cargando la clínica…</span>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="p-2.5 bg-kio/10 dark:bg-kio/20 rounded-xl">
            <Building2
              className="w-6 h-6 text-kanji-deep dark:text-kio"
              aria-hidden="true"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-kanji dark:text-white">
              {clinic?.name ?? 'Mi clínica'}
            </h1>
            {/* Nunca "0 miembros" ante un fallo: es una afirmación falsa sobre
                la práctica de quien la lee. */}
            <p className="text-text/60 dark:text-slate-400 text-sm mt-0.5">
              {clinic
                ? `${clinic.members.length} ${clinic.members.length === 1 ? 'miembro' : 'miembros'}`
                : clinicQuery.isError
                  ? 'No pudimos cargar los miembros'
                  : 'Cargando miembros…'}
            </p>
          </div>
        </div>

        {/* Tu propio rol y lo que concede */}
        {myRole && (
          <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-2xl border border-cruz dark:border-slate-800 bg-bg/60 dark:bg-slate-800/50 px-4 py-3">
            <ShieldCheck
              size={16}
              className="text-kanji-deep dark:text-kio shrink-0"
              aria-hidden="true"
            />
            <span className="text-sm font-bold text-kanji dark:text-white">
              Tu rol: {ROLE_LABELS[myRole]}
            </span>
            <span className="text-sm text-text/60 dark:text-slate-400">
              {ROLE_GRANTS[myRole]}
            </span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-slate-800">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`flex min-h-11 items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors duration-150 ${
                activeTab === id
                  ? 'border-kio text-kanji-deep dark:text-kio'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-kanji dark:hover:text-white'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {clinicQuery.isError ? (
              <WidgetError
                what="los miembros de la clínica"
                onRetry={() => void clinicQuery.refetch()}
              />
            ) : (
              <>
                {clinic?.members.map((member) => {
                  const email = member.clinician.user.email;
                  const isMe = member.clinicianId === user?.profile?.id;
                  const canRemove = isAdmin && member.role !== 'OWNER' && !isMe;
                  const canChangeRole = isOwner && member.role !== 'OWNER';
                  const nextRole: GrantableClinicRole =
                    member.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';

                  return (
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-kio to-kanji rounded-full flex items-center justify-center shrink-0">
                          <span className="text-white text-sm font-semibold">
                            {email?.[0]?.toUpperCase() ?? '?'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-kanji dark:text-white">
                            {email || 'Sin correo registrado'}
                            {isMe && (
                              <span className="ml-1.5 text-xs font-semibold text-text/50 dark:text-slate-400">
                                (tú)
                              </span>
                            )}
                          </p>
                          <span
                            className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[member.role]}`}
                          >
                            {ROLE_LABELS[member.role]}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* Elegir-y-confirmar. Antes era el onChange de un
                            <select> nativo: la rueda del ratón sobre el control
                            degradaba a un administrador en silencio. */}
                        {canChangeRole && (
                          <button
                            type="button"
                            onClick={() =>
                              void handleChangeRole(email, member.clinicianId, nextRole)
                            }
                            disabled={updateRoleMutation.isPending}
                            className="inline-flex min-h-11 items-center gap-1.5 rounded-lg border border-cruz dark:border-slate-700 px-3 text-sm font-medium text-gray-600 dark:text-slate-300 transition-colors duration-150 hover:border-kio hover:text-kanji-deep dark:hover:text-white disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            <Shield size={15} aria-hidden="true" />
                            {nextRole === 'ADMIN' ? 'Hacer administrador' : 'Pasar a miembro'}
                          </button>
                        )}
                        {canRemove && (
                          <button
                            type="button"
                            onClick={() => void handleRemoveMember(email, member.clinicianId)}
                            disabled={removeMemberMutation.isPending}
                            aria-label={`Quitar a ${email} de la clínica`}
                            className={DANGER_BUTTON}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                            Quitar
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {clinic && clinic.members.length === 0 && (
                  <p className="text-sm text-text/50 dark:text-slate-400">
                    Esta clínica todavía no tiene miembros.
                  </p>
                )}

                {/* Leyenda de roles */}
                <div className="rounded-2xl border border-cruz dark:border-slate-800 bg-bg/60 dark:bg-slate-800/40 p-4">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-text/50 dark:text-slate-400">
                    Qué puede hacer cada rol
                  </h2>
                  <dl className="mt-3 space-y-2.5">
                    {ROLE_LEGEND.map(({ role, grant }) => (
                      <div key={role} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                        <dt>
                          <span
                            className={`inline-block text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[role]}`}
                          >
                            {ROLE_LABELS[role]}
                          </span>
                        </dt>
                        <dd className="flex-1 min-w-48 text-sm text-text/60 dark:text-slate-400">
                          {grant}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </>
            )}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && isAdmin && (
          <div className="space-y-6">
            {/* Create Invitation */}
            <div className="bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800 p-5">
              <h2 className="font-semibold text-kanji dark:text-white mb-1">
                Invitar a la clínica
              </h2>
              {/*
                Sustituye al formulario "Crear cuenta nueva", que pedía una
                contraseña que el propietario tenía que dictarle a su colega:
                compartir credenciales como ruta de alta, en un producto cuya
                promesa central es la confidencialidad clínica.

                La copy dice solo lo que el backend sostiene hoy:
                `INVITATION_TTL_HOURS = 48` en clinics.service.ts (antes eran 7
                días), y `/join/:token` ya ofrece las dos ramas —
                `POST /clinics/join/register` para quien no tiene cuenta y
                `POST /clinics/join` para quien sí—, así que ya se puede decir
                dónde se crea la cuenta. Lo que NO se promete es el envío del
                correo: eso lo declara `emailSent` en la respuesta, invitación
                por invitación.
              */}
              <p className="text-sm text-text/60 dark:text-slate-400 mb-4">
                Generamos un enlace de un solo uso, válido 48 horas. Quien lo abra
                se une desde ahí: si aún no tiene cuenta de Kio, la crea en esa
                misma pantalla y elige su contraseña. Tú nunca la escribes ni la
                conoces.
              </p>
              <form
                onSubmit={(e) => {
                  // El aviso de fallo lo emite `useCreateInvitation.onError`;
                  // aquí solo evitamos la promesa rechazada sin dueño.
                  void inviteForm.handleSubmit(submitInvitation)(e).catch(() => {});
                }}
                className="flex flex-wrap gap-3"
              >
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  aria-label="Correo de la persona a invitar"
                  {...inviteForm.register('email', { required: true })}
                  className="flex-1 min-w-48 min-h-11 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                />
                <select
                  aria-label="Rol con el que se une"
                  {...inviteForm.register('role')}
                  className="min-h-11 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                >
                  <option value="MEMBER">Miembro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <button
                  type="submit"
                  disabled={createInvitationMutation.isPending}
                  className="flex min-h-11 items-center gap-2 px-4 py-2.5 bg-kanji-deep text-white rounded-xl text-sm font-bold shadow-md shadow-kanji-deep/20 hover:bg-kanji-deep/90 transition-all duration-150 active:scale-95 disabled:opacity-70"
                >
                  {createInvitationMutation.isPending ? (
                    <Loader2 size={15} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <Mail size={15} aria-hidden="true" />
                  )}
                  Generar enlace
                </button>
              </form>

              {/*
                El enlace recién generado, visible y seleccionable — no solo en
                el portapapeles ni solo en un toast que se va. `emailSent` es la
                mitad honesta del contrato: el backend guarda la invitación
                aunque el correo falle, así que decir "invitación enviada" a
                secas sería afirmar un envío que puede no haber ocurrido.
              */}
              {lastInvitation && (
                <div className="mt-4 rounded-xl border border-cruz dark:border-slate-800 bg-bg/60 dark:bg-slate-800/50 p-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-text/50 dark:text-slate-500">
                    Enlace para {lastInvitation.email}
                  </p>
                  <p className="mt-2 break-all rounded-lg border border-cruz dark:border-slate-700 bg-surface dark:bg-slate-900 px-3 py-2 text-xs font-medium text-kanji dark:text-white">
                    {lastInvitation.link}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => void handleCopyLink(lastInvitation.link)}
                      className="inline-flex min-h-11 items-center gap-1.5 px-3 rounded-lg text-sm font-medium border border-cruz dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-surface dark:hover:bg-slate-800 transition-colors duration-150"
                    >
                      {copiedLink === lastInvitation.link ? (
                        <Check size={15} className="text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                      ) : (
                        <Copy size={15} aria-hidden="true" />
                      )}
                      {copiedLink === lastInvitation.link ? 'Copiado' : 'Copiar enlace'}
                    </button>
                    <p className="text-xs text-text/50 dark:text-slate-500">
                      Rol: {ROLE_LABELS[lastInvitation.role]} · Caduca el{' '}
                      {format(parseISO(lastInvitation.expiresAt), "d 'de' MMM 'a las' HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>

                  {lastInvitation.emailSent ? (
                    <p className="mt-3 text-xs text-text/60 dark:text-slate-400">
                      También le enviamos el enlace por correo a{' '}
                      {lastInvitation.email}.
                    </p>
                  ) : (
                    <p
                      role="alert"
                      className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50/60 px-3 py-2 text-xs font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/20 dark:text-amber-200"
                    >
                      <MailWarning size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
                      No pudimos enviarle el correo. La invitación está creada:
                      pásale tú este enlace antes de que caduque.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Pending Invitations */}
            <div className="space-y-3">
              <h2 className="font-semibold text-kanji dark:text-white">
                Invitaciones pendientes
              </h2>

              {invitationsQuery.isError ? (
                <WidgetError
                  what="las invitaciones pendientes"
                  onRetry={() => void invitationsQuery.refetch()}
                />
              ) : invitationsQuery.isLoading ? (
                <p className="text-sm text-text/50 dark:text-slate-400">
                  Cargando invitaciones…
                </p>
              ) : !invitations?.length ? (
                <p className="text-sm text-text/50 dark:text-slate-400">
                  No hay invitaciones pendientes.
                </p>
              ) : (
                invitations.map((inv) => {
                  const link = `${window.location.origin}/join/${inv.token}`;
                  return (
                    <div
                      key={inv.id}
                      className="flex flex-wrap items-center justify-between gap-3 p-4 bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800"
                    >
                      <div>
                        <p className="text-sm font-medium text-kanji dark:text-white">
                          {inv.invitedEmail}
                        </p>
                        {/* Con 48 horas de vida, la fecha sin hora no dice si
                            el enlace sigue sirviendo esta tarde. */}
                        <p className="text-xs text-text/50 dark:text-slate-400 mt-0.5">
                          Rol: {ROLE_LABELS[inv.invitedRole]} · Caduca el{' '}
                          {format(parseISO(inv.expiresAt), "d 'de' MMM 'a las' HH:mm", {
                            locale: es,
                          })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleCopyLink(link)}
                          className="inline-flex min-h-11 items-center gap-1.5 px-3 rounded-lg text-sm font-medium border border-cruz dark:border-slate-700 text-gray-600 dark:text-slate-300 hover:bg-bg dark:hover:bg-slate-800 transition-colors duration-150"
                        >
                          {copiedLink === link ? (
                            <Check
                              size={15}
                              className="text-emerald-600 dark:text-emerald-400"
                              aria-hidden="true"
                            />
                          ) : (
                            <Copy size={15} aria-hidden="true" />
                          )}
                          {copiedLink === link ? 'Copiado' : 'Copiar enlace'}
                        </button>
                        <button
                          type="button"
                          onClick={() => void handleRevokeInvitation(inv.invitedEmail, inv.id)}
                          disabled={revokeInvitationMutation.isPending}
                          aria-label={`Revocar la invitación de ${inv.invitedEmail}`}
                          className={DANGER_BUTTON}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                          Revocar
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && isAdmin && (
          <div className="space-y-3">
            <p className="text-sm text-text/50 dark:text-slate-400 mb-4">
              Vista de solo lectura: nombre, estado y fecha de alta. El expediente, las
              notas y el diagnóstico siguen siendo solo del profesional que atiende.
            </p>

            {patientsQuery.isError ? (
              <WidgetError
                what="los pacientes de la clínica"
                onRetry={() => void patientsQuery.refetch()}
              />
            ) : patientsQuery.isLoading ? (
              <p className="text-sm text-text/50 dark:text-slate-400">
                Cargando pacientes…
              </p>
            ) : !patients?.length ? (
              <p className="text-sm text-text/50 dark:text-slate-400">
                No hay pacientes registrados en la clínica.
              </p>
            ) : (
              patientGroups.map((group) => (
                <div key={group.key} className="space-y-2">
                  <h3 className="text-[11px] font-bold text-text/50 dark:text-slate-400 uppercase tracking-wider px-1">
                    {group.label}
                  </h3>
                  {group.patients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex flex-wrap items-center justify-between gap-2 p-4 bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800"
                    >
                      <p className="text-sm font-medium text-kanji dark:text-white">
                        {patient.fullName}
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            patient.status === 'ACTIVE'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                          }`}
                        >
                          {patient.status === 'ACTIVE' ? 'Activo' : 'Archivado'}
                        </span>
                        <span className="text-xs text-text/40 dark:text-slate-500">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* Finance Tab — solo OWNER/ADMIN */}
        {activeTab === 'finance' && isAdmin && <ClinicFinanceTab />}
      </div>
    </DashboardLayout>
  );
}
