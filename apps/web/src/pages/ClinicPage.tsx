import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DashboardLayout } from '../components/DashboardLayout';
import { useAuthStore } from '../stores/auth.store';
import {
  useMyClinic,
  useClinicInvitations,
  useClinicPatients,
  useClinicFinance,
  useCreateInvitation,
  useRevokeInvitation,
  useCreateMemberAccount,
  useRemoveMember,
  useUpdateMemberRole,
} from '../hooks/use-clinics';
import type { ClinicRole } from '../types/clinic.types';
import {
  Building2,
  Users,
  Mail,
  DollarSign,
  Copy,
  Trash2,
  Shield,
  UserPlus,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

type Tab = 'members' | 'invitations' | 'patients' | 'finance';

const ROLE_LABELS: Record<ClinicRole, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  MEMBER: 'Miembro',
};

const ROLE_BADGE: Record<ClinicRole, string> = {
  OWNER: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  ADMIN: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  MEMBER: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
};

export default function ClinicPage() {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>('members');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const now = new Date();
  const [financeMonth, setFinanceMonth] = useState(now.getMonth() + 1);
  const [financeYear, setFinanceYear] = useState(now.getFullYear());

  const { data: clinic, isLoading } = useMyClinic();
  const { data: invitations } = useClinicInvitations();
  const { data: patients } = useClinicPatients();
  const { data: finance } = useClinicFinance(financeMonth, financeYear);

  const createInvitationMutation = useCreateInvitation();
  const revokeInvitationMutation = useRevokeInvitation();
  const createMemberMutation = useCreateMemberAccount();
  const removeMemberMutation = useRemoveMember();
  const updateRoleMutation = useUpdateMemberRole();

  const inviteForm = useForm<{ email: string; role: ClinicRole }>({
    defaultValues: { email: '', role: 'MEMBER' },
  });

  const memberAccountForm = useForm<{
    email: string;
    password: string;
    role: ClinicRole;
  }>({
    defaultValues: { email: '', password: '', role: 'MEMBER' },
  });

  const isOwner = user?.clinicRole === 'OWNER';
  const isAdmin = user?.clinicRole === 'OWNER' || user?.clinicRole === 'ADMIN';

  const handleCopyLink = async (link: string) => {
    await navigator.clipboard.writeText(link);
    setCopiedLink(link);
    toast.success('Link copiado al portapapeles');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCreateInvitation = inviteForm.handleSubmit(async (data) => {
    const result = await createInvitationMutation.mutateAsync(data);
    handleCopyLink(result.link);
    inviteForm.reset();
  });

  const handleCreateMemberAccount = memberAccountForm.handleSubmit(async (data) => {
    await createMemberMutation.mutateAsync({ ...data, clinicianType: 'PSYCHOLOGIST' });
    memberAccountForm.reset();
  });

  const tabs: { id: Tab; label: string; icon: typeof Building2 }[] = [
    { id: 'members', label: 'Miembros', icon: Users },
    { id: 'invitations', label: 'Invitaciones', icon: Mail },
    { id: 'patients', label: 'Pacientes', icon: Shield },
    { id: 'finance', label: 'Finanzas', icon: DollarSign },
  ];

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-kio" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto pb-12">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="p-2.5 bg-kio/10 dark:bg-kio/20 rounded-xl">
            <Building2 className="w-6 h-6 text-kio" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-kanji dark:text-white">
              {clinic?.name ?? 'Mi Clínica'}
            </h1>
            <p className="text-text/60 dark:text-slate-400 text-sm mt-0.5">
              {clinic?.members.length ?? 0} miembros
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-slate-800">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === id
                  ? 'border-kio text-kio'
                  : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-kanji dark:hover:text-white'
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-4">
            {clinic?.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-kio to-kanji rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {member.clinician.user.email[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-kanji dark:text-white">
                      {member.clinician.user.email}
                    </p>
                    <span
                      className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_BADGE[member.role]}`}
                    >
                      {ROLE_LABELS[member.role]}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isOwner && member.role !== 'OWNER' && (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateRoleMutation.mutate({
                          clinicianId: member.clinicianId,
                          role: e.target.value,
                        })
                      }
                      className="text-xs border border-cruz dark:border-slate-700 rounded-lg px-2 py-1 bg-bg dark:bg-slate-800 text-kanji dark:text-white"
                    >
                      <option value="ADMIN">Administrador</option>
                      <option value="MEMBER">Miembro</option>
                    </select>
                  )}
                  {isAdmin && member.role !== 'OWNER' && member.clinicianId !== user?.profile?.id && (
                    <button
                      type="button"
                      onClick={() => removeMemberMutation.mutate(member.clinicianId)}
                      disabled={removeMemberMutation.isPending}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Invitations Tab */}
        {activeTab === 'invitations' && (
          <div className="space-y-6">
            {/* Create Invitation */}
            <div className="bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800 p-5">
              <h2 className="font-semibold text-kanji dark:text-white mb-4">Crear Invitación</h2>
              <form onSubmit={handleCreateInvitation} className="flex flex-wrap gap-3">
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...inviteForm.register('email', { required: true })}
                  className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                />
                <select
                  {...inviteForm.register('role')}
                  className="px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                >
                  <option value="MEMBER">Miembro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <button
                  type="submit"
                  disabled={createInvitationMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 bg-kio text-white rounded-xl text-sm font-medium hover:bg-kio/90 transition-colors disabled:opacity-70"
                >
                  {createInvitationMutation.isPending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Mail size={15} />
                  )}
                  Generar Link
                </button>
              </form>
            </div>

            {/* Create Member Account */}
            <div className="bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800 p-5">
              <h2 className="font-semibold text-kanji dark:text-white mb-4 flex items-center gap-2">
                <UserPlus size={16} />
                Crear Cuenta Nueva
              </h2>
              <form onSubmit={handleCreateMemberAccount} className="flex flex-wrap gap-3">
                <input
                  type="email"
                  placeholder="correo@ejemplo.com"
                  {...memberAccountForm.register('email', { required: true })}
                  className="flex-1 min-w-48 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                />
                <input
                  type="password"
                  placeholder="Contraseña (mín. 8 chars)"
                  {...memberAccountForm.register('password', { required: true })}
                  className="flex-1 min-w-40 px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                />
                <select
                  {...memberAccountForm.register('role')}
                  className="px-4 py-2.5 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
                >
                  <option value="MEMBER">Miembro</option>
                  <option value="ADMIN">Administrador</option>
                </select>
                <button
                  type="submit"
                  disabled={createMemberMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-70"
                >
                  {createMemberMutation.isPending ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <UserPlus size={15} />
                  )}
                  Crear Cuenta
                </button>
              </form>
            </div>

            {/* Pending Invitations */}
            <div className="space-y-3">
              <h2 className="font-semibold text-kanji dark:text-white">Invitaciones Pendientes</h2>
              {!invitations?.length && (
                <p className="text-sm text-text/50 dark:text-slate-400">No hay invitaciones pendientes.</p>
              )}
              {invitations?.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between p-4 bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800"
                >
                  <div>
                    <p className="text-sm font-medium text-kanji dark:text-white">{inv.invitedEmail}</p>
                    <p className="text-xs text-text/50 dark:text-slate-400 mt-0.5">
                      Rol: {ROLE_LABELS[inv.invitedRole]} · Expira:{' '}
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyLink(`${window.location.origin}/join/${inv.token}`)
                      }
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-cruz dark:border-slate-700 hover:bg-bg dark:hover:bg-slate-800 transition-colors"
                    >
                      {copiedLink === `${window.location.origin}/join/${inv.token}` ? (
                        <Check size={12} className="text-emerald-500" />
                      ) : (
                        <Copy size={12} />
                      )}
                      Copiar link
                    </button>
                    <button
                      type="button"
                      onClick={() => revokeInvitationMutation.mutate(inv.id)}
                      disabled={revokeInvitationMutation.isPending}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patients Tab */}
        {activeTab === 'patients' && (
          <div className="space-y-3">
            <p className="text-sm text-text/50 dark:text-slate-400 mb-4">
              Vista de solo lectura de todos los pacientes de la clínica.
            </p>
            {!patients?.length && (
              <p className="text-sm text-text/50 dark:text-slate-400">No hay pacientes registrados.</p>
            )}
            {clinic?.members.map((member) => {
              const memberPatients = patients?.filter(
                (p) => p.clinicianId === member.clinicianId,
              );
              if (!memberPatients?.length) return null;
              return (
                <div key={member.clinicianId} className="space-y-2">
                  <h3 className="text-xs font-semibold text-text/50 dark:text-slate-400 uppercase tracking-wider px-1">
                    {member.clinician.user.email}
                  </h3>
                  {memberPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between p-4 bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800"
                    >
                      <p className="text-sm font-medium text-kanji dark:text-white">
                        {patient.fullName}
                      </p>
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            patient.status === 'ACTIVE'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : patient.status === 'WAITLIST'
                                ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          }`}
                        >
                          {patient.status === 'ACTIVE'
                            ? 'Activo'
                            : patient.status === 'WAITLIST'
                              ? 'Lista de espera'
                              : 'Archivado'}
                        </span>
                        <span className="text-xs text-text/40 dark:text-slate-500">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* Month/Year selector */}
            <div className="flex items-center gap-3">
              <select
                value={financeMonth}
                onChange={(e) => setFinanceMonth(Number(e.target.value))}
                className="px-3 py-2 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i, 1).toLocaleDateString('es', { month: 'long' })}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={financeYear}
                onChange={(e) => setFinanceYear(Number(e.target.value))}
                min={2020}
                max={2030}
                className="w-24 px-3 py-2 rounded-xl border border-cruz dark:border-slate-700 bg-bg dark:bg-slate-800 text-kanji dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-kio/50"
              />
            </div>

            {finance && finance.length > 0 ? (
              <div className="bg-surface dark:bg-slate-900 rounded-xl border border-cruz dark:border-slate-800 p-5">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={finance.map((f) => ({ name: f.email.split('@')[0], Ingresos: f.income, Gastos: f.expense }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Ingresos" fill="#ae93fe" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Gastos" fill="#f87171" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {finance.map((f) => (
                    <div
                      key={f.clinicianId}
                      className="flex items-center justify-between p-3 rounded-lg bg-bg dark:bg-slate-800/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-kanji dark:text-white">{f.email}</p>
                        <span className={`text-xs ${ROLE_BADGE[f.role]} px-1.5 py-0.5 rounded`}>
                          {ROLE_LABELS[f.role]}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                          +{f.income.toFixed(2)}
                        </p>
                        <p className="text-xs text-red-500 dark:text-red-400">
                          -{f.expense.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-text/50 dark:text-slate-400">
                No hay datos financieros para este período.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
