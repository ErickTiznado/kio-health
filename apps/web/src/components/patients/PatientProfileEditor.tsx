import { useState, useRef, type KeyboardEvent } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Pencil,
  X,
  Check,
  Target,
  User,
  AlertTriangle,
  Plus,
  Trash2,
  Phone,
} from 'lucide-react';
import { useUpdatePatient } from '../../hooks/use-patients';
import type { Patient } from '../../types/patients.types';
import { TasksWidget } from '../patient/tasks/TasksWidget';
import { DatePicker } from '../ui/DatePicker';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface PatientProfileEditorProps {
  patient: Patient;
}

const inputCls =
  'block w-full rounded-xl border border-gray-200 dark:border-slate-700 focus:border-kio focus:ring-2 focus:ring-kio/20 outline-none text-sm font-medium text-kanji dark:text-white bg-gray-50/50 dark:bg-slate-800 py-2.5 px-3.5 placeholder:text-gray-400 dark:placeholder:text-slate-500 placeholder:font-normal transition-all';
const labelCls =
  'block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';
const cardCls =
  'bg-surface dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-[var(--color-cruz)] dark:border-slate-800';
const errorCls = 'mt-1.5 text-xs text-rose-600 font-bold';

// ── Section header ──────────────────────────────────────────────────────────
function SectionHeader({
  title,
  Icon,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  isSaving,
}: {
  title: string;
  Icon: React.ElementType;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-base font-bold text-[var(--color-kanji)] dark:text-white flex items-center gap-2">
        <Icon size={16} className="text-kio" />
        {title}
      </h3>
      {!isEditing ? (
        <button
          type="button"
          onClick={onEdit}
          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-kio dark:hover:text-kio rounded-lg hover:bg-kio/10 transition-all"
          title="Editar sección"
        >
          <Pencil size={13} />
        </button>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Cancelar"
          >
            <X size={14} />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-kio rounded-lg hover:bg-kio/90 disabled:opacity-50 transition-all shadow-sm shadow-kio/20"
          >
            {isSaving ? (
              <span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Check size={12} />
            )}
            Guardar
          </button>
        </div>
      )}
    </div>
  );
}

// ── 1. Datos Personales ─────────────────────────────────────────────────────
const personalSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  contactPhone: z
    .string()
    .optional()
    .refine((v) => !v || /^\+?[1-9]\d{1,14}$/.test(v.replace(/\s/g, '')), {
      message: 'Formato de teléfono inválido',
    }),
  contactEmail: z.string().email('Formato de email inválido').optional().or(z.literal('')),
  dateOfBirth: z.string().optional(),
});
type PersonalData = z.infer<typeof personalSchema>;

