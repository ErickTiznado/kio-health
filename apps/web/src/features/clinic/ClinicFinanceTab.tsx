import { useState } from 'react';
import { CalendarCheck, ChevronLeft, ChevronRight, Loader2, TrendingUp } from 'lucide-react';
import { WidgetError } from '../../components/widgets/WidgetError';
import { useClinicFinance, useClinicAttendance } from '../../hooks/use-clinics';
import { useAuthStore } from '../../stores/auth.store';
import type { ClinicRole } from '../../types/clinic.types';

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const ROLE_LABELS: Record<ClinicRole, string> = {
  OWNER: 'Propietario',
  ADMIN: 'Administrador',
  MEMBER: 'Miembro',
};

/** Encabezado de columna: la versalita del sistema, a 11px. */
const TH = 'px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-text/50 dark:text-slate-500';

/** Paso de mes: control real, así que 44px de área táctil. */
const STEP_BUTTON =
  'inline-flex min-h-11 min-w-11 items-center justify-center rounded-lg text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-150';

/**
 * Ingresos y egresos por clínico del mes seleccionado.
 * Consume GET /clinics/mine/finance/summary (solo OWNER/ADMIN).
 */
export function ClinicFinanceTab() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1); // 1-12
  const [year, setYear] = useState(now.getFullYear());
  const currency = useAuthStore((s) => s.user?.profile?.currency ?? 'USD');

  const financeQuery = useClinicFinance(month, year);
  const attendanceQuery = useClinicAttendance(month, year);
  const members = financeQuery.data;
  const attendance = attendanceQuery.data;

  const stepMonth = (delta: number) => {
    const date = new Date(year, month - 1 + delta, 1);
    setMonth(date.getMonth() + 1);
    setYear(date.getFullYear());
  };

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);

  const totals = (members ?? []).reduce(
    (acc, m) => ({
      income: acc.income + m.income,
      expense: acc.expense + m.expense,
    }),
    { income: 0, expense: 0 },
  );

  return (
    <div className="space-y-5">
      {/* Month stepper */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-kanji dark:text-white flex items-center gap-2">
          {/* kanji-deep sobre claro: `kio` como tinta mide 2.2:1. */}
          <TrendingUp
            size={16}
            className="text-kanji-deep dark:text-kio"
            aria-hidden="true"
          />
          Finanzas por profesional
        </h3>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => stepMonth(-1)}
            aria-label="Mes anterior"
            className={STEP_BUTTON}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>
          <span className="text-sm font-semibold text-kanji dark:text-white w-36 text-center">
            {MONTH_LABELS[month - 1]} {year}
          </span>
          <button
            type="button"
            onClick={() => stepMonth(1)}
            aria-label="Mes siguiente"
            className={STEP_BUTTON}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* El error va antes que el vacío: "sin movimientos este mes" ante un
          fallo es una afirmación falsa sobre lo que cobró la clínica. */}
      {financeQuery.isError ? (
        <WidgetError
          what="las finanzas de la clínica"
          onRetry={() => void financeQuery.refetch()}
        />
      ) : financeQuery.isLoading ? (
        <div role="status" className="flex items-center justify-center h-40">
          <Loader2
            className="w-6 h-6 animate-spin text-kanji-deep dark:text-kio"
            aria-hidden="true"
          />
          <span className="sr-only">Cargando las finanzas de la clínica…</span>
        </div>
      ) : !members || members.length === 0 ? (
        <p className="text-sm text-text/50 dark:text-slate-500 py-8 text-center">
          Sin movimientos este mes.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-cruz dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-bg/50 dark:bg-slate-800/50 text-left">
                <th className={TH}>Profesional</th>
                <th className={`${TH} text-right`}>Ingresos</th>
                <th className={`${TH} text-right`}>Egresos</th>
                <th className={`${TH} text-right`}>Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-cruz dark:divide-slate-800">
              {members.map((member) => {
                const balance = member.income - member.expense;
                return (
                  <tr key={member.clinicianId} className="hover:bg-bg/40 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3">
                      <p className="font-medium text-kanji dark:text-white">{member.email}</p>
                      <p className="text-xs text-text/50 dark:text-slate-500">
                        {ROLE_LABELS[member.role]}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatMoney(member.income)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                      {formatMoney(member.expense)}
                    </td>
                    <td
                      className={`px-4 py-3 text-right font-bold ${
                        balance >= 0
                          ? 'text-kanji dark:text-white'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {formatMoney(balance)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-bg/50 dark:bg-slate-800/50 border-t-2 border-cruz dark:border-slate-700">
                <td className="px-4 py-3 font-bold text-kanji dark:text-white">Total</td>
                <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                  {formatMoney(totals.income)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-rose-600 dark:text-rose-400">
                  {formatMoney(totals.expense)}
                </td>
                <td className="px-4 py-3 text-right font-bold text-kanji dark:text-white">
                  {formatMoney(totals.income - totals.expense)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}

      {/* Asistencia por profesional.
          La sección entera desaparecía si la petición fallaba o aún cargaba:
          un dato clínico que se esfuma sin decir nada se lee como "aquí no hay
          asistencia que ver", que es justo lo que no sabemos. */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-kanji dark:text-white flex items-center gap-2">
          <CalendarCheck
            size={16}
            className="text-kanji-deep dark:text-kio"
            aria-hidden="true"
          />
          Asistencia del mes
        </h3>

        {attendanceQuery.isError ? (
          <WidgetError
            what="la asistencia del mes"
            onRetry={() => void attendanceQuery.refetch()}
          />
        ) : attendanceQuery.isLoading ? (
          <p className="text-sm text-text/50 dark:text-slate-500 py-4">
            Cargando asistencia…
          </p>
        ) : !attendance || attendance.length === 0 ? (
          <p className="text-sm text-text/50 dark:text-slate-500 py-4">
            Sin citas registradas este mes.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-cruz dark:border-slate-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-bg/50 dark:bg-slate-800/50 text-left">
                  <th className={TH}>Profesional</th>
                  <th className={`${TH} text-center`}>Completadas</th>
                  <th className={`${TH} text-center`}>No asistió</th>
                  <th className={`${TH} text-center`}>Canceladas</th>
                  <th className={`${TH} text-right`}>Tasa de asistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-cruz dark:divide-slate-800">
                {attendance.map((member) => {
                  const rate =
                    member.attendanceRate !== null
                      ? Math.round(member.attendanceRate * 100)
                      : null;
                  return (
                    <tr key={member.clinicianId} className="hover:bg-bg/40 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-medium text-kanji dark:text-white">
                        {member.email}
                      </td>
                      <td className="px-4 py-3 text-center text-emerald-600 dark:text-emerald-400 font-semibold">
                        {member.completed}
                      </td>
                      <td className="px-4 py-3 text-center text-amber-600 dark:text-amber-400 font-semibold">
                        {member.noShow}
                      </td>
                      <td className="px-4 py-3 text-center text-text/60 dark:text-slate-400">
                        {member.cancelled}
                      </td>
                      <td className={`px-4 py-3 text-right font-bold ${
                        rate === null
                          ? 'text-text/40 dark:text-slate-500'
                          : rate >= 85
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : rate >= 60
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-rose-600 dark:text-rose-400'
                      }`}>
                        {rate !== null ? `${rate}%` : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
