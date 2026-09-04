import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
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
  Pill,
} from 'lucide-react';
import { useUpdatePatient } from '../../hooks/use-patients';
import {
  patientSchema,
  emergencyContactSchema,
  GOAL_MAX_LENGTH,
  MAX_TREATMENT_GOALS,
} from '../../schemas/patients.schema';
import type { Patient, UpdatePatientDto } from '../../types/patients.types';
import { TasksWidget } from '../patient/tasks/TasksWidget';
import { DatePicker } from '../ui/DatePicker';
import { PhoneInput } from '../ui/PhoneInput';
import { format } from 'date-fns';
import { toast } from 'sonner';

/** Secciones que el lápiz de la cabecera puede abrir directamente en edición. */
export type ProfileSectionId = 'personal' | 'clinical';

interface PatientProfileEditorProps {
  patient: Patient;
  /** Sección a abrir en edición al llegar desde el lápiz de la cabecera. */
  focusSection?: ProfileSectionId | null;
  /** Se llama una vez aplicado, para que la URL no repita el salto. */
  onFocusHandled?: () => void;
}

// `min-h-11`: con `py-2.5` + `text-sm` el control medía 40px, por debajo del
// suelo táctil de 44. El relleno documentado del sistema (`py-2.5 px-3.5`) se
// conserva; sólo se le pone suelo de altura.
// `text-text` en vez de `text-kanji`: el valor de un campo es dato, no marca, y
// `kanji` sobre superficie clara mide 3.88:1 — por debajo de AA para texto
// normal. El resto de los formularios de este carril ya usaba `text-text`.
const inputCls =
  'block w-full min-h-11 rounded-xl border border-gray-200 dark:border-slate-700 focus:border-kio focus:ring-2 focus:ring-kio/20 outline-none text-sm font-medium text-text dark:text-white bg-gray-50/50 dark:bg-slate-800 py-2.5 px-3.5 placeholder:text-slate-500 dark:placeholder:text-slate-400 placeholder:font-normal transition-all';
const labelCls =
  'block text-[11px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-1.5';
const cardCls =
  'bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-border dark:border-slate-800';