function PersonalDataSection({ patient }: { patient: Patient }) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdatePatient();

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
    defaultValues: {
      fullName: patient.fullName,
      contactPhone: patient.contactPhone ?? '',
      contactEmail: patient.contactEmail ?? '',
      dateOfBirth: patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
        : '',
    },
  });

  const startEdit = () => {
    reset({
      fullName: patient.fullName,
      contactPhone: patient.contactPhone ?? '',
      contactEmail: patient.contactEmail ?? '',
      dateOfBirth: patient.dateOfBirth
        ? new Date(patient.dateOfBirth).toISOString().split('T')[0]
        : '',
    });
    setIsEditing(true);
  };

  const onSave = handleSubmit((data) => {
    mutate(
      { id: patient.id, data },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Datos personales actualizados');
        },
        onError: () => toast.error('Error al guardar. Intenta de nuevo.'),
      },
    );
  });

  const dob = patient.dateOfBirth
    ? new Date(patient.dateOfBirth).toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className={cardCls}>
      <SectionHeader
        title="Datos Personales"
        Icon={User}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={() => setIsEditing(false)}
        onSave={onSave}
        isSaving={isPending}
      />

      {!isEditing ? (
        <dl className="space-y-4">
          <DataRow label="Nombre completo" value={patient.fullName} />
          <DataRow label="Fecha de nacimiento" value={dob ?? 'No registrada'} />
          <DataRow label="Teléfono" value={patient.contactPhone ?? 'No registrado'} />
          <DataRow label="Email" value={patient.contactEmail ?? 'No registrado'} />
        </dl>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>
              Nombre Completo <span className="text-rose-500">*</span>
            </label>
            <input
              {...register('fullName')}
              className={inputCls}
              placeholder="Ej. Juan Pérez"
            />
            {errors.fullName && <p className={errorCls}>{errors.fullName.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Teléfono</label>
              <input
                {...register('contactPhone')}
                className={inputCls}
                placeholder="+52..."
              />
              {errors.contactPhone && (
                <p className={errorCls}>{errors.contactPhone.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls}>Email <span className="text-gray-400 font-normal normal-case">(recordatorios)</span></label>
              <input
                {...register('contactEmail')}
                type="email"
                className={inputCls}
                placeholder="paciente@email.com"
              />
              {errors.contactEmail && (
                <p className={errorCls}>{errors.contactEmail.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Controller
                control={control}
                name="dateOfBirth"
                render={({ field }) => (
                  <DatePicker
                    label="Fecha de Nacimiento"
                    value={field.value}
                    onChange={(date) =>
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                    }
                    error={errors.dateOfBirth?.message}
                  />
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 2. Escenario Clínico ────────────────────────────────────────────────────
const clinicalSchema = z.object({
  diagnosis: z.string().optional(),
  clinicalContext: z.string().optional(),
});
type ClinicalData = z.infer<typeof clinicalSchema>;

function ClinicalScenarioSection({ patient }: { patient: Patient }) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdatePatient();

  const { register, handleSubmit, reset } = useForm<ClinicalData>({
    resolver: zodResolver(clinicalSchema),
    defaultValues: {
      diagnosis: patient.diagnosis ?? '',
      clinicalContext: patient.clinicalContext ?? '',
    },
  });

  const startEdit = () => {
    reset({ diagnosis: patient.diagnosis ?? '', clinicalContext: patient.clinicalContext ?? '' });
    setIsEditing(true);
  };

  const onSave = handleSubmit((data) => {
    mutate(
      { id: patient.id, data },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Escenario clínico actualizado');
        },
        onError: () => toast.error('Error al guardar. Intenta de nuevo.'),
      },
    );
  });

  return (
    <div className={cardCls}>
      <SectionHeader
        title="Escenario Clínico"
        Icon={AlertTriangle}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={() => setIsEditing(false)}
        onSave={onSave}
        isSaving={isPending}
      />

      {!isEditing ? (
        <dl className="space-y-4">
          <div>
            <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">
              Diagnóstico
            </dt>
            <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1 bg-gray-50 dark:bg-slate-800 p-2.5 rounded-lg border border-gray-100 dark:border-slate-700">
              {patient.diagnosis || 'Sin diagnóstico'}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">
              Contexto Clínico
            </dt>
            <dd className="text-sm text-gray-600 dark:text-slate-400 mt-1 leading-relaxed whitespace-pre-wrap">
              {patient.clinicalContext || 'Sin contexto registrado.'}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Diagnóstico</label>
            <textarea
              {...register('diagnosis')}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Diagnóstico preliminar o confirmado..."
            />
          </div>
          <div>
            <label className={labelCls}>Contexto Clínico</label>
            <textarea
              {...register('clinicalContext')}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Antecedentes relevantes, motivo de consulta..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── 3. Objetivos de Tratamiento ─────────────────────────────────────────────
function TreatmentGoalsSection({ patient }: { patient: Patient }) {
  const [isEditing, setIsEditing] = useState(false);
  const [goals, setGoals] = useState<string[]>(patient.treatmentGoals ?? []);
  const [newGoal, setNewGoal] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdatePatient();

  const startEdit = () => {
    setGoals(patient.treatmentGoals ?? []);
    setNewGoal('');
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const addGoal = () => {
    const trimmed = newGoal.trim();
    if (!trimmed) return;
    setGoals((prev) => [...prev, trimmed]);
    setNewGoal('');
    inputRef.current?.focus();
  };

  const removeGoal = (index: number) =>
    setGoals((prev) => prev.filter((_, i) => i !== index));

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addGoal();
    }
  };

  const onSave = () => {
    mutate(
      { id: patient.id, data: { treatmentGoals: goals } },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Objetivos actualizados');
        },
        onError: () => toast.error('Error al guardar. Intenta de nuevo.'),
      },
    );
  };

  const displayGoals = isEditing ? goals : (patient.treatmentGoals ?? []);

  return (
    <div className={cardCls}>
      <SectionHeader
        title="Objetivos de Tratamiento"
        Icon={Target}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={() => setIsEditing(false)}
        onSave={onSave}
        isSaving={isPending}
      />

      {displayGoals.length === 0 && !isEditing ? (
        <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
          No se han definido objetivos. Haz clic en el lápiz para agregarlos.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {displayGoals.map((goal, i) => (
            <li key={i} className="flex items-start gap-3 group">
              <span className="mt-0.5 w-5 h-5 rounded-full bg-[var(--color-bg)] dark:bg-slate-800 border border-[var(--color-kanji)]/30 flex items-center justify-center text-[10px] font-bold text-[var(--color-kanji)] dark:text-kio shrink-0">
                {i + 1}
              </span>
              <span className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed flex-1">
                {goal}
              </span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => removeGoal(i)}
                  className="shrink-0 p-1 text-gray-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isEditing && (
        <div className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${inputCls} flex-1`}
            placeholder="Nuevo objetivo... (Enter para agregar)"
          />
          <button
            type="button"
            onClick={addGoal}
            disabled={!newGoal.trim()}
            className="px-3 py-2 rounded-xl bg-kio/10 text-kio hover:bg-kio/20 disabled:opacity-30 transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ── 4. Contacto de Emergencia ───────────────────────────────────────────────
const emergencySchema = z.object({
  emergencyContact: z.object({
    name: z.string().optional(),
    phone: z
      .string()
      .optional()
      .refine((v) => !v || /^\+?[1-9]\d{1,14}$/.test(v.replace(/\s/g, '')), {
        message: 'Formato de teléfono inválido',
      }),
    relation: z.string().optional(),
  }),
});
type EmergencyData = z.infer<typeof emergencySchema>;

function EmergencyContactSection({ patient }: { patient: Patient }) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdatePatient();
  const ec = patient.emergencyContact;

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EmergencyData>({
    resolver: zodResolver(emergencySchema),
    defaultValues: {
      emergencyContact: {
        name: ec?.name ?? '',
        phone: ec?.phone ?? '',
        relation: ec?.relation ?? '',
      },
    },
  });

  const startEdit = () => {
    reset({
      emergencyContact: {
        name: ec?.name ?? '',
        phone: ec?.phone ?? '',
        relation: ec?.relation ?? '',
      },
    });
    setIsEditing(true);
  };

  const onSave = handleSubmit((data) => {
    mutate(
      { id: patient.id, data },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Contacto de emergencia actualizado');
        },
        onError: () => toast.error('Error al guardar. Intenta de nuevo.'),
      },
    );
  });

  const hasContact = ec?.name || ec?.phone;

  return (
    <div
      className={
        isEditing || hasContact
          ? `${cardCls} border-rose-100 dark:border-rose-900/40 bg-rose-50/30 dark:bg-rose-900/10`
          : `${cardCls} border-dashed`
      }
    >
      <SectionHeader
        title="Contacto de Emergencia"
        Icon={AlertTriangle}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={() => setIsEditing(false)}
        onSave={onSave}
        isSaving={isPending}
      />

      {!isEditing ? (
        hasContact ? (
          <div className="text-sm text-rose-700 dark:text-rose-300 space-y-1">
            <p>
              <span className="font-semibold">{ec?.name}</span>
              {ec?.relation && (
                <span className="text-rose-500 dark:text-rose-400 font-normal">
                  {' '}
                  ({ec.relation})
                </span>
              )}
            </p>
            {ec?.phone && (
              <a
                href={`tel:${ec.phone}`}
                className="flex items-center gap-2 hover:underline font-medium"
              >
                <Phone size={13} />
                {ec.phone}
              </a>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-slate-500 leading-relaxed">
            No registrado. Haz clic en el lápiz para agregar un contacto de emergencia.
          </p>
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls}>Nombre</label>
            <input
              {...register('emergencyContact.name')}
              className={inputCls}
              placeholder="Nombre del contacto"
            />
          </div>
          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              {...register('emergencyContact.phone')}
              className={inputCls}
              placeholder="+52..."
            />
            {errors.emergencyContact?.phone && (
              <p className={errorCls}>{errors.emergencyContact.phone.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls}>Relación</label>
            <input
              {...register('emergencyContact.relation')}
              className={inputCls}
              placeholder="Ej. Madre, Pareja..."
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── Helper: read-only data row ───────────────────────────────────────────────
function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-400 dark:text-slate-500 uppercase font-bold tracking-wider">
        {label}
      </dt>
      <dd className="text-sm font-medium text-gray-700 dark:text-slate-300 mt-1">{value}</dd>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function PatientProfileEditor({ patient }: PatientProfileEditorProps) {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-6">
        <PersonalDataSection patient={patient} />
        <TreatmentGoalsSection patient={patient} />
        <TasksWidget patientId={patient.id} />
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <ClinicalScenarioSection patient={patient} />
        <EmergencyContactSection patient={patient} />
      </div>
    </div>
  );
}
