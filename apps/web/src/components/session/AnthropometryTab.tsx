import { useState, useMemo, useEffect, type FC } from 'react';
import { TrendingDown, TrendingUp, Minus, Activity, Ruler, Save } from 'lucide-react';
import { useUpsertAnthropometry } from '../../hooks/use-session';
import { toast } from 'sonner';

interface AnthropometryTabProps {
  appointmentId: string;
  initialData?: any;
}

const DEFAULT_HEIGHT_M = 1.65; // Keeping as fallback or should come from patient profile? Left as constant for now.

interface AnthropometryField {
  readonly id: string;
  readonly label: string;
  readonly unit: string;
  readonly placeholder: string;
  readonly isReadonly?: boolean;
  readonly defaultValue?: string;
  readonly colSpan?: number;
}

const FIELDS: readonly AnthropometryField[] = [
  { id: 'currentWeight', label: 'Peso Actual', unit: 'kg', placeholder: '0.0' },
  { id: 'bodyFat', label: '% Grasa Corporal', unit: '%', placeholder: '0.0' },
  { id: 'waist', label: 'Cintura', unit: 'cm', placeholder: '0.0' },
  { id: 'hip', label: 'Cadera', unit: 'cm', placeholder: '0.0' },
] as const;

/**
 * Bento-grid of anthropometric input cards.
 * Calculates BMI in real-time and shows weight-trend feedback.
 */
