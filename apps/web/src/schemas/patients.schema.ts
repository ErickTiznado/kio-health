import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().max(120, 'Máximo 120 caracteres').optional(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val.replace(/\s/g, '')), {
      message: 'Formato de teléfono inválido',
    }),
  relation: z.string().max(60, 'Máximo 60 caracteres').optional(),
});

/**
 * Topes de los objetivos de tratamiento, expuestos como constantes porque hay
 * dos caminos de escritura hacia el mismo campo: el alta (validada con zod) y
 * la sección "Objetivos de tratamiento" del editor de la ficha, que trabaja
 * con estado local y añade objetivos de uno en uno. Si el número viviera sólo
 * dentro del esquema, el editor volvería a aceptar lo que el alta rechaza.
 */
export const GOAL_MAX_LENGTH = 200;
export const MAX_TREATMENT_GOALS = 20;

export const patientSchema = z.object({
  fullName: z
    .string()
    .min(1, 'El nombre es requerido')
    .max(120, 'Máximo 120 caracteres'),
  contactPhone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val.replace(/\s/g, '')), {
      message: 'Formato de teléfono inválido',
    }),
  contactEmail: z
    .string()
    .email('Formato de email inválido')
    .optional()
    .or(z.literal('')),
  dateOfBirth: z.string().optional(),
  // El paso clínico del asistente no validaba nada antes de enviar. Los topes
  // son generosos a propósito: sólo frenan un pegado accidental de un
  // documento entero, no la redacción clínica normal.
  diagnosis: z.string().max(500, 'Máximo 500 caracteres').optional(),
  clinicalContext: z.string().max(4000, 'Máximo 4000 caracteres').optional(),
  treatmentGoals: z
    .array(
      z
        .string()
        .min(1)
        .max(GOAL_MAX_LENGTH, `Cada objetivo admite hasta ${GOAL_MAX_LENGTH} caracteres`),
    )
    .max(MAX_TREATMENT_GOALS, `Máximo ${MAX_TREATMENT_GOALS} objetivos`)
    .optional(),
  emergencyContact: emergencyContactSchema.optional(),
  // Campos cifrados en servidor (AES-256-GCM), igual que diagnóstico y
  // contexto clínico: no son buscables ni filtrables en SQL.
  medicacionActual: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
  alergias: z.string().max(1000, 'Máximo 1000 caracteres').optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
