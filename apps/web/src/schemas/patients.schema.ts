import { z } from 'zod';

export const emergencyContactSchema = z.object({
  name: z.string().optional(),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[1-9]\d{1,14}$/.test(val.replace(/\s/g, '')), {
      message: 'Formato de teléfono inválido',
    }),
  relation: z.string().optional(),
});

export const patientSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
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
  diagnosis: z.string().optional(),
  clinicalContext: z.string().optional(),
  treatmentGoals: z.array(z.string().min(1)).optional(),
  emergencyContact: emergencyContactSchema.optional(),
  medicacionActual: z.string().optional(),
  alergias: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientSchema>;