export const AnthropometryTab: FC<AnthropometryTabProps> = ({ appointmentId, initialData }) => {
  const [values, setValues] = useState<Record<string, string>>({});
  const { mutate: save, isPending } = useUpsertAnthropometry();

  useEffect(() => {
    if (initialData) {
      setValues({
        currentWeight: initialData.weight ? String(initialData.weight) : '',
        bodyFat: initialData.bodyFat ? String(initialData.bodyFat) : '',
        waist: initialData.waist ? String(initialData.waist) : '',
        hip: initialData.hip ? String(initialData.hip) : '',
      });
    }
  }, [initialData]);

  const handleFieldChange = (fieldId: string, rawValue: string) => {
    const sanitized = rawValue.replace(/[^0-9.]/g, '');
    setValues((prev) => ({ ...prev, [fieldId]: sanitized }));
  };

  const handleSave = () => {
    const payload = {
      weight: parseFloat(values.currentWeight || '0'),
      height: DEFAULT_HEIGHT_M, // TODO: Make editable
      bodyFat: values.bodyFat ? parseFloat(values.bodyFat) : undefined,
      waist: values.waist ? parseFloat(values.waist) : undefined,
      hip: values.hip ? parseFloat(values.hip) : undefined,
    };
    
    save({ appointmentId, data: payload }, {
       onSuccess: () => toast.success('Antropometría guardada')
    });
  };

  /* ── Derived calculations ── */
  const currentWeight = parseFloat(values.currentWeight ?? '');
  const previousWeight = 0; // TODO: Fetch from previous appointment

  const bmiValue = useMemo(() => {
    if (!currentWeight || currentWeight <= 0) return null;
    return currentWeight / (DEFAULT_HEIGHT_M * DEFAULT_HEIGHT_M);
  }, [currentWeight]);

  const bmiCategory = useMemo(() => {
    if (bmiValue === null) return null;
    if (bmiValue < 18.5) return { label: 'Bajo peso', color: 'text-blue-500' };
    if (bmiValue < 25) return { label: 'Normal', color: 'text-emerald-500' };
    if (bmiValue < 30) return { label: 'Sobrepeso', color: 'text-amber-500' };
    return { label: 'Obesidad', color: 'text-red-500' };
  }, [bmiValue]);

  const weightTrend = useMemo(() => {
    if (!currentWeight || currentWeight <= 0) return 'neutral';
    if (currentWeight < previousWeight) return 'down';
    if (currentWeight > previousWeight) return 'up';
    return 'neutral';
  }, [currentWeight, previousWeight]);

  return (
    <div className="h-full overflow-y-auto p-6">
      {/* ── Bento Grid ── */}
      <div className="grid grid-cols-2 gap-4">
         <div className="col-span-2 flex justify-end">
             <button 
                onClick={handleSave}
                disabled={isPending}
                className="flex items-center gap-2 bg-kio hover:bg-kanji text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50"
             >
                <Save size={16} />
                {isPending ? 'Guardando...' : 'Guardar Medidas'}
             </button>
         </div>
        {FIELDS.map((field) => (
          <div
            key={field.id}
            className={`
              bg-surface dark:bg-slate-900 rounded-3xl p-5 border border-gray-100/60 dark:border-slate-800
              shadow-sm hover:shadow-md transition-shadow duration-200
              ${field.colSpan === 2 ? 'col-span-2' : ''}
              ${field.isReadonly ? 'opacity-70' : ''}
            `}
          >
            {/* Label */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest">
                {field.label}
              </span>

              {/* Weight trend indicator — only on current weight */}
              {field.id === 'currentWeight' && weightTrend !== 'neutral' && (
                <span
                  className={`
                    flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full
                    ${weightTrend === 'down' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400'}
                  `}
                >
                  {weightTrend === 'down' ? (
                    <TrendingDown size={13} />
                  ) : (
                    <TrendingUp size={13} />
                  )}
                  {Math.abs(currentWeight - previousWeight).toFixed(1)} kg
                </span>
              )}
            </div>

            {/* Large Number Input */}
            <div className="flex items-baseline gap-2">
              <input
                type="text"
                inputMode="decimal"
                readOnly={field.isReadonly}
                value={values[field.id] ?? field.defaultValue ?? ''}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className={`
                  w-full text-3xl font-bold tracking-tight border-none outline-none bg-transparent
                  placeholder:text-gray-200 dark:placeholder:text-slate-700
                  ${field.isReadonly ? 'text-gray-400 dark:text-slate-500 cursor-default' : 'text-gray-900 dark:text-white'}
                `}
              />
              <span className="text-base font-semibold text-gray-300 dark:text-slate-600 shrink-0">
                {field.unit}
              </span>
            </div>
          </div>
        ))}

        {/* ── IMC Highlighted Card ── */}
        <div className="col-span-2 bg-gradient-to-br from-kio/10 via-kanji/5 to-transparent dark:from-kio/5 dark:via-kanji/5 dark:to-slate-900 rounded-3xl p-6 border border-kio/20 dark:border-kio/10 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-kio/20 flex items-center justify-center">
              <Activity size={16} className="text-kanji dark:text-kio" />
            </div>
            <span className="text-[11px] font-bold text-kanji/70 dark:text-kio/70 uppercase tracking-widest">
              IMC — Índice de Masa Corporal
            </span>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-5xl font-black text-kanji dark:text-white tracking-tight">
              {bmiValue !== null ? bmiValue.toFixed(1) : '—'}
            </span>
            {bmiCategory && (
              <span className={`text-sm font-bold ${bmiCategory.color}`}>
                {bmiCategory.label}
              </span>
            )}
          </div>

          {/* Formula hint */}
          <div className="flex items-center gap-1.5 mt-3">
            <Ruler size={12} className="text-gray-300 dark:text-slate-600" />
            <span className="text-[10px] text-gray-400 dark:text-slate-500">
              Altura ref: {DEFAULT_HEIGHT_M}m · Fórmula: peso / altura²
            </span>
          </div>

          {/* Neutral weight indicator */}
          {weightTrend === 'neutral' && currentWeight > 0 && (
            <div className="flex items-center gap-1.5 mt-2">
              <Minus size={12} className="text-gray-400 dark:text-slate-500" />
              <span className="text-[10px] text-gray-400 dark:text-slate-500">
                Sin cambio respecto a cita anterior
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
