import { useState, type FC } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  Brain,
  Target,
  Hash,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/* ── Shared types ── */

interface SessionHistoryItem {
  id: string;
  date: string;
  type: string;
  summary: string;
}

/* ── Psychologist-specific context ── */

interface PsychologistContext {
  diagnosis: string;
  treatmentGoals: string[];
  totalSessions: number;
}

/* ── Props ── */

interface PatientContextPanelProps {
  patientName: string;
  patientAge: number;
  clinicianType: 'PSYCHOLOGIST';
  psychContext?: PsychologistContext;
  sessionHistory: SessionHistoryItem[];
}

/**
 * Left panel (30%) — role-aware patient context.
 * Psychologist: diagnosis, treatment goals, session count.
 * Nutritionist: blood type, allergies.
 * Both: session timeline.
 */
export const PatientContextPanel: FC<PatientContextPanelProps> = ({
  patientName,
  patientAge,
  clinicianType,
  psychContext,
  sessionHistory,
}) => {
  const [expandedSessionIds, setExpandedSessionIds] = useState<Set<string>>(new Set());

  const initials = patientName
    .split(' ')
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  const toggleSession = (sessionId: string) => {
    setExpandedSessionIds((prev) => {
      const next = new Set(prev);
      if (next.has(sessionId)) {
        next.delete(sessionId);
      } else {
        next.add(sessionId);
      }
      return next;
    });
  };

  const isPsychologist = clinicianType === 'PSYCHOLOGIST';

  return (
    <div className="h-full overflow-y-auto bg-gray-50/50 p-5 space-y-5">
      {/* ── Patient Card ── */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100/60">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-kio to-kanji rounded-2xl flex items-center justify-center shadow-lg shrink-0">
            <span className="text-white font-bold text-xl">{initials}</span>
          </div>
          <div>
            <p className="text-base font-bold text-gray-900">{patientName}</p>
            <p className="text-sm text-gray-400">{patientAge} años</p>
          </div>
        </div>

        {/* ── Role-Specific Data ── */}
        <div className="space-y-2.5">
          {isPsychologist && psychContext ? (
            <PsychologistDataCards context={psychContext} />
          ) : null}
        </div>
      </div>

      {/* ── Session Timeline ── */}
      <div>
        <div className="flex items-center gap-2 mb-3 px-1">
          <Calendar size={14} className="text-gray-400" />
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Sesiones Recientes
          </p>
        </div>

        {/* Vertical Timeline */}
        <div className="relative pl-5">
          {/* Timeline Line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gray-200" />

          <div className="space-y-3">
            {sessionHistory.map((session) => {
              const isExpanded = expandedSessionIds.has(session.id);

              return (
                <div key={session.id} className="relative">
                  {/* Timeline Dot */}
                  <div className="absolute -left-5 top-3 w-[7px] h-[7px] rounded-full bg-kanji ring-2 ring-white" />

                  {/* Session Card */}
                  <button
                    type="button"
                    onClick={() => toggleSession(session.id)}
                    className="w-full text-left bg-white rounded-2xl p-3.5 shadow-sm border border-gray-100/60 hover:shadow-md hover:border-gray-200/80 transition-all duration-200 group"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-kanji">
                          {format(parseISO(session.date), "d 'de' MMMM, yyyy", { locale: es })}
                        </p>
                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                          {session.type}
                        </p>
                      </div>
                      <span className="text-gray-300 group-hover:text-kanji transition-colors">
                        {isExpanded ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </span>
                    </div>

                    {/* Expandable Summary */}
                    {isExpanded && (
                      <p className="text-xs text-gray-600 leading-relaxed mt-2.5 pt-2.5 border-t border-gray-100">
                        {session.summary}
                      </p>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────────────
 * Sub-components for role-specific data cards
 * ────────────────────────────────────────────────────────────────────── */

const PsychologistDataCards: FC<{ context: PsychologistContext }> = ({ context }) => (
  <>
    {/* Diagnosis */}
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
        <Brain size={14} className="text-indigo-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Diagnóstico Principal
        </p>
        <p className="text-sm font-semibold text-gray-800">{context.diagnosis}</p>
      </div>
    </div>

    {/* Treatment Goals */}
    <div className="flex items-start gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
        <Target size={14} className="text-emerald-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
          Objetivos Terapéuticos
        </p>
        <div className="space-y-1">
          {context.treatmentGoals.map((goal) => (
            <p key={goal} className="text-xs text-gray-600 flex items-start gap-1.5">
              <span className="text-kanji mt-0.5">•</span>
              {goal}
            </p>
          ))}
        </div>
      </div>
    </div>

    {/* Session Count */}
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
        <Hash size={14} className="text-blue-500" />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          Sesiones Totales
        </p>
        <p className="text-sm font-bold text-gray-800">{context.totalSessions}</p>
      </div>
    </div>
  </>
);