const errorCls = 'mt-1.5 text-xs text-rose-700 dark:text-rose-400 font-bold';

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
    <div className="flex items-center justify-between gap-3 mb-5">
      <h3 className="text-base font-bold text-text dark:text-white flex items-center gap-2">
        <Icon size={16} aria-hidden="true" className="text-kanji-deep dark:text-kio" />
        {title}
      </h3>
      {!isEditing ? (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Editar ${title.toLowerCase()}`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-secondary hover:text-kanji-deep dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-kio"
        >
          <Pencil size={15} aria-hidden="true" />
        </button>
      ) : (
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onCancel}
            aria-label={`Cancelar edición de ${title.toLowerCase()}`}
            className="grid h-11 w-11 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:bg-rose-50 hover:text-rose-700 dark:text-slate-400 dark:hover:bg-rose-900/20 dark:hover:text-rose-400"
          >
            <X size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex min-h-11 items-center gap-1.5 rounded-xl bg-kanji-deep px-4 text-xs font-bold text-white shadow-sm shadow-kio/20 transition-colors duration-150 hover:bg-kanji hover:shadow-md hover:shadow-kio/20 disabled:opacity-50 dark:bg-kio dark:text-slate-900 dark:hover:bg-cruz"
          >
            {isSaving ? (
              <span aria-hidden="true" className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
            ) : (
              <Check size={13} aria-hidden="true" />
            )}
            {isSaving ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Los esquemas de cada sección se DERIVAN de `patientSchema` con `.pick()`, no
 * se vuelven a escribir aquí.
 *
 * Redeclararlos era la vía por la que el mismo campo aceptaba 10.000 caracteres
 * al editar la ficha y los rechazaba al dar de alta: los topes de longitud
 * vivían sólo en el esquema del alta. Un campo tiene una regla, no una por
 * pantalla.
 */

// ── 1. Datos personales ─────────────────────────────────────────────────────
const personalSchema = patientSchema.pick({
  fullName: true,
  contactPhone: true,
  contactEmail: true,
  dateOfBirth: true,
});
type PersonalData = z.infer<typeof personalSchema>;

function PersonalDataSection({
  patient,
  autoEdit,
  onAutoEditHandled,
}: {
  patient: Patient;
  autoEdit?: boolean;
  onAutoEditHandled?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdatePatient();
  const containerRef = useRef<HTMLDivElement>(null);
  const fullNameRef = useRef<HTMLInputElement | null>(null);
  // El enfoque no puede colgar del efecto de `autoEdit`: consumir el parámetro
  // de la URL vuelve `autoEdit` false en el mismo commit, y todo lo que
  // dependiera de ese efecto quedaría cancelado por su limpieza. Cada petición
  // del lápiz incrementa este contador y el enfoque vive en su propio efecto.
  const [focusRequest, setFocusRequest] = useState(0);

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

  // El lápiz de la cabecera del expediente abre esta sección en edición en vez
  // de un asistente de alta de 3 pasos sobre un paciente que ya existe.
  useEffect(() => {
    if (!autoEdit) return;
    startEdit();
    containerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setFocusRequest((n) => n + 1);
    onAutoEditHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEdit]);

  // El campo sólo está en el DOM cuando la sección está en edición, así que el
  // enfoque va aparte: `setFocusRequest` y `setIsEditing` se agrupan en el mismo
  // render, y cuando este efecto corre el input ya está montado. `preventScroll`
  // deja que el desplazamiento suave del contenedor haga el movimiento.
  useEffect(() => {
    if (focusRequest === 0) return;
    fullNameRef.current?.focus({ preventScroll: true });
  }, [focusRequest]);

  const { ref: registerFullNameRef, ...fullNameField } = register('fullName');

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
    <div className={cardCls} ref={containerRef}>
      <SectionHeader
        title="Datos personales"
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
            <label className={labelCls} htmlFor="patient-full-name">
              Nombre completo <span className="text-rose-500">*</span>
            </label>
            <input
              id="patient-full-name"
              {...fullNameField}
              // El ref de react-hook-form se conserva (lo usa para enfocar el
              // primer campo inválido) y encima se guarda el nodo para el
              // enfoque que pide el lápiz de la cabecera.
              ref={(el) => {
                registerFullNameRef(el);
                fullNameRef.current = el;
              }}
              className={inputCls}
              placeholder="Ej. Juan Pérez"
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'patient-full-name-error' : undefined}
            />
            {errors.fullName && (
              <p id="patient-full-name-error" className={errorCls}>{errors.fullName.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* `PhoneInput` monta dos controles (prefijo + número) y no acepta
                `id`, así que el nombre accesible se da al grupo. */}
            <div role="group" aria-labelledby="patient-phone-label">
              <span className={labelCls} id="patient-phone-label">Teléfono</span>
              {/* Mismo control que el asistente de alta: antes aquí era un input
                  suelto y el prefijo internacional se perdía al editar. */}
              <Controller
                control={control}
                name="contactPhone"
                render={({ field }) => (
                  <PhoneInput value={field.value || ''} onChange={field.onChange} />
                )}
              />
              {errors.contactPhone && (
                <p className={errorCls}>{errors.contactPhone.message}</p>
              )}
            </div>
            <div>
              <label className={labelCls} htmlFor="patient-email">
                Email <span className="font-normal normal-case text-slate-600 dark:text-slate-400">(recordatorios)</span>
              </label>
              <input
                id="patient-email"
                {...register('contactEmail')}
                type="email"
                className={inputCls}
                placeholder="paciente@email.com"
                aria-invalid={!!errors.contactEmail}
                aria-describedby={errors.contactEmail ? 'patient-email-error' : undefined}
              />
              {errors.contactEmail && (
                <p id="patient-email-error" className={errorCls}>{errors.contactEmail.message}</p>
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
                    label="Fecha de nacimiento"
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

// ── 2. Escenario clínico ────────────────────────────────────────────────────
const clinicalSchema = patientSchema.pick({ diagnosis: true, clinicalContext: true });
type ClinicalData = z.infer<typeof clinicalSchema>;

function ClinicalScenarioSection({
  patient,
  autoEdit,
  onAutoEditHandled,
}: {
  patient: Patient;
  autoEdit?: boolean;
  onAutoEditHandled?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdatePatient();
  const containerRef = useRef<HTMLDivElement>(null);
  const diagnosisRef = useRef<HTMLTextAreaElement | null>(null);
  // Mismo motivo que en "Datos personales": el enfoque no puede depender del
  // efecto de `autoEdit`, porque ese efecto se invalida al limpiar la URL.
  const [focusRequest, setFocusRequest] = useState(0);

  // Con los topes heredados de `patientSchema`, guardar puede fallar por
  // longitud: sin pintar el error, el botón "Guardar" no haría nada y el texto
  // clínico se perdería al cancelar.
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ClinicalData>({
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

  useEffect(() => {
    if (!autoEdit) return;
    startEdit();
    containerRef.current?.scrollIntoView({ block: 'start', behavior: 'smooth' });
    setFocusRequest((n) => n + 1);
    onAutoEditHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoEdit]);

  useEffect(() => {
    if (focusRequest === 0) return;
    diagnosisRef.current?.focus({ preventScroll: true });
  }, [focusRequest]);

  const { ref: registerDiagnosisRef, ...diagnosisField } = register('diagnosis');

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
    <div className={cardCls} ref={containerRef}>
      <SectionHeader
        title="Escenario clínico"
        Icon={AlertTriangle}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={() => setIsEditing(false)}
        onSave={onSave}
        isSaving={isPending}
      />

      {!isEditing ? (
        <dl className="space-y-4">
          {/* Sin card anidada: el diagnóstico llevaba su propio fondo y borde
              dentro de una card, que es la card dentro de la card. */}
          <DataRow label="Diagnóstico" value={patient.diagnosis || 'Sin diagnóstico registrado'} />
          <div>
            <dt className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
              Contexto clínico
            </dt>
            <dd className="text-sm font-medium text-text dark:text-slate-300 mt-1 leading-relaxed whitespace-pre-wrap">
              {patient.clinicalContext || 'Sin contexto registrado.'}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="patient-diagnosis">Diagnóstico</label>
            <textarea
              id="patient-diagnosis"
              {...diagnosisField}
              ref={(el) => {
                registerDiagnosisRef(el);
                diagnosisRef.current = el;
              }}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Diagnóstico preliminar o confirmado..."
              aria-invalid={!!errors.diagnosis}
              aria-describedby={errors.diagnosis ? 'patient-diagnosis-error' : undefined}
            />
            {errors.diagnosis && (
              <p id="patient-diagnosis-error" className={errorCls}>{errors.diagnosis.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="patient-clinical-context">Contexto clínico</label>
            <textarea
              id="patient-clinical-context"
              {...register('clinicalContext')}
              rows={4}
              className={`${inputCls} resize-none`}
              placeholder="Antecedentes relevantes, motivo de consulta..."
              aria-invalid={!!errors.clinicalContext}
              aria-describedby={
                errors.clinicalContext ? 'patient-clinical-context-error' : undefined
              }
            />
            {errors.clinicalContext && (
              <p id="patient-clinical-context-error" className={errorCls}>
                {errors.clinicalContext.message}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── 3. Objetivos de tratamiento ─────────────────────────────────────────────
function TreatmentGoalsSection({ patient }: { patient: Patient }) {
  const [isEditing, setIsEditing] = useState(false);
  const [goals, setGoals] = useState<string[]>(patient.treatmentGoals ?? []);
  const [newGoal, setNewGoal] = useState('');
  // Esta sección no usa react-hook-form (los objetivos se añaden de uno en uno
  // sobre estado local), así que los topes de `patientSchema` se comprueban a
  // mano con las mismas constantes. Sin esto el alta rechazaba lo que la ficha
  // aceptaba.
  const [goalError, setGoalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { mutate, isPending } = useUpdatePatient();

  const startEdit = () => {
    setGoals(patient.treatmentGoals ?? []);
    setNewGoal('');
    setGoalError(null);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const cancelEdit = () => {
    setGoalError(null);
    setIsEditing(false);
  };

  const addGoal = () => {
    const trimmed = newGoal.trim();
    if (!trimmed) return;
    if (goals.length >= MAX_TREATMENT_GOALS) {
      setGoalError(
        `Ya hay ${MAX_TREATMENT_GOALS} objetivos, el máximo. Quita alguno para añadir otro.`,
      );
      return;
    }
    if (trimmed.length > GOAL_MAX_LENGTH) {
      setGoalError(
        `Cada objetivo admite hasta ${GOAL_MAX_LENGTH} caracteres; este tiene ${trimmed.length}.`,
      );
      return;
    }
    setGoalError(null);
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
        title="Objetivos de tratamiento"
        Icon={Target}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={cancelEdit}
        onSave={onSave}
        isSaving={isPending}
      />

      {displayGoals.length === 0 && !isEditing ? (
        <p className="text-sm font-medium leading-relaxed text-slate-600 dark:text-slate-400">
          Sin objetivos definidos. Usa el lápiz para agregarlos.
        </p>
      ) : (
        <ul className="space-y-2.5">
          {displayGoals.map((goal, i) => (
            <li key={i} className="flex items-start gap-3">
              {/* Antes bajaba del suelo tipográfico de 11px y pintaba el
                  púrpura con la variable CSS en línea — el único sitio del
                  módulo que no usaba el token de Tailwind. */}
              <span
                aria-hidden="true"
                className="mt-0.5 w-5 h-5 rounded-full bg-bg dark:bg-slate-800 border border-kanji/30 dark:border-kio/30 flex items-center justify-center text-[11px] font-bold text-kanji-deep dark:text-kio shrink-0"
              >
                {i + 1}
              </span>
              <span className="text-sm font-medium text-text dark:text-slate-300 leading-relaxed flex-1 py-0.5">
                {goal}
              </span>
              {/* Mismo control que el asistente de alta: 44px, etiquetado y
                  siempre visible. Antes era `opacity-0 group-hover`, de ~21px y
                  sin nombre accesible: en táctil no existía. */}
              {isEditing && (
                <button
                  type="button"
                  onClick={() => removeGoal(i)}
                  aria-label={`Quitar objetivo: ${goal}`}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-text-secondary transition-colors duration-150 hover:text-rose-700 dark:text-slate-400 dark:hover:text-rose-400"
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {isEditing && (
        <div className="mt-4">
          <div className="flex gap-2">
            <label className="sr-only" htmlFor="patient-new-goal">Nuevo objetivo</label>
            <input
              id="patient-new-goal"
              ref={inputRef}
              value={newGoal}
              onChange={(e) => {
                setNewGoal(e.target.value);
                if (goalError) setGoalError(null);
              }}
              onKeyDown={handleKeyDown}
              className={`${inputCls} flex-1`}
              placeholder="Nuevo objetivo... (Enter para agregar)"
              aria-invalid={!!goalError}
              aria-describedby={goalError ? 'patient-new-goal-error' : undefined}
            />
            {/* El botón sigue habilitado al llegar al tope: un control apagado
                sin explicación no dice por qué. El motivo se pinta debajo. */}
            <button
              type="button"
              onClick={addGoal}
              disabled={!newGoal.trim()}
              aria-label="Agregar objetivo"
              className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-cruz/50 hover:bg-cruz dark:bg-kio/20 dark:hover:bg-kio/30 text-kanji-deep dark:text-kio transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} aria-hidden="true" />
            </button>
          </div>
          {goalError && (
            <p id="patient-new-goal-error" role="alert" className={errorCls}>
              {goalError}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── 4. Medicación y alergias ────────────────────────────────────────────────
const medicationSchema = patientSchema.pick({ medicacionActual: true, alergias: true });
type MedicationData = z.infer<typeof medicationSchema>;

/**
 * Tercer pilar de posicionamiento del producto: medicación y alergias, no un
 * CRM médico genérico. Los campos existían en el modelo, se cifran en servidor
 * y se leen en el panel de sesión, pero no había forma de escribirlos desde
 * ninguna ficha — de modo que la sesión mostraba "Sin alergias registradas" de
 * forma permanente, que se lee como una afirmación clínica y no como un vacío.
 */
function MedicationSection({ patient }: { patient: Patient }) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdatePatient();

  const medicacion = patient.medicacionActual ?? '';
  const alergias = patient.alergias ?? '';

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MedicationData>({
    resolver: zodResolver(medicationSchema),
    defaultValues: { medicacionActual: medicacion, alergias },
  });

  const startEdit = () => {
    reset({ medicacionActual: medicacion, alergias });
    setIsEditing(true);
  };

  const onSave = handleSubmit((data) => {
    // `UpdatePatientDto` ya declara `medicacionActual` y `alergias`: el apaño de
    // la intersección local desapareció con la deuda de tipos.
    const payload: UpdatePatientDto = { ...data };
    mutate(
      { id: patient.id, data: payload },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast.success('Medicación y alergias actualizadas');
        },
        onError: () => toast.error('Error al guardar. Intenta de nuevo.'),
      },
    );
  });

  return (
    <div className={cardCls}>
      <SectionHeader
        title="Medicación y alergias"
        Icon={Pill}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={() => setIsEditing(false)}
        onSave={onSave}
        isSaving={isPending}
      />

      {!isEditing ? (
        <dl className="space-y-4">
          <div>
            <dt className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
              Alergias
            </dt>
            {/* "Sin alergias" y "no se ha preguntado" no son el mismo hecho: el
                vacío se nombra como vacío, nunca como ausencia de alergias. */}
            <dd
              className={`mt-1 whitespace-pre-wrap text-sm leading-relaxed ${
                alergias
                  ? 'font-bold text-rose-800 dark:text-rose-300'
                  : 'font-medium text-slate-600 dark:text-slate-400'
              }`}
            >
              {alergias || 'Sin registrar. No equivale a «no tiene alergias».'}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
              Medicación actual
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-sm font-medium leading-relaxed text-text dark:text-slate-300">
              {medicacion || 'Sin registrar.'}
            </dd>
          </div>
        </dl>
      ) : (
        <div className="space-y-4">
          <div>
            <label className={labelCls} htmlFor="patient-alergias">Alergias</label>
            <textarea
              id="patient-alergias"
              {...register('alergias')}
              rows={2}
              className={`${inputCls} resize-none`}
              placeholder="Ej. Penicilina, AINEs… Déjalo vacío si no se han preguntado."
              aria-invalid={!!errors.alergias}
              aria-describedby={errors.alergias ? 'patient-alergias-error' : undefined}
            />
            {errors.alergias && (
              <p id="patient-alergias-error" className={errorCls}>{errors.alergias.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="patient-medicacion">Medicación actual</label>
            <textarea
              id="patient-medicacion"
              {...register('medicacionActual')}
              rows={3}
              className={`${inputCls} resize-none`}
              placeholder="Fármaco, dosis y pauta. Ej. Sertralina 50 mg / día."
              aria-invalid={!!errors.medicacionActual}
              aria-describedby={errors.medicacionActual ? 'patient-medicacion-error' : undefined}
            />
            {errors.medicacionActual && (
              <p id="patient-medicacion-error" className={errorCls}>{errors.medicacionActual.message}</p>
            )}
          </div>
          <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
            Ambos campos se guardan cifrados y aparecen en el panel de sesión. Por estar
            cifrados no se pueden buscar ni filtrar.
          </p>
        </div>
      )}
    </div>
  );
}

// ── 5. Contacto de emergencia ───────────────────────────────────────────────
// El contacto siempre viaja como objeto desde este formulario (los tres campos
// sí son opcionales), así que se envuelve el esquema compartido en vez de
// tomarlo con `.pick()`, que lo dejaría opcional entero.
const emergencySchema = z.object({ emergencyContact: emergencyContactSchema });
type EmergencyData = z.infer<typeof emergencySchema>;

function EmergencyContactSection({ patient }: { patient: Patient }) {
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useUpdatePatient();
  const ec = patient.emergencyContact;

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<EmergencyData>({
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

  // Tener contacto de emergencia registrado es el estado bueno; teñirlo de rose
  // lo pintaba como una alerta. El rose queda para el estado que sí lo es: no
  // haberlo registrado.
  return (
    <div
      className={
        !isEditing && !hasContact
          ? `${cardCls} border-dashed border-rose-200 bg-rose-50/30 dark:border-rose-900/40 dark:bg-rose-900/10`
          : cardCls
      }
    >
      <SectionHeader
        title="Contacto de emergencia"
        Icon={AlertTriangle}
        isEditing={isEditing}
        onEdit={startEdit}
        onCancel={() => setIsEditing(false)}
        onSave={onSave}
        isSaving={isPending}
      />

      {!isEditing ? (
        hasContact ? (
          <div className="space-y-1.5 text-sm">
            <p className="font-medium text-text dark:text-slate-300">
              <span className="font-bold">{ec?.name}</span>
              {ec?.relation && (
                <span className="font-normal text-slate-600 dark:text-slate-400"> ({ec.relation})</span>
              )}
            </p>
            {ec?.phone && (
              <a
                href={`tel:${ec.phone}`}
                className="inline-flex min-h-11 items-center gap-2 font-bold text-kanji-deep hover:underline dark:text-kio"
              >
                <Phone size={14} aria-hidden="true" />
                {ec.phone}
              </a>
            )}
          </div>
        ) : (
          <p className="text-sm font-medium leading-relaxed text-rose-800 dark:text-rose-300">
            Sin contacto de emergencia. Usa el lápiz para registrarlo.
          </p>
        )
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className={labelCls} htmlFor="patient-ec-name">Nombre</label>
            <input
              id="patient-ec-name"
              {...register('emergencyContact.name')}
              className={inputCls}
              placeholder="Nombre del contacto"
              aria-invalid={!!errors.emergencyContact?.name}
              aria-describedby={
                errors.emergencyContact?.name ? 'patient-ec-name-error' : undefined
              }
            />
            {errors.emergencyContact?.name && (
              <p id="patient-ec-name-error" className={errorCls}>
                {errors.emergencyContact.name.message}
              </p>
            )}
          </div>
          <div role="group" aria-labelledby="patient-ec-phone-label">
            <span className={labelCls} id="patient-ec-phone-label">Teléfono</span>
            <Controller
              control={control}
              name="emergencyContact.phone"
              render={({ field }) => (
                <PhoneInput value={field.value || ''} onChange={field.onChange} />
              )}
            />
            {errors.emergencyContact?.phone && (
              <p className={errorCls}>{errors.emergencyContact.phone.message}</p>
            )}
          </div>
          <div>
            <label className={labelCls} htmlFor="patient-ec-relation">Relación</label>
            <input
              id="patient-ec-relation"
              {...register('emergencyContact.relation')}
              className={inputCls}
              placeholder="Ej. Madre, Pareja..."
              aria-invalid={!!errors.emergencyContact?.relation}
              aria-describedby={
                errors.emergencyContact?.relation ? 'patient-ec-relation-error' : undefined
              }
            />
            {errors.emergencyContact?.relation && (
              <p id="patient-ec-relation-error" className={errorCls}>
                {errors.emergencyContact.relation.message}
              </p>
            )}
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
      <dt className="text-[11px] text-slate-600 dark:text-slate-400 uppercase font-bold tracking-wider">
        {label}
      </dt>
      <dd className="text-sm font-medium text-text dark:text-slate-300 mt-1">{value}</dd>
    </div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export function PatientProfileEditor({
  patient,
  focusSection,
  onFocusHandled,
}: PatientProfileEditorProps) {
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column */}
      <div className="space-y-6">
        <PersonalDataSection
          patient={patient}
          autoEdit={focusSection === 'personal'}
          onAutoEditHandled={onFocusHandled}
        />
        <TreatmentGoalsSection patient={patient} />
        <TasksWidget patientId={patient.id} />
      </div>

      {/* Right column */}
      <div className="space-y-6">
        <ClinicalScenarioSection
          patient={patient}
          autoEdit={focusSection === 'clinical'}
          onAutoEditHandled={onFocusHandled}
        />
        <MedicationSection patient={patient} />
        <EmergencyContactSection patient={patient} />
      </div>
    </div>
  );
}
